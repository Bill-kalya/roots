import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

import { useNavigate } from 'react-router-dom';

import { tokenStore } from '../lib/tokenStore.js';

import { fetchAndInitEncryptionKey, clearEncryption } from '../utils/authEncryption.js';


const AuthContext = createContext(null);

function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

function deriveUserFromToken() {
  const token = tokenStore.getAccess();
  if (!token) return null;

  const payload = decodeToken(token);
  if (!payload) return null;

  // Reject expired tokens immediately
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    tokenStore.clear();
    return null;
  }

  const roleRaw = payload.role;
  const role = typeof roleRaw === 'string' ? roleRaw.trim().toUpperCase() : null;

  return {
    id: payload.sub,
    email: payload.email,
    role,
    full_name: payload.full_name,
  };
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => deriveUserFromToken());
  const [loading, setLoading] = useState(false);

  // Guards against double-firing in React 18 Strict Mode.
  const handlingExpiryRef = useRef(false);

  const syncUser = useCallback(() => {
    setUser(deriveUserFromToken());
  }, []);

  const clearAuth = useCallback(() => {
    tokenStore.clear();
    setUser(null);
    window.dispatchEvent(new Event('roots:auth-changed'));
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    const onAuthChanged = () => syncUser();
    window.addEventListener('roots:auth-changed', onAuthChanged);

    const onAuthExpired = () => {
      if (handlingExpiryRef.current) return;
      handlingExpiryRef.current = true;

      clearAuth();

      // Allow future events
      setTimeout(() => {
        handlingExpiryRef.current = false;
      }, 0);
    };

    window.addEventListener('roots:auth-expired', onAuthExpired);

    // Cross-tab logout: if another tab removes tokens, clear this tab.
    const onStorage = () => {
      const accessNow = tokenStore.getAccess();
      if (!accessNow) {
        // If we have no access token, ensure this tab is logged out.
        // Avoid loops by just syncing/clearing.
        if (user) {
          clearAuth();
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('roots:auth-changed', onAuthChanged);
      window.removeEventListener('roots:auth-expired', onAuthExpired);
      window.removeEventListener('storage', onStorage);
    };
  }, [clearAuth, syncUser, user]);

  const login = useCallback(async (accessToken, refreshToken, rememberMe) => {
    try {
      if (rememberMe) {
        tokenStore.persist(accessToken, refreshToken);
      } else {
        tokenStore.session(accessToken, refreshToken);
      }

      // Initialize client-side encryption after we have the access token.
      try {
        await fetchAndInitEncryptionKey(accessToken);
      } catch {
        // Do not block login UX if encryption is misconfigured.
      }

      setLoading(false);
      setUser(deriveUserFromToken());
      window.dispatchEvent(new Event('roots:auth-changed'));
    } catch {
      setLoading(false);
      throw new Error('Login failed');
    }
  }, []);


  const logout = useCallback(() => {
    clearEncryption();
    tokenStore.clear();
    setUser(null);
    window.dispatchEvent(new Event('roots:auth-changed'));
    navigate('/login');
  }, [navigate]);


  const isAuthenticated = Boolean(user);
  const isAdmin = user?.role === 'ADMIN';
  const isMerchant = user?.role === 'MERCHANT';

  return (
    <AuthContext.Provider
      value={{
        // Public API
        login,
        logout,
        syncUser,

        // Derived booleans
        isAuthenticated,
        isAdmin,
        isMerchant,

        // Optional: expose user and loading for UI
        user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

