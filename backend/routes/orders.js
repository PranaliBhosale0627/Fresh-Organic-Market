import express from 'express';
const router = express.Router();
import { db } from '../config/db.js';
import { ApiError } from '../middleware/errorHandler.js';

// GET /api/orders - Get all orders (isolated for customers, full list for admins)
router.get('/', (req, res) => {
  const { status, customerId } = req.query;
  let orders = db.orders;

  // Restrict orders to logged-in user unless Admin
  if (!req.user.isAdmin) {
    orders = orders.filter(o => o.customerEmail.toLowerCase() === req.user.email.toLowerCase());
  } else if (customerId) {
    orders = orders.filter(o => o.customerId === customerId);
  }

  if (status) {
    orders = orders.filter(o => o.status.toLowerCase() === status.toLowerCase());
  }

  res.json({ success: true, data: orders, count: orders.length });
});

// GET /api/orders/:id - Get single order
router.get('/:id', (req, res, next) => {
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return next(new ApiError(`Order '${req.params.id}' not found`, 404));

  // Isolate customer orders unless Admin
  if (!req.user.isAdmin && order.customerEmail.toLowerCase() !== req.user.email.toLowerCase()) {
    return next(new ApiError('Unauthorized to view this order', 403));
  }

  res.json({ success: true, data: order });
});

// POST /api/orders - Place a new order
router.post('/', (req, res, next) => {
  const { cartItems, address, deliveryTimeSlot, paymentMethod, appliedDiscount = 0 } = req.body;
  const user = req.user;

  if (!cartItems || cartItems.length === 0) {
    return next(new ApiError('Cart is empty. Cannot place an order.', 400));
  }
  if (!address || !deliveryTimeSlot || !paymentMethod) {
    return next(new ApiError('address, deliveryTimeSlot, and paymentMethod are required', 400));
  }

  // Validate stock for each item
  for (const item of cartItems) {
    const product = db.products.find(p => p.id === item.product.id);
    if (!product) return next(new ApiError(`Product '${item.product.id}' not found`, 404));
    if (product.stock < item.quantity) {
      return next(new ApiError(`Insufficient stock for '${product.name}'. Available: ${product.stock}`, 400));
    }
  }

  // Compute totals
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
    items: cartItems.map(item => ({
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

  // Deduct stock from products
  for (const item of cartItems) {
    const productIdx = db.products.findIndex(p => p.id === item.product.id);
    db.products[productIdx].stock = Math.max(0, db.products[productIdx].stock - item.quantity);
  }

  // Update customer order count
  const customerIdx = db.customers.findIndex(c => c.email.toLowerCase() === user.email.toLowerCase());
  if (customerIdx !== -1) {
    db.customers[customerIdx].ordersCount += 1;
  }

  // Award eco coins if eco delivery was selected
  if (deliveryTimeSlot.includes('Eco-Consolidated') && db.loyalties[user.email]) {
    db.loyalties[user.email].coins += 20;
    // Complete the eco quest if not already done
    const questIdx = db.loyalties[user.email].quests.findIndex(q => q.id === 'quest-green');
    if (questIdx !== -1 && db.loyalties[user.email].quests[questIdx].status === 'locked') {
      db.loyalties[user.email].quests[questIdx].status = 'completable';
      db.loyalties[user.email].quests[questIdx].progressText = '1/1 eco-slot selected - Reward available!';
    }
  }

  // Prepend to orders list (newest first)
  db.orders.unshift(newOrder);

  // Clear the user's cart
  db.carts[user.email] = [];

  res.status(201).json({ success: true, data: newOrder, message: 'Order placed successfully' });
});

// PUT /api/orders/:id/status - Update order status (Admin only)
router.put('/:id/status', (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(new ApiError('Unauthorized. Admin privilege required.', 403));
  }

  const { status } = req.body;
  const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  if (!status || !validStatuses.includes(status)) {
    return next(new ApiError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400));
  }

  const idx = db.orders.findIndex(o => o.id === req.params.id);
  if (idx === -1) return next(new ApiError(`Order '${req.params.id}' not found`, 404));

  const timeStr = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const order = db.orders[idx];

  // Update timeline based on new status
  const updatedTimeline = order.timeline.map(step => {
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

  db.orders[idx] = { ...order, status, timeline: updatedTimeline };
  res.json({ success: true, data: db.orders[idx], message: `Order status updated to '${status}'` });
});

// GET /api/orders/stats/summary - Dashboard stats (Admin only)
router.get('/stats/summary', (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(new ApiError('Unauthorized. Admin privilege required.', 403));
  }

  const orders = db.orders;
  const revenue = orders.filter(o => o.status === 'Delivered').reduce((sum, o) => sum + o.total, 0);
  const byStatus = {
    Pending: orders.filter(o => o.status === 'Pending').length,
    Processing: orders.filter(o => o.status === 'Processing').length,
    Shipped: orders.filter(o => o.status === 'Shipped').length,
    Delivered: orders.filter(o => o.status === 'Delivered').length,
  };

  res.json({
    success: true,
    data: {
      totalOrders: orders.length,
      totalRevenue: parseFloat(revenue.toFixed(2)),
      byStatus
    }
  });
});

export default router;
