// Checkout.jsx — Roots African Art & Culture
import React, { useState, useRef, useEffect } from "react";
import "./checkout.css";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatCardNumber(value) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1  ")
    .trim();
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 2) return digits.slice(0, 2) + " / " + digits.slice(2);
  return digits;
}

// ─── Step Breadcrumb ─────────────────────────────────────────────────────────
function CheckoutSteps({ current = 1 }) {
  const steps = ["CART", "CHECKOUT", "CONFIRM"];
  return (
    <div className="checkout-steps" aria-label="Checkout progress">
      {steps.map((step, i) => {
        const state = i < current ? "done" : i === current ? "active" : "idle";
        return (
          <React.Fragment key={step}>
            {i > 0 && <span className="step-sep" aria-hidden="true">›</span>}
            <span className={`checkout-step checkout-step-${state}`}>{step}</span>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Checkout Nav ────────────────────────────────────────────────────────────
function CheckoutNav() {
  return (
    <nav className="checkout-nav" aria-label="Checkout navigation">
      <div className="checkout-nav-logo">ROOTS</div>
      <CheckoutSteps current={1} />
      <div className="checkout-secure" aria-label="Secure checkout">
        <div className="secure-dot" aria-hidden="true" />
        SECURE CHECKOUT
      </div>
    </nav>
  );
}

// ─── Section Label ───────────────────────────────────────────────────────────
function SectionLabel({ text }) {
  return (
    <div className="section-label">
      <div className="section-label-line" />
      <span>{text}</span>
    </div>
  );
}

// ─── Payment Method Selector ─────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { id: "card", label: "CARD", iconClass: "pay-icon-card" },
  { id: "mpesa", label: "M-PESA", iconClass: "pay-icon-mpesa" },
  { id: "paypal", label: "PAYPAL", iconClass: "pay-icon-paypal" },
];

function PaymentMethodSelector({ selected, onChange }) {
  return (
    <div className="payment-methods" role="radiogroup" aria-label="Payment method">
      {PAYMENT_METHODS.map(({ id, label, iconClass }) => (
        <button
          key={id}
          role="radio"
          aria-checked={selected === id}
          className={`pay-method ${selected === id ? "pay-method-active" : ""}`}
          onClick={() => onChange(id)}
          type="button"
        >
          <div className={`pay-method-icon ${iconClass}`} aria-hidden="true" />
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── Field ───────────────────────────────────────────────────────────────────
function Field({ label, children, htmlFor }) {
  return (
    <div className="field">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}

// ─── Delivery Form ────────────────────────────────────────────────────────────
function DeliveryForm({ data, onChange }) {
  const handle = (key) => (e) => onChange({ ...data, [key]: e.target.value });

  return (
    <fieldset className="form-fieldset">
      <SectionLabel text="Delivery Information" />

      <div className="form-row">
        <Field label="First Name" htmlFor="first-name">
          <input
            id="first-name"
            type="text"
            placeholder="Amara"
            value={data.firstName}
            onChange={handle("firstName")}
            autoComplete="given-name"
          />
        </Field>
        <Field label="Last Name" htmlFor="last-name">
          <input
            id="last-name"
            type="text"
            placeholder="Osei"
            value={data.lastName}
            onChange={handle("lastName")}
            autoComplete="family-name"
          />
        </Field>
      </div>

      <div className="form-row form-row-full">
        <Field label="Email Address" htmlFor="email">
          <input
            id="email"
            type="email"
            placeholder="amara@example.com"
            value={data.email}
            onChange={handle("email")}
            autoComplete="email"
          />
        </Field>
      </div>

      <div className="form-row form-row-full">
        <Field label="Phone Number" htmlFor="phone">
          <input
            id="phone"
            type="tel"
            placeholder="+254 700 000 000"
            value={data.phone}
            onChange={handle("phone")}
            autoComplete="tel"
          />
        </Field>
      </div>

      <div className="form-row form-row-full">
        <Field label="Delivery Address" htmlFor="address">
          <input
            id="address"
            type="text"
            placeholder="Street address, apartment, suite…"
            value={data.address}
            onChange={handle("address")}
            autoComplete="street-address"
          />
        </Field>
      </div>

      <div className="form-row">
        <Field label="City" htmlFor="city">
          <input
            id="city"
            type="text"
            placeholder="Nairobi"
            value={data.city}
            onChange={handle("city")}
            autoComplete="address-level2"
          />
        </Field>
        <Field label="Country" htmlFor="country">
          <select
            id="country"
            value={data.country}
            onChange={handle("country")}
            autoComplete="country-name"
          >
            {[
              "Kenya", "Ghana", "Nigeria", "Ethiopia",
              "South Africa", "United Kingdom", "United States",
            ].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
      </div>
    </fieldset>
  );
}

// ─── Payment Form ─────────────────────────────────────────────────────────────
function PaymentForm({ paymentMethod, setPaymentMethod, cardData, onCardChange }) {
  const handleCard = (key) => (e) => {
    let value = e.target.value;
    if (key === "number") value = formatCardNumber(value);
    if (key === "expiry") value = formatExpiry(value);
    onCardChange({ ...cardData, [key]: value });
  };

  return (
    <fieldset className="form-fieldset">
      <SectionLabel text="Payment Method" />

      <PaymentMethodSelector selected={paymentMethod} onChange={setPaymentMethod} />

      {paymentMethod === "card" && (
        <>
          <div className="card-row">
            <Field label="Card Number" htmlFor="card-number">
              <input
                id="card-number"
                type="text"
                placeholder="1234  5678  9012  3456"
                value={cardData.number}
                onChange={handleCard("number")}
                autoComplete="cc-number"
                inputMode="numeric"
                maxLength={22}
              />
            </Field>
            <Field label="Expiry" htmlFor="expiry">
              <input
                id="expiry"
                type="text"
                placeholder="MM / YY"
                value={cardData.expiry}
                onChange={handleCard("expiry")}
                autoComplete="cc-exp"
                inputMode="numeric"
                maxLength={7}
              />
            </Field>
            <Field label="CVV" htmlFor="cvv">
              <input
                id="cvv"
                type="text"
                placeholder="•••"
                value={cardData.cvv}
                onChange={handleCard("cvv")}
                autoComplete="cc-csc"
                inputMode="numeric"
                maxLength={4}
              />
            </Field>
          </div>

          <div className="form-row form-row-full">
            <Field label="Name on Card" htmlFor="card-name">
              <input
                id="card-name"
                type="text"
                placeholder="As it appears on card"
                value={cardData.name}
                onChange={handleCard("name")}
                autoComplete="cc-name"
              />
            </Field>
          </div>
        </>
      )}

      {paymentMethod === "mpesa" && (
        <div className="form-row form-row-full">
          <Field label="M-Pesa Phone Number" htmlFor="mpesa-phone">
            <input
              id="mpesa-phone"
              type="tel"
              placeholder="+254 700 000 000"
              autoComplete="tel"
            />
          </Field>
        </div>
      )}

      {paymentMethod === "paypal" && (
        <div className="paypal-redirect-notice">
          <span className="paypal-notice-icon" aria-hidden="true">ℹ</span>
          You will be redirected to PayPal to complete your payment securely.
        </div>
      )}
    </fieldset>
  );
}

// ─── Order Item ───────────────────────────────────────────────────────────────
function OrderItem({ item, onQtyChange }) {
  return (
    <div className="order-item" aria-label={item.name}>
      <div className="item-visual" aria-hidden="true">{item.emoji}</div>
      <div className="item-info">
        <div className="item-name">{item.name}</div>
        <div className="item-origin">{item.origin}</div>
        <div className="item-qty" role="group" aria-label={`Quantity for ${item.name}`}>
          <button
            className="qty-btn"
            onClick={() => onQtyChange(item.id, -1)}
            aria-label="Decrease quantity"
            type="button"
          >
            −
          </button>
          <span className="qty-val" aria-live="polite">{item.qty}</span>
          <button
            className="qty-btn"
            onClick={() => onQtyChange(item.id, 1)}
            aria-label="Increase quantity"
            type="button"
          >
            +
          </button>
        </div>
      </div>
      <div className="item-price">
        KSh {(item.price * item.qty).toLocaleString("en-KE")}
      </div>
    </div>
  );
}

// ─── Order Summary ────────────────────────────────────────────────────────────
const INITIAL_ITEMS = [
  { id: 1, name: "Yoruba Gelede Mask",      origin: "NIGERIA · CERTIFIED", emoji: "🎭", price: 24500, qty: 1 },
  { id: 2, name: "Djembe Ceremonial Drum",  origin: "GHANA · ARTISAN",     emoji: "🪘", price: 18000, qty: 1 },
  { id: 3, name: "Benin Bronze Figure",     origin: "BENIN · HERITAGE",    emoji: "🏺", price: 33500, qty: 2 },
];

const SHIPPING = 1200;
const INSURANCE = 800;
const DISCOUNT_RATE = 0.10;

function OrderSummary({ items, onQtyChange }) {
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discount = promoApplied ? Math.round(subtotal * DISCOUNT_RATE) : 0;
  const total = subtotal - discount + SHIPPING + INSURANCE;

  const handlePromo = () => {
    if (promo.trim().length > 0) setPromoApplied(true);
  };

  return (
    <aside className="order-card" aria-label="Order summary">
      <div className="order-header">
        <h3>Your Order</h3>
        <span className="order-count">
          {items.reduce((s, i) => s + i.qty, 0)} PIECES
        </span>
      </div>

      <div className="order-items">
        {items.map((item) => (
          <OrderItem key={item.id} item={item} onQtyChange={onQtyChange} />
        ))}
      </div>

      <div className="promo-row">
        <input
          className="promo-input"
          placeholder="Promo / gift code"
          value={promo}
          onChange={(e) => setPromo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handlePromo()}
          aria-label="Promo code"
          disabled={promoApplied}
        />
        <button
          className="promo-btn"
          onClick={handlePromo}
          type="button"
          disabled={promoApplied}
        >
          {promoApplied ? "APPLIED ✓" : "APPLY"}
        </button>
      </div>

      <div className="summary-rows" aria-label="Price breakdown">
        <div className="summary-row">
          <span>Subtotal</span>
          <span>KSh {subtotal.toLocaleString("en-KE")}</span>
        </div>
        {promoApplied && (
          <div className="summary-row summary-row-discount">
            <span>Member Discount (10%)</span>
            <span>− KSh {discount.toLocaleString("en-KE")}</span>
          </div>
        )}
        <div className="summary-row">
          <span>Shipping</span>
          <span>KSh {SHIPPING.toLocaleString("en-KE")}</span>
        </div>
        <div className="summary-row">
          <span>Insurance & Packaging</span>
          <span>KSh {INSURANCE.toLocaleString("en-KE")}</span>
        </div>
        <div className="summary-row summary-row-total">
          <span>Total</span>
          <span>KSh {total.toLocaleString("en-KE")}</span>
        </div>
      </div>

      <div className="provenance-badge">
        <span className="prov-icon" aria-hidden="true">📜</span>
        <div className="prov-text">
          <strong>Provenance Included</strong>
          <span>
            Each piece ships with its authenticated certificate of origin
            and artisan biography.
          </span>
        </div>
      </div>
    </aside>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────
export default function Checkout() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [delivery, setDelivery] = useState({
    firstName: "", lastName: "", email: "",
    phone: "", address: "", city: "", country: "Kenya",
  });

  const [cardData, setCardData] = useState({
    number: "", expiry: "", cvv: "", name: "",
  });

  useEffect(() => {
    document.body.classList.add("roots-body");
    return () => document.body.classList.remove("roots-body");
  }, []);

  const handleQtyChange = (id, delta) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, qty: Math.max(1, item.qty + delta) }
          : item
      )
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    // Replace with your actual order submission API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="roots-checkout roots-checkout-confirmed">
        <CheckoutNav />
        <div className="confirmed-content">
          <div className="confirmed-circle">
            <span className="confirmed-check" aria-hidden="true">✦</span>
          </div>
          <h2 className="confirmed-title">Order Placed</h2>
          <p className="confirmed-desc">
            Thank you for your order. A confirmation has been sent to your email.
            Your pieces will be carefully packed and shipped with provenance documents.
          </p>
          <button
            className="confirmed-btn"
            onClick={() => (window.location.href = "/")}
            type="button"
          >
            CONTINUE EXPLORING →
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="roots-checkout">
      <CheckoutNav />

      <main className="checkout-body">
        {/* ── Left column: forms ── */}
        <div className="checkout-left">
          <h2 className="checkout-heading">Complete Your Order</h2>
          <p className="checkout-subtitle">SHIPPING & PAYMENT DETAILS</p>

          <DeliveryForm data={delivery} onChange={setDelivery} />

          <PaymentForm
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            cardData={cardData}
            onCardChange={setCardData}
          />

          <button
            className={`submit-btn ${submitting ? "submit-btn-loading" : ""}`}
            onClick={handleSubmit}
            disabled={submitting}
            aria-busy={submitting ? "true" : "false"}
            type="button"
          >
            {submitting ? "PROCESSING…" : "PLACE ORDER →"}
          </button>

          <div className="trust-row" aria-label="Trust signals">
            {["SSL ENCRYPTED", "FREE RETURNS", "INSURED SHIPPING"].map((t) => (
              <div key={t} className="trust-item">
                <span className="trust-icon" aria-hidden="true">✦</span>
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* ── Right column: order summary ── */}
        <OrderSummary items={items} onQtyChange={handleQtyChange} />
      </main>

      <Footer />
    </div>
  );
}