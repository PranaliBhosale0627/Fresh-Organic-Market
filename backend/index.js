/**
 * Verdant Harvest Express Backend
 *
 * RESTful API server for the fresh and organic grocery store.
 * Runs on Render's PORT or local port 5000.
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
import { connectToDatabase } from './config/db.js';
import { authMiddleware } from './middleware/authMiddleware.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    const localOrigins = ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4173'];
    const origins = [...localOrigins, ...allowedOrigins];

    if (!origin || origins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(authMiddleware);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Verdant Harvest API is running',
    version: '1.1.0',
    database: 'mongodb',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/loyalty', loyaltyRoutes);

app.use(notFound);
app.use(errorHandler);

connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log('');
      console.log('  Verdant Harvest API Server');
      console.log(`  Running at: http://localhost:${PORT}`);
      console.log(`  Auth:       http://localhost:${PORT}/api/auth`);
      console.log(`  Products:   http://localhost:${PORT}/api/products`);
      console.log(`  Orders:     http://localhost:${PORT}/api/orders`);
      console.log(`  Customers:  http://localhost:${PORT}/api/customers`);
      console.log(`  Cart:       http://localhost:${PORT}/api/cart`);
      console.log(`  Loyalty:    http://localhost:${PORT}/api/loyalty`);
      console.log('');
    });
  })
  .catch((error) => {
    console.error('Failed to start backend:', error.message);
    process.exit(1);
  });

export default app;
