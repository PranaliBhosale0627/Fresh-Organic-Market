import express from 'express';
const router = express.Router();
import { db } from '../config/db.js';
import { ApiError } from '../middleware/errorHandler.js';

// GET /api/customers - Get all customers
router.get('/', (req, res) => {
  const { status } = req.query;
  let customers = db.customers;

  if (status) {
    customers = customers.filter(c => c.status.toLowerCase() === status.toLowerCase());
  }

  res.json({ success: true, data: customers, count: customers.length });
});

// GET /api/customers/:id - Get single customer
router.get('/:id', (req, res, next) => {
  const customer = db.customers.find(c => c.id === req.params.id);
  if (!customer) return next(new ApiError(`Customer '${req.params.id}' not found`, 404));

  // Attach their orders
  const orders = db.orders.filter(o => o.customerEmail === customer.email);
  res.json({ success: true, data: { ...customer, orders } });
});

// PUT /api/customers/:id/toggle-status - Toggle Active / Blocked
router.put('/:id/toggle-status', (req, res, next) => {
  const idx = db.customers.findIndex(c => c.id === req.params.id);
  if (idx === -1) return next(new ApiError(`Customer '${req.params.id}' not found`, 404));

  const current = db.customers[idx].status;
  const newStatus = current === 'Active' ? 'Blocked' : 'Active';
  db.customers[idx] = { ...db.customers[idx], status: newStatus };

  res.json({
    success: true,
    data: db.customers[idx],
    message: `Customer status changed to '${newStatus}'`
  });
});

// POST /api/customers - Add a new customer
router.post('/', (req, res, next) => {
  const { name, email, avatar } = req.body;
  if (!name || !email) return next(new ApiError('name and email are required', 400));

  const exists = db.customers.find(c => c.email === email);
  if (exists) return next(new ApiError(`Customer with email '${email}' already exists`, 409));

  const newCustomer = {
    id: `cust-${Date.now()}`,
    name,
    email,
    avatar: avatar || name.split(' ').map(n => n[0]).join('').toUpperCase(),
    ordersCount: 0,
    joinDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    status: 'Active'
  };

  db.customers.push(newCustomer);
  res.status(201).json({ success: true, data: newCustomer, message: 'Customer created' });
});

export default router;
