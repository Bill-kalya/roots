export function formatMoney(amountInKes, currency) {
  // amountInKes is expected to be a numeric KES amount from the backend.
  // Frontend sometimes receives strings like "12,000"; normalize them.
  const numRaw = typeof amountInKes === "number" ? amountInKes : amountInKes;
  const num =
    typeof numRaw === "string"
      ? Number(numRaw.replace(/[^0-9.-]/g, ""))
      : Number(numRaw);
  const safe = Number.isFinite(num) ? num : 0;

  if (!currency || !currency.rate) {
    return `KSh ${safe.toLocaleString("en-KE")}`;
  }

  const converted = safe * currency.rate;
  const isKES = currency.code === "KES";

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: currency.code,
    minimumFractionDigits: isKES ? 0 : 2,
    maximumFractionDigits: isKES ? 0 : 2,
  }).format(converted);
}


