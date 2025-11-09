'use client'

import { updateAsset, deleteAsset } from '@/app/actions/assets'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Asset } from '@/lib/types/database.types'
import Card from '@/components/Card'
import PageHeader, { HeaderButton } from '@/components/PageHeader'
import { pageStyles } from '@/lib/constants/pageStyles'
import { ArrowLeft, Trash2 } from 'lucide-react'

interface EditAssetFormProps {
  asset: Asset
}

export default function EditAssetForm({ asset }: EditAssetFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const router = useRouter()

  // Helper function to scroll input into view on focus
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 300)
  }

  // For stock reverse calculation
  const [shares, setShares] = useState(asset.shares || 0)
  const [monetaryValue, setMonetaryValue] = useState(0)
  const [monetaryValueInput, setMonetaryValueInput] = useState('')
  const currentPrice = asset.price_per_share || 0

  useEffect(() => {
    if (asset.type === 'stock' && asset.shares && asset.price_per_share) {
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
      // Round to nearest 0.1 shares
      const calculatedShares = value / currentPrice
      setShares(Math.round(calculatedShares * 10) / 10)
    } else if (value === 0) {
      setShares(0)
    }
  }

  async function handleSubmit(formData: FormData) {
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
      router.push('/dashboard')
    }
  }

  async function handleDelete() {
    await deleteAsset(asset.id)
    router.push('/dashboard/accounts')
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <PageHeader
          title="Edit Asset"
          buttonColor={pageStyles.dashboard.buttonColor}
          leftAction={
            <HeaderButton onClick={handleBack} color={pageStyles.dashboard.buttonColor}>
              <ArrowLeft className="h-5 w-5" />
            </HeaderButton>
          }
          rightAction={
            <HeaderButton onClick={() => setIsDeleteModalOpen(true)} color={pageStyles.dashboard.buttonColor}>
              <Trash2 className="h-5 w-5" />
            </HeaderButton>
          }
        />

        {/* Instruction Card */}
        <Card className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#00BCD4] to-[#0097A7] rounded-full mb-4 shadow-lg">
            <span className="text-4xl">✏️</span>
          </div>
          <h2 className="text-[#5C4033] mb-2">Update Your Asset</h2>
          <p className="text-[#8B7355]">Make changes below</p>
        </Card>
      </div>

      {/* Form */}
      <div className="px-6 space-y-4">
        <form action={handleSubmit} className="space-y-4">
          <Card className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-[#5C4033] mb-2"
              >
                Asset Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                defaultValue={asset.name}
                onFocus={handleInputFocus}
                className="w-full px-4 py-3 bg-[#E3F2FD] border-0 rounded-2xl focus:ring-2 focus:ring-[#FF9933] text-[#5C4033] placeholder-[#8B7355]"
                placeholder="e.g., Chase Savings, Apple Stock"
              />
            </div>

            <div>
              <label
                htmlFor="type"
                className="block text-sm font-semibold text-[#5C4033] mb-2"
              >
                Asset Type *
              </label>
              <select
                id="type"
                name="type"
                required
                defaultValue={asset.type}
                className="w-full px-4 py-3 bg-[#E3F2FD] border-0 rounded-2xl focus:ring-2 focus:ring-[#FF9933] text-[#5C4033]"
              >
                <option value="">Choose a type...</option>
                <option value="bank_account">💰 Bank Account</option>
                <option value="stocks">📈 Stocks</option>
                <option value="retirement_account">🏦 Retirement Account</option>
                <option value="index_funds">📊 Index Funds</option>
              </select>
            </div>

            {asset.type === 'stock' && asset.ticker ? (
              <>
                <div>
                  <label
                    htmlFor="shares"
                    className="block text-sm font-semibold text-[#5C4033] mb-2"
                  >
                    Number of Shares
                  </label>
                  <input
                    id="shares"
                    name="shares"
                    type="number"
                    step="0.00000001"
                    min="0"
                    inputMode="decimal"
                    value={shares}
                    onChange={(e) => handleSharesChange(parseFloat(e.target.value) || 0)}
                    onFocus={handleInputFocus}
                    className="w-full px-4 py-3 bg-[#E3F2FD] border-0 rounded-2xl focus:ring-2 focus:ring-[#FF9933] text-[#5C4033] placeholder-[#8B7355]"
                    placeholder="0"
                  />
                  <p className="mt-2 text-sm text-[#8B7355]">
                    Current number of {asset.ticker} shares you own
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="monetaryValue"
                    className="block text-sm font-semibold text-[#5C4033] mb-2"
                  >
                    Or Enter Total Value ($)
                  </label>
                  <input
                    id="monetaryValue"
                    name="monetaryValue"
                    type="text"
                    inputMode="numeric"
                    value={monetaryValueInput}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '')
                      handleMonetaryValueInputChange(value)
                    }}
                    onBlur={handleMonetaryValueBlur}
                    onFocus={handleInputFocus}
                    className="w-full px-4 py-3 bg-[#E3F2FD] border-0 rounded-2xl focus:ring-2 focus:ring-[#FF9933] text-[#5C4033] placeholder-[#8B7355]"
                    placeholder="0"
                  />
                  <p className="mt-2 text-sm text-[#8B7355]">
                    Current price: ${currentPrice.toFixed(2)} per share
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="changeDate"
                    className="block text-sm font-semibold text-[#5C4033] mb-2"
                  >
                    Change Date *
                  </label>
                  <input
                    id="changeDate"
                    name="changeDate"
                    type="date"
                    required
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-[#E3F2FD] border-0 rounded-2xl focus:ring-2 focus:ring-[#FF9933] text-[#5C4033] placeholder-[#8B7355]"
                  />
                  <p className="mt-2 text-sm text-[#8B7355]">
                    When did the number of shares change?
                  </p>
                </div>
              </>
            ) : (
              <div>
                <label
                  htmlFor="currentValue"
                  className="block text-sm font-semibold text-[#5C4033] mb-2"
                >
                  Current Value ($) *
                </label>
                <input
                  id="currentValue"
                  name="currentValue"
                  type="number"
                  step="1"
                  min="0"
                  required
                  inputMode="numeric"
                  defaultValue={Math.round(Number(asset.current_value))}
                  onFocus={handleInputFocus}
                  className="w-full px-4 py-3 bg-[#E3F2FD] border-0 rounded-2xl focus:ring-2 focus:ring-[#FF9933] text-[#5C4033] placeholder-[#8B7355]"
                  placeholder="0"
                />
                <p className="mt-2 text-sm text-[#8B7355]">
                  Update to the current value of this asset
                </p>
              </div>
            )}

            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-semibold text-[#5C4033] mb-2"
              >
                Notes (optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                defaultValue={asset.notes || ''}
                onFocus={handleInputFocus}
                className="w-full px-4 py-3 bg-[#E3F2FD] border-0 rounded-2xl focus:ring-2 focus:ring-[#FF9933] text-[#5C4033] placeholder-[#8B7355] resize-none"
                placeholder="Any additional information..."
              />
            </div>
          </Card>

          {error && (
            <div className="bg-gradient-to-br from-white to-[#FFEBEE] border-2 border-[#FF6B6B]/20 rounded-2xl p-4">
              <div className="flex gap-3 items-start">
                <span className="text-2xl shrink-0">⚠️</span>
                <p className="text-[#FF6B6B] font-medium">{error}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse md:flex-row gap-3 pt-2">
            <Link
              href="/dashboard"
              className="flex-1 bg-white/50 text-[#5C4033] font-bold py-4 px-6 rounded-2xl transition-all text-center text-base md:text-lg hover:bg-white/70 active:scale-95 border-2 border-[#5C4033]/10"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-[#00BCD4] to-[#0097A7] text-white font-bold py-4 px-6 rounded-2xl transition-all text-base md:text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl active:scale-95"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#FF6B6B] to-[#FF5252] rounded-full mb-4 shadow-lg">
                <span className="text-3xl">⚠️</span>
              </div>
              <h2 className="text-xl font-bold text-[#5C4033] mb-2">Delete Asset?</h2>
              <p className="text-[#8B7355]">
                Are you sure you want to delete {asset.name}? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 bg-[#E0E0E0] text-[#5C4033] font-bold py-3 px-6 rounded-2xl transition-all hover:bg-[#D0D0D0] active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-gradient-to-r from-[#FF6B6B] to-[#FF5252] text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
