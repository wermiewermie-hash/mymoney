'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getExchangeRate } from '@/lib/services/exchangeRate'

type Currency = 'USD' | 'JPY'

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  exchangeRate: number
  formatCurrency: (amount: number) => string
  getCurrencySymbol: () => string
  isLoadingRate: boolean
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

// Fallback rate if API fails to load
const FALLBACK_RATE = 149.5

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('USD')
  const [exchangeRate, setExchangeRate] = useState(FALLBACK_RATE)
  const [isLoadingRate, setIsLoadingRate] = useState(true)

  // Load currency preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('currency')
    if (saved === 'USD' || saved === 'JPY') {
      setCurrency(saved)
    }
  }, [])

  // Fetch live exchange rate on mount
  useEffect(() => {
    const fetchRate = async () => {
      setIsLoadingRate(true)
      try {
        const rate = await getExchangeRate()
        setExchangeRate(rate)
      } catch (error) {
        console.warn('Failed to fetch exchange rate, using fallback:', error)
        setExchangeRate(FALLBACK_RATE)
      } finally {
        setIsLoadingRate(false)
      }
    }

    fetchRate()
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

  const getCurrencySymbol = (): string => {
    return currency === 'USD' ? '$' : '¥'
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, exchangeRate, formatCurrency, getCurrencySymbol, isLoadingRate }}>
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
