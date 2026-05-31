import api from "../services/api";

// Internal ROOTS order creation (used as the source-of-truth before creating PayPal)
// POST /api/orders/ (OrderCreate) -> OrderResponse
export const createOrder = ({
  shipping_fee,
  payment_method,
  delivery,
  mpesa_phone,
  cancel_url,
  success_url,
}) =>
  api.post("/api/orders/", {
    shipping_fee,
    payment_method,
    delivery,
    ...(mpesa_phone ? { mpesa_phone } : {}),
    ...(cancel_url ? { cancel_url } : {}),
    ...(success_url ? { success_url } : {}),
  }).then((res) => res.data);



