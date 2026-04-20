// Basket.jsx — Production cart page (FastAPI + PostgreSQL + Redis backend)
import React, { useState, useEffect, useCallback } from "react";
import "./Basket.css";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { getCart, removeFromCart, addToCart } from "../services/api";
import { useApi, useMutation } from "../hooks/useApi";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(amount) {
  return `KSh ${Number(amount).toLocaleString("en-KE")}`;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function BasketItemSkeleton() {
  return (
    <div className="basket-item basket-item-skeleton" aria-hidden="true">
      <div className="skeleton-img" />
      <div className="basket-item-details">
        <div className="skeleton-line" />
        <div className="skeleton-line skeleton-line-short" />
        <div className="skeleton-line skeleton-line-short" />
      </div>
      <div className="skeleton-line skeleton-line-short" style={{ width: 60 }} />
    </div>
  );
}

// ─── Single cart item row ─────────────────────────────────────────────────────

function BasketItem({ item, onQuantityChange, onRemove, disabled }) {
  const displayPrice = formatPrice(item.price * item.quantity);

  return (
    <div className="basket-item" role="row" aria-label={item.name}>
      <div className="basket-item-image-wrap">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="basket-item-image"
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        ) : (
          <div className="basket-item-image-placeholder" aria-hidden="true">🎭</div>
        )}
      </div>

      <div className="basket-item-details">
        <h3 className="basket-item-name">{item.name}</h3>
        <p className="basket-item-origin">{item.origin}</p>
        <p className="basket-item-unit-price">{formatPrice(item.price)} each</p>
      </div>

      <div className="basket-item-qty" role="group" aria-label={`Quantity for ${item.name}`}>
        <button
          className="qty-btn"
          onClick={() => onQuantityChange(item.product_id, item.quantity - 1)}
          disabled={disabled || item.quantity <= 1}
          aria-label="Decrease quantity"
        >−</button>
        <span className="qty-value" aria-live="polite">{item.quantity}</span>
        <button
          className="qty-btn"
          onClick={() => onQuantityChange(item.product_id, item.quantity + 1)}
          disabled={disabled}
          aria-label="Increase quantity"
        >+</button>
      </div>

      <div className="basket-item-price">{displayPrice}</div>

      <button
        className="basket-item-remove"
        onClick={() => onRemove(item.product_id)}
        disabled={disabled}
        aria-label={`Remove ${item.name} from basket`}
      >
        ✕
      </button>
    </div>
  );
}

// ─── Order summary panel ──────────────────────────────────────────────────────

function OrderSummary({ items, onCheckout, checkingOut }) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  // Shipping: free over KSh 10,000, otherwise KSh 850
  const shipping = subtotal >= 10000 ? 0 : 850;
  const total = subtotal + shipping;

  return (
    <aside className="order-summary" aria-label="Order summary">
      <h2 className="order-summary-title">Order Summary</h2>

      <div className="order-summary-rows">
        <div className="order-summary-row">
          <span>Subtotal ({items.reduce((n, i) => n + i.quantity, 0)} items)</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="order-summary-row">
          <span>Shipping</span>
          <span className={shipping === 0 ? "order-summary-free" : ""}>
            {shipping === 0 ? "FREE" : formatPrice(shipping)}
          </span>
        </div>
        {shipping > 0 && (
          <p className="order-summary-shipping-note">
            Add {formatPrice(10000 - subtotal)} more for free shipping
          </p>
        )}
      </div>

      <div className="order-summary-divider" />

      <div className="order-summary-total">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>

      <button
        className="checkout-btn"
        onClick={onCheckout}
        disabled={checkingOut || items.length === 0}
        aria-busy={checkingOut}
      >
        {checkingOut ? "Processing…" : "Proceed to Checkout"}
      </button>

      <p className="order-summary-note">
        🔒 Secure checkout · All prices in KES
      </p>
    </aside>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyBasket() {
  return (
    <div className="basket-empty">
      <div className="basket-empty-icon" aria-hidden="true">🛒</div>
      <h2 className="basket-empty-title">Your basket is empty</h2>
      <p className="basket-empty-desc">
        Discover handcrafted pieces from master artisans across the continent.
      </p>
      <a href="/" className="basket-empty-cta">Explore Collection</a>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Basket() {
  // Cart data from Redis-backed FastAPI endpoint
  const { data: cart, loading, error, refetch } = useApi(getCart, []);

  // Local optimistic items list
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (cart?.items) setItems(cart.items);
  }, [cart]);

  // Listen for cart updates fired from ProductCard "Add to Cart"
  useEffect(() => {
    const handler = () => refetch();
    window.addEventListener("roots:cart-updated", handler);
    return () => window.removeEventListener("roots:cart-updated", handler);
  }, [refetch]);

  const { mutate: doRemove, loading: removing } = useMutation(
    useCallback((id) => removeFromCart(id), [])
  );

  const { mutate: doAdd, loading: adding } = useMutation(
    useCallback((id, qty) => addToCart(id, qty), [])
  );

  const [checkingOut, setCheckingOut] = useState(false);
  const [actionError, setActionError] = useState("");

  const mutating = removing || adding;

  // ── Quantity change: optimistic update then sync ─────────────────────────
  const handleQuantityChange = async (productId, newQty) => {
    if (newQty < 1) return;
    // Optimistic
    setItems((prev) =>
      prev.map((i) => i.product_id === productId ? { ...i, quantity: newQty } : i)
    );
    setActionError("");
    try {
      // addToCart with absolute qty — adjust your API to accept `quantity` as absolute
      // or use a PATCH /api/cart/items/:id endpoint
      await doAdd(productId, newQty);
    } catch (err) {
      setActionError(err.message || "Failed to update quantity.");
      refetch(); // roll back by re-fetching
    }
  };

  // ── Remove ────────────────────────────────────────────────────────────────
  const handleRemove = async (productId) => {
    // Optimistic
    setItems((prev) => prev.filter((i) => i.product_id !== productId));
    setActionError("");
    try {
      await doRemove(productId);
    } catch (err) {
      setActionError(err.message || "Failed to remove item.");
      refetch();
    }
  };

  // ── Checkout ─────────────────────────────────────────────────────────────
  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      // Navigate to checkout — wire to your checkout route / Stripe session
      window.location.href = "/checkout";
    } finally {
      setCheckingOut(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="basket-page">
      <Nav />

      <main className="basket-main">
        <div className="basket-container">
          <h1 className="basket-title">
            Your Basket
            {!loading && items.length > 0 && (
              <span className="basket-count" aria-live="polite">
                {items.reduce((n, i) => n + i.quantity, 0)} items
              </span>
            )}
          </h1>

          {actionError && (
            <div className="basket-action-error" role="alert">⚠ {actionError}</div>
          )}

          <div className="basket-layout">
            {/* ── Items column ─────────────────────────────────────────── */}
            <section className="basket-items" aria-label="Cart items" aria-live="polite" aria-busy={loading}>
              {loading && Array.from({ length: 3 }).map((_, i) => (
                <BasketItemSkeleton key={i} />
              ))}

              {!loading && error && (
                <div className="basket-error" role="alert">
                  <p>⚠ {error.message || "Failed to load your basket."}</p>
                  <button className="basket-retry-btn" onClick={refetch}>Try again</button>
                </div>
              )}

              {!loading && !error && items.length === 0 && <EmptyBasket />}

              {!loading && !error && items.map((item) => (
                <BasketItem
                  key={item.product_id}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                  disabled={mutating}
                />
              ))}
            </section>

            {/* ── Summary column ───────────────────────────────────────── */}
            {!loading && !error && items.length > 0 && (
              <OrderSummary
                items={items}
                onCheckout={handleCheckout}
                checkingOut={checkingOut}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}