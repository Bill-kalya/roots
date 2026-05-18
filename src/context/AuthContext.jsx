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
  const [user, setUser] = useState(() => getUserFromStorage());

  // Call this after a successful login to sync state
  const syncUser = useCallback(() => {
    setUser(getUserFromStorage());
  }, []);

  const clearUser = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  // Re-sync if token changes in another tab
  useEffect(() => {
    const handler = () => setUser(getUserFromStorage());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return (
    <AuthContext.Provider value={{ user, syncUser, clearUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

