/**
 * Settings service - centralized API calls for user settings operations.
 * All settings-related endpoints should live here.
 */

import api from './api.js';
import { getErrorMessage } from '../utils/errorUtils.js';

/**
 * Fetches the current user's settings.
 *
 * @param {AbortSignal} signal - Optional abort signal for cancellation
 * @returns {Promise<Object>} The user settings
 * @throws {Error} If the request fails
 */
export async function getUserSettings(signal) {
  try {
    const res = await api.get('/api/user/settings', { signal });
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Updates the current user's settings.
 *
 * @param {Object} payload - The settings to update
 * @param {Object} [payload.notifications] - Notification settings
 * @param {Object} [payload.privacy] - Privacy settings
 * @param {string} [payload.currency] - Preferred currency
 * @param {string} [payload.language] - Preferred language
 * @param {AbortSignal} signal - Optional abort signal for cancellation
 * @returns {Promise<Object>} The updated settings
 * @throws {Error} If the request fails
 */
export async function updateUserSettings(payload, signal) {
  try {
    const res = await api.put('/api/user/settings', payload, { signal });
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Updates notification settings only.
 *
 * @param {Object} notificationSettings - The notification settings to update
 * @param {boolean} notificationSettings.orderUpdates - Order update notifications
 * @param {boolean} notificationSettings.promotions - Promotion notifications
 * @param {boolean} notificationSettings.newArrivals - New arrival notifications
 * @param {boolean} notificationSettings.artisanStories - Artisan story notifications
 * @param {AbortSignal} signal - Optional abort signal for cancellation
 * @returns {Promise<Object>} The updated settings
 * @throws {Error} If the request fails
 */
export async function updateNotificationSettings(notificationSettings, signal) {
  try {
    const res = await api.patch('/api/user/settings/notifications', notificationSettings, { signal });
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Updates privacy settings only.
 *
 * @param {Object} privacySettings - The privacy settings to update
 * @param {boolean} privacySettings.profileVisible - Profile visibility
 * @param {boolean} privacySettings.dataAnalytics - Analytics consent
 * @param {AbortSignal} signal - Optional abort signal for cancellation
 * @returns {Promise<Object>} The updated settings
 * @throws {Error} If the request fails
 */
export async function updatePrivacySettings(privacySettings, signal) {
  try {
    const res = await api.patch('/api/user/settings/privacy', privacySettings, { signal });
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Updates user preferences (currency, language, theme).
 *
 * @param {Object} preferences - The preferences to update
 * @param {string} [preferences.currency] - Preferred currency
 * @param {string} [preferences.language] - Preferred language
 * @param {string} [preferences.theme] - Preferred theme (dark/light)
 * @param {AbortSignal} signal - Optional abort signal for cancellation
 * @returns {Promise<Object>} The updated settings
 * @throws {Error} If the request fails
 */
export async function updatePreferences(preferences, signal) {
  try {
    const res = await api.patch('/api/user/settings/preferences', preferences, { signal });
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Deletes the current user's account.
 *
 * @param {string} password - User's password for confirmation
 * @param {AbortSignal} signal - Optional abort signal for cancellation
 * @returns {Promise<Object>} Deletion confirmation
 * @throws {Error} If the request fails
 */
export async function deleteAccount(password, signal) {
  try {
    const res = await api.post('/api/user/account/delete', { password }, { signal });
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Enables two-factor authentication.
 *
 * @param {AbortSignal} signal - Optional abort signal for cancellation
 * @returns {Promise<Object>} MFA setup data (qr_code, secret, etc.)
 * @throws {Error} If the request fails
 */
export async function enableTwoFactorAuth(signal) {
  try {
    const res = await api.post('/api/user/settings/2fa/enable', {}, { signal });
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Disables two-factor authentication.
 *
 * @param {string} password - User's password for confirmation
 * @param {string} mfaCode - Current MFA code for verification
 * @param {AbortSignal} signal - Optional abort signal for cancellation
 * @returns {Promise<Object>} Success confirmation
 * @throws {Error} If the request fails
 */
export async function disableTwoFactorAuth(password, mfaCode, signal) {
  try {
    const res = await api.post('/api/user/settings/2fa/disable', { password, mfa_code: mfaCode }, { signal });
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Changes the current user's password.
 *
 * @param {string} currentPassword - The user's current password
 * @param {string} newPassword - The new password
 * @param {AbortSignal} signal - Optional abort signal for cancellation
 * @returns {Promise<Object>} Success confirmation
 * @throws {Error} If the request fails
 */
export async function changePassword(currentPassword, newPassword, signal) {
  try {
    const res = await api.post('/api/user/account/change-password', { current_password: currentPassword, new_password: newPassword }, { signal });
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
