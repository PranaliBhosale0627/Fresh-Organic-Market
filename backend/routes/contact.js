import express from 'express';
import { collections, withoutMongoId } from '../config/db.js';
import { emitToAdmins } from '../config/socket.js';
import { ApiError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = express.Router();

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post('/', asyncHandler(async (req, res, next) => {
  const { name, email, phone = '', subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return next(new ApiError('Name, email, subject, and message are required', 400));
  }
  if (!isValidEmail(email)) {
    return next(new ApiError('Please enter a valid email address', 400));
  }

  const contactMessage = {
    id: `msg-${Date.now()}`,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    subject: subject.trim(),
    message: message.trim(),
    status: 'New',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await collections().contactMessages.insertOne(contactMessage);
  emitToAdmins('contact:new', contactMessage);

  res.status(201).json({
    success: true,
    data: contactMessage,
    message: 'Your message has been sent. Our team will contact you soon.'
  });
}));

router.get('/', asyncHandler(async (req, res, next) => {
  if (!req.user.isAdmin) return next(new ApiError('Admin privilege required.', 403));
  const messages = await collections().contactMessages.find({}).sort({ createdAt: -1 }).toArray();
  res.json({ success: true, data: messages.map(withoutMongoId), count: messages.length });
}));

router.put('/:id/status', asyncHandler(async (req, res, next) => {
  if (!req.user.isAdmin) return next(new ApiError('Admin privilege required.', 403));
  const status = ['New', 'Read', 'Resolved'].includes(req.body.status) ? req.body.status : 'Read';
  const result = await collections().contactMessages.findOneAndUpdate(
    { id: req.params.id },
    { $set: { status, updatedAt: new Date().toISOString() } },
    { returnDocument: 'after' }
  );
  if (!result) return next(new ApiError('Contact message not found', 404));
  res.json({ success: true, data: withoutMongoId(result) });
}));

export default router;
