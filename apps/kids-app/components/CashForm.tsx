'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { upsertCash } from '@/app/actions/kidsAssets'
import { useCurrency } from '@/lib/context/CurrencyContext'
import Card from '@/components/Card'

interface CashFormProps {
  existingCash: any | null
}

export default function CashForm({ existingCash }: CashFormProps) {
  const router = useRouter()
  const { formatCurrency } = useCurrency()
  const [amount, setAmount] = useState(existingCash?.current_value.toString() || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum < 0) {
      setError('Please enter a valid amount')
      setLoading(false)
      return
    }

    const result = await upsertCash(amountNum)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Cash Info Card */}
      <Card>
        <div className="text-center py-4">
          <div className="text-6xl mb-4">💰</div>
          <h2 className="text-[#5C4033] font-bold text-2xl mb-2">Cash</h2>
          <p className="text-[#8B7355] text-sm">Your savings and money</p>
        </div>
      </Card>

      {/* Amount Input Card */}
      <Card>
        <h3 className="text-[#5C4033] font-semibold text-lg mb-4">
          {existingCash ? 'Update your cash amount' : 'How much cash do you have?'}
        </h3>

        <div className="mb-6">
          <label className="block text-[#5C4033] font-medium mb-2">
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5c4033] text-lg font-semibold">
              $
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
              required
              autoFocus
              inputMode="decimal"
              className="w-full pl-8 pr-4 py-3 bg-[#E3F2FD] border-0 rounded-2xl focus:ring-2 focus:ring-[#0bd2ec] text-[#5c4033] text-lg font-semibold"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Total Display */}
        {amount && !isNaN(parseFloat(amount)) && (
          <div className="p-4 bg-gradient-to-br from-[#0bd2ec]/10 to-[#15acc0]/10 rounded-2xl">
            <p className="text-[#8B7355] text-sm mb-1">Your total cash</p>
            <p className="text-[#5C4033] font-bold text-2xl">
              {formatCurrency(parseFloat(amount))}
            </p>
          </div>
        )}
      </Card>

      {/* Error Message */}
      {error && (
        <Card>
          <div className="flex gap-3 items-start">
            <span className="text-2xl shrink-0">⚠️</span>
            <p className="text-[#FF6B6B] font-medium">{error}</p>
          </div>
        </Card>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full h-16 bg-gradient-to-b from-[#0bd2ec] to-[#15acc0] text-white font-semibold text-lg rounded-[18px] shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Saving...' : existingCash ? 'Update Cash' : 'Add Cash'}
      </button>

      {/* Delete Button (only show if updating) */}
      {existingCash && (
        <button
          type="button"
          onClick={() => {
            if (confirm('Are you sure you want to remove your cash?')) {
              // TODO: Implement delete function
            }
          }}
          className="w-full h-12 text-[#FF6B6B] font-medium"
        >
          Remove cash
        </button>
      )}
    </form>
  )
}
