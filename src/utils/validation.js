/**
 * Validation utilities for form inputs.
 * Provides consistent validation across the application.
 */

/**
 * Validates an email address.
 *
 * @param {string} email - The email to validate
 * @returns {string|null} Error message if invalid, null if valid
 */
export function validateEmail(email) {
  if (!email || email.trim() === '') {
    return 'Email is required';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }

  return null;
}

/**
 * Validates a phone number (basic international format).
 *
 * @param {string} phone - The phone number to validate
 * @returns {string|null} Error message if invalid, null if valid
 */
export function validatePhone(phone) {
  if (!phone || phone.trim() === '') {
    return null; // Phone is optional
  }

  // Allow digits, spaces, hyphens, parentheses, and plus sign
  const phoneRegex = /^[+]?[\d\s\-()]+$/;
  if (!phoneRegex.test(phone)) {
    return 'Please enter a valid phone number';
  }

  // Check minimum length (at least 7 digits)
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length < 7) {
    return 'Phone number must have at least 7 digits';
  }

  return null;
}

/**
 * Validates a name field.
 *
 * @param {string} name - The name to validate
 * @returns {string|null} Error message if invalid, null if valid
 */
export function validateName(name) {
  if (!name || name.trim() === '') {
    return 'Name is required';
  }

  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters';
  }

  if (name.trim().length > 100) {
    return 'Name must be less than 100 characters';
  }

  return null;
}

/**
 * Validates a location field.
 *
 * @param {string} location - The location to validate
 * @returns {string|null} Error message if invalid, null if valid
 */
export function validateLocation(location) {
  if (!location || location.trim() === '') {
    return null; // Location is optional
  }

  if (location.trim().length > 200) {
    return 'Location must be less than 200 characters';
  }

  return null;
}

/**
 * Validates a bio field.
 *
 * @param {string} bio - The bio to validate
 * @returns {string|null} Error message if invalid, null if valid
 */
export function validateBio(bio) {
  if (!bio || bio.trim() === '') {
    return null; // Bio is optional
  }

  if (bio.trim().length > 1000) {
    return 'Bio must be less than 1000 characters';
  }

  return null;
}

/**
 * Validates an entire profile form.
 *
 * @param {Object} form - The form data to validate
 * @returns {Object} Object with field names as keys and error messages as values
 */
export function validateProfileForm(form) {
  const errors = {};

  const nameError = validateName(form.name);
  if (nameError) errors.name = nameError;

  const emailError = validateEmail(form.email);
  if (emailError) errors.email = emailError;

  const phoneError = validatePhone(form.phone);
  if (phoneError) errors.phone = phoneError;

  const locationError = validateLocation(form.location);
  if (locationError) errors.location = locationError;

  const bioError = validateBio(form.bio);
  if (bioError) errors.bio = bioError;

  return errors;
}

/**
 * Validates notification settings.
 *
 * @param {Object} notifications - The notification settings to validate
 * @param {boolean} notifications.orderUpdates - Order update notifications
 * @param {boolean} notifications.promotions - Promotion notifications
 * @param {boolean} notifications.newArrivals - New arrival notifications
 * @param {boolean} notifications.artisanStories - Artisan story notifications
 * @returns {Object} Object with isValid boolean and errors object
 */
export function validateNotificationSettings(notifications) {
  const errors = {};
  let isValid = true;

  // All notification settings should be booleans
  const booleanFields = ['orderUpdates', 'promotions', 'newArrivals', 'artisanStories'];
  
  for (const field of booleanFields) {
    if (notifications[field] !== undefined && typeof notifications[field] !== 'boolean') {
      errors[field] = `${field} must be a boolean value`;
      isValid = false;
    }
  }

  return { isValid, errors };
}

/**
 * Validates privacy settings.
 *
 * @param {Object} privacy - The privacy settings to validate
 * @param {boolean} privacy.profileVisible - Profile visibility
 * @param {boolean} privacy.dataAnalytics - Analytics consent
 * @returns {Object} Object with isValid boolean and errors object
 */
export function validatePrivacySettings(privacy) {
  const errors = {};
  let isValid = true;

  // All privacy settings should be booleans
  const booleanFields = ['profileVisible', 'dataAnalytics'];
  
  for (const field of booleanFields) {
    if (privacy[field] !== undefined && typeof privacy[field] !== 'boolean') {
      errors[field] = `${field} must be a boolean value`;
      isValid = false;
    }
  }

  return { isValid, errors };
}

/**
 * Validates user preferences.
 *
 * @param {Object} preferences - The preferences to validate
 * @param {string} [preferences.currency] - Preferred currency
 * @param {string} [preferences.language] - Preferred language
 * @param {string} [preferences.theme] - Preferred theme
 * @returns {Object} Object with isValid boolean and errors object
 */
export function validatePreferences(preferences) {
  const errors = {};
  let isValid = true;

  // Validate currency if provided
  if (preferences.currency !== undefined) {
    const validCurrencies = ['USD', 'EUR', 'GBP', 'KES', 'NGN', 'ZAR'];
    if (!validCurrencies.includes(preferences.currency)) {
      errors.currency = 'Invalid currency selected';
      isValid = false;
    }
  }

  // Validate language if provided
  if (preferences.language !== undefined) {
    const validLanguages = ['en', 'fr', 'sw', 'ar'];
    if (!validLanguages.includes(preferences.language)) {
      errors.language = 'Invalid language selected';
      isValid = false;
    }
  }

  // Validate theme if provided
  if (preferences.theme !== undefined) {
    if (preferences.theme !== 'dark' && preferences.theme !== 'light') {
      errors.theme = 'Theme must be either dark or light';
      isValid = false;
    }
  }

  return { isValid, errors };
}
