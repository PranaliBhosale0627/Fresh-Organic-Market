import { ADMIN_EMAIL, DEFAULT_USER_EMAIL, collections, ensureUserState, withoutMongoId } from '../config/db.js';

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  let email = DEFAULT_USER_EMAIL;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    email = authHeader.split(' ')[1];
  }

  try {
    const lowerEmail = email.toLowerCase();
    const isAdmin = lowerEmail === ADMIN_EMAIL;

    await ensureUserState(lowerEmail);
    const customer = await collections().customers.findOne({ email: lowerEmail });

    req.user = {
      email: lowerEmail,
      isAdmin,
      customer: withoutMongoId(customer)
    };

    next();
  } catch (error) {
    next(error);
  }
}
