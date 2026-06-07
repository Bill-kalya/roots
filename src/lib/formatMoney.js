export function formatMoney(amountInKes, currency) {
  const num = typeof amountInKes === "number" ? amountInKes : Number(amountInKes);
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


