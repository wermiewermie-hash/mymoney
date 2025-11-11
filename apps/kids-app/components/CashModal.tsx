'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { upsertCash } from '@/app/actions/kidsAssets'
import { useCurrency } from '@/lib/context/CurrencyContext'
import Card from '@/components/Card'
import Modal from '@/components/Modal'

interface CashModalProps {
  isOpen: boolean
  onClose: () => void
  existingAmount?: number
  onSuccess?: () => void
}

export default function CashModal({ isOpen, onClose, existingAmount = 0, onSuccess }: CashModalProps) {
  const router = useRouter()
  const { formatCurrency } = useCurrency()
  const [amount, setAmount] = useState(existingAmount.toString())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset amount when modal opens
  useEffect(() => {
    if (isOpen) {
      setAmount(existingAmount > 0 ? existingAmount.toString() : '')
      setError(null)
    }
  }, [isOpen, existingAmount])

  const handleSave = async () => {
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
      console.log('✅ Cash save successful!')
      setLoading(false)
      if (onSuccess) {
        console.log('🎯 Calling onSuccess callback')
        onSuccess()
      } else {
        console.log('⚠️ No onSuccess callback provided')
      }
      // Keep modal open and wait for confetti to complete before closing
      setTimeout(() => {
        onClose()
        router.refresh()
      }, 600)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} loading={loading}>
      {/* Header */}
      <h2 className="text-xl font-bold text-[#5C4033]">
        How much cash do you have?
      </h2>

      {/* Input Card */}
      <Card className="my-9">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5c4033] text-[36px] font-semibold">
            $
          </span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0"
            autoFocus
            inputMode="decimal"
            className="w-full pl-16 pr-4 py-4 bg-transparent border-0 rounded-2xl focus:outline-none text-[#5c4033] text-[36px] font-semibold text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="0"
          />
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="flex gap-3 items-start p-4 bg-red-50 rounded-2xl">
          <span className="text-2xl shrink-0">⚠️</span>
          <p className="text-[#FF6B6B] font-medium">{error}</p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onClose}
          disabled={loading}
          className="flex-1 bg-[#E0E0E0] text-[#5C4033] font-bold py-3 px-6 rounded-2xl transition-all hover:bg-[#D0D0D0] active:scale-95 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={loading || !amount || parseFloat(amount) < 0}
          className="flex-1 bg-gradient-to-r from-[#0bd2ec] to-[#15acc0] text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </Modal>
  )
}
