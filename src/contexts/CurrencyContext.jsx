import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CurrencyContext = createContext(null);

const STORAGE_KEY = 'roots_display_currency';

export default function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState('KES');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, currency);
  }, [currency]);


  const value = useMemo(() => ({
    currency,
    setCurrency,
  }), [currency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
};

