import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { tokenStore } from '../services/api.js';

const AuthContext = createContext(null);

// Decode JWT payload without a library
function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

function getUserFromStorage() {
  const token = tokenStore.get();
  if (!token) return null;
  const payload = decodeToken(token);
  if (!payload) return null;
  // Reject expired tokens immediately
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    tokenStore.clear();
    return null;
  }
  return {
    id: payload.sub,
    email: payload.email,
    role: payload.role, // 'USER' | 'MERCHANT' | 'ADMIN'
    full_name: payload.full_name,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = getUserFromStorage();
    return stored;
  });
  const [loading, setLoading] = useState(false);

  const loadUser = useCallback(() => {
    try {
      const u = getUserFromStorage();
      setUser(u);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
    const handler = () => loadUser();
    window.addEventListener('roots:auth-changed', handler);
    return () => window.removeEventListener('roots:auth-changed', handler);
  }, [loadUser]);

  const syncUser = useCallback(() => {
    setUser(getUserFromStorage());
  }, []);

  const login = useCallback((userData, token) => {
    try {
      if (token) tokenStore.set(token);
      // userData shape: allow avatar/name/email/full_name
      if (userData && typeof userData === 'object') {
        // persist full user payload for Nav avatar fallback
        localStorage.setItem('user', JSON.stringify(userData));
      }
      setUser(userData || getUserFromStorage());
    } finally {
      setLoading(false);
      window.dispatchEvent(new Event('roots:auth-changed'));
    }
  }, []);

  const clearUser = useCallback(() => {
    tokenStore.clear();
    localStorage.removeItem('user');
    setUser(null);
    window.dispatchEvent(new Event('roots:auth-changed'));
  }, []);

  const logout = clearUser;


  // Re-sync if token changes in another tab
  useEffect(() => {
    const handler = () => setUser(getUserFromStorage());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, syncUser, clearUser }}>

      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

