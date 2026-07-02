/**
 * Profile service - centralized API calls for user profile operations.
 * All profile-related endpoints should live here.
 */

import api from './api.js';
import { getErrorMessage } from '../utils/errorUtils.js';

/**
 * Fetches the current user's profile.
 *
 * @param {AbortSignal} signal - Optional abort signal for cancellation
 * @returns {Promise<Object>} The profile data
 * @throws {Error} If the request fails
 */
export async function getMyProfile(signal) {
  try {
    const res = await api.get('/api/user/profile/me', { signal });
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Updates the current user's profile.
 *
 * @param {Object} payload - The profile data to update
 * @param {string} payload.name - User's full name
 * @param {string} payload.email - User's email
 * @param {string} [payload.phone] - User's phone number
 * @param {string} [payload.location] - User's location
 * @param {string} [payload.bio] - User's bio
 * @param {AbortSignal} signal - Optional abort signal for cancellation
 * @returns {Promise<Object>} The updated profile data
 * @throws {Error} If the request fails
 */
export async function updateMyProfile(payload, signal) {
  try {
    const res = await api.put('/api/user/profile/me', payload, { signal });
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Partially updates the current user's profile.
 *
 * @param {Object} payload - The profile fields to update
 * @param {AbortSignal} signal - Optional abort signal for cancellation
 * @returns {Promise<Object>} The updated profile data
 * @throws {Error} If the request fails
 */
export async function patchMyProfile(payload, signal) {
  try {
    const res = await api.patch('/api/user/profile/me', payload, { signal });
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}