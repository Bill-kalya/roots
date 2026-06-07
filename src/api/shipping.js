import api from "../services/api";

// Shipping rates lookup
// Backend (FastAPI) should implement e.g.:
// POST /api/shipping/rates
// Body: { country_code, package: { weight_kg, length_cm, width_cm, height_cm }, fragile }
// Returns: { rates: [{ id, carrier, service, cost, estimated_delivery_days, customs_info? }] }
export const getShippingRates = ({
  country_code,
  package: pkg,
  fragile = false,
  currency = "KES",
  signal,
}) =>
  api
    .post(
      "/api/shipping/rates",
      {
        country_code,
        package: pkg,
        fragile,
        currency,
      },
      { signal }
    )
    .then((res) => res.data);

