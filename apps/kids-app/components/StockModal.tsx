'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { upsertGoogleStock } from '@/app/actions/kidsAssets'
import { getStockPrice } from '@/app/actions/stocks'
import { useCurrency } from '@/lib/context/CurrencyContext'
import Card from '@/components/Card'
import Modal from '@/components/Modal'

interface StockModalProps {
  isOpen: boolean
  onClose: () => void
  existingShares?: number
  onSuccess?: () => void
}

export default function StockModal({ isOpen, onClose, existingShares = 0, onSuccess }: StockModalProps) {
  const router = useRouter()
  const { formatCurrency } = useCurrency()
  const [shares, setShares] = useState(existingShares)
  const [pricePerShare, setPricePerShare] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [fetchingPrice, setFetchingPrice] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch Google stock price on mount
  useEffect(() => {
    async function fetchGooglePrice() {
      try {
        setFetchingPrice(true)
        const result = await getStockPrice('GOOGL')
        if (result) {
          setPricePerShare(result.price)
        } else {
          setError('Could not fetch Google stock price')
        }
      } catch (err) {
        setError('Error fetching stock price')
      } finally {
        setFetchingPrice(false)
      }
    }

    if (isOpen) {
      fetchGooglePrice()
      setShares(existingShares)
    }
  }, [isOpen, existingShares])

  const totalValue = shares * pricePerShare

  const handleIncrement = () => {
    setShares(shares + 1)
  }

  const handleDecrement = () => {
    if (shares > 0) {
      setShares(shares - 1)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setError(null)

    if (shares <= 0) {
      setError('Please enter at least 1 share')
      setLoading(false)
      return
    }

    const result = await upsertGoogleStock(shares)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      console.log('✅ Stock save successful!')
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
        How many Google stock do you have?
      </h2>

      {/* Stepper Card */}
      <Card className="my-9">
        <div className="flex items-center justify-between">
          <button
            onClick={handleDecrement}
            disabled={shares === 0}
            className={`w-16 h-16 rounded-[16px] flex items-center justify-center shadow-md transition-all ${
              shares > 0
                ? 'bg-gradient-to-b from-[#ffa93d] to-[#ffd740] hover:scale-105 active:scale-95'
                : 'bg-[rgba(255,169,61,0.1)]'
            }`}
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 28 28">
              <path
                d="M5.83199 13.9968H22.1616"
                stroke={shares > 0 ? 'white' : '#D4C4B0'}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3.5"
              />
            </svg>
          </button>

          <div className="text-center">
            <p className="font-lora text-[#5c4033] font-semibold leading-none" style={{ fontSize: '36px' }}>
              {shares}
            </p>
          </div>

          <button
            onClick={handleIncrement}
            disabled={fetchingPrice || !pricePerShare}
            className="w-16 h-16 bg-gradient-to-b from-[#52c41a] to-[#389e0d] rounded-[16px] flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 28 28">
              <path
                d="M5.83199 13.9968H22.1616"
                stroke="white"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3.5"
              />
              <path
                d="M13.9968 5.83199V22.1616"
                stroke="white"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3.5"
              />
            </svg>
          </button>
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
          disabled={loading || fetchingPrice || !pricePerShare || shares === 0}
          className="flex-1 bg-gradient-to-r from-[#52C41A] to-[#389E0D] text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </Modal>
  )
}
