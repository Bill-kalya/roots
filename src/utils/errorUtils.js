/**
 * Centralized error normalization utility.
 * Provides consistent error messages across the application.
 */

export function getErrorMessage(error) {
  if (!error) {
    return 'An unexpected error occurred';
  }

  if (error.response?.data?.message) {
    return String(error.response.data.message);
  }

  if (error.request) {
    return 'Unable to reach the server. Check your connection or API URL.';
  }

  if (error.message) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

export function isNetworkError(error) {
  return Boolean(error?.request && !error?.response);
}

export function isAuthError(error) {
  return error?.response?.status === 401;
}

export function isValidationError(error) {
  return error?.response?.status === 422;
}