import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_CUSTOMERS, INITIAL_LOYALTY } from '../data/seed.js';

// Deep clone seed data so restarts always get fresh copies
const db = {
  products: JSON.parse(JSON.stringify(INITIAL_PRODUCTS)),
  orders: JSON.parse(JSON.stringify(INITIAL_ORDERS)),
  customers: JSON.parse(JSON.stringify(INITIAL_CUSTOMERS)),
  // Map email -> cart items array
  carts: {
    'elena.r@example.com': []
  },
  // Map email -> loyalty object
  loyalties: {
    'elena.r@example.com': JSON.parse(JSON.stringify(INITIAL_LOYALTY))
  },
  // Simple password store for in-memory accounts: email -> password
  passwords: {
    'elena.r@example.com': 'password123',
    'admin@harvest.com': 'admin123'
  }
};

function resetDatabase() {
  db.products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
  db.orders = JSON.parse(JSON.stringify(INITIAL_ORDERS));
  db.customers = JSON.parse(JSON.stringify(INITIAL_CUSTOMERS));
  db.carts = { 'elena.r@example.com': [] };
  db.loyalties = { 'elena.r@example.com': JSON.parse(JSON.stringify(INITIAL_LOYALTY)) };
  db.passwords = { 'elena.r@example.com': 'password123', 'admin@harvest.com': 'admin123' };
}

export { db, resetDatabase };
