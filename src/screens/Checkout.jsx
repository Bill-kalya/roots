// Checkout.jsx — Roots African Art & Culture
import React, { useState, useEffect } from "react";
import "./checkout.css";

import Footer from "../components/Footer";
import { useCart } from "../contexts/CartContext.jsx";
import { getShippingRates } from "../api/shipping.js";

import { useNavigate, useLocation } from "react-router-dom";

import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CheckoutSteps({ current = 1 }) {
  const navigate = useNavigate();
  const steps = ["CART", "CHECKOUT", "CONFIRM"];
  const stepRoutes = ["/basket", "/checkout", "/confirm"];

  return (
    <div className="checkout-steps" aria-label="Checkout progress">
      {steps.map((step, i) => {
        const state = i < current ? "done" : i === current ? "active" : "idle";
        const isClickable = i < current; // only allow going back to completed steps

        return (
          <React.Fragment key={step}>
            {i > 0 && (
              <span className="step-sep" aria-hidden="true">
                ›
              </span>
            )}
            <button
              className={`checkout-step checkout-step-${state}`}
              onClick={() => isClickable && navigate(stepRoutes[i])}
              disabled={!isClickable}
              type="button"
              aria-current={i === current ? "step" : undefined}
            >
              {step}
            </button>
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
          <div className="form-row form-row-full">
            <Field label="Card Details" htmlFor="card-element">
              <div
                id="card-element"
                style={{
                  padding: "10px 12px",
                  border: "1px solid var(--border, #ccc)",
                  borderRadius: "4px",
                  background: "white",
                }}
              >
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: "16px",
                        color: "#1a1a1a",
                        "::placeholder": { color: "#999" },
                      },
                    },
                  }}
                />
              </div>
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

function CheckoutInner() {
  const navigate = useNavigate();
  const location = useLocation();

  const { items, loading: cartLoading } = useCart();

  const stripe = useStripe();
  const elements = useElements();

  const cartError = false;

  const backToBasket = () => {
    const from = location?.state?.from;
    navigate(from || "/basket");
  };

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [mpesaPhone, setMpesaPhone] = useState("");

  const [ratesLoading, setRatesLoading] = useState(false);
  const [shippingRates, setShippingRates] = useState([]);
  const [ratesError, setRatesError] = useState("");
  const [selectedRateId, setSelectedRateId] = useState(null);

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

  const packageEstimate = React.useMemo(() => {
    const safeNum = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };

    const itemsArr = Array.isArray(items) ? items : [];

    const totalQty = itemsArr.reduce((s, i) => s + safeNum(i.quantity) || 0, 0);
    const weight_kg = itemsArr.reduce((sum, i) => sum + safeNum(i.weight_kg) * (safeNum(i.quantity) || 1), 0);

    const length_cm = Math.max(...itemsArr.map((i) => safeNum(i.length_cm) || 0));
    const width_cm = Math.max(...itemsArr.map((i) => safeNum(i.width_cm) || 0));
    const height_cm = Math.max(...itemsArr.map((i) => safeNum(i.height_cm) || 0));

    const fragile = itemsArr.some((i) => Boolean(i.fragile));

    return {
      weight_kg: weight_kg || 0.5,
      length_cm: length_cm || 10,
      width_cm: width_cm || 10,
      height_cm: height_cm || 2,
      fragile,
      totalQty,
    };
  }, [items]);

  React.useEffect(() => {
    let alive = true;

    const fetchRates = async () => {
      setRatesError("");

      const country = delivery?.country;
      if (!country) return;

      const normalized = String(country).trim().toLowerCase();

      if (normalized === "kenya" || normalized === "ke") {
        const freeRate = {
          id: "free_local_delivery",
          carrier: "Local Delivery",
          service: "Local Delivery",
          cost: 0,
          currency: "KES",
          free_shipping: true,
          estimated_delivery_days: null,
        };

        setShippingRates([freeRate]);
        setSelectedRateId(freeRate.id);
        setRatesError("");
        setRatesLoading(false);
        return;
      }

      const country_code = country;

      setRatesLoading(true);
      try {
        const data = await getShippingRates({
          country_code,
          package: {
            weight_kg: packageEstimate.weight_kg,
            length_cm: packageEstimate.length_cm,
            width_cm: packageEstimate.width_cm,
            height_cm: packageEstimate.height_cm,
          },
          fragile: packageEstimate.fragile,
        });

        const rates = data?.rates || [];
        if (!alive) return;

        setShippingRates(rates);
        setSelectedRateId((prev) => {
          if (prev && rates.some((r) => r.id === prev)) return prev;
          return rates[0]?.id || null;
        });
      } catch (err) {
        if (!alive) return;
        const msg = err?.response?.data?.detail || err?.message || "Could not fetch shipping rates.";
        setRatesError(msg);
        setShippingRates([]);
        setSelectedRateId(null);
      } finally {
        if (alive) setRatesLoading(false);
      }
    };

    const t = setTimeout(fetchRates, 350);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [delivery?.country, packageEstimate]);

  useEffect(() => {
    document.body.classList.add("roots-body");
    return () => document.body.classList.remove("roots-body");
  }, []);

  const selectedRate = React.useMemo(() => {
    return shippingRates.find((r) => r.id === selectedRateId) || null;
  }, [shippingRates, selectedRateId]);

  const getShippingFee = () => {
    if (selectedRate?.cost != null) return Number(selectedRate.cost);

    const subtotalFallback =
      items?.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0) || 0;
    return subtotalFallback >= 10000 ? 0 : 850;
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      if (paymentMethod === "mpesa") {
        if (!items || items.length === 0) {
          alert("Your cart is empty.");
          setSubmitting(false);
          return;
        }

        // We still validate/normalize the phone, but the backend derives the canonical amount from the Order row.
        const raw = mpesaPhone.trim().replace(/\s+/g, "").replace("+", "");
        const phone = raw.startsWith("0") ? "254" + raw.slice(1) : raw;

        if (!phone || !/^2547\d{8}$/.test(phone)) {
          alert("Enter a valid Safaricom number e.g. 0712 345 678");
          setSubmitting(false);
          return;
        }

        const shipping = getShippingFee();

        const { createOrder: createInternalOrder } = await import("../api/orders.js");
        const { startMpesaPayment, getPaymentStatus } = await import("../api/payments.js");

        let internalOrder;
        try {
          internalOrder = await createInternalOrder({
            shipping_fee: shipping,
            payment_method: "mpesa",
            // Prefer passing mpesa_phone if backend uses it to populate STK push fields.
            mpesa_phone: phone,
            delivery,
            cancel_url: window.location.origin + "/payments/cancel",
            success_url: window.location.origin + "/payments/success",
          });
        } catch (err) {
          const detail = err?.response?.data?.detail || err?.message || "Could not create order.";
          alert(`Order error: ${detail}`);
          setSubmitting(false);
          return;
        }

        const response = await startMpesaPayment({
          phone,
          order_id: internalOrder.id,
        });


        const checkoutRequestId = response.checkout_request_id;
        if (!checkoutRequestId) throw new Error("Missing checkout_request_id from backend response.");

        alert("Check your phone and enter your M-Pesa PIN.");

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

        const shipping = getShippingFee();
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

        const amount = totalKES;
        const currency = "KES";

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

        if (!stripe || !elements) {
          setSubmitting(false);
          alert("Stripe is not ready yet. Please wait a moment.");
          return;
        }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          setSubmitting(false);
          alert("Card input not found.");
          return;
        }

        const { error } = await stripe.confirmCardPayment(client_secret, {
          payment_method: {
            card: cardElement,
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

        const shipping = getShippingFee();
        const totalKES = Math.ceil(subtotal + shipping);

        const amount = totalKES;
        const currency = "USD";

        const { createOrder: createInternalOrder } = await import("../api/orders.js");
        const { createPaypalOrder } = await import("../api/payments.js");

        let internalOrder;
        try {
          internalOrder = await createInternalOrder({
            shipping_fee: shipping,
            payment_method: "paypal",
            delivery,
            cancel_url: window.location.origin + "/paypal/cancel",
            success_url: window.location.origin + "/paypal/success",
          });
        } catch (err) {
          const detail = err?.response?.data?.detail || err?.message || "Could not create order.";
          alert(`Order error: ${detail}`);
          setSubmitting(false);
          return;
        }

        let response;
        try {
          response = await createPaypalOrder({
            order_id: internalOrder.id,
            amount,
            currency,
          });
        } catch (err) {
          const status = err?.response?.status;
          const detail = err?.response?.data?.detail || err?.message;

          if (status === 503) alert("PayPal is not available right now. Please try M-Pesa or card.");
          else if (status === 502) alert("Could not reach PayPal. Please try again in a moment.");
          else alert(`PayPal error: ${detail || "Unknown error"}`);

          setSubmitting(false);
          return;
        }

        const approvalUrl = response?.approval_url || response?.approvalUrl;
        if (!approvalUrl) {
          alert("Missing approval URL from PayPal. Please try again.");
          setSubmitting(false);
          return;
        }

        window.location.href = approvalUrl;
        return;
      }

      alert("This payment method is not implemented yet.");
      setSubmitting(false);
    } catch (err) {
      console.error(err);
      const detail = err?.response?.data?.detail || err?.message;
      alert(detail ? `Payment failed: ${detail}` : "Payment failed. Please try again.");
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
          <button className="confirmed-btn" onClick={() => (window.location.href = "/")} type="button">
            CONTINUE EXPLORING →
          </button>
        </div>
        <Footer />
      </div>
    );
  }

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

          <button type="button" className="back-to-basket-btn" onClick={backToBasket}>
            ↩ Back to Basket
          </button>

          <DeliveryForm data={delivery} onChange={setDelivery} />

          <fieldset className="form-fieldset">
            <div className="section-label">
              <div className="section-label-line" />
              <span>Shipping Options</span>
            </div>

            {ratesLoading && (
              <p className="checkout-subtitle" style={{ margin: 0 }}>
                Fetching live shipping rates…
              </p>
            )}

            {ratesError && (
              <div className="checkout-error" role="alert">
                ⚠ {ratesError}
              </div>
            )}

            {!ratesLoading && !ratesError && shippingRates.length === 0 && (
              <p className="checkout-subtitle" style={{ margin: 0 }}>
                Enter your delivery country to see available carriers.
              </p>
            )}

            {shippingRates.length > 0 && (
              <div className="shipping-rates" role="radiogroup" aria-label="Available shipping methods">
                {shippingRates.map((r) => {
                  const active = r.id === selectedRateId;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      className={`shipping-rate ${active ? "shipping-rate-active" : ""}`}
                      role="radio"
                      aria-checked={active}
                      onClick={() => setSelectedRateId(r.id)}
                    >
                      <div className="shipping-rate-top">
                        <div>
                          <div className="shipping-rate-carrier">{r.carrier || r.service || "Carrier"}</div>
                          <div className="shipping-rate-meta">
                            {r.estimated_delivery_days != null ? `Est. ${r.estimated_delivery_days} days` : "Delivery estimate unavailable"}
                          </div>
                        </div>
                        <div className="shipping-rate-cost">{r.cost != null ? `KSh ${Number(r.cost).toLocaleString("en-KE")}` : "—"}</div>
                      </div>

                      {r.customs_info && (
                        <div className="shipping-rate-customs">
                          <strong>Customs/Taxes:</strong> {r.customs_info}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="customs-info-banner" role="note">
              ℹ Import duties and taxes may be charged by your country’s customs authority and are not included in the product price.
            </div>
          </fieldset>

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

        <div className="checkout-right" />

        <button
          className="checkout-chat-floating"
          type="button"
          onClick={() => {
            const firstMerchantId = items?.find((i) => i.merchant_id)?.merchant_id;
            if (firstMerchantId) {
              navigate("/chat", { state: { merchantId: firstMerchantId } });
            } else {
              navigate("/chat", { state: { roomId: "general" } });
            }
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

export default function Checkout() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutInner />
    </Elements>
  );
}

