'use client'

import { useCurrency } from '@/lib/context/CurrencyContext'

interface CurrencyDisplayProps {
  amount: number
  className?: string
}

export default function CurrencyDisplay({ amount, className = '' }: CurrencyDisplayProps) {
  const { formatCurrency } = useCurrency()

  return <span className={className}>{formatCurrency(amount)}</span>
}
