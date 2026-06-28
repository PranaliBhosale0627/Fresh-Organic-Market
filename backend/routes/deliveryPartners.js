import crypto from 'crypto';
import express from 'express';
import { collections, withoutMongoId } from '../config/db.js';
import { emitToAdmins, emitToDeliveryPartner, emitToUser } from '../config/socket.js';
import { ApiError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { notifyAdmins, notifyCustomer } from '../services/notificationService.js';

const router = express.Router();
const DELIVERY_STATUSES = ['Assigned', 'Accepted', 'Picked Up', 'Out for Delivery', 'Reached Destination', 'Delivered', 'Rejected'];
const OTP_TTL_MINUTES = 30;

function requireAdmin(req, next) {
  if (!req.user.isAdmin) return next(new ApiError('Admin privilege required.', 403));
  return null;
}

function requirePartner(req, next) {
  if (!req.user.isDeliveryPartner) return next(new ApiError('Delivery partner privilege required.', 403));
  return null;
}

function publicPartner(partner) {
  if (!partner) return null;
  const cleaned = withoutMongoId(partner);
  delete cleaned.password;
  return cleaned;
}

function otpHash(code) {
  return crypto.createHash('sha256').update(String(code)).digest('hex');
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function deliveryHistoryEntry(status, changedBy, note) {
  return {
    status,
    changedAt: new Date().toISOString(),
    changedBy,
    note
  };
}

function buildAssignedPartner(partner) {
  return {
    id: partner.id,
    name: partner.name,
    email: partner.email,
    phone: partner.phone,
    avatar: partner.avatar,
    vehicleType: partner.vehicleType,
    vehicleNumber: partner.vehicleNumber,
    rating: partner.rating || 4.7
  };
}

async function emitOrderDeliveryUpdate(order, event = 'delivery:updated') {
  const cleanOrder = withoutMongoId(order);
  emitToAdmins(event, cleanOrder);
  emitToUser(order.customerEmail, 'order:updated', cleanOrder);
  if (order.assignedPartner?.email) {
    emitToDeliveryPartner(order.assignedPartner.email, event, cleanOrder);
  }
}

async function updateOrderDeliveryStatus(order, status, changedBy, note, extra = {}) {
  const changedAt = new Date().toISOString();
  const deliveryHistory = [
    ...(order.deliveryHistory || []),
    deliveryHistoryEntry(status, changedBy, note || `Delivery status changed to ${status}`)
  ];
  const statusHistory = [
    ...(order.statusHistory || []),
    {
      status: status === 'Delivered' ? 'Delivered' : order.status,
      changedAt,
      changedBy,
      note: note || `Delivery status changed to ${status}`
    }
  ];

  const orderStatusPatch = status === 'Delivered'
    ? { status: 'Delivered', paymentStatus: order.paymentStatus === 'Pending' ? 'Paid' : order.paymentStatus }
    : status === 'Out for Delivery'
    ? { status: 'Out for Delivery' }
    : {};

  const patch = {
    ...orderStatusPatch,
    ...extra,
    deliveryStatus: status,
    deliveryHistory,
    statusHistory,
    updatedAt: changedAt
  };

  await collections().orders.updateOne({ id: order.id }, { $set: patch });
  return { ...withoutMongoId(order), ...patch };
}

router.get('/', asyncHandler(async (req, res, next) => {
  if (requireAdmin(req, next)) return;
  const { q, status } = req.query;
  const query = {};
  if (status) query.status = status;
  if (q) {
    const search = new RegExp(String(q), 'i');
    query.$or = [{ name: search }, { email: search }, { phone: search }, { vehicleNumber: search }];
  }

  const partners = await collections().deliveryPartners.find(query).sort({ name: 1 }).toArray();
  res.json({ success: true, data: partners.map(publicPartner), count: partners.length });
}));

router.post('/', asyncHandler(async (req, res, next) => {
  if (requireAdmin(req, next)) return;
  const { name, email, phone, vehicleType, vehicleNumber, password = 'partner123' } = req.body;
  if (!name || !email || !phone || !vehicleType || !vehicleNumber) {
    return next(new ApiError('name, email, phone, vehicleType, and vehicleNumber are required', 400));
  }

  const lowerEmail = email.toLowerCase();
  const partner = {
    id: `dp-${Date.now()}`,
    name,
    email: lowerEmail,
    phone,
    avatar: name.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2),
    vehicleType,
    vehicleNumber,
    rating: 4.7,
    status: 'Active',
    availability: 'Available',
    completedDeliveries: 0,
    activeDeliveries: 0,
    averageDeliveryTime: 0,
    joinedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await collections().deliveryPartners.insertOne(partner);
  await collections().accounts.updateOne(
    { email: lowerEmail },
    { $set: { email: lowerEmail, password, role: 'delivery_partner', isAdmin: false } },
    { upsert: true }
  );

  res.status(201).json({ success: true, data: partner, message: 'Delivery partner added' });
}));

router.put('/:id', asyncHandler(async (req, res, next) => {
  if (requireAdmin(req, next)) return;
  const allowed = ['name', 'phone', 'vehicleType', 'vehicleNumber', 'rating', 'status', 'availability'];
  const patch = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) patch[key] = req.body[key];
  }
  patch.updatedAt = new Date().toISOString();

  const result = await collections().deliveryPartners.findOneAndUpdate(
    { id: req.params.id },
    { $set: patch },
    { returnDocument: 'after' }
  );
  if (!result) return next(new ApiError('Delivery partner not found', 404));

  res.json({ success: true, data: publicPartner(result) });
}));

router.delete('/:id', asyncHandler(async (req, res, next) => {
  if (requireAdmin(req, next)) return;
  const partner = await collections().deliveryPartners.findOne({ id: req.params.id });
  if (!partner) return next(new ApiError('Delivery partner not found', 404));
  await collections().deliveryPartners.deleteOne({ id: req.params.id });
  await collections().accounts.deleteOne({ email: partner.email });
  res.json({ success: true, message: 'Delivery partner deleted' });
}));

router.get('/analytics/summary', asyncHandler(async (req, res, next) => {
  if (requireAdmin(req, next)) return;
  const partners = await collections().deliveryPartners.find({}).toArray();
  const activeOrders = await collections().orders.countDocuments({
    deliveryStatus: { $in: ['Assigned', 'Accepted', 'Picked Up', 'Out for Delivery', 'Reached Destination'] }
  });
  const completedDeliveries = partners.reduce((sum, partner) => sum + (partner.completedDeliveries || 0), 0);
  const avgRating = partners.length
    ? partners.reduce((sum, partner) => sum + (partner.rating || 0), 0) / partners.length
    : 0;
  const avgDeliveryTime = partners.length
    ? partners.reduce((sum, partner) => sum + (partner.averageDeliveryTime || 0), 0) / partners.length
    : 0;

  res.json({
    success: true,
    data: {
      totalPartners: partners.length,
      activePartners: partners.filter((partner) => partner.status === 'Active').length,
      completedDeliveries,
      activeDeliveries: activeOrders,
      averageDeliveryTime: Math.round(avgDeliveryTime),
      partnerRating: Number(avgRating.toFixed(1))
    }
  });
}));

router.post('/assign', asyncHandler(async (req, res, next) => {
  if (requireAdmin(req, next)) return;
  const { orderId, partnerId, estimatedDeliveryTime = '30-40 minutes' } = req.body;
  if (!orderId || !partnerId) return next(new ApiError('orderId and partnerId are required', 400));

  const [order, partner] = await Promise.all([
    collections().orders.findOne({ id: orderId }),
    collections().deliveryPartners.findOne({ id: partnerId })
  ]);
  if (!order) return next(new ApiError('Order not found', 404));
  if (!partner) return next(new ApiError('Delivery partner not found', 404));
  if (partner.status !== 'Active') return next(new ApiError('Delivery partner is inactive', 400));

  const assignedPartner = buildAssignedPartner(partner);
  const updatedOrder = await updateOrderDeliveryStatus(
    order,
    'Assigned',
    req.user.email,
    `Assigned to ${partner.name}`,
    { assignedPartner, estimatedDeliveryTime }
  );

  await collections().deliveryPartners.updateOne(
    { id: partnerId },
    { $inc: { activeDeliveries: 1 }, $set: { availability: 'Busy', updatedAt: new Date().toISOString() } }
  );

  await notifyCustomer(order.customerEmail, {
    type: 'delivery.assigned',
    title: 'Delivery Partner Assigned',
    message: `${partner.name} has been assigned to your order ${order.id}`,
    data: { orderId: order.id, partnerId }
  });

  emitToDeliveryPartner(partner.email, 'delivery:assigned', updatedOrder);
  await emitOrderDeliveryUpdate(updatedOrder, 'delivery:assigned');
  res.json({ success: true, data: updatedOrder, message: 'Order assigned to delivery partner' });
}));

router.get('/me/profile', asyncHandler(async (req, res, next) => {
  if (requirePartner(req, next)) return;
  res.json({ success: true, data: publicPartner(req.user.deliveryPartner) });
}));

router.put('/me/availability', asyncHandler(async (req, res, next) => {
  if (requirePartner(req, next)) return;
  const availability = req.body.availability === 'Unavailable' ? 'Unavailable' : 'Available';
  const result = await collections().deliveryPartners.findOneAndUpdate(
    { email: req.user.email },
    { $set: { availability, updatedAt: new Date().toISOString() } },
    { returnDocument: 'after' }
  );
  res.json({ success: true, data: publicPartner(result) });
}));

router.get('/me/orders', asyncHandler(async (req, res, next) => {
  if (requirePartner(req, next)) return;
  const orders = await collections().orders.find({
    'assignedPartner.email': req.user.email,
    deliveryStatus: { $nin: ['Delivered', 'Rejected'] }
  }).sort({ updatedAt: -1 }).toArray();
  res.json({ success: true, data: orders.map(withoutMongoId), count: orders.length });
}));

router.get('/me/history', asyncHandler(async (req, res, next) => {
  if (requirePartner(req, next)) return;
  const orders = await collections().orders.find({
    'assignedPartner.email': req.user.email,
    deliveryStatus: { $in: ['Delivered', 'Rejected'] }
  }).sort({ updatedAt: -1 }).toArray();
  res.json({ success: true, data: orders.map(withoutMongoId), count: orders.length });
}));

router.put('/orders/:id/respond', asyncHandler(async (req, res, next) => {
  if (requirePartner(req, next)) return;
  const decision = req.body.decision === 'reject' ? 'reject' : 'accept';
  const order = await collections().orders.findOne({ id: req.params.id, 'assignedPartner.email': req.user.email });
  if (!order) return next(new ApiError('Assigned order not found', 404));

  const status = decision === 'accept' ? 'Accepted' : 'Rejected';
  const updatedOrder = await updateOrderDeliveryStatus(order, status, req.user.email, `Delivery partner ${status.toLowerCase()} delivery`);
  if (decision === 'reject') {
    await collections().deliveryPartners.updateOne(
      { email: req.user.email },
      { $inc: { activeDeliveries: -1 }, $set: { availability: 'Available' } }
    );
  }

  await emitOrderDeliveryUpdate(updatedOrder, 'delivery:updated');
  res.json({ success: true, data: updatedOrder });
}));

router.put('/orders/:id/status', asyncHandler(async (req, res, next) => {
  if (requirePartner(req, next)) return;
  const { status, otp } = req.body;
  if (!DELIVERY_STATUSES.includes(status) || status === 'Assigned' || status === 'Rejected') {
    return next(new ApiError(`Invalid delivery status. Use one of: Accepted, Picked Up, Out for Delivery, Reached Destination, Delivered`, 400));
  }

  const order = await collections().orders.findOne({ id: req.params.id, 'assignedPartner.email': req.user.email });
  if (!order) return next(new ApiError('Assigned order not found', 404));

  const extra = {};
  if (status === 'Out for Delivery') {
    const code = generateOtp();
    extra.deliveryOtp = {
      hash: otpHash(code),
      expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString(),
      verifiedAt: null
    };
    extra.deliveryOtpCode = code;
    await notifyCustomer(order.customerEmail, {
      type: 'delivery.otp',
      title: 'Order Out for Delivery',
      message: `Your order ${order.id} is out for delivery. Share the OTP only after receiving your order.`,
      data: { orderId: order.id }
    });
  }

  if (status === 'Delivered') {
    if (!order.deliveryOtp?.hash || !order.deliveryOtp?.expiresAt) {
      return next(new ApiError('Delivery OTP has not been generated yet', 400));
    }
    if (new Date(order.deliveryOtp.expiresAt).getTime() < Date.now()) {
      return next(new ApiError('Delivery OTP has expired. Ask admin/customer support to regenerate it.', 400));
    }
    if (!otp || otpHash(otp) !== order.deliveryOtp.hash) {
      return next(new ApiError('Incorrect delivery OTP. Delivery cannot be completed.', 400));
    }
    extra.deliveryOtp = { ...order.deliveryOtp, verifiedAt: new Date().toISOString() };
    extra.deliveryOtpCode = null;
  }

  const updatedOrder = await updateOrderDeliveryStatus(order, status, req.user.email, `Delivery partner marked ${status}`, extra);

  if (status === 'Delivered') {
    await collections().deliveryPartners.updateOne(
      { email: req.user.email },
      {
        $inc: { completedDeliveries: 1, activeDeliveries: -1 },
        $set: { availability: 'Available', updatedAt: new Date().toISOString() }
      }
    );
  }

  await notifyAdmins({
    type: 'delivery.status',
    title: 'Delivery Status Updated',
    message: `${order.id} is now ${status}`,
    data: { orderId: order.id, status }
  });

  await emitOrderDeliveryUpdate(updatedOrder, 'delivery:updated');
  res.json({ success: true, data: updatedOrder });
}));

export default router;
