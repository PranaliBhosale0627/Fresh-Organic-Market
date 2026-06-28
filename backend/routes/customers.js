import express from 'express';
import { collections, withoutMongoId } from '../config/db.js';
import { ApiError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = status ? { status: new RegExp(`^${status}$`, 'i') } : {};
  const customers = await collections().customers.find(query).toArray();
  const data = customers.map(withoutMongoId);
  res.json({ success: true, data, count: data.length });
}));

router.get('/:id', asyncHandler(async (req, res, next) => {
  const customer = await collections().customers.findOne({ id: req.params.id });
  if (!customer) return next(new ApiError(`Customer '${req.params.id}' not found`, 404));

  const orders = await collections().orders.find({ customerEmail: customer.email }).toArray();
  res.json({ success: true, data: { ...withoutMongoId(customer), orders: orders.map(withoutMongoId) } });
}));

router.put('/:id/toggle-status', asyncHandler(async (req, res, next) => {
  const customer = await collections().customers.findOne({ id: req.params.id });
  if (!customer) return next(new ApiError(`Customer '${req.params.id}' not found`, 404));

  const newStatus = customer.status === 'Active' ? 'Blocked' : 'Active';
  await collections().customers.updateOne({ id: req.params.id }, { $set: { status: newStatus } });

  res.json({
    success: true,
    data: { ...withoutMongoId(customer), status: newStatus },
    message: `Customer status changed to '${newStatus}'`
  });
}));

router.post('/', asyncHandler(async (req, res, next) => {
  const { name, email, avatar } = req.body;
  if (!name || !email) return next(new ApiError('name and email are required', 400));

  const lowerEmail = email.toLowerCase();
  const exists = await collections().customers.findOne({ email: lowerEmail });
  if (exists) return next(new ApiError(`Customer with email '${email}' already exists`, 409));

  const newCustomer = {
    id: `cust-${Date.now()}`,
    name,
    email: lowerEmail,
    avatar: avatar || name.split(' ').map((n) => n[0]).join('').toUpperCase(),
    ordersCount: 0,
    joinDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    status: 'Active'
  };

  await collections().customers.insertOne(newCustomer);
  res.status(201).json({ success: true, data: newCustomer, message: 'Customer created' });
}));

export default router;
