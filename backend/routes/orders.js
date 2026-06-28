import express from 'express';
import { collections, getLoyalty, setCart, setLoyalty, withoutMongoId } from '../config/db.js';
import { ApiError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = express.Router();

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

  const orders = await collections().orders.find(query).toArray();
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
    Processing: orders.filter((o) => o.status === 'Processing').length,
    Shipped: orders.filter((o) => o.status === 'Shipped').length,
    Delivered: orders.filter((o) => o.status === 'Delivered').length
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
    address,
    deliveryTimeSlot,
    paymentMethod,
    timeline: [
      { stage: 'Order Received', time: timeStr, description: "We've received your order and started preparing.", completed: true },
      { stage: 'Packed', time: 'Pending', description: 'All items will be hand-picked and double-checked.', completed: false },
      { stage: 'On the Way', time: 'Pending', description: 'Rider dispatch pending.', completed: false },
      { stage: 'Delivered', time: 'Pending', description: 'Expected shortly.', completed: false }
    ]
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

  res.status(201).json({ success: true, data: newOrder, message: 'Order placed successfully' });
}));

router.put('/:id/status', asyncHandler(async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(new ApiError('Unauthorized. Admin privilege required.', 403));
  }

  const { status } = req.body;
  const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  if (!status || !validStatuses.includes(status)) {
    return next(new ApiError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400));
  }

  const order = await collections().orders.findOne({ id: req.params.id });
  if (!order) return next(new ApiError(`Order '${req.params.id}' not found`, 404));

  const timeStr = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const updatedTimeline = order.timeline.map((step) => {
    if (status === 'Processing' && step.stage === 'Packed') {
      return { ...step, time: timeStr, completed: true };
    }
    if (status === 'Shipped') {
      if (step.stage === 'Packed') return { ...step, completed: true };
      if (step.stage === 'On the Way') return { ...step, time: timeStr, completed: true };
    }
    if (status === 'Delivered') {
      if (step.stage === 'Packed' || step.stage === 'On the Way') return { ...step, completed: true };
      if (step.stage === 'Delivered') return { ...step, time: timeStr, completed: true };
    }
    return step;
  });

  await collections().orders.updateOne({ id: req.params.id }, { $set: { status, timeline: updatedTimeline } });
  res.json({
    success: true,
    data: { ...withoutMongoId(order), status, timeline: updatedTimeline },
    message: `Order status updated to '${status}'`
  });
}));

export default router;
