import express from 'express';
const router = express.Router();
import { db } from '../config/db.js';
import { ApiError } from '../middleware/errorHandler.js';

// GET /api/cart - Get current user's cart
router.get('/', (req, res) => {
  const userEmail = req.user.email;
  const userCart = db.carts[userEmail] || [];

  const subtotal = userCart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const count = userCart.reduce((acc, item) => acc + item.quantity, 0);

  res.json({
    success: true,
    data: userCart,
    summary: {
      count,
      subtotal: parseFloat(subtotal.toFixed(2))
    }
  });
});

// POST /api/cart - Add item to cart (or increment if exists)
router.post('/', (req, res, next) => {
  const { productId, quantity = 1 } = req.body;
  if (!productId) return next(new ApiError('productId is required', 400));

  const product = db.products.find(p => p.id === productId);
  if (!product) return next(new ApiError(`Product '${productId}' not found`, 404));
  if (product.stock <= 0) return next(new ApiError(`'${product.name}' is out of stock`, 400));

  const userEmail = req.user.email;
  if (!db.carts[userEmail]) db.carts[userEmail] = [];
  const userCart = db.carts[userEmail];

  const existing = userCart.find(item => item.product.id === productId);
  if (existing) {
    existing.quantity = Math.min(product.stock, existing.quantity + parseInt(quantity));
  } else {
    userCart.push({ product, quantity: Math.min(product.stock, parseInt(quantity)) });
  }

  res.json({ success: true, data: userCart, message: `'${product.name}' added to cart` });
});

// PUT /api/cart/:productId - Update quantity of a cart item
router.put('/:productId', (req, res, next) => {
  const { quantity } = req.body;
  if (quantity == null) return next(new ApiError('quantity is required', 400));

  const qty = parseInt(quantity);
  const userEmail = req.user.email;
  if (!db.carts[userEmail]) db.carts[userEmail] = [];

  // Remove if quantity is 0 or less
  if (qty <= 0) {
    db.carts[userEmail] = db.carts[userEmail].filter(item => item.product.id !== req.params.productId);
    return res.json({ success: true, data: db.carts[userEmail], message: 'Item removed from cart' });
  }

  const idx = db.carts[userEmail].findIndex(item => item.product.id === req.params.productId);
  if (idx === -1) return next(new ApiError(`Product '${req.params.productId}' not in cart`, 404));

  const product = db.products.find(p => p.id === req.params.productId);
  const maxQty = product ? product.stock : 99;
  db.carts[userEmail][idx].quantity = Math.min(maxQty, qty);

  res.json({ success: true, data: db.carts[userEmail], message: 'Cart updated' });
});

// DELETE /api/cart/:productId - Remove a specific item from cart
router.delete('/:productId', (req, res, next) => {
  const userEmail = req.user.email;
  if (!db.carts[userEmail]) db.carts[userEmail] = [];

  const before = db.carts[userEmail].length;
  db.carts[userEmail] = db.carts[userEmail].filter(item => item.product.id !== req.params.productId);

  if (db.carts[userEmail].length === before) {
    return next(new ApiError(`Product '${req.params.productId}' not found in cart`, 404));
  }

  res.json({ success: true, data: db.carts[userEmail], message: 'Item removed from cart' });
});

// DELETE /api/cart - Clear entire cart
router.delete('/', (req, res) => {
  const userEmail = req.user.email;
  db.carts[userEmail] = [];
  res.json({ success: true, data: [], message: 'Cart cleared' });
});

export default router;
