import { MongoClient } from 'mongodb';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_CUSTOMERS, INITIAL_LOYALTY } from '../data/seed.js';

let client;
let database;

const DEFAULT_USER_EMAIL = 'elena.r@example.com';
const ADMIN_EMAIL = 'admin@harvest.com';

const deepClone = (value) => JSON.parse(JSON.stringify(value));

function withoutMongoId(document) {
  if (!document) return null;
  const { _id, ...rest } = document;
  return rest;
}

function getMongoUri() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    throw new Error('Missing MONGODB_URI. Add your MongoDB Atlas connection string in Render environment variables.');
  }
  return uri;
}

function getDatabaseName(uri) {
  if (process.env.MONGODB_DB) return process.env.MONGODB_DB;
  try {
    const parsed = new URL(uri);
    const dbName = parsed.pathname.replace('/', '');
    return dbName || 'verdant_harvest';
  } catch {
    return 'verdant_harvest';
  }
}

async function connectToDatabase() {
  if (database) return database;

  const uri = getMongoUri();
  client = new MongoClient(uri);
  await client.connect();
  database = client.db(getDatabaseName(uri));

  await createIndexes();
  await seedDatabase();

  return database;
}

function collections() {
  if (!database) {
    throw new Error('Database not connected. Call connectToDatabase before handling requests.');
  }

  return {
    products: database.collection('products'),
    orders: database.collection('orders'),
    customers: database.collection('customers'),
    carts: database.collection('carts'),
    wishlists: database.collection('wishlists'),
    loyalties: database.collection('loyalties'),
    accounts: database.collection('accounts'),
    notifications: database.collection('notifications')
  };
}

async function createIndexes() {
  const db = collections();
  await Promise.all([
    db.products.createIndex({ id: 1 }, { unique: true }),
    db.orders.createIndex({ id: 1 }, { unique: true }),
    db.orders.createIndex({ customerEmail: 1 }),
    db.customers.createIndex({ id: 1 }, { unique: true }),
    db.customers.createIndex({ email: 1 }, { unique: true }),
    db.carts.createIndex({ email: 1 }, { unique: true }),
    db.wishlists.createIndex({ email: 1 }, { unique: true }),
    db.loyalties.createIndex({ email: 1 }, { unique: true }),
    db.accounts.createIndex({ email: 1 }, { unique: true }),
    db.notifications.createIndex({ recipientEmail: 1, createdAt: -1 }),
    db.notifications.createIndex({ recipientRole: 1, createdAt: -1 }),
    db.notifications.createIndex({ id: 1 }, { unique: true })
  ]);
}

async function seedDatabase() {
  const db = collections();

  if (await db.products.countDocuments() === 0) {
    await db.products.insertMany(deepClone(INITIAL_PRODUCTS));
  }

  if (await db.orders.countDocuments() === 0) {
    await db.orders.insertMany(deepClone(INITIAL_ORDERS));
  }

  if (await db.customers.countDocuments() === 0) {
    await db.customers.insertMany(deepClone(INITIAL_CUSTOMERS));
  }

  await db.accounts.updateOne(
    { email: DEFAULT_USER_EMAIL },
    { $setOnInsert: { email: DEFAULT_USER_EMAIL, password: 'password123', isAdmin: false } },
    { upsert: true }
  );

  await db.accounts.updateOne(
    { email: ADMIN_EMAIL },
    { $setOnInsert: { email: ADMIN_EMAIL, password: 'admin123', isAdmin: true } },
    { upsert: true }
  );

  await ensureUserState(DEFAULT_USER_EMAIL, 185);
  await migrateLegacyOrders();
}

async function migrateLegacyOrders() {
  const db = collections();
  await Promise.all([
    db.orders.updateMany({ status: 'Processing' }, { $set: { status: 'Packed' } }),
    db.orders.updateMany({ status: 'Shipped' }, { $set: { status: 'Out for Delivery' } })
  ]);
}

function createDefaultLoyalty(coins = 50) {
  return {
    coins,
    unlockedCoupons: [],
    quests: deepClone(INITIAL_LOYALTY.quests)
  };
}

async function ensureUserState(email, startingCoins = 50) {
  if (!email || email === ADMIN_EMAIL) return;
  const db = collections();

  await db.carts.updateOne(
    { email },
    { $setOnInsert: { email, items: [] } },
    { upsert: true }
  );

  await db.wishlists.updateOne(
    { email },
    { $setOnInsert: { email, items: [] } },
    { upsert: true }
  );

  await db.loyalties.updateOne(
    { email },
    { $setOnInsert: { email, ...createDefaultLoyalty(startingCoins) } },
    { upsert: true }
  );
}

async function getCart(email) {
  const cart = await collections().carts.findOne({ email });
  return cart?.items || [];
}

async function setCart(email, items) {
  await collections().carts.updateOne(
    { email },
    { $set: { email, items } },
    { upsert: true }
  );
  return items;
}

async function getWishlist(email) {
  const wishlist = await collections().wishlists.findOne({ email });
  return wishlist?.items || [];
}

async function setWishlist(email, items) {
  await collections().wishlists.updateOne(
    { email },
    { $set: { email, items } },
    { upsert: true }
  );
  return items;
}

async function getLoyalty(email) {
  const loyalty = await collections().loyalties.findOne({ email });
  return withoutMongoId(loyalty);
}

async function setLoyalty(email, loyalty) {
  await collections().loyalties.updateOne(
    { email },
    { $set: { email, ...loyalty } },
    { upsert: true }
  );
  return getLoyalty(email);
}

export {
  ADMIN_EMAIL,
  DEFAULT_USER_EMAIL,
  collections,
  connectToDatabase,
  createDefaultLoyalty,
  ensureUserState,
  getCart,
  getWishlist,
  getLoyalty,
  setCart,
  setWishlist,
  setLoyalty,
  withoutMongoId
};
