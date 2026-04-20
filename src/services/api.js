<<<<<<< HEAD
import apiClient from '../lib/apiClient.js';
=======
import axios from "axios";
>>>>>>> fcd4104f7808b2fd515cc9c6796c3a39e77acff2

// =========================
// CONFIG
// =========================
<<<<<<< HEAD
// BASE_URL handled by apiClient
=======
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
>>>>>>> fcd4104f7808b2fd515cc9c6796c3a39e77acff2

// =========================
// TOKEN STORE
// =========================
export const tokenStore = {
<<<<<<< HEAD
  get: () => localStorage.getItem("access_token"),
  set: (token) => localStorage.setItem("access_token", token),

  getRefresh: () => localStorage.getItem("refresh_token"),
  setRefresh: (token) => localStorage.setItem("refresh_token", token),

  clear: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
=======
  get: () => localStorage.getItem("roots_access_token"),
  set: (token) => localStorage.setItem("roots_access_token", token),

  getRefresh: () => localStorage.getItem("roots_refresh_token"),
  setRefresh: (token) => localStorage.setItem("roots_refresh_token", token),

  clear: () => {
    localStorage.removeItem("roots_access_token");
    localStorage.removeItem("roots_refresh_token");
>>>>>>> fcd4104f7808b2fd515cc9c6796c3a39e77acff2
  },
};

// =========================
<<<<<<< HEAD
// API CLIENT INSTANCE (handles auth, refresh, normalization)
// =========================
const api = apiClient;
=======
// AXIOS INSTANCE
// =========================
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// =========================
// REQUEST INTERCEPTOR
// =========================
api.interceptors.request.use((config) => {
  const token = tokenStore.get();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// =========================
// RESPONSE INTERCEPTOR (AUTO REFRESH)
// =========================
let isRefreshing = false;
let subscribers = [];

function onRefreshed(token) {
  subscribers.forEach((cb) => cb(token));
  subscribers = [];
}

function subscribeTokenRefresh(cb) {
  subscribers.push(cb);
}

async function refreshToken() {
  const refresh = tokenStore.getRefresh();
  if (!refresh) throw new Error("No refresh token");

  const res = await axios.post(`${BASE_URL}/api/auth/refresh`, {
    refresh_token: refresh,
  });

  tokenStore.set(res.data.access_token);
  if (res.data.refresh_token) {
    tokenStore.setRefresh(res.data.refresh_token);
  }

  return res.data.access_token;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const newToken = await refreshToken();
          onRefreshed(newToken);
        } catch (err) {
          tokenStore.clear();
          window.location.href = "/login";
          return Promise.reject(err);
        }

        isRefreshing = false;
      }

      return new Promise((resolve) => {
        subscribeTokenRefresh((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);
>>>>>>> fcd4104f7808b2fd515cc9c6796c3a39e77acff2

// =========================
// AUTH
// =========================
<<<<<<< HEAD
export async function login(email, password, signal) {
  const res = await api.post('/api/auth/login', { username: email, password }, { signal });
=======
export async function login(email, password) {
  const formData = new URLSearchParams({
    username: email,
    password,
  });

  const res = await axios.post(`${BASE_URL}/api/auth/login`, formData, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
>>>>>>> fcd4104f7808b2fd515cc9c6796c3a39e77acff2

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
<<<<<<< HEAD
export const getProducts = (params, signal) =>
  api.get("/api/products", { params, signal }).then((res) => res.data);

export const getProduct = (id, signal) =>
  api.get(`/api/products/${id}`, { signal }).then((res) => res.data);

export const getFeaturedProducts = (signal) =>
  api.get("/api/products/featured", { signal }).then((res) => res.data);
=======
export const getProducts = (params) =>
  api.get("/api/products", { params }).then((res) => res.data);

export const getProduct = (id) =>
  api.get(`/api/products/${id}`).then((res) => res.data);

export const getFeaturedProducts = () =>
  api.get("/api/products/featured").then((res) => res.data);
>>>>>>> fcd4104f7808b2fd515cc9c6796c3a39e77acff2

// =========================
// TESTIMONIALS
// =========================
<<<<<<< HEAD
export const getTestimonials = (signal) =>
  api.get("/api/testimonials", { signal }).then((res) => res.data);
=======
export const getTestimonials = () =>
  api.get("/api/testimonials").then((res) => res.data);

>>>>>>> fcd4104f7808b2fd515cc9c6796c3a39e77acff2

// =========================
// NEWSLETTER
// =========================
<<<<<<< HEAD
export const subscribeNewsletter = (email, signal) =>
  api.post("/api/newsletter/subscribe", { email }, { signal }).then((res) => res.data);
=======
export const subscribeNewsletter = (email) =>
  api.post("/api/newsletter/subscribe", { email })
     .then((res) => res.data);
>>>>>>> fcd4104f7808b2fd515cc9c6796c3a39e77acff2

// =========================
// CART
// =========================
<<<<<<< HEAD
export const getCart = (signal) =>
  api.get("/api/cart", { signal }).then((res) => res.data);

export const addToCart = (product_id, quantity = 1, signal) =>
  api.post("/api/cart/items", { product_id, quantity }, { signal }).then((res) => res.data);

export const removeFromCart = (productId, signal) =>
  api.delete(`/api/cart/items/${productId}`, { signal }).then((res) => res.data);
=======
export const getCart = () =>
  api.get("/api/cart").then((res) => res.data);

export const addToCart = (product_id, quantity = 1) =>
  api.post("/api/cart/items", { product_id, quantity }).then((res) => res.data);

export const removeFromCart = (productId) =>
  api.delete(`/api/cart/items/${productId}`).then((res) => res.data);
>>>>>>> fcd4104f7808b2fd515cc9c6796c3a39e77acff2

// =========================
// EXPORT
// =========================
<<<<<<< HEAD
export default api;
=======
export default api;
>>>>>>> fcd4104f7808b2fd515cc9c6796c3a39e77acff2
