import express from 'express';
import jwt from 'jsonwebtoken';
import { ADMIN_EMAIL, collections, createDefaultLoyalty, withoutMongoId } from '../config/db.js';
import { ApiError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = express.Router();

function signToken(email, role) {
  return jwt.sign(
    { email: email.toLowerCase(), role },
    process.env.JWT_SECRET || 'fresh-organic-market-dev-secret',
    { expiresIn: '7d' }
  );
}

function userResponse(customer, isAdmin = false, partner = null) {
  if (isAdmin) {
    return { name: 'Verdant Admin', email: ADMIN_EMAIL, avatar: 'AD', isAdmin: true, role: 'admin' };
  }

  if (partner) {
    return {
      name: partner.name,
      email: partner.email,
      avatar: partner.avatar || partner.name.slice(0, 2).toUpperCase(),
      isAdmin: false,
      role: 'delivery_partner',
      isDeliveryPartner: true
    };
  }

  return {
    name: customer.name,
    email: customer.email,
    avatar: customer.avatar,
    isAdmin: false,
    role: 'customer'
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
    collections().accounts.insertOne({ email: lowerEmail, password, role: 'customer', isAdmin: false }),
    collections().carts.updateOne({ email: lowerEmail }, { $set: { email: lowerEmail, items: [] } }, { upsert: true }),
    collections().loyalties.updateOne({ email: lowerEmail }, { $set: { email: lowerEmail, ...createDefaultLoyalty(50) } }, { upsert: true })
  ]);

  res.status(201).json({
    success: true,
    token: signToken(lowerEmail, 'customer'),
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

  const role = account.role || (account.isAdmin ? 'admin' : 'customer');

  if (role === 'admin') {
    return res.json({
      success: true,
      token: signToken(lowerEmail, 'admin'),
      user: userResponse(null, true),
      message: 'Admin login successful!'
    });
  }

  if (role === 'delivery_partner') {
    const partner = await collections().deliveryPartners.findOne({ email: lowerEmail });
    if (!partner) return next(new ApiError('Delivery partner profile not found', 404));
    if (partner.status !== 'Active') return next(new ApiError('Delivery partner account is inactive', 403));

    return res.json({
      success: true,
      token: signToken(lowerEmail, 'delivery_partner'),
      user: userResponse(null, false, withoutMongoId(partner)),
      message: 'Delivery partner login successful!'
    });
  }

  const customer = await collections().customers.findOne({ email: lowerEmail });
  if (!customer) return next(new ApiError('Account not found with this email', 404));
  if (customer.status === 'Blocked') {
    return next(new ApiError('Your account has been suspended. Please contact support.', 403));
  }

  res.json({
    success: true,
    token: signToken(lowerEmail, 'customer'),
    user: userResponse(withoutMongoId(customer)),
    message: 'Login successful!'
  });
}));

router.get('/me', asyncHandler(async (req, res) => {
  if (req.user.role === 'admin' || req.user.email === ADMIN_EMAIL) {
    return res.json({ success: true, user: userResponse(null, true) });
  }

  if (req.user.role === 'delivery_partner') {
    const partner = await collections().deliveryPartners.findOne({ email: req.user.email });
    return res.json({ success: true, user: userResponse(null, false, withoutMongoId(partner)) });
  }

  const customer = await collections().customers.findOne({ email: req.user.email });
  if (!customer) return res.json({ success: false, user: null });

  res.json({ success: true, user: userResponse(withoutMongoId(customer)) });
}));

export default router;
