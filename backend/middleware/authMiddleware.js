import { db } from '../config/db.js';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  let email = 'elena.r@example.com'; // Default backward compatible user

  if (authHeader && authHeader.startsWith('Bearer ')) {
    email = authHeader.split(' ')[1];
  }

  // Initialize cart and loyalty for new or existing users dynamically
  if (email && email !== 'admin@harvest.com') {
    const lowerEmail = email.toLowerCase();
    if (!db.carts[lowerEmail]) {
      db.carts[lowerEmail] = [];
    }
    if (!db.loyalties[lowerEmail]) {
      db.loyalties[lowerEmail] = {
        coins: 50, // 50 Coins Welcome Bonus!
        unlockedCoupons: [],
        quests: [
          { id: 'quest-recipes', title: 'Farmhouse Cook Master', description: 'Gather and add all required fresh ingredients of any delicious organic meal from our cookbook.', reward: 50, status: 'locked', progressText: '0/1 added to cart' },
          { id: 'quest-green', title: 'Carbon Neutral Delivery', description: 'Select an Eco-Consolidated delivery time slot at checkout to minimize last-mile transport emissions.', reward: 40, status: 'locked', progressText: '0/1 eco-slot selected' },
          { id: 'quest-local', title: 'Sourced Locally Patron', description: 'Support regional family farms by ordering any heirloom cherry tomatoes or purpled cauliflowers.', reward: 35, status: 'completable', progressText: 'Complete! Ready to claim reward' }
        ]
      };
    }
  }

  const customer = db.customers.find(c => c.email.toLowerCase() === email.toLowerCase());
  const isAdmin = email.toLowerCase() === 'admin@harvest.com';

  req.user = {
    email: email.toLowerCase(),
    isAdmin,
    customer
  };

  next();
}
