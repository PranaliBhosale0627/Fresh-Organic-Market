import express from 'express';
import { ADMIN_EMAIL, collections, createDefaultLoyalty, withoutMongoId } from '../config/db.js';
import { ApiError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = express.Router();

function userResponse(customer, isAdmin = false) {
  if (isAdmin) {
    return { name: 'Verdant Admin', email: ADMIN_EMAIL, avatar: 'AD', isAdmin: true };
  }

  return {
    name: customer.name,
    email: customer.email,
    avatar: customer.avatar,
    isAdmin: false
  };
}

router.post('/register', asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return next(new ApiError('Name, email, and password are required', 400));
  }

  const lowerEmail = email.toLowerCase();
  const exists = await collections().customers.findOne({ email: lowerEmail });
  if (exists || lowerEmail === ADMIN_EMAIL) {
    return next(new ApiError(`Account with email '${email}' already exists`, 409));
  }

  const newCustomer = {
    id: `cust-${Date.now()}`,
    name,
    email: lowerEmail,
    avatar: name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2),
    ordersCount: 0,
    joinDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    status: 'Active'
  };

  await Promise.all([
    collections().customers.insertOne(newCustomer),
    collections().accounts.insertOne({ email: lowerEmail, password, isAdmin: false }),
    collections().carts.updateOne({ email: lowerEmail }, { $set: { email: lowerEmail, items: [] } }, { upsert: true }),
    collections().loyalties.updateOne({ email: lowerEmail }, { $set: { email: lowerEmail, ...createDefaultLoyalty(50) } }, { upsert: true })
  ]);

  res.status(201).json({
    success: true,
    token: lowerEmail,
    user: userResponse(newCustomer),
    message: 'Registration successful!'
  });
}));

router.post('/login', asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ApiError('Email and password are required', 400));
  }

  const lowerEmail = email.toLowerCase();
  const account = await collections().accounts.findOne({ email: lowerEmail });

  if (!account || account.password !== password) {
    return next(new ApiError(lowerEmail === ADMIN_EMAIL ? 'Invalid admin password' : 'Incorrect email or password', 401));
  }

  if (account.isAdmin) {
    return res.json({
      success: true,
      token: lowerEmail,
      user: userResponse(null, true),
      message: 'Admin login successful!'
    });
  }

  const customer = await collections().customers.findOne({ email: lowerEmail });
  if (!customer) return next(new ApiError('Account not found with this email', 404));
  if (customer.status === 'Blocked') {
    return next(new ApiError('Your account has been suspended. Please contact support.', 403));
  }

  res.json({
    success: true,
    token: lowerEmail,
    user: userResponse(withoutMongoId(customer)),
    message: 'Login successful!'
  });
}));

router.get('/me', asyncHandler(async (req, res) => {
  if (req.user.email === ADMIN_EMAIL) {
    return res.json({ success: true, user: userResponse(null, true) });
  }

  const customer = await collections().customers.findOne({ email: req.user.email });
  if (!customer) return res.json({ success: false, user: null });

  res.json({ success: true, user: userResponse(withoutMongoId(customer)) });
}));

export default router;
