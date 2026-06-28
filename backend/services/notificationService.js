import { collections, withoutMongoId } from '../config/db.js';
import { emitToAdmins, emitToUser } from '../config/socket.js';

async function createNotification({
  recipientEmail = null,
  recipientRole = 'customer',
  type,
  title,
  message,
  data = {}
}) {
  const notification = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    recipientEmail: recipientEmail ? recipientEmail.toLowerCase() : null,
    recipientRole,
    type,
    title,
    message,
    data,
    read: false,
    createdAt: new Date().toISOString()
  };

  await collections().notifications.insertOne(notification);
  return notification;
}

async function notifyAdmins(payload) {
  const notification = await createNotification({
    ...payload,
    recipientRole: 'admin'
  });

  emitToAdmins('notification:new', notification);
  return notification;
}

async function notifyCustomer(email, payload) {
  const notification = await createNotification({
    ...payload,
    recipientEmail: email,
    recipientRole: 'customer'
  });

  emitToUser(email, 'notification:new', notification);
  return notification;
}

async function getNotificationsForUser(user) {
  const query = user.isAdmin
    ? { recipientRole: 'admin' }
    : { recipientEmail: user.email };

  const notifications = await collections()
    .notifications
    .find(query)
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  return notifications.map(withoutMongoId);
}

export {
  createNotification,
  getNotificationsForUser,
  notifyAdmins,
  notifyCustomer
};
