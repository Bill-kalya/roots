/**
 * tokenStore — storage-aware token management.
 *
 * Tokens may live in localStorage (remember-me ON) or sessionStorage
 * (remember-me OFF / incognito). On refresh, new tokens are written back
 * to the same storage that held the originals so the "remember me"
 * preference is always respected.
 *
 * Public API:
 *   tokenStore.getAccess()          → string | null
 *   tokenStore.getRefresh()         → string | null
 *   tokenStore.setTokens(a, r)      → void   (respects origin storage)
 *   tokenStore.persist(a, r)        → void   (explicit localStorage)
 *   tokenStore.session(a, r)        → void   (explicit sessionStorage)
 *   tokenStore.clear()              → void   (both stores)
 *   tokenStore.hasTokens()          → boolean
 */

const ACCESS_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

function readFrom(key) {
  return localStorage.getItem(key) || sessionStorage.getItem(key) || null;
}

function originOf(key) {
  // Which storage actually holds this key right now?
  if (localStorage.getItem(key) !== null) return localStorage;
  if (sessionStorage.getItem(key) !== null) return sessionStorage;
  return localStorage; // default for new writes
}

export const tokenStore = {
  getAccess() {
    return readFrom(ACCESS_KEY);
  },

  getRefresh() {
    return readFrom(REFRESH_KEY);
  },

  /**
   * Write new tokens back to whichever storage held the refresh token.
   * Call this after every successful /refresh response.
   */
  setTokens(accessToken, refreshToken) {
    const store = originOf(REFRESH_KEY);
    if (accessToken) store.setItem(ACCESS_KEY, accessToken);
    if (refreshToken) store.setItem(REFRESH_KEY, refreshToken);
  },

  /**
   * Explicit persist to localStorage (call on login with "remember me" ON).
   */
  persist(accessToken, refreshToken) {
    if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  },

  /**
   * Explicit persist to sessionStorage (call on login with "remember me" OFF).
   */
  session(accessToken, refreshToken) {
    if (accessToken) sessionStorage.setItem(ACCESS_KEY, accessToken);
    if (refreshToken) sessionStorage.setItem(REFRESH_KEY, refreshToken);
  },

  /**
   * Remove tokens from both stores unconditionally.
   */
  clear() {
    [localStorage, sessionStorage].forEach((store) => {
      store.removeItem(ACCESS_KEY);
      store.removeItem(REFRESH_KEY);
    });
  },

  hasTokens() {
    return Boolean(this.getAccess() && this.getRefresh());
  },
};

