/**
 * Orders service - centralized API calls for user orders operations.
 * All orders-related endpoints should live here.
 */

import api from './api.js';
import { getErrorMessage } from '../utils/errorUtils.js';

/**
 * Fetches the current user's orders.
 *
 * @param {Object} [params] - Query parameters
 * @param {string} [params.status] - Filter by order status
 * @param {number} [params.page] - Page number for pagination
 * @param {number} [params.limit] - Items per page
 * @param {AbortSignal} signal - Optional abort signal for cancellation
 * @returns {Promise<Object>} The orders data
 * @throws {Error} If the request fails
 */
export async function getMyOrders(params = {}, signal) {
  try {
    const res = await api.get('/api/user/orders/', { params, signal });
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Fetches a single order by ID.
 *
 * @param {string|number} orderId - The order ID
 * @param {AbortSignal} signal - Optional abort signal for cancellation
 * @returns {Promise<Object>} The order data
 * @throws {Error} If the request fails
 */
export async function getOrderById(orderId, signal) {
  try {
    const res = await api.get(`/api/user/orders/${orderId}`, { signal });
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Cancels an order.
 *
 * @param {string|number} orderId - The order ID to cancel
 * @param {string} reason - Cancellation reason
 * @param {AbortSignal} signal - Optional abort signal for cancellation
 * @returns {Promise<Object>} Cancellation confirmation
 * @throws {Error} If the request fails
 */
export async function cancelOrder(orderId, reason, signal) {
  try {
    const res = await api.post(`/api/user/orders/${orderId}/cancel`, { reason }, { signal });
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Requests a return for an order.
 *
 * @param {string|number} orderId - The order ID
 * @param {string} reason - Return reason
 * @param {AbortSignal} signal - Optional abort signal for cancellation
 * @returns {Promise<Object>} Return request confirmation
 * @throws {Error} If the request fails
 */
export async function requestReturn(orderId, reason, signal) {
  try {
    const res = await api.post(`/api/user/orders/${orderId}/return`, { reason }, { signal });
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Tracks an order (gets tracking information).
 *
 * @param {string|number} orderId - The order ID
 * @param {AbortSignal} signal - Optional abort signal for cancellation
 * @returns {Promise<Object>} Tracking information
 * @throws {Error} If the request fails
 */
export async function trackOrder(orderId, signal) {
  try {
    const res = await api.get(`/api/user/orders/${orderId}/tracking`, { signal });
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Reorders a previous order (adds all items to cart).
 *
 * @param {string|number} orderId - The order ID to reorder
 * @param {AbortSignal} signal - Optional abort signal for cancellation
 * @returns {Promise<Object>} Reorder confirmation
 * @throws {Error} If the request fails
 */
export async function reorder(orderId, signal) {
  try {
    const res = await api.post(`/api/user/orders/${orderId}/reorder`, {}, { signal });
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}