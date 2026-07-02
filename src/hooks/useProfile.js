/**
 * useProfile - Custom hook for managing user profile state and operations.
 * Separates business logic from UI components.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

import { useAuth } from '../context/auth-context.js';
import { useApi } from './useApi.js';
import { useMutation } from './useApi.js';

import { getMyProfile, updateMyProfile } from '../services/profileService.js';
import { validateProfileForm } from '../utils/validation.js';
import { getErrorMessage } from '../utils/errorUtils.js';

// Custom event for profile updates
const PROFILE_UPDATED_EVENT = 'roots:profile-updated';

/**
 * Custom hook for managing user profile.
 *
 * @returns {Object} Profile state and operations
 *
 * @example
 * const {
 *   profile,
 *   form,
 *   loading,
 *   error,
 *   saving,
 *   saveError,
 *   validationErrors,
 *   saved,
 *   updateProfile,
 *   handleChange,
 *   resetForm
 * } = useProfile();
 */
export function useProfile() {
  const { user } = useAuth();

  // Use the existing useApi hook for fetching profile
  const {
    data: profile,
    loading: loadingProfile,
    error: profileError,
    refetch: refetchProfile,
  } = useApi(
    useCallback(
      (signal) => getMyProfile(signal),
      [user?.id] // Refetch when user changes
    ),
    [],
    { immediate: true }
  );

  // Form state - initialize with user data from auth context
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
  });

  // Sync form with user data when user changes
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.full_name || user.name || prev.name,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  // Sync form with profile data when profile loads
  useEffect(() => {
    if (profile) {
      setForm((prev) => ({
        name: profile.name ?? prev.name,
        email: profile.email ?? prev.email,
        phone: profile.phone ?? prev.phone,
        location: profile.location ?? prev.location,
        bio: profile.bio ?? prev.bio,
      }));
    }
  }, [profile]);

  // Validation errors
  const [validationErrors, setValidationErrors] = useState({});

  // Save state
  const [saved, setSaved] = useState(false);
  const savedTimeoutRef = useRef(null);

  // Use the existing useMutation hook for saving
  const {
    mutate: saveProfile,
    loading: saving,
    error: saveError,
    reset: resetSaveError,
  } = useMutation(updateMyProfile);

  // Optimistic update: dispatch event when profile is saved
  useEffect(() => {
    if (saved) {
      // Dispatch custom event for other components to listen to
      window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT, {
        detail: { profile: form }
      }));
    }
  }, [saved, form]);

  // Clear saved state after timeout
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

  /**
   * Handles form input changes.
   *
   * @param {Event} e - The change event
   */
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

    // Clear saved state when user makes changes
    if (saved) {
      setSaved(false);
    }
  }, [validationErrors, saved]);

  /**
   * Validates the form and returns validation errors.
   *
   * @returns {Object} Validation errors
   */
  const validate = useCallback(() => {
    const errors = validateProfileForm(form);
    setValidationErrors(errors);
    return errors;
  }, [form]);

  /**
   * Submits the profile form.
   *
   * @param {Event} e - The form submit event
   * @returns {Promise<boolean>} True if save was successful
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    // Validate form
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      return false;
    }

    resetSaveError();

    try {
      await saveProfile(form);
      setSaved(true);
      return true;
    } catch (error) {
      // Error is already set by useMutation
      return false;
    }
  }, [form, validate, saveProfile, resetSaveError]);

  /**
   * Resets the form to the current profile data.
   */
  const resetForm = useCallback(() => {
    if (profile) {
      setForm({
        name: profile.name ?? '',
        email: profile.email ?? '',
        phone: profile.phone ?? '',
        location: profile.location ?? '',
        bio: profile.bio ?? '',
      });
    }
    setValidationErrors({});
    setSaved(false);
  }, [profile]);

  return {
    // Data
    profile,
    form,

    // Loading states
    loadingProfile,
    saving,

    // Errors
    profileError: profileError ? getErrorMessage(profileError) : null,
    saveError: saveError ? getErrorMessage(saveError) : null,
    validationErrors,

    // Success state
    saved,

    // Actions
    handleChange,
    handleSubmit,
    validate,
    resetForm,
    refetchProfile,

    // Event name for external listeners
    PROFILE_UPDATED_EVENT,
  };
}
