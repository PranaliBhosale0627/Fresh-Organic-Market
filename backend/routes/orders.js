import express from 'express';
import { collections, getLoyalty, setCart, setLoyalty, withoutMongoId } from '../config/db.js';
import { emitToAdmins, emitToUser } from '../config/socket.js';
import { ApiError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { notifyAdmins, notifyCustomer } from '../services/notificationService.js';

const router = express.Router();
const ORDER_STATUSES = ['Pending', 'Confirmed', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'];

function createTimeline(status, timeStr) {
  const stageMap = [
    { stage: 'Order Placed', activeStatuses: ORDER_STATUSES, description: "We've received your order and started preparing." },
    { stage: 'Confirmed', activeStatuses: ['Confirmed', 'Packed', 'Out for Delivery', 'Delivered'], description: 'Your order has been confirmed by the store.' },
    { stage: 'Packed', activeStatuses: ['Packed', 'Out for Delivery', 'Delivered'], description: 'All items are packed and quality checked.' },
    { stage: 'Out for Delivery', activeStatuses: ['Out for Delivery', 'Delivered'], description: 'Your order is on the way.' },
    { stage: 'Delivered', activeStatuses: ['Delivered'], description: 'Order delivered successfully.' }
  ];

  return stageMap.map((step) => {
    const completed = step.activeStatuses.includes(status);
    return {
      stage: step.stage,
      time: completed ? timeStr : 'Pending',
      description: step.description,
      completed
    };
  });
}

router.get('/', asyncHandler(async (req, res) => {
  const { status, customerId } = req.query;
  const query = {};

  if (!req.user.isAdmin) {
    query.customerEmail = req.user.email;
  } else if (customerId) {
    query.customerId = customerId;
  }

  if (status) {
    query.status = new RegExp(`^${status}$`, 'i');
  }

  const orders = await collections().orders.find(query).sort({ createdAt: -1, date: -1 }).toArray();
  const data = orders.map(withoutMongoId);
  res.json({ success: true, data, count: data.length });
}));

router.get('/stats/summary', asyncHandler(async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(new ApiError('Unauthorized. Admin privilege required.', 403));
  }

  const orders = await collections().orders.find({}).toArray();
  const revenue = orders.filter((o) => o.status === 'Delivered').reduce((sum, o) => sum + o.total, 0);
  const byStatus = {
    Pending: orders.filter((o) => o.status === 'Pending').length,
    Confirmed: orders.filter((o) => o.status === 'Confirmed').length,
    Packed: orders.filter((o) => o.status === 'Packed').length,
    'Out for Delivery': orders.filter((o) => o.status === 'Out for Delivery').length,
    Delivered: orders.filter((o) => o.status === 'Delivered').length,
    Cancelled: orders.filter((o) => o.status === 'Cancelled').length
  };

  res.json({
    success: true,
    data: {
      totalOrders: orders.length,
      totalRevenue: parseFloat(revenue.toFixed(2)),
      byStatus
    }
  });
}));

router.get('/:id', asyncHandler(async (req, res, next) => {
  const order = await collections().orders.findOne({ id: req.params.id });
  if (!order) return next(new ApiError(`Order '${req.params.id}' not found`, 404));

  if (!req.user.isAdmin && order.customerEmail.toLowerCase() !== req.user.email) {
    return next(new ApiError('Unauthorized to view this order', 403));
  }

  res.json({ success: true, data: withoutMongoId(order) });
}));

router.post('/', asyncHandler(async (req, res, next) => {
  const { cartItems, address, deliveryTimeSlot, paymentMethod, appliedDiscount = 0 } = req.body;
  const user = req.user;

  if (!cartItems || cartItems.length === 0) {
    return next(new ApiError('Cart is empty. Cannot place an order.', 400));
  }
  if (!address || !deliveryTimeSlot || !paymentMethod) {
    return next(new ApiError('address, deliveryTimeSlot, and paymentMethod are required', 400));
  }

  for (const item of cartItems) {
    const product = await collections().products.findOne({ id: item.product.id });
    if (!product) return next(new ApiError(`Product '${item.product.id}' not found`, 404));
    if (product.stock < item.quantity) {
      return next(new ApiError(`Insufficient stock for '${product.name}'. Available: ${product.stock}`, 400));
    }
  }

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const deliveryFee = deliveryTimeSlot.includes('Eco-Consolidated') ? 0 : (subtotal > 30 ? 0 : 2.99);
  const tax = subtotal * 0.08;
  const discount = parseFloat(appliedDiscount) || 0;
  const total = subtotal - discount + deliveryFee + tax;

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const createdAt = now.toISOString();
  const customerName = user.customer ? user.customer.name : 'Anonymous Customer';
  const customerAvatar = user.customer ? user.customer.avatar : 'AC';

  const newOrder = {
    id: `#FO-${Math.floor(1000000 + Math.random() * 9000000)}`,
    customerName,
    customerEmail: user.email,
    customerAvatar,
    date: dateStr,
    items: cartItems.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      price: item.product.price
    })),
    subtotal: parseFloat(subtotal.toFixed(2)),
    deliveryFee: parseFloat(deliveryFee.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    discount: parseFloat(discount.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
    status: 'Pending',
    paymentStatus: paymentMethod.toLowerCase().includes('cash') ? 'Pending' : 'Paid',
    address,
    deliveryTimeSlot,
    paymentMethod,
    timeline: createTimeline('Pending', timeStr),
    statusHistory: [
      {
        status: 'Pending',
        changedAt: createdAt,
        changedBy: user.email,
        note: 'Order placed by customer'
      }
    ],
    createdAt,
    updatedAt: createdAt
  };

  for (const item of cartItems) {
    await collections().products.updateOne(
      { id: item.product.id },
      { $inc: { stock: -Math.abs(parseInt(item.quantity)) } }
    );
  }

  await collections().customers.updateOne(
    { email: user.email },
    { $inc: { ordersCount: 1 } }
  );

  if (deliveryTimeSlot.includes('Eco-Consolidated')) {
    const loyalty = await getLoyalty(user.email);
    if (loyalty) {
      loyalty.coins += 20;
      const questIdx = loyalty.quests.findIndex((q) => q.id === 'quest-green');
      if (questIdx !== -1 && loyalty.quests[questIdx].status === 'locked') {
        loyalty.quests[questIdx].status = 'completable';
        loyalty.quests[questIdx].progressText = '1/1 eco-slot selected - Reward available!';
      }
      await setLoyalty(user.email, loyalty);
    }
  }

  await collections().orders.insertOne(newOrder);
  await setCart(user.email, []);

  await notifyAdmins({
    type: 'order.created',
    title: 'New Order',
    message: `${customerName} placed order ${newOrder.id}`,
    data: { orderId: newOrder.id, total: newOrder.total, customerEmail: user.email }
  });

  emitToAdmins('order:new', newOrder);
  emitToUser(user.email, 'order:updated', newOrder);

  res.status(201).json({ success: true, data: newOrder, message: 'Order placed successfully' });
}));

router.put('/:id/status', asyncHandler(async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(new ApiError('Unauthorized. Admin privilege required.', 403));
  }

  const { status } = req.body;
  if (!status || !ORDER_STATUSES.includes(status)) {
    return next(new ApiError(`Invalid status. Must be one of: ${ORDER_STATUSES.join(', ')}`, 400));
  }

  const order = await collections().orders.findOne({ id: req.params.id });
  if (!order) return next(new ApiError(`Order '${req.params.id}' not found`, 404));

  const timeStr = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const changedAt = new Date().toISOString();
  const updatedTimeline = status === 'Cancelled'
    ? (order.timeline || createTimeline('Pending', timeStr)).map((step) => ({ ...step, completed: false }))
    : createTimeline(status, timeStr);
  const statusHistory = [
    ...(order.statusHistory || []),
    {
      status,
      changedAt,
      changedBy: req.user.email,
      note: `Order marked as ${status}`
    }
  ];

  await collections().orders.updateOne(
    { id: req.params.id },
    { $set: { status, timeline: updatedTimeline, statusHistory, updatedAt: changedAt } }
  );

  const updatedOrder = { ...withoutMongoId(order), status, timeline: updatedTimeline, statusHistory, updatedAt: changedAt };

  await notifyCustomer(order.customerEmail, {
    type: 'order.status',
    title: 'Order Status Updated',
    message: `Your order ${order.id} is now ${status}`,
    data: { orderId: order.id, status }
  });

  emitToUser(order.customerEmail, 'order:updated', updatedOrder);
  emitToAdmins('order:updated', updatedOrder);

  res.json({
    success: true,
    data: updatedOrder,
    message: `Order status updated to '${status}'`
  });
}));

export default router;
