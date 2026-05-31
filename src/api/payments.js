import api from "../services/api";

// =========================
// M-PESA
// =========================
export const startMpesaPayment = (payload) =>
  api.post("/api/payments/mpesa/stk-push", payload).then((res) => res.data);

export const getPaymentStatus = (checkoutRequestId) =>
  api
    .get(`/api/payments/mpesa/status/${checkoutRequestId}`)
    .then((res) => res.data);

// =========================
// STRIPE (CARD)
// =========================
export const createStripePaymentIntent = ({
  order_id,
  amount,
  currency = "USD",
}) =>
  api
    .post("/api/payments/stripe/create-payment-intent", {
      order_id,
      amount,
      currency,
    })
    .then((res) => res.data);

// =========================
// PAYPAL
// =========================
// Backend responsibilities (per recommended architecture):
// - create internal pending order
// - create PayPal order via PayPal API
// - store paypal_order_id
// - return approval_url for frontend redirect
export const createPaypalOrder = ({ order_id, amount, currency }) =>
  api
    .post("/api/payments/paypal/create-order", { order_id, amount, currency })
    .then((res) => res.data);


// Capture is done server-side (frontend should NOT process PayPal fully).
export const capturePaypalOrder = ({ paypal_order_id }) =>
  api
    .post("/api/payments/paypal/capture", { paypal_order_id })
    .then((res) => res.data);

