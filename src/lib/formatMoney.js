export function formatMoney(amount, currency = 'KES') {
  const num = typeof amount === 'number' ? amount : Number(amount);
  const safe = Number.isFinite(num) ? num : 0;

  if (currency === 'USD') {
    return `$${safe.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  }

  // Default: KES
  return `KSh ${safe.toLocaleString('en-KE')}`;
}

