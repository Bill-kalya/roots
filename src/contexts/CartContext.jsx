import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getCart } from "../services/api";
import { tokenStore } from "../lib/tokenStore.js";


const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!tokenStore.hasTokens()) {
      setCart(null);
      return;
    }



    setLoading(true);
    try {
      const data = await getCart();
      setCart(data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch once on mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Re-fetch on cart updates (debounced to collapse multiple dispatches)
  const debounceRef = React.useRef(null);

  const debouncedFetch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchCart();
    }, 100);
  }, [fetchCart]);

  useEffect(() => {
    window.addEventListener("roots:cart-updated", debouncedFetch);
    return () => {
      window.removeEventListener("roots:cart-updated", debouncedFetch);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [debouncedFetch]);

  const items = cart?.items || [];
  const itemCount = useMemo(
    () => items.reduce((n, i) => n + (i.quantity || 0), 0),
    [items]
  );

  // Keep an error-less API; components can derive empty state from loading + cart.
  const value = useMemo(
    () => ({
      cart,
      items,
      itemCount,
      loading,
      refetch: fetchCart,
    }),
    [cart, items, itemCount, loading, fetchCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

