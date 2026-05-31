// Checkout.jsx — Roots African Art & Culture
import React, { useState, useEffect } from "react";
import "./checkout.css";

import Footer from "../components/Footer";
import { useCart } from "../contexts/CartContext.jsx";


// NOTE: This component currently only implements the frontend UI.
// It assumes the backend enforces auth and returns 401 when missing/expired.

import { useNavigate } from "react-router-dom";

function CheckoutSteps({ current = 1 }) {
  const steps = ["CART", "CHECKOUT", "CONFIRM"];
  return (
    <div className="checkout-steps" aria-label="Checkout progress">
      {steps.map((step, i) => {
        const state = i < current ? "done" : i === current ? "active" : "idle";
        return (
          <React.Fragment key={step}>
            {i > 0 && (
              <span className="step-sep" aria-hidden="true">
                ›
              </span>
            )}
            <span className={`checkout-step checkout-step-${state}`}>{step}</span>
          </React.Fragment>
        );
      })}
    </div>
  );
}

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

function SectionLabel({ text }) {
  return (
    <div className="section-label">
      <div className="section-label-line" />
      <span>{text}</span>
    </div>
  );
}

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

function Field({ label, children, htmlFor }) {
  return (
    <div className="field">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}

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
            {["Kenya", "Ghana", "Nigeria", "Ethiopia", "South Africa", "United Kingdom", "United States"].map(
              (c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              )
            )}
          </select>
        </Field>
      </div>
    </fieldset>
  );
}

function PaymentForm({
  paymentMethod,
  setPaymentMethod,
  cardData,
  onCardChange,
  mpesaPhone,
  onMpesaPhoneChange,
}) {
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
              placeholder="0748 623 579"
              value={mpesaPhone}
              onChange={(e) => onMpesaPhoneChange(e.target.value)}
              autoComplete="tel"
            />
          </Field>
        </div>
      )}

      {paymentMethod === "paypal" && (
        <div className="paypal-redirect-notice">
          <span className="paypal-notice-icon" aria-hidden="true">
            ℹ
          </span>
          You will be redirected to PayPal to complete your payment securely.
        </div>
      )}
    </fieldset>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const { items, loading: cartLoading } = useCart();

  const cartError = false;


  const [paymentMethod, setPaymentMethod] = useState("card");
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [delivery, setDelivery] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Kenya",
  });

  const [cardData, setCardData] = useState({ number: "", expiry: "", cvv: "", name: "" });

  useEffect(() => {
    document.body.classList.add("roots-body");
    return () => document.body.classList.remove("roots-body");
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      if (paymentMethod === "mpesa") {
        // Validate cart
        if (!items || items.length === 0) {
          alert("Your cart is empty.");
          setSubmitting(false);
          return;
        }

        // Calculate subtotal
        const subtotal = items.reduce((sum, item) => {
          const price = Number(item.price || 0);
          const qty = Number(item.quantity || 1);

          return sum + price * qty;
        }, 0);

        // Shipping logic
        const shipping = subtotal >= 10000 ? 0 : 850;

        // Final total
        const total = Math.ceil(subtotal + shipping);

        // Prevent invalid STK requests
        if (total < 1) {
          alert("Invalid cart total.");
          setSubmitting(false);
          return;
        }

        // Normalize phone to 254XXXXXXXXX
        const raw = mpesaPhone.trim().replace(/\s+/g, "").replace("+", "");
        const phone = raw.startsWith("0") ? "254" + raw.slice(1) : raw;

        if (!phone || !/^2547\d{8}$/.test(phone)) {
          alert("Enter a valid Safaricom number e.g. 0712 345 678");
          setSubmitting(false);
          return;
        }

        const { startMpesaPayment, getPaymentStatus } =
          await import("../api/payments.js");

        const response = await startMpesaPayment({
          phone,
          amount: total,
          order_reference: `ROOTS-${Date.now()}`,
        });

        const checkoutRequestId = response.checkout_request_id;


        if (!checkoutRequestId) {
          throw new Error("Missing checkout_request_id from backend response.");
        }

        alert("Check your phone and enter your M-Pesa PIN.");

        // Poll for payment status every 3 seconds, stop after 2 minutes
        let attempts = 0;
        const MAX_ATTEMPTS = 40;

        const interval = setInterval(async () => {
          attempts += 1;

          if (attempts > MAX_ATTEMPTS) {
            clearInterval(interval);
            setSubmitting(false);
            alert("Payment confirmation timed out. If you paid, contact support.");
            return;
          }

          try {
            const statusRes = await getPaymentStatus(checkoutRequestId);
            const status = statusRes?.status;

            if (status === "completed") {
              clearInterval(interval);
              setSubmitted(true);
              setSubmitting(false);
            } else if (status === "failed") {
              clearInterval(interval);
              setSubmitting(false);
              alert("Payment was not completed. Please try again.");
            }
          } catch {
            clearInterval(interval);
            setSubmitting(false);
            alert("Could not confirm payment. Contact support if you were charged.");
          }
        }, 3000);

        return;
      }

      if (paymentMethod === "card") {
        if (!items || items.length === 0) {
          alert("Your cart is empty.");
          setSubmitting(false);
          return;
        }

        const subtotal = items.reduce((sum, item) => {
          const price = Number(item.price || 0);
          const qty = Number(item.quantity || 1);
          return sum + price * qty;
        }, 0);

        const shipping = subtotal >= 10000 ? 0 : 850;
        const totalKES = Math.ceil(subtotal + shipping);

        const { createOrder: createInternalOrder } = await import("../api/orders.js");
        const { createStripePaymentIntent } = await import("../api/payments.js");

        const internalOrder = await createInternalOrder({
          shipping_fee: shipping,
          payment_method: "card",
          delivery,
          cancel_url: window.location.origin + "/payments/cancel",
          success_url: window.location.origin + "/payments/success",
        });

        // Amount/currency contract:
        // backend should convert/store correctly. We pass KES amount and let backend create the Stripe PI.
        const amount = totalKES;
        const currency = "KES";

        const { loadStripe } = await import("@stripe/stripe-js");
        const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

        if (!stripe) {
          setSubmitting(false);
          alert("Stripe failed to initialize. Missing VITE_STRIPE_PUBLISHABLE_KEY.");
          return;
        }

        // NOTE: This implementation expects your backend to return a PaymentIntent client_secret.
        const { client_secret } = await createStripePaymentIntent({
          order_id: internalOrder.id,
          amount,
          currency,
        });

        if (!client_secret) {
          setSubmitting(false);
          alert("Missing client_secret from backend.");
          return;
        }

        // Because this app currently uses plain inputs (not Stripe Elements),
        // we cannot securely confirm with raw card data.
        // The backend should instead support a PCI-compliant flow using Stripe Elements.
        // For now, we attempt confirm with a minimal payload. If you use Stripe Elements,
        // replace this section with Elements-based confirmation.
        const { error } = await stripe.confirmCardPayment(client_secret, {
          payment_method: {
            card: undefined,
            billing_details: {
              name: cardData.name,
              email: delivery.email,
              phone: delivery.phone,
              address: {
                line1: delivery.address,
                city: delivery.city,
                country: delivery.country,
              },
            },
          },
        });

        if (error) {
          setSubmitting(false);
          alert(error.message || "Card payment failed.");
          return;
        }

        setSubmitted(true);
        setSubmitting(false);
        return;
      }

      if (paymentMethod === "paypal") {
        // IMPORTANT: PayPal expects a currency it supports (recommended USD).
        // Backend will create the internal pending order + PayPal order.
        if (!items || items.length === 0) {
          alert("Your cart is empty.");
          setSubmitting(false);
          return;
        }


        const subtotal = items.reduce((sum, item) => {
          const price = Number(item.price || 0);
          const qty = Number(item.quantity || 1);
          return sum + price * qty;
        }, 0);

        const shipping = subtotal >= 10000 ? 0 : 850;
        const totalKES = Math.ceil(subtotal + shipping);

        // For now, pass amount/currency exactly as backend expects.
        // Recommended setup is PayPal->USD, so your backend can convert if it stores KES.
        const amount = totalKES;
        const currency = "USD";

        const { createOrder: createInternalOrder } = await import("../api/orders.js");
        const { createPaypalOrder } = await import("../api/payments.js");

        // 1) Create internal pending ROOTS order first (required by backend schema)
        // OrderCreate expects: shipping_fee, payment_method, delivery, cancel_url, success_url, mpesa_phone?
        const internalOrder = await createInternalOrder({
          shipping_fee: shipping,
          payment_method: "paypal",
          delivery,
          cancel_url: window.location.origin + "/paypal/cancel",
          success_url: window.location.origin + "/paypal/success",
        });

        // 2) Create PayPal order linked to internal order id
        const response = await createPaypalOrder({
          order_id: internalOrder.id,
          amount,
          currency,
        });


        const approvalUrl = response?.approval_url || response?.approvalUrl;
        if (!approvalUrl) {
          throw new Error("Missing approval_url from PayPal create-order response.");
        }

        // Redirect user to PayPal to approve payment
        window.location.href = approvalUrl;
        return;
      }

      alert("This payment method is not implemented yet.");

      setSubmitting(false);
    } catch (err) {
      console.error(err);

      alert("Payment failed.");

      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="roots-checkout roots-checkout-confirmed">
        <CheckoutNav />
        <div className="confirmed-content">
          <div className="confirmed-circle">
            <span className="confirmed-check" aria-hidden="true">
              ✦
            </span>
          </div>
          <h2 className="confirmed-title">Order Placed</h2>
          <p className="confirmed-desc">
            Thank you for your order. A confirmation has been sent to your email. Your pieces will be carefully packed and shipped with
            provenance documents.
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

  // Frontend guard: prevent crashes / broken UI when auth token is missing.
  // If backend returns 401, our axios interceptors redirect to /login.
  // Still, keep checkout mount resilient.
  if (cartError) {
    return (
      <div className="roots-checkout">
        <CheckoutNav />
        <main className="checkout-body">
          <div className="checkout-left">
            <h2 className="checkout-heading">Please sign in</h2>
            <p className="checkout-subtitle">Your session has expired or is missing. Redirecting to login…</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className="roots-checkout">
        <CheckoutNav />
        <main className="checkout-body">
          <div className="checkout-left">
            <h2 className="checkout-heading">Loading your cart…</h2>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="roots-checkout">
      <CheckoutNav />
      <main className="checkout-body">
        <div className="checkout-left">
          <h2 className="checkout-heading">Complete Your Order</h2>
          <p className="checkout-subtitle">SHIPPING & PAYMENT DETAILS</p>

          <DeliveryForm data={delivery} onChange={setDelivery} />

          <PaymentForm
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            cardData={cardData}
            onCardChange={setCardData}
            mpesaPhone={mpesaPhone}
            onMpesaPhoneChange={setMpesaPhone}
          />

          <button
            className={`submit-btn ${submitting ? "submit-btn-loading" : ""}`}
            onClick={handleSubmit}
            disabled={submitting || items.length === 0}
            aria-busy={submitting ? "true" : "false"}
            type="button"
          >
            {submitting ? "PROCESSING…" : "PLACE ORDER →"}
          </button>

          <div className="trust-row" aria-label="Trust signals">
            {["SSL ENCRYPTED", "FREE RETURNS", "INSURED SHIPPING"].map((t) => (
              <div key={t} className="trust-item">
                <span className="trust-icon" aria-hidden="true">
                  ✦
                </span>
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Keep existing OrderSummary UI out of scope for the auth crash fix */}
        <div className="checkout-right" />

        <button
          className="checkout-chat-floating"
          type="button"
          onClick={() => {
            // Keep SPA navigation. roomId is required by Chat.jsx.
            navigate("/chat", { state: { roomId: "general" } });
          }}
          aria-label="Chat about your order"
        >
          💬
        </button>

      </main>
      <Footer />
    </div>
  );
}

