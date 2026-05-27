import apiClient from '../lib/apiClient.js';

// =========================
// CONFIG
// =========================
// BASE_URL handled by apiClient

// =========================
// TOKEN STORE
// =========================
export const tokenStore = {
  get: () => localStorage.getItem('access_token'),
  set: (token) => localStorage.setItem('access_token', token),

  getRefresh: () => localStorage.getItem('refresh_token'),
  setRefresh: (token) => localStorage.setItem('refresh_token', token),

  clear: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};

// =========================
// API CLIENT INSTANCE (handles auth, refresh, normalization)
// =========================
const api = apiClient;

// =========================
// AXIOS INTERCEPTORS
// =========================
// NOTE: src/lib/apiClient.js already contains a similar setup, but some flows
// import this module directly. These interceptors ensure Authorization is
// attached for every request made via `src/services/api.js`.

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses — token expired or invalid (refresh once, then redirect)
// Deduplicate concurrent refresh requests to avoid refresh storms + rate limiting.
let refreshPromise = null

async function refreshAccessToken(original) {
  if (refreshPromise) return refreshPromise

  // Try to refresh using the refresh token we store
  const refresh_token = tokenStore.getRefresh()
  if (!refresh_token) {
    tokenStore.clear()
    window.location.href = '/login'
    return Promise.reject(new Error('Missing refresh token'))
  }

  const { default: axios } = await import('axios')

  refreshPromise = axios
    .post(
      `${original.baseURL || api.defaults.baseURL}/api/auth/refresh`,
      { refresh_token },
      { withCredentials: true }
    )
    .then((refreshRes) => {
      tokenStore.set(refreshRes.data.access_token)
      if (refreshRes.data.refresh_token) tokenStore.setRefresh(refreshRes.data.refresh_token)
      return refreshRes.data
    })
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true

      try {
        const data = await refreshAccessToken(original)

        original.headers = original.headers || {}
        original.headers.Authorization = `Bearer ${data.access_token || tokenStore.get()}`
        return api(original)
      } catch {
        tokenStore.clear()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)
; 



// =========================
// AUTH
// =========================
export async function register(email, password, full_name, interests = [], signal) {
  const res = await api.post(
    '/api/auth/register',
    { email, password, full_name, interests },
    { signal }
  );
  return res.data;
}

export async function login(email, password, signal) {
  const res = await api.post(
    '/api/auth/login',
    { email, password },
    { signal }
  );

  // Token payload from backend: { access_token, refresh_token }
  tokenStore.set(res.data.access_token);
  if (res.data.refresh_token) {
    tokenStore.setRefresh(res.data.refresh_token);
  }

  return res.data;
}

export async function logout() {
  try {
    await api.post('/api/auth/logout');
  } finally {
    tokenStore.clear();
  }
}

export async function refresh() {
  // Note: apiClient already refreshes automatically on 401.
  // This is exposed for explicit flows if needed.
  const refresh_token = tokenStore.getRefresh();
  const res = await api.post('/api/auth/refresh', { refresh_token });
  tokenStore.set(res.data.access_token);
  if (res.data.refresh_token) tokenStore.setRefresh(res.data.refresh_token);
  return res.data;
}

export async function verifyEmail(token, signal) {
  const res = await api.get('/api/auth/verify-email', { params: { token }, signal });
  return res.data;
}

export async function validatePassword(password, signal) {
  const res = await api.post('/api/auth/validate-password', { password }, { signal });
  return res.data;
}

// =========================
// MFA
// =========================

export async function loginWithMfa(email, password, signal) {
  // Step 1: POST /api/auth/login with { email, password }
  // Backend may return either:
  // - { requires_mfa: true, user_id, ... }
  // - { access_token, refresh_token, token_type }
  const res = await api.post(
    '/api/auth/login',
    { email, password },
    { signal }
  );
  return res.data;
}

export async function verifyMfaLogin({ email, password, mfa_code }, signal) {
  // Step 2: POST /api/auth/login/verify-mfa
  const res = await api.post(
    '/api/auth/login/verify-mfa',
    { email, password, mfa_code },
    { signal }
  );
  const { access_token, refresh_token } = res.data;
  if (access_token) tokenStore.set(access_token);
  if (refresh_token) tokenStore.setRefresh(refresh_token);
  return res.data;
}

export async function setupMfa(access_token, signal) {
  // Enable MFA: POST /api/auth/mfa/setup
  const res = await api.post(
    '/api/auth/mfa/setup',
    {},
    {
      signal,
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );
  return res.data;
}

export async function verifyEnrollMfa({ code, access_token }, signal) {
  // Enable MFA verification: POST /api/auth/mfa/verify-enroll
  const res = await api.post(
    '/api/auth/mfa/verify-enroll',
    { code },
    {
      signal,
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );
  return res.data;
}

// =========================
// PRODUCTS
// =========================
export const getProducts = (params, signal) =>
api.get('/api/products/', { params, signal }).then((res) => res.data);

export const getProduct = (id, signal) =>
  api.get(`/api/products/${id}`, { signal }).then((res) => res.data);

export const getFeaturedProducts = (signal) =>
  api.get('/api/products/featured', { signal }).then((res) => res.data);

// =========================
// TESTIMONIALS
// =========================
export const getTestimonials = (signal) =>
  api.get('/api/testimonials', { signal }).then((res) => res.data);

// =========================
// NEWSLETTER
// =========================
export const subscribeNewsletter = (email, signal) =>
  api
    .post('/api/newsletter/subscribe', { email }, { signal })
    .then((res) => res.data);

// =========================
// CART
// =========================
export const getCart = (signal) =>
  api.get('/api/cart', { signal }).then((res) => res.data);

export const addToCart = (product_id, quantity = 1, signal) =>
  api
    .post('/api/cart/items', { product_id, quantity }, { signal })
    .then((res) => res.data);

export const removeFromCart = (productId, signal) =>
  api.delete(`/api/cart/items/${productId}`, { signal }).then((res) => res.data);

// =========================
// CHECKOUT
// =========================
// POST /api/checkout
// Backend is expected to:
// - validate auth, inventory, prices, totals, shipping/tax, etc.
// - create an order and request the payment gateway
// - return { checkout_url?: string, order_id?: string, ... }
export const createCheckoutSession = (payload, signal) =>
  api.post('/api/checkout', payload, { signal }).then((res) => res.data);


// =========================
// MERCHANT
// =========================
export const getMerchantProducts = (signal) =>
  api.get('/api/merchant/products', { signal }).then((res) => res.data);

// =========================
// Public merchant profile / listing (customer view)
// =========================
export const getMerchantById = (merchantId, signal) =>
  api
    .get(`/api/merchants/${merchantId}`, { signal })
    .then((res) => res.data);

export const getMerchantProductsByMerchantId = (merchantId, signal) =>
  api
    .get(`/api/merchants/${merchantId}/products`, { signal })
    .then((res) => res.data);


export const createMerchantProduct = (data, config = {}) =>
  api.post('/api/merchant/products', data, config).then((res) => res.data);

export const updateMerchantProduct = (id, data, config = {}) =>
  api.put(`/api/merchant/products/${id}`, data, config).then((res) => res.data);

export const deleteMerchantProduct = (id, signal) =>
  api.delete(`/api/merchant/products/${id}`, { signal }).then((res) => res.data);

export const getMerchantOrders = (signal) =>
  api.get('/api/merchant/orders', { signal }).then((res) => res.data);

export const updateOrderStatus = (orderId, status, signal) =>
  api
    .put(
      `/api/merchant/orders/${orderId}/status`,
      { status },
      { signal }
    )
    .then((res) => res.data);

export const getMerchantAnalytics = (signal) =>
  api.get('/api/merchant/analytics', { signal }).then((res) => res.data);

// =========================
// ADMIN
// =========================
export const getAnalytics = (signal) =>
  api.get('/api/admin/dashboard/stats', { signal }).then((res) => res.data);

export const getOrders = (params, signal) =>
  api.get('/api/admin/dashboard/orders', { params, signal }).then((res) => res.data);

export const updateSystemSettings = (data, signal) =>
  api.put('/api/admin/settings/', data, { signal }).then((res) => res.data);

// =========================
// ADMIN USERS (role management)
// =========================
// PATCH /api/admin/users/{user_id}/role
export const updateUserRole = (userId, role, signal) =>
  api
    .patch(`/api/admin/users/${userId}/role`, { role }, { signal })
    .then((res) => res.data);

// GET /api/admin/users/ (admin users list)
// Backend must return role + merchant_approved (or frontend will have no button gating)
export const getUsers = (signal) =>
  api.get('/api/admin/users/', { signal }).then((res) => res.data);

// =========================
// EXPORT
// =========================
export default api;





