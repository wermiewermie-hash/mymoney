import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Currency = 'USD' | 'JPY';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatAmount: (amount: number) => string;
  convertAmount: (usdAmount: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Exchange rate as of November 6, 2025: 1 USD = 150 JPY
const EXCHANGE_RATE = 150;

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    // Load from localStorage on initial render
    const saved = localStorage.getItem('currency');
    return (saved === 'JPY' ? 'JPY' : 'USD') as Currency;
  });

  useEffect(() => {
    // Save to localStorage whenever currency changes
    localStorage.setItem('currency', currency);
  }, [currency]);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
  };

  const convertAmount = (usdAmount: number): number => {
    if (currency === 'JPY') {
      return Math.round(usdAmount * EXCHANGE_RATE);
    }
    return usdAmount;
  };

  const formatAmount = (usdAmount: number): string => {
    const amount = convertAmount(usdAmount);
    
    if (currency === 'JPY') {
      return `¥${amount.toLocaleString()}`;
    }
    return `$${amount}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount, convertAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
