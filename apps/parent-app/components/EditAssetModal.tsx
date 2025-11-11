'use client'

import { updateAsset, deleteAsset } from '@/app/actions/assets'
import { useState, useEffect } from 'react'
import type { Asset } from '@/lib/types/database.types'
import Modal from '@/components/Modal'
import { Trash2 } from 'lucide-react'

interface EditAssetModalProps {
  asset: Asset | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function EditAssetModal({ asset, isOpen, onClose, onSuccess }: EditAssetModalProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // For stock reverse calculation
  const [shares, setShares] = useState(0)
  const [monetaryValue, setMonetaryValue] = useState(0)
  const [monetaryValueInput, setMonetaryValueInput] = useState('')
  const currentPrice = asset?.price_per_share || 0

  useEffect(() => {
    if (asset?.type === 'stock' && asset.shares && asset.price_per_share) {
      setShares(asset.shares)
      const value = asset.shares * asset.price_per_share
      setMonetaryValue(value)
      setMonetaryValueInput(Math.round(value).toString())
    }
  }, [asset])

  const handleSharesChange = (value: number) => {
    setShares(value)
    if (currentPrice > 0) {
      const newValue = value * currentPrice
      setMonetaryValue(newValue)
      setMonetaryValueInput(Math.round(newValue).toString())
    }
  }

  const handleMonetaryValueInputChange = (inputValue: string) => {
    setMonetaryValueInput(inputValue)
  }

  const handleMonetaryValueBlur = () => {
    const value = parseFloat(monetaryValueInput) || 0
    setMonetaryValue(value)
    if (currentPrice > 0 && value > 0) {
      const calculatedShares = value / currentPrice
      setShares(Math.round(calculatedShares * 10) / 10)
    } else if (value === 0) {
      setShares(0)
    }
  }

  async function handleSubmit(formData: FormData) {
    if (!asset) return

    setLoading(true)
    setError(null)

    // For stocks, set the calculated shares value
    if (asset.type === 'stock') {
      formData.set('shares', shares.toString())
    }

    const result = await updateAsset(asset.id, formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setLoading(false)
      onSuccess()
      onClose()
    }
  }

  async function handleDelete() {
    if (!asset) return
    await deleteAsset(asset.id)
    setIsDeleteModalOpen(false)
    onSuccess()
    onClose()
  }

  if (!asset) return null

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} loading={loading}>
        {/* Header with trash icon */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#5C4033]">Edit Asset</h2>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FF6B6B]/10 hover:bg-[#FF6B6B]/20 active:scale-95 transition-all"
          >
            <Trash2 className="w-5 h-5 text-[#FF6B6B]" />
          </button>
        </div>

        <form action={handleSubmit} className="space-y-4">
          {/* Asset Name */}
          <div>
            <label className="block text-sm font-semibold text-[#5C4033] mb-2">
              Asset Name *
            </label>
            <input
              name="name"
              type="text"
              required
              defaultValue={asset.name}
              className="w-full px-4 py-3 bg-[#E3F2FD] border-0 rounded-2xl focus:ring-2 focus:ring-[#FF9933] text-[#5C4033] placeholder-[#8B7355]"
              placeholder="e.g., Chase Savings"
            />
          </div>

          {/* Conditional fields based on asset type */}
          {asset.type === 'stock' && (
            <>
              {/* Shares */}
              <div>
                <label className="block text-sm font-semibold text-[#5C4033] mb-2">
                  Shares
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={shares}
                  onChange={(e) => handleSharesChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-[#E3F2FD] border-0 rounded-2xl focus:ring-2 focus:ring-[#FF9933] text-[#5C4033]"
                />
              </div>

              {/* Monetary Value */}
              <div>
                <label className="block text-sm font-semibold text-[#5C4033] mb-2">
                  Value ($)
                </label>
                <input
                  type="number"
                  value={monetaryValueInput}
                  onChange={(e) => handleMonetaryValueInputChange(e.target.value)}
                  onBlur={handleMonetaryValueBlur}
                  className="w-full px-4 py-3 bg-[#E3F2FD] border-0 rounded-2xl focus:ring-2 focus:ring-[#FF9933] text-[#5C4033]"
                />
              </div>
            </>
          )}

          {asset.type === 'cash' && (
            <div>
              <label className="block text-sm font-semibold text-[#5C4033] mb-2">
                Amount ($) *
              </label>
              <input
                name="current_value"
                type="number"
                step="0.01"
                required
                defaultValue={asset.current_value}
                className="w-full px-4 py-3 bg-[#E3F2FD] border-0 rounded-2xl focus:ring-2 focus:ring-[#FF9933] text-[#5C4033]"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-[#5C4033] mb-2">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              rows={3}
              defaultValue={asset.notes || ''}
              className="w-full px-4 py-3 bg-[#E3F2FD] border-0 rounded-2xl focus:ring-2 focus:ring-[#FF9933] text-[#5C4033] placeholder-[#8B7355] resize-none"
              placeholder="Add any additional details..."
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-gradient-to-br from-white to-[#FFEBEE] border-2 border-[#FF6B6B]/20 rounded-2xl p-4">
              <p className="text-[#FF6B6B] font-medium text-sm">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-[#E0E0E0] text-[#5C4033] font-bold py-3 px-6 rounded-2xl transition-all hover:bg-[#D0D0D0] active:scale-95 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-[#00BCD4] to-[#0097A7] text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#FF6B6B] mb-4">Delete {asset.name}?</h2>
          <p className="text-[#5C4033] text-[14px] mb-6">
            This will be permanent and can't be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 bg-[#E0E0E0] text-[#5C4033] font-bold py-3 px-6 rounded-2xl transition-all hover:bg-[#D0D0D0] active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 bg-[#FF6B6B] text-white font-bold py-3 px-6 rounded-2xl transition-all hover:bg-[#FF5252] active:scale-95"
            >
              Yes, delete
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
