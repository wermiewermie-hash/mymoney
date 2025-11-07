'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Currency = 'USD' | 'JPY'

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  exchangeRate: number
  formatCurrency: (amount: number) => string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

// Get today's USD to JPY exchange rate (approximate - you can replace with API call)
const USD_TO_JPY_RATE = 149.5 // Update this or fetch from an API

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('USD')
  const [exchangeRate, setExchangeRate] = useState(USD_TO_JPY_RATE)

  // Load currency preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('currency')
    if (saved === 'USD' || saved === 'JPY') {
      setCurrency(saved)
    }
  }, [])

  // Save currency preference to localStorage
  useEffect(() => {
    localStorage.setItem('currency', currency)
  }, [currency])

  const formatCurrency = (amount: number): string => {
    if (currency === 'USD') {
      return `$${Math.round(amount).toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`
    } else {
      // Convert to JPY
      const jpy = amount * exchangeRate

      // Abbreviate for amounts >= 1000
      if (jpy >= 1000) {
        const k = Math.round(jpy / 1000)
        return `¥${k.toLocaleString('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}k`
      }

      return `¥${Math.round(jpy).toLocaleString('en-US')}`
    }
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, exchangeRate, formatCurrency }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
