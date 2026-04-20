// CartDrawer.jsx — Production slide-out cart drawer (FastAPI + Redis backend)
import React, { useState, useEffect, useCallback, useRef } from "react";
import "./CartDrawer.css";
import { getCart, removeFromCart, addToCart } from "../services/api";
import { useApi, useMutation } from "../hooks/useApi";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(amount) {
  return `KSh ${Number(amount).toLocaleString("en-KE")}`;
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────

function DrawerItemSkeleton() {
  return (
    <div className="drawer-item drawer-item-skeleton" aria-hidden="true">
      <div className="skeleton-img" />
      <div className="drawer-item-info">
        <div className="skeleton-line" />
        <div className="skeleton-line skeleton-line-short" />
      </div>
      <div className="skeleton-line skeleton-line-short" style={{ width: 50 }} />
    </div>
  );
}

// ─── Single drawer item ───────────────────────────────────────────────────────

function DrawerItem({ item, onRemove, onQtyChange, disabled }) {
  return (
    <div className="drawer-item">
      <div className="drawer-item-image-wrap">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="drawer-item-image"
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        ) : (
          <div className="drawer-item-image-placeholder" aria-hidden="true">🎭</div>
        )}
      </div>

      <div className="drawer-item-info">
        <h4 className="drawer-item-name">{item.name}</h4>
        <p className="drawer-item-price">{formatPrice(item.price)}</p>

        <div className="drawer-item-qty" role="group" aria-label={`Quantity for ${item.name}`}>
          <button
            className="drawer-qty-btn"
            onClick={() => onQtyChange(item.product_id, item.quantity - 1)}
            disabled={disabled || item.quantity <= 1}
            aria-label="Decrease quantity"
          >−</button>
          <span className="drawer-qty-value" aria-live="polite">{item.quantity}</span>
          <button
            className="drawer-qty-btn"
            onClick={() => onQtyChange(item.product_id, item.quantity + 1)}
            disabled={disabled}
            aria-label="Increase quantity"
          >+</button>
        </div>
      </div>

      <div className="drawer-item-subtotal">
        {formatPrice(item.price * item.quantity)}
      </div>

      <button
        className="drawer-item-remove"
        onClick={() => onRemove(item.product_id)}
        disabled={disabled}
        aria-label={`Remove ${item.name}`}
      >✕</button>
    </div>
  );
}

// ─── CartDrawer ────────────────────────────────────────────────────────────────

/**
 * CartDrawer
 *
 * Props:
 *   isOpen   {boolean}  — controls drawer visibility
 *   onClose  {Function} — called when overlay or close button is clicked
 *
 * The drawer fetches its own cart data and re-fetches whenever
 * a "roots:cart-updated" event is dispatched (e.g. from ProductCard).
 * This means the parent does NOT need to pass cartItems — it only
 * controls open/close state.
 */
function CartDrawer({ isOpen, onClose }) {
  const drawerRef = useRef(null);

  // Fetch cart — lazy: only load when drawer opens for the first time
  const [shouldFetch, setShouldFetch] = useState(false);

  useEffect(() => {
    if (isOpen) setShouldFetch(true);
  }, [isOpen]);

  const { data: cart, loading, error, refetch } = useApi(
    getCart,
    [shouldFetch],
    { immediate: shouldFetch }
  );

  // Re-fetch whenever another part of the app updates the cart
  useEffect(() => {
    const handler = () => { if (shouldFetch) refetch(); };
    window.addEventListener("roots:cart-updated", handler);
    return () => window.removeEventListener("roots:cart-updated", handler);
  }, [shouldFetch, refetch]);

  // Optimistic local items
  const [items, setItems] = useState([]);
  useEffect(() => {
    if (cart?.items) setItems(cart.items);
  }, [cart]);

  const { mutate: doRemove, loading: removing } = useMutation(
    useCallback((id) => removeFromCart(id), [])
  );
  const { mutate: doAdd, loading: adding } = useMutation(
    useCallback((id, qty) => addToCart(id, qty), [])
  );

  const mutating = removing || adding;
  const [actionError, setActionError] = useState("");

  const handleRemove = async (productId) => {
    setItems((prev) => prev.filter((i) => i.product_id !== productId));
    setActionError("");
    try {
      await doRemove(productId);
      window.dispatchEvent(new CustomEvent("roots:cart-updated"));
    } catch (err) {
      setActionError(err.message || "Failed to remove item.");
      refetch();
    }
  };

  const handleQtyChange = async (productId, newQty) => {
    if (newQty < 1) return;
    setItems((prev) =>
      prev.map((i) => i.product_id === productId ? { ...i, quantity: newQty } : i)
    );
    setActionError("");
    try {
      await doAdd(productId, newQty);
    } catch (err) {
      setActionError(err.message || "Failed to update quantity.");
      refetch();
    }
  };

  // ── Computed totals ───────────────────────────────────────────────────────
  const itemCount = items.reduce((n, i) => n + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal >= 10000 ? 0 : 850;
  const total = subtotal + shipping;

  // ── Trap focus inside drawer when open ────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const focusable = drawerRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable?.length) focusable[0].focus();
  }, [isOpen]);

  // ── Close on Escape ───────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape" && isOpen) onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // ── Prevent body scroll when open ─────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`cart-overlay ${isOpen ? "show" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`cart-drawer ${isOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping basket"
      >
        {/* Header */}
        <div className="cart-header">
          <div className="cart-header-left">
            <h2 className="cart-header-title">Your Basket</h2>
            {itemCount > 0 && (
              <span className="cart-header-count" aria-live="polite">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            )}
          </div>
          <button
            className="close-btn"
            onClick={onClose}
            aria-label="Close basket"
          >✕</button>
        </div>

        {/* Body */}
        <div className="cart-body" aria-live="polite" aria-busy={loading}>
          {loading && Array.from({ length: 3 }).map((_, i) => (
            <DrawerItemSkeleton key={i} />
          ))}

          {!loading && error && (
            <div className="cart-error" role="alert">
              <p>⚠ {error.message || "Couldn't load your basket."}</p>
              <button className="cart-retry-btn" onClick={refetch}>Retry</button>
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="cart-empty">
              <span className="cart-empty-icon" aria-hidden="true">🛒</span>
              <p className="cart-empty-text">Your basket is empty</p>
              <button className="cart-empty-cta" onClick={onClose}>
                Continue Shopping
              </button>
            </div>
          )}

          {!loading && !error && items.map((item) => (
            <DrawerItem
              key={item.product_id}
              item={item}
              onRemove={handleRemove}
              onQtyChange={handleQtyChange}
              disabled={mutating}
            />
          ))}

          {actionError && (
            <p className="cart-action-error" role="alert">⚠ {actionError}</p>
          )}
        </div>

        {/* Footer — only shown when cart has items */}
        {!loading && !error && items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-totals">
              <div className="cart-totals-row">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="cart-totals-row">
                <span>Shipping</span>
                <span className={shipping === 0 ? "cart-totals-free" : ""}>
                  {shipping === 0 ? "FREE" : formatPrice(shipping)}
                </span>
              </div>
              {shipping > 0 && (
                <p className="cart-shipping-nudge">
                  {formatPrice(10000 - subtotal)} away from free shipping
                </p>
              )}
              <div className="cart-totals-row cart-totals-total">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <a href="/basket" className="view-basket-btn">
              View Full Basket
            </a>
            <a href="/checkout" className="checkout-btn">
              Checkout →
            </a>

            <p className="cart-secure-note">🔒 Secure checkout · KES</p>
          </div>
        )}
      </div>
    </>
  );
}

export default CartDrawer;