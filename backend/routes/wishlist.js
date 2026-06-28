import express from 'express';
import { collections, getCart, getWishlist, setCart, setWishlist, withoutMongoId } from '../config/db.js';
import { ApiError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const items = await getWishlist(req.user.email);
  res.json({ success: true, data: items, count: items.length });
}));

router.post('/', asyncHandler(async (req, res, next) => {
  const { productId } = req.body;
  if (!productId) return next(new ApiError('productId is required', 400));

  const product = await collections().products.findOne({ id: productId });
  if (!product) return next(new ApiError(`Product '${productId}' not found`, 404));

  const wishlist = await getWishlist(req.user.email);
  const alreadySaved = wishlist.some((item) => item.id === productId);
  const updatedWishlist = alreadySaved ? wishlist : [withoutMongoId(product), ...wishlist];

  await setWishlist(req.user.email, updatedWishlist);
  res.status(alreadySaved ? 200 : 201).json({
    success: true,
    data: updatedWishlist,
    message: alreadySaved ? 'Product already in wishlist' : 'Product saved to wishlist'
  });
}));

router.delete('/:productId', asyncHandler(async (req, res, next) => {
  const wishlist = await getWishlist(req.user.email);
  const updatedWishlist = wishlist.filter((item) => item.id !== req.params.productId);

  if (updatedWishlist.length === wishlist.length) {
    return next(new ApiError(`Product '${req.params.productId}' not found in wishlist`, 404));
  }

  await setWishlist(req.user.email, updatedWishlist);
  res.json({ success: true, data: updatedWishlist, message: 'Product removed from wishlist' });
}));

router.post('/:productId/move-to-cart', asyncHandler(async (req, res, next) => {
  const product = await collections().products.findOne({ id: req.params.productId });
  if (!product) return next(new ApiError(`Product '${req.params.productId}' not found`, 404));
  if (product.stock <= 0) return next(new ApiError(`'${product.name}' is out of stock`, 400));

  const cleanProduct = withoutMongoId(product);
  const wishlist = await getWishlist(req.user.email);
  const cart = await getCart(req.user.email);
  const existingCartItem = cart.find((item) => item.product.id === req.params.productId);

  if (existingCartItem) {
    existingCartItem.quantity = Math.min(product.stock, existingCartItem.quantity + 1);
    existingCartItem.product = cleanProduct;
  } else {
    cart.push({ product: cleanProduct, quantity: 1 });
  }

  const updatedWishlist = wishlist.filter((item) => item.id !== req.params.productId);

  await Promise.all([
    setCart(req.user.email, cart),
    setWishlist(req.user.email, updatedWishlist)
  ]);

  res.json({
    success: true,
    data: {
      wishlist: updatedWishlist,
      cart
    },
    message: 'Product moved to cart'
  });
}));

export default router;
