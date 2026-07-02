/**
 * Custom hook for managing user settings state and operations.
 * Follows the same pattern as useProfile.js
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useApi } from './useApi.js';
import { useMutation } from './useApi.js';
import {
  getUserSettings,
  updateUserSettings,
  updateNotificationSettings,
  updatePrivacySettings,
  updatePreferences,
  deleteAccount,
  enableTwoFactorAuth,
  disableTwoFactorAuth,
} from '../services/settingsService.js';
import { validateNotificationSettings, validatePrivacySettings } from '../utils/validation.js';
import { getErrorMessage } from '../utils/errorUtils.js';

const DEFAULT_SETTINGS = {
  notifications: {
    orderUpdates: true,
    promotions: false,
    newArrivals: true,
    artisanStories: false,
  },
  privacy: {
    profileVisible: true,
    dataAnalytics: true,
  },
  currency: 'USD',
  language: 'en',
  theme: 'dark',
};

/**
 * Custom hook for managing user settings
 *
 * @returns {Object} Settings state and operations
 */
export function useSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const savedTimeoutRef = useRef(null);
  const initialSettingsRef = useRef(DEFAULT_SETTINGS);

  // Fetch settings on mount
  const {
    data: fetchedSettings,
    loading: loadingSettings,
    error: fetchError,
    refetch: refetchSettings,
  } = useApi(
    useCallback(
      (signal) => getUserSettings(signal),
      []
    ),
    [],
    { immediate: true, initialData: null }
  );

  // Update local settings when fetched
  useEffect(() => {
    if (fetchedSettings) {
      const mergedSettings = {
        notifications: { ...DEFAULT_SETTINGS.notifications, ...fetchedSettings.notifications },
        privacy: { ...DEFAULT_SETTINGS.privacy, ...fetchedSettings.privacy },
        currency: fetchedSettings.currency || DEFAULT_SETTINGS.currency,
        language: fetchedSettings.language || DEFAULT_SETTINGS.language,
        theme: fetchedSettings.theme || DEFAULT_SETTINGS.theme,
      };
      setSettings(mergedSettings);
      initialSettingsRef.current = mergedSettings;
    }
  }, [fetchedSettings]);

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(initialSettingsRef.current);
    setHasUnsavedChanges(hasChanges);
  }, [settings]);

  // Show saved indicator temporarily
  useEffect(() => {
    if (saved) {
      savedTimeoutRef.current = setTimeout(() => {
        setSaved(false);
      }, 2500);

      return () => {
        if (savedTimeoutRef.current) {
          clearTimeout(savedTimeoutRef.current);
        }
      };
    }
  }, [saved]);

  // Update notification settings
  const updateNotification = useCallback(
    async (key, value) => {
      setSettings((prev) => ({
        ...prev,
        notifications: { ...prev.notifications, [key]: value },
      }));

      // Validate
      const validation = validateNotificationSettings({
        ...settings.notifications,
        [key]: value,
      });
      setValidationErrors((prev) => ({ ...prev, notifications: validation }));

      if (!validation.isValid) return;

      try {
        await updateNotificationSettings({ [key]: value });
        setSaved(true);
        setSaveError(null);
        window.dispatchEvent(
          new CustomEvent('roots:settings-updated', {
            detail: { type: 'notification', key, value },
          })
        );
      } catch (error) {
        setSaveError(getErrorMessage(error));
        // Rollback on error
        setSettings((prev) => ({
          ...prev,
          notifications: { ...prev.notifications, [key]: !value },
        }));
      }
    },
    [settings.notifications]
  );

  // Update privacy settings
  const updatePrivacy = useCallback(
    async (key, value) => {
      setSettings((prev) => ({
        ...prev,
        privacy: { ...prev.privacy, [key]: value },
      }));

      // Validate
      const validation = validatePrivacySettings({
        ...settings.privacy,
        [key]: value,
      });
      setValidationErrors((prev) => ({ ...prev, privacy: validation }));

      if (!validation.isValid) return;

      try {
        await updatePrivacySettings({ [key]: value });
        setSaved(true);
        setSaveError(null);
        window.dispatchEvent(
          new CustomEvent('roots:settings-updated', {
            detail: { type: 'privacy', key, value },
          })
        );
      } catch (error) {
        setSaveError(getErrorMessage(error));
        // Rollback on error
        setSettings((prev) => ({
          ...prev,
          privacy: { ...prev.privacy, [key]: !value },
        }));
      }
    },
    [settings.privacy]
  );

  // Update preferences (currency, language, theme)
  const updatePreference = useCallback(
    async (key, value) => {
      setSettings((prev) => ({
        ...prev,
        [key]: value,
      }));

      try {
        await updatePreferences({ [key]: value });
        setSaved(true);
        setSaveError(null);
        window.dispatchEvent(
          new CustomEvent('roots:settings-updated', {
            detail: { type: 'preference', key, value },
          })
        );
      } catch (error) {
        setSaveError(getErrorMessage(error));
        // Rollback on error
        setSettings((prev) => ({
          ...prev,
          [key]: initialSettingsRef.current[key],
        }));
      }
    },
    []
  );

  // Save all settings
  const { mutate: saveAllSettings, loading: saving } = useMutation(updateUserSettings);

  const saveSettings = useCallback(async () => {
    setSaveError(null);
    setValidationErrors({});

    try {
      await saveAllSettings(settings);
      setSaved(true);
      initialSettingsRef.current = settings;
      setHasUnsavedChanges(false);
      window.dispatchEvent(
        new CustomEvent('roots:settings-updated', {
          detail: { type: 'all', settings },
        })
      );
    } catch (error) {
      setSaveError(getErrorMessage(error));
    }
  }, [settings, saveAllSettings]);

  // Reset settings to defaults
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    initialSettingsRef.current = DEFAULT_SETTINGS;
    setValidationErrors({});
    setSaveError(null);
  }, []);

  // Delete account
  const { mutate: deleteAccountMutation, loading: deletingAccount } = useMutation(deleteAccount);

  const confirmDeleteAccount = useCallback(async () => {
    if (!deletePassword) {
      setDeleteError('Password is required');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteAccountMutation(deletePassword);
      // Account deleted successfully - logout will be handled by the component
      window.dispatchEvent(new Event('roots:auth-expired'));
    } catch (error) {
      setDeleteError(getErrorMessage(error));
      setIsDeleting(false);
    }
  }, [deletePassword, deleteAccountMutation]);

  const cancelDeleteAccount = useCallback(() => {
    setDeleteConfirm(false);
    setDeletePassword('');
    setDeleteError(null);
    setIsDeleting(false);
  }, []);

  // Enable 2FA
  const { mutate: enable2FAMutation, loading: enabling2FA } = useMutation(enableTwoFactorAuth);

  const handleEnable2FA = useCallback(async () => {
    try {
      const result = await enable2FAMutation();
      // Return the result so component can show QR code, etc.
      return result;
    } catch (error) {
      throw error;
    }
  }, [enable2FAMutation]);

  // Disable 2FA
  const { mutate: disable2FAMutation, loading: disabling2FA } = useMutation(disableTwoFactorAuth);

  const handleDisable2FA = useCallback(
    async (password, mfaCode) => {
      try {
        await disable2FAMutation(password, mfaCode);
        return true;
      } catch (error) {
        throw error;
      }
    },
    [disable2FAMutation]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (savedTimeoutRef.current) {
        clearTimeout(savedTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    settings,
    loading: loadingSettings,
    fetchError,
    saving,
    saved,
    saveError,
    validationErrors,
    hasUnsavedChanges,
    deleteConfirm,
    setDeleteConfirm,
    deletePassword,
    setDeletePassword,
    deleteError,
    isDeleting,

    // Actions
    updateNotification,
    updatePrivacy,
    updatePreference,
    saveSettings,
    resetSettings,
    confirmDeleteAccount,
    cancelDeleteAccount,
    refetchSettings,

    // 2FA actions
    handleEnable2FA,
    enabling2FA,
    handleDisable2FA,
    disabling2FA,
  };
}