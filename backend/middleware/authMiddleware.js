import jwt from 'jsonwebtoken';
import { ADMIN_EMAIL, DEFAULT_USER_EMAIL, collections, ensureUserState, withoutMongoId } from '../config/db.js';

function parseAuthToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { email: DEFAULT_USER_EMAIL };
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fresh-organic-market-dev-secret');
    return { email: decoded.email, role: decoded.role };
  } catch {
    return { email: token };
  }
}

export async function authMiddleware(req, res, next) {
  try {
    const { email = DEFAULT_USER_EMAIL, role: tokenRole } = parseAuthToken(req.headers.authorization);
    const lowerEmail = email.toLowerCase();
    const account = await collections().accounts.findOne({ email: lowerEmail });
    const role = tokenRole || account?.role || (lowerEmail === ADMIN_EMAIL ? 'admin' : 'customer');
    const isAdmin = role === 'admin' || lowerEmail === ADMIN_EMAIL;
    const isDeliveryPartner = role === 'delivery_partner';

    if (!isAdmin && !isDeliveryPartner) {
      await ensureUserState(lowerEmail);
    }
    const customer = await collections().customers.findOne({ email: lowerEmail });
    const deliveryPartner = await collections().deliveryPartners.findOne({ email: lowerEmail });

    req.user = {
      email: lowerEmail,
      isAdmin,
      role,
      isDeliveryPartner,
      customer: withoutMongoId(customer),
      deliveryPartner: withoutMongoId(deliveryPartner)
    };

    next();
  } catch (error) {
    next(error);
  }
}
