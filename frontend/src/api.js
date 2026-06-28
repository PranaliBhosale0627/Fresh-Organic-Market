/**
 * Verdant Harvest — Frontend API Service
 * 
 * Centralised HTTP client for all backend API calls.
 * The Vite dev proxy routes /api/* to http://localhost:5000
 * so no CORS issues during development.
 */

const API_ROOT = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const BASE_URL = API_ROOT ? `${API_ROOT}/api` : '/api';

// ─── Token Management ─────────────────────────────────────────────────────────

export const authStorage = {
  getToken: () => localStorage.getItem('vh_auth_token'),
  setToken: (token) => localStorage.setItem('vh_auth_token', token),
  clearToken: () => localStorage.removeItem('vh_auth_token')
};

// ─── Utility Request ──────────────────────────────────────────────────────────

async function request(path, options = {}) {
  const token = authStorage.getToken();
  const headers = { 
    'Content-Type': 'application/json', 
    ...options.headers 
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    headers,
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `API Error: ${response.status}`);
  }
  return data;
}

// ─── Authentication ───────────────────────────────────────────────────────────

export const authApi = {
  register: (name, email, password) => request('/auth/register', { method: 'POST', body: { name, email, password } }),
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  me: () => request('/auth/me'),
  logout: () => {
    authStorage.clearToken();
    return Promise.resolve({ success: true });
  }
};

// ─── Products ─────────────────────────────────────────────────────────────────

export const productsApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/products${qs ? `?${qs}` : ''}`);
  },
  getById: (id) => request(`/products/${id}`),
  getCategories: () => request('/products/categories'),
  create: (product) => request('/products', { method: 'POST', body: product }),
  update: (id, data) => request(`/products/${id}`, { method: 'PUT', body: data }),
  restock: (id, quantity) => request(`/products/${id}/restock`, { method: 'PUT', body: { quantity } }),
  updatePrice: (id, price) => request(`/products/${id}/price`, { method: 'PUT', body: { price } }),
  delete: (id) => request(`/products/${id}`, { method: 'DELETE' })
};

// ─── Orders ───────────────────────────────────────────────────────────────────

export const ordersApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/orders${qs ? `?${qs}` : ''}`);
  },
  getById: (id) => request(`/orders/${id}`),
  place: (orderData) => request('/orders', { method: 'POST', body: orderData }),
  updateStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PUT', body: { status } }),
  getStats: () => request('/orders/stats/summary')
};

// ─── Customers ────────────────────────────────────────────────────────────────

export const customersApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/customers${qs ? `?${qs}` : ''}`);
  },
  getById: (id) => request(`/customers/${id}`),
  toggleStatus: (id) => request(`/customers/${id}/toggle-status`, { method: 'PUT' }),
  create: (customer) => request('/customers', { method: 'POST', body: customer })
};

// ─── Cart ─────────────────────────────────────────────────────────────────────

export const cartApi = {
  get: () => request('/cart'),
  addItem: (productId, quantity = 1) => request('/cart', { method: 'POST', body: { productId, quantity } }),
  updateQuantity: (productId, quantity) => request(`/cart/${productId}`, { method: 'PUT', body: { quantity } }),
  removeItem: (productId) => request(`/cart/${productId}`, { method: 'DELETE' }),
  clear: () => request('/cart', { method: 'DELETE' })
};

// Wishlist
export const wishlistApi = {
  get: () => request('/wishlist'),
  add: (productId) => request('/wishlist', { method: 'POST', body: { productId } }),
  remove: (productId) => request(`/wishlist/${productId}`, { method: 'DELETE' }),
  moveToCart: (productId) => request(`/wishlist/${productId}/move-to-cart`, { method: 'POST' })
};

// ─── Loyalty ──────────────────────────────────────────────────────────────────

export const loyaltyApi = {
  get: () => request('/loyalty'),
  setCoins: (coins) => request('/loyalty/coins', { method: 'PUT', body: { coins } }),
  addCoins: (amount) => request('/loyalty/coins/add', { method: 'PUT', body: { amount } }),
  spendCoins: (amount) => request('/loyalty/coins/spend', { method: 'PUT', body: { amount } }),
  completeQuest: (questId) => request(`/loyalty/quests/${questId}/complete`, { method: 'PUT' }),
  claimQuest: (questId) => request(`/loyalty/quests/${questId}/claim`, { method: 'PUT' }),
  unlockCoupon: (code, cost) => request('/loyalty/coupons', { method: 'POST', body: { code, cost } })
};

// ─── Health ───────────────────────────────────────────────────────────────────

export const healthApi = {
  check: () => request('/health')
};
