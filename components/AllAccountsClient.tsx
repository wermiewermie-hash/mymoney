'use client'

import Link from 'next/link'
import { useCurrency } from '@/lib/context/CurrencyContext'
import type { Asset } from '@/lib/types/database.types'
import type { AssetHistory } from '@/lib/types/database.types'
import { useState } from 'react'
import { deleteAsset } from '@/app/actions/assets'
import { useRouter } from 'next/navigation'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts'

interface AssetWithHistory extends Asset {
  history?: AssetHistory[]
}

interface AllAccountsClientProps {
  assets: AssetWithHistory[]
}

const assetTypeEmojis: Record<string, string> = {
  bank_account: '💰',
  stocks: '📈',
  retirement_account: '🏦',
  index_funds: '📊',
}

const assetTypeLabels: Record<string, string> = {
  bank_account: 'Bank Account',
  stocks: 'Stocks',
  retirement_account: 'Retirement Account',
  index_funds: 'Index Funds',
}

export default function AllAccountsClient({ assets }: AllAccountsClientProps) {
  const { formatCurrency } = useCurrency()
  const router = useRouter()
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const handleBack = () => {
    router.back()
  }

  // Sort assets: Stocks first, then Bank/Cash, then Retirement/Index (debts would go last)
  const sortedAssets = [...assets].sort((a, b) => {
    const order = { stocks: 1, bank_account: 2, retirement_account: 3, index_funds: 3 }
    return (order[a.type as keyof typeof order] || 4) - (order[b.type as keyof typeof order] || 4)
  })

  // Process history data for charting
  const processAssetHistory = (asset: AssetWithHistory) => {
    if (!asset.history || asset.history.length === 0) {
      return []
    }

    const currentPrice = asset.price_per_share || 1

    return asset.history.map((h) => ({
      date: new Date(h.change_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: asset.type === 'stocks' ? h.shares * currentPrice : (h.value || 0),
    }))
  }

  const handleDelete = async () => {
    if (selectedAsset) {
      await deleteAsset(selectedAsset.id)
      setIsDeleteModalOpen(false)
      setSelectedAsset(null)
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="px-6 pt-8 pb-0">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#FFA93D] to-[#FFD740] hover:opacity-90 text-white shadow-md transition-opacity"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-white text-2xl [text-shadow:rgba(0,0,0,0.1)_0px_4px_6px]">Your Money</h1>
          <Link
            href="/dashboard/add-asset"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#FFA93D] to-[#FFD740] hover:opacity-90 text-white shadow-md transition-opacity"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Assets List */}
      <div className="px-6 space-y-4">
        {sortedAssets.length === 0 ? (
          <div className="kids-card text-center">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-xl font-bold text-[#5C4033] mb-2">No Accounts Yet</h3>
            <p className="text-[#8B7355] mb-6">
              Start tracking your money by adding your first account
            </p>
            <Link
              href="/dashboard/add-asset"
              className="inline-block bg-gradient-to-r from-[#52C41A] to-[#389E0D] text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              Add Account
            </Link>
          </div>
        ) : (
          sortedAssets.map((asset) => (
            <div key={asset.id} className="kids-card">
              {/* Asset Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#FFF3E0] to-[#FFE4C4] rounded-2xl flex items-center justify-center shrink-0">
                  <span className="text-2xl">{assetTypeEmojis[asset.type] || '💵'}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-[#5C4033]">{asset.name}</h3>
                  <p className="text-sm text-[#8B7355]">{assetTypeLabels[asset.type] || asset.type}</p>
                </div>
              </div>

              {/* Asset value chart */}
              <div className="mb-4 h-48 rounded-2xl overflow-hidden outline-none [&_*]:outline-none">
                {processAssetHistory(asset).length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={processAssetHistory(asset)}>
                      <defs>
                        <linearGradient id={`colorValue-${asset.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FFA93D" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#FFA93D" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#8B7355', fontSize: 12 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#8B7355', fontSize: 12 }}
                        width={40}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#FFA93D"
                        strokeWidth={3}
                        fill={`url(#colorValue-${asset.id})`}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full bg-gradient-to-br from-[#F5F0FF] to-[#EDE7F6] rounded-2xl flex items-center justify-center">
                    <div className="text-[#8B7355] text-sm">No history yet</div>
                  </div>
                )}
              </div>

              {/* Current Amount */}
              <div className="mb-4">
                <p className="text-sm text-[#8B7355] mb-1">Current Value</p>
                <div className="text-3xl text-[#5C4033]">
                  {asset.type === 'debt' ? `-${formatCurrency(asset.current_value)}` : formatCurrency(asset.current_value)}
                </div>
              </div>

              {/* Update Button */}
              <Link
                href={`/dashboard/edit-asset/${asset.id}`}
                className="w-full bg-gradient-to-r from-[#00BCD4] to-[#0097A7] text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95 block text-center"
              >
                Update
              </Link>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#FF6B6B] to-[#FF5252] rounded-full mb-4 shadow-lg">
                <span className="text-3xl">⚠️</span>
              </div>
              <h2 className="text-xl font-bold text-[#5C4033] mb-2">Delete Asset?</h2>
              <p className="text-[#8B7355]">
                Are you sure you want to delete {selectedAsset?.name}? This action cannot be undone.
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
