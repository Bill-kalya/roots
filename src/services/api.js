import apiClient from '../lib/apiClient.js';

// =========================
// CONFIG
// =========================
// BASE_URL handled by apiClient

// =========================
// TOKEN STORE
// =========================
export const tokenStore = {
  get: () => localStorage.getItem("access_token"),
  set: (token) => localStorage.setItem("access_token", token),

  getRefresh: () => localStorage.getItem("refresh_token"),
  setRefresh: (token) => localStorage.setItem("refresh_token", token),

  clear: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
};

// =========================
// API CLIENT INSTANCE (handles auth, refresh, normalization)
// =========================
const api = apiClient;

// =========================
// AUTH
// =========================
export async function login(email, password, signal) {
  const res = await api.post('/api/auth/login', { username: email, password }, { signal });

  tokenStore.set(res.data.access_token);
  if (res.data.refresh_token) {
    tokenStore.setRefresh(res.data.refresh_token);
  }

  return res.data;
}

export async function logout() {
  try {
    await api.post("/api/auth/logout");
  } finally {
    tokenStore.clear();
  }
}

// =========================
// PRODUCTS
// =========================
export const getProducts = (params, signal) =>
  api.get("/api/products", { params, signal }).then((res) => res.data);

export const getProduct = (id, signal) =>
  api.get(`/api/products/${id}`, { signal }).then((res) => res.data);

export const getFeaturedProducts = (signal) =>
  api.get("/api/products/featured", { signal }).then((res) => res.data);

// =========================
// TESTIMONIALS
// =========================
export const getTestimonials = (signal) =>
  api.get("/api/testimonials", { signal }).then((res) => res.data);

// =========================
// NEWSLETTER
// =========================
export const subscribeNewsletter = (email, signal) =>
  api.post("/api/newsletter/subscribe", { email }, { signal }).then((res) => res.data);

// =========================
// CART
// =========================
export const getCart = (signal) =>
  api.get("/api/cart", { signal }).then((res) => res.data);

export const addToCart = (product_id, quantity = 1, signal) =>
  api.post("/api/cart/items", { product_id, quantity }, { signal }).then((res) => res.data);

export const removeFromCart = (productId, signal) =>
  api.delete(`/api/cart/items/${productId}`, { signal }).then((res) => res.data);

// =========================
// EXPORT
// =========================
export default api;
