/**
 * Verdant Harvest — Express Backend
 *
 * RESTful API server for the fresh & organic grocery store.
 * Runs on PORT 5000 (or process.env.PORT).
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import customerRoutes from './routes/customers.js';
import cartRoutes from './routes/cart.js';
import loyaltyRoutes from './routes/loyalty.js';
import { authMiddleware } from './middleware/authMiddleware.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Global auth parser middleware
app.use(authMiddleware);

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🌿 Verdant Harvest API is running',
    version: '1.1.0',
    timestamp: new Date().toISOString()
  });
});

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/loyalty', loyaltyRoutes);

// ─── Error Handling ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('  🌿 Verdant Harvest API Server');
  console.log('  ─────────────────────────────');
  console.log(`  ✅ Running at: http://localhost:${PORT}`);
  console.log(`  🔑 Auth:       http://localhost:${PORT}/api/auth`);
  console.log(`  📦 Products:   http://localhost:${PORT}/api/products`);
  console.log(`  📋 Orders:     http://localhost:${PORT}/api/orders`);
  console.log(`  👤 Customers:  http://localhost:${PORT}/api/customers`);
  console.log(`  🛒 Cart:       http://localhost:${PORT}/api/cart`);
  console.log(`  🏆 Loyalty:    http://localhost:${PORT}/api/loyalty`);
  console.log('');
});

export default app;
