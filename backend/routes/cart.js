import express from 'express';
import { collections, getCart, setCart, withoutMongoId } from '../config/db.js';
import { ApiError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const userCart = await getCart(req.user.email);
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
}));

router.post('/', asyncHandler(async (req, res, next) => {
  const { productId, quantity = 1 } = req.body;
  if (!productId) return next(new ApiError('productId is required', 400));

  const product = await collections().products.findOne({ id: productId });
  if (!product) return next(new ApiError(`Product '${productId}' not found`, 404));
  if (product.stock <= 0) return next(new ApiError(`'${product.name}' is out of stock`, 400));

  const cleanProduct = withoutMongoId(product);
  const userCart = await getCart(req.user.email);
  const existing = userCart.find((item) => item.product.id === productId);

  if (existing) {
    existing.quantity = Math.min(product.stock, existing.quantity + parseInt(quantity));
    existing.product = cleanProduct;
  } else {
    userCart.push({ product: cleanProduct, quantity: Math.min(product.stock, parseInt(quantity)) });
  }

  await setCart(req.user.email, userCart);
  res.json({ success: true, data: userCart, message: `'${product.name}' added to cart` });
}));

router.put('/:productId', asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  if (quantity == null) return next(new ApiError('quantity is required', 400));

  const qty = parseInt(quantity);
  let userCart = await getCart(req.user.email);

  if (qty <= 0) {
    userCart = userCart.filter((item) => item.product.id !== req.params.productId);
    await setCart(req.user.email, userCart);
    return res.json({ success: true, data: userCart, message: 'Item removed from cart' });
  }

  const idx = userCart.findIndex((item) => item.product.id === req.params.productId);
  if (idx === -1) return next(new ApiError(`Product '${req.params.productId}' not in cart`, 404));

  const product = await collections().products.findOne({ id: req.params.productId });
  const maxQty = product ? product.stock : 99;
  userCart[idx].quantity = Math.min(maxQty, qty);
  if (product) userCart[idx].product = withoutMongoId(product);

  await setCart(req.user.email, userCart);
  res.json({ success: true, data: userCart, message: 'Cart updated' });
}));

router.delete('/:productId', asyncHandler(async (req, res, next) => {
  const userCart = await getCart(req.user.email);
  const updatedCart = userCart.filter((item) => item.product.id !== req.params.productId);

  if (updatedCart.length === userCart.length) {
    return next(new ApiError(`Product '${req.params.productId}' not found in cart`, 404));
  }

  await setCart(req.user.email, updatedCart);
  res.json({ success: true, data: updatedCart, message: 'Item removed from cart' });
}));

router.delete('/', asyncHandler(async (req, res) => {
  await setCart(req.user.email, []);
  res.json({ success: true, data: [], message: 'Cart cleared' });
}));

export default router;
