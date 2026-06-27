import express from 'express';
const router = express.Router();
import { db } from '../config/db.js';
import { ApiError } from '../middleware/errorHandler.js';

// POST /api/auth/register - Register a new customer
router.post('/register', (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return next(new ApiError('Name, email, and password are required', 400));
  }

  const lowerEmail = email.toLowerCase();
  const exists = db.customers.find(c => c.email.toLowerCase() === lowerEmail);
  if (exists || lowerEmail === 'admin@harvest.com') {
    return next(new ApiError(`Account with email '${email}' already exists`, 409));
  }

  // Create the new customer profile
  const newCustomer = {
    id: `cust-${Date.now()}`,
    name,
    email: lowerEmail,
    avatar: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    ordersCount: 0,
    joinDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    status: 'Active'
  };

  db.customers.push(newCustomer);
  db.passwords[lowerEmail] = password;
  db.carts[lowerEmail] = [];
  db.loyalties[lowerEmail] = {
    coins: 50, // 50 Welcome Coins!
    unlockedCoupons: [],
    quests: [
      { id: 'quest-recipes', title: 'Farmhouse Cook Master', description: 'Gather and add all required fresh ingredients of any delicious organic meal from our cookbook.', reward: 50, status: 'locked', progressText: '0/1 added to cart' },
      { id: 'quest-green', title: 'Carbon Neutral Delivery', description: 'Select an Eco-Consolidated delivery time slot at checkout to minimize last-mile transport emissions.', reward: 40, status: 'locked', progressText: '0/1 eco-slot selected' },
      { id: 'quest-local', title: 'Sourced Locally Patron', description: 'Support regional family farms by ordering any heirloom cherry tomatoes or purpled cauliflowers.', reward: 35, status: 'completable', progressText: 'Complete! Ready to claim reward' }
    ]
  };

  res.status(201).json({
    success: true,
    token: lowerEmail,
    user: {
      name: newCustomer.name,
      email: newCustomer.email,
      avatar: newCustomer.avatar,
      isAdmin: false
    },
    message: 'Registration successful!'
  });
});

// POST /api/auth/login - Log in
router.post('/login', (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ApiError('Email and password are required', 400));
  }

  const lowerEmail = email.toLowerCase();
  
  // Admin Login Handler
  if (lowerEmail === 'admin@harvest.com') {
    if (password === 'admin123') {
      return res.json({
        success: true,
        token: lowerEmail,
        user: {
          name: 'Verdant Admin',
          email: lowerEmail,
          avatar: 'AD',
          isAdmin: true
        },
        message: 'Admin login successful!'
      });
    } else {
      return next(new ApiError('Invalid admin password', 401));
    }
  }

  // Customer Login Handler
  const customer = db.customers.find(c => c.email.toLowerCase() === lowerEmail);
  if (!customer) {
    return next(new ApiError('Account not found with this email', 404));
  }

  if (customer.status === 'Blocked') {
    return next(new ApiError('Your account has been suspended. Please contact support.', 403));
  }

  const storedPassword = db.passwords[lowerEmail];
  if (!storedPassword || storedPassword !== password) {
    return next(new ApiError('Incorrect email or password', 401));
  }

  res.json({
    success: true,
    token: lowerEmail,
    user: {
      name: customer.name,
      email: customer.email,
      avatar: customer.avatar,
      isAdmin: false
    },
    message: 'Login successful!'
  });
});

// GET /api/auth/me - Verify active session from auth header
router.get('/me', (req, res) => {
  const email = req.user.email;
  
  if (email === 'admin@harvest.com') {
    return res.json({
      success: true,
      user: {
        name: 'Verdant Admin',
        email,
        avatar: 'AD',
        isAdmin: true
      }
    });
  }

  const customer = db.customers.find(c => c.email.toLowerCase() === email);
  if (!customer) {
    return res.json({ success: false, user: null });
  }

  res.json({
    success: true,
    user: {
      name: customer.name,
      email: customer.email,
      avatar: customer.avatar,
      isAdmin: false
    }
  });
});

export default router;
