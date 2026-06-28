import express from 'express';
import { collections, withoutMongoId } from '../config/db.js';
import { ApiError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  const query = {};

  if (category && category !== 'All Products') {
    query.category = new RegExp(`^${category}$`, 'i');
  }

  if (search) {
    const q = new RegExp(search, 'i');
    query.$or = [{ name: q }, { category: q }, { tag: q }];
  }

  const products = await collections().products.find(query).toArray();
  const data = products.map(withoutMongoId);
  res.json({ success: true, data, count: data.length });
}));

router.get('/categories', asyncHandler(async (req, res) => {
  const categories = await collections().products.distinct('category');
  res.json({ success: true, data: categories });
}));

router.get('/:id', asyncHandler(async (req, res, next) => {
  const product = await collections().products.findOne({ id: req.params.id });
  if (!product) return next(new ApiError(`Product with id '${req.params.id}' not found`, 404));
  res.json({ success: true, data: withoutMongoId(product) });
}));

router.post('/', asyncHandler(async (req, res, next) => {
  const { name, category, price, unit, image, stock, maxStock, description } = req.body;
  if (!name || !category || price == null || !unit || stock == null || !description) {
    return next(new ApiError('Missing required fields: name, category, price, unit, stock, description', 400));
  }

  const newProduct = {
    ...req.body,
    id: `prod-${Date.now()}`,
    name,
    category,
    price: parseFloat(price),
    unit,
    image: image || '',
    stock: parseInt(stock),
    maxStock: parseInt(maxStock) || parseInt(stock),
    description
  };

  await collections().products.insertOne(newProduct);
  res.status(201).json({ success: true, data: newProduct, message: 'Product added successfully' });
}));

router.put('/:id', asyncHandler(async (req, res, next) => {
  const result = await collections().products.findOneAndUpdate(
    { id: req.params.id },
    { $set: { ...req.body, id: req.params.id } },
    { returnDocument: 'after' }
  );

  if (!result) return next(new ApiError(`Product '${req.params.id}' not found`, 404));
  res.json({ success: true, data: withoutMongoId(result), message: 'Product updated' });
}));

router.put('/:id/restock', asyncHandler(async (req, res, next) => {
  const { quantity = 50 } = req.body;
  const product = await collections().products.findOne({ id: req.params.id });
  if (!product) return next(new ApiError(`Product '${req.params.id}' not found`, 404));

  const newStock = Math.min(product.maxStock, product.stock + parseInt(quantity));
  await collections().products.updateOne({ id: req.params.id }, { $set: { stock: newStock } });

  res.json({
    success: true,
    data: { ...withoutMongoId(product), stock: newStock },
    message: `Restocked ${quantity} units. New stock: ${newStock}`
  });
}));

router.put('/:id/price', asyncHandler(async (req, res, next) => {
  const { price } = req.body;
  if (price == null || isNaN(price)) return next(new ApiError('Valid price is required', 400));

  const result = await collections().products.findOneAndUpdate(
    { id: req.params.id },
    { $set: { price: parseFloat(price) } },
    { returnDocument: 'after' }
  );

  if (!result) return next(new ApiError(`Product '${req.params.id}' not found`, 404));
  res.json({ success: true, data: withoutMongoId(result), message: 'Price updated' });
}));

router.delete('/:id', asyncHandler(async (req, res, next) => {
  const result = await collections().products.deleteOne({ id: req.params.id });
  if (result.deletedCount === 0) return next(new ApiError(`Product '${req.params.id}' not found`, 404));
  res.json({ success: true, message: `Product '${req.params.id}' deleted successfully` });
}));

export default router;
