import express from 'express';
import { collections, withoutMongoId } from '../config/db.js';
import { ApiError } from '../middleware/errorHandler.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { getNotificationsForUser } from '../services/notificationService.js';

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const notifications = await getNotificationsForUser(req.user);
  res.json({ success: true, data: notifications, count: notifications.length });
}));

router.put('/:id/read', asyncHandler(async (req, res, next) => {
  const query = req.user.isAdmin
    ? { id: req.params.id, recipientRole: 'admin' }
    : { id: req.params.id, recipientEmail: req.user.email };

  const result = await collections().notifications.findOneAndUpdate(
    query,
    { $set: { read: true, readAt: new Date().toISOString() } },
    { returnDocument: 'after' }
  );

  if (!result) return next(new ApiError(`Notification '${req.params.id}' not found`, 404));
  res.json({ success: true, data: withoutMongoId(result), message: 'Notification marked as read' });
}));

router.put('/read-all', asyncHandler(async (req, res) => {
  const query = req.user.isAdmin
    ? { recipientRole: 'admin' }
    : { recipientEmail: req.user.email };

  const result = await collections().notifications.updateMany(
    query,
    { $set: { read: true, readAt: new Date().toISOString() } }
  );

  res.json({ success: true, updatedCount: result.modifiedCount, message: 'Notifications marked as read' });
}));

export default router;
