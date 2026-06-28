import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";


import { getCart } from "../services/api";
import { tokenStore } from "../lib/tokenStore.js";

import CartContext, { useCart } from "./cart-context.js";

export { useCart };

export default function CartProvider({ children }) {
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
  const debounceRef = useRef(null);

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

  const items = useMemo(() => cart?.items || [], [cart]);
  const itemCount = useMemo(
    () => items.reduce((n, i) => n + (i.quantity || 0), 0),
    [items]
  );

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

