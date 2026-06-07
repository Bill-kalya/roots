import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

// ── Exchange rates relative to KES (1 KES = X foreign currency) ──────────────
// Update these periodically or fetch from exchangerate-api.com
const CURRENCY_MAP = {
  // ── East Africa ────────────────────────────────────────────────────────────
  KE: { code: "KES", symbol: "KSh", rate: 1 },
  TZ: { code: "TZS", symbol: "TSh", rate: 28.5 },
  UG: { code: "UGX", symbol: "USh", rate: 29.3 },
  RW: { code: "RWF", symbol: "Fr", rate: 10.2 },
  ET: { code: "ETB", symbol: "Br", rate: 0.57 },
  SS: { code: "SSP", symbol: "£", rate: 10.5 },
  BI: { code: "BIF", symbol: "Fr", rate: 22.8 },

  // ── West Africa ────────────────────────────────────────────────────────────
  NG: { code: "NGN", symbol: "₦", rate: 4.9 },
  GH: { code: "GHS", symbol: "₵", rate: 0.057 },
  SN: { code: "XOF", symbol: "Fr", rate: 4.6 },
  CI: { code: "XOF", symbol: "Fr", rate: 4.6 },
  CM: { code: "XAF", symbol: "Fr", rate: 4.6 },
  ML: { code: "XOF", symbol: "Fr", rate: 4.6 },
  BF: { code: "XOF", symbol: "Fr", rate: 4.6 },
  NE: { code: "XOF", symbol: "Fr", rate: 4.6 },
  TG: { code: "XOF", symbol: "Fr", rate: 4.6 },
  BJ: { code: "XOF", symbol: "Fr", rate: 4.6 },
  GN: { code: "GNF", symbol: "Fr", rate: 66.8 },
  SL: { code: "SLL", symbol: "Le", rate: 156 },
  LR: { code: "LRD", symbol: "$", rate: 1.49 },
  GM: { code: "GMD", symbol: "D", rate: 0.52 },
  MR: { code: "MRU", symbol: "UM", rate: 0.31 },
  CV: { code: "CVE", symbol: "$", rate: 0.78 },

  // ── North Africa ────────────────────────────────────────────────────────────
  EG: { code: "EGP", symbol: "£", rate: 0.24 },
  MA: { code: "MAD", symbol: "د.م", rate: 0.077 },
  DZ: { code: "DZD", symbol: "دج", rate: 1.04 },
  TN: { code: "TND", symbol: "د.ت", rate: 0.024 },
  LY: { code: "LYD", symbol: "ل.د", rate: 0.037 },
  SD: { code: "SDG", symbol: "ج.س", rate: 4.55 },

  // ── Southern Africa ────────────────────────────────────────────────────────
  ZA: { code: "ZAR", symbol: "R", rate: 0.14 },
  ZM: { code: "ZMW", symbol: "ZK", rate: 0.17 },
  ZW: { code: "ZWL", symbol: "$", rate: 3.12 },
  BW: { code: "BWP", symbol: "P", rate: 0.1 },
  NA: { code: "NAD", symbol: "$", rate: 0.14 },
  MZ: { code: "MZN", symbol: "MT", rate: 0.49 },
  MW: { code: "MWK", symbol: "MK", rate: 13.3 },
  MG: { code: "MGA", symbol: "Ar", rate: 35.2 },
  MU: { code: "MUR", symbol: "₨", rate: 0.35 },
  SC: { code: "SCR", symbol: "₨", rate: 0.11 },
  LS: { code: "LSL", symbol: "L", rate: 0.14 },
  SZ: { code: "SZL", symbol: "L", rate: 0.14 },

  // ── USA & Canada ────────────────────────────────────────────────────────────
  US: { code: "USD", symbol: "$", rate: 0.0077 },
  CA: { code: "CAD", symbol: "CA$", rate: 0.011 },

  // ── United Kingdom ─────────────────────────────────────────────────────────
  GB: { code: "GBP", symbol: "£", rate: 0.0061 },

  // ── Europe (non-Euro) ──────────────────────────────────────────────────────
  CH: { code: "CHF", symbol: "Fr", rate: 0.0069 },
  NO: { code: "NOK", symbol: "kr", rate: 0.083 },
  SE: { code: "SEK", symbol: "kr", rate: 0.082 },
  DK: { code: "DKK", symbol: "kr", rate: 0.053 },
  PL: { code: "PLN", symbol: "zł", rate: 0.031 },
  CZ: { code: "CZK", symbol: "Kč", rate: 0.18 },
  HU: { code: "HUF", symbol: "Ft", rate: 2.85 },
  RO: { code: "RON", symbol: "lei", rate: 0.035 },
  BG: { code: "BGN", symbol: "лв", rate: 0.014 },
  HR: { code: "HRK", symbol: "kn", rate: 0.053 },
  RS: { code: "RSD", symbol: "дин", rate: 0.83 },
  UA: { code: "UAH", symbol: "₴", rate: 0.31 },
  RU: { code: "RUB", symbol: "₽", rate: 0.71 },
  TR: { code: "TRY", symbol: "₺", rate: 0.25 },
  IS: { code: "ISK", symbol: "kr", rate: 1.06 },
  AL: { code: "ALL", symbol: "L", rate: 0.7 },
  MK: { code: "MKD", symbol: "ден", rate: 0.44 },
  BA: { code: "BAM", symbol: "KM", rate: 0.014 },

  // ── Middle East ────────────────────────────────────────────────────────────
  AE: { code: "AED", symbol: "د.إ", rate: 0.028 },
  SA: { code: "SAR", symbol: "﷼", rate: 0.029 },
  QA: { code: "QAR", symbol: "﷼", rate: 0.028 },
  KW: { code: "KWD", symbol: "د.ك", rate: 0.0024 },
  BH: { code: "BHD", symbol: ".د.ب", rate: 0.0029 },
  OM: { code: "OMR", symbol: "﷼", rate: 0.003 },
  JO: { code: "JOD", symbol: "د.ا", rate: 0.0055 },
  LB: { code: "LBP", symbol: "ل.ل", rate: 690 },
  IQ: { code: "IQD", symbol: "ع.د", rate: 10.1 },
  IR: { code: "IRR", symbol: "﷼", rate: 324 },
  IL: { code: "ILS", symbol: "₪", rate: 0.028 },
  YE: { code: "YER", symbol: "﷼", rate: 1.93 },
  SY: { code: "SYP", symbol: "£", rate: 10 },
  PS: { code: "ILS", symbol: "₪", rate: 0.028 },

  // ── Asia-Pacific ───────────────────────────────────────────────────────────
  CN: { code: "CNY", symbol: "¥", rate: 0.056 },
  JP: { code: "JPY", symbol: "¥", rate: 1.17 },
  IN: { code: "INR", symbol: "₹", rate: 0.65 },
  AU: { code: "AUD", symbol: "A$", rate: 0.012 },
  NZ: { code: "NZD", symbol: "NZ$", rate: 0.013 },
  SG: { code: "SGD", symbol: "S$", rate: 0.01 },
  MY: { code: "MYR", symbol: "RM", rate: 0.036 },
  TH: { code: "THB", symbol: "฿", rate: 0.27 },
  ID: { code: "IDR", symbol: "Rp", rate: 125 },
  PH: { code: "PHP", symbol: "₱", rate: 0.44 },
  PK: { code: "PKR", symbol: "₨", rate: 2.15 },
  BD: { code: "BDT", symbol: "৳", rate: 0.84 },
  LK: { code: "LKR", symbol: "₨", rate: 2.31 },
  NP: { code: "NPR", symbol: "₨", rate: 1.03 },
  KR: { code: "KRW", symbol: "₩", rate: 10.6 },
  HK: { code: "HKD", symbol: "HK$", rate: 0.06 },
  TW: { code: "TWD", symbol: "NT$", rate: 0.25 },
  VN: { code: "VND", symbol: "₫", rate: 196 },
  MM: { code: "MMK", symbol: "K", rate: 16.2 },
  KH: { code: "KHR", symbol: "៛", rate: 31.7 },
  LA: { code: "LAK", symbol: "₭", rate: 168 },

  // ── Latin America ──────────────────────────────────────────────────────────
  MX: { code: "MXN", symbol: "MX$", rate: 0.13 },
  BR: { code: "BRL", symbol: "R$", rate: 0.044 },
  AR: { code: "ARS", symbol: "$", rate: 7.5 },
  CL: { code: "CLP", symbol: "$", rate: 7.3 },
  CO: { code: "COP", symbol: "$", rate: 32 },
  PE: { code: "PEN", symbol: "S/", rate: 0.029 },
  VE: { code: "VES", symbol: "Bs", rate: 0.28 },
  EC: { code: "USD", symbol: "$", rate: 0.0077 },
  UY: { code: "UYU", symbol: "$U", rate: 0.31 },
  PY: { code: "PYG", symbol: "₲", rate: 57.2 },
  BO: { code: "BOB", symbol: "Bs", rate: 0.053 },
  CR: { code: "CRC", symbol: "₡", rate: 3.99 },
  GT: { code: "GTQ", symbol: "Q", rate: 0.06 },
  HN: { code: "HNL", symbol: "L", rate: 0.19 },
  PA: { code: "PAB", symbol: "B/.", rate: 0.0077 },
  DO: { code: "DOP", symbol: "RD$", rate: 0.46 },
  CU: { code: "CUP", symbol: "$", rate: 0.0077 },
  JM: { code: "JMD", symbol: "J$", rate: 1.21 },
  TT: { code: "TTD", symbol: "TT$", rate: 0.052 },
};

// EU countries → EUR
const EU_COUNTRIES = [
  "AT",
  "BE",
  "CY",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PT",
  "SK",
  "SI",
  "ES",
];

const EUR = { code: "EUR", symbol: "€", rate: 0.0071 };
const DEFAULT_CURRENCY = CURRENCY_MAP.KE;

const CurrencyContext = createContext(null);

const STORAGE_KEY = "roots_currency";

export default function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [detected, setDetected] = useState(false);

  useEffect(() => {
    // Respect manual user choice saved to localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setCurrency(JSON.parse(saved));
        setDetected(true);
        return;
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    // Auto-detect country via backend geolocation
    // (avoids ipapi.co CORS + free-tier 429 issues)
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

    fetch(`${apiBaseUrl}/api/v1/geo`)
      .then((res) => res.json())
      .then((data) => {
        const country = data?.country_code;

        if (!country) return;

        if (EU_COUNTRIES.includes(country)) {
          setCurrency(EUR);
          return;
        }

        const matched = CURRENCY_MAP[country];
        if (matched) setCurrency(matched);
        // else stay on KES default
      })
      .catch(() => {
        // Silent fallback
      })
      .finally(() => setDetected(true));
  }, []);

  const changeCurrency = (code) => {
    const found = Object.values({ ...CURRENCY_MAP, EU: EUR }).find(
      (c) => c.code === code
    );

    if (found) {
      setCurrency(found);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
    }
  };

  const value = useMemo(
    () => ({ currency, changeCurrency, detected, CURRENCY_MAP, EUR }),
    [currency, detected]
  );

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
};


