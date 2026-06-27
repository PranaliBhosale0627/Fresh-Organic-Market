import express from 'express';
const router = express.Router();
import { db } from '../config/db.js';
import { ApiError } from '../middleware/errorHandler.js';

// GET /api/products - Get all products (optional ?category= filter)
router.get('/', (req, res) => {
  const { category, search } = req.query;
  let products = db.products;

  if (category && category !== 'All Products') {
    products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.tag && p.tag.toLowerCase().includes(q))
    );
  }

  res.json({ success: true, data: products, count: products.length });
});

// GET /api/products/categories - Get distinct categories
router.get('/categories', (req, res) => {
  const categories = [...new Set(db.products.map(p => p.category))];
  res.json({ success: true, data: categories });
});

// GET /api/products/:id - Get a single product
router.get('/:id', (req, res, next) => {
  const product = db.products.find(p => p.id === req.params.id);
  if (!product) return next(new ApiError(`Product with id '${req.params.id}' not found`, 404));
  res.json({ success: true, data: product });
});

// POST /api/products - Add a new product (Admin)
router.post('/', (req, res, next) => {
  const { name, category, price, unit, image, stock, maxStock, description } = req.body;
  if (!name || !category || price == null || !unit || !stock || !description) {
    return next(new ApiError('Missing required fields: name, category, price, unit, stock, description', 400));
  }

  const newProduct = {
    id: `prod-${Date.now()}`,
    name,
    category,
    price: parseFloat(price),
    unit,
    image: image || '',
    stock: parseInt(stock),
    maxStock: parseInt(maxStock) || parseInt(stock),
    description,
    ...req.body
  };

  db.products.push(newProduct);
  res.status(201).json({ success: true, data: newProduct, message: 'Product added successfully' });
});

// PUT /api/products/:id - Update a product fully
router.put('/:id', (req, res, next) => {
  const idx = db.products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return next(new ApiError(`Product '${req.params.id}' not found`, 404));

  db.products[idx] = { ...db.products[idx], ...req.body, id: req.params.id };
  res.json({ success: true, data: db.products[idx], message: 'Product updated' });
});

// PUT /api/products/:id/restock - Restock product by quantity
router.put('/:id/restock', (req, res, next) => {
  const { quantity = 50 } = req.body;
  const idx = db.products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return next(new ApiError(`Product '${req.params.id}' not found`, 404));

  const product = db.products[idx];
  const newStock = Math.min(product.maxStock, product.stock + parseInt(quantity));
  db.products[idx] = { ...product, stock: newStock };

  res.json({ success: true, data: db.products[idx], message: `Restocked ${quantity} units. New stock: ${newStock}` });
});

// PUT /api/products/:id/price - Update price only
router.put('/:id/price', (req, res, next) => {
  const { price } = req.body;
  if (price == null || isNaN(price)) return next(new ApiError('Valid price is required', 400));

  const idx = db.products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return next(new ApiError(`Product '${req.params.id}' not found`, 404));

  db.products[idx] = { ...db.products[idx], price: parseFloat(price) };
  res.json({ success: true, data: db.products[idx], message: 'Price updated' });
});

// DELETE /api/products/:id - Delete a product (Admin)
router.delete('/:id', (req, res, next) => {
  const idx = db.products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return next(new ApiError(`Product '${req.params.id}' not found`, 404));

  db.products.splice(idx, 1);
  res.json({ success: true, message: `Product '${req.params.id}' deleted successfully` });
});

export default router;
