'use client'

import type { Asset } from '@/lib/types/database.types'
import Link from 'next/link'
import { deleteAsset } from '@/app/actions/assets'
import { useState } from 'react'
import CurrencyDisplay from '@/components/CurrencyDisplay'

interface AssetListProps {
  assets: Asset[]
}

export default function AssetList({ assets }: AssetListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this asset?')) {
      return
    }

    setDeletingId(id)
    await deleteAsset(id)
    setDeletingId(null)
  }

  return (
    <div className="space-y-3">
      {assets.map((asset) => (
        <div
          key={asset.id}
          className="flex items-center justify-between p-3 bg-[#F0F9FF] rounded-2xl"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
              <span className="text-lg">
                {asset.type === 'stocks' ? '📈' : asset.type === 'bank_account' ? '💰' : '🏦'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#5C4033] font-medium truncate">{asset.name}</p>
              {asset.notes && (
                <p className="text-sm text-[#8B7355] truncate">{asset.notes}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right">
              <p className="text-[#5C4033] font-medium">
                <CurrencyDisplay amount={Number(asset.current_value)} />
              </p>
            </div>
            <Link
              href={`/dashboard/edit-asset/${asset.id}`}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white hover:bg-gray-50 active:scale-95 transition-all"
            >
              <svg className="w-4 h-4 text-[#5C4033]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </Link>
            <button
              onClick={() => handleDelete(asset.id)}
              disabled={deletingId === asset.id}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white hover:bg-red-50 active:scale-95 transition-all disabled:opacity-50"
            >
              <svg className="w-4 h-4 text-[#FF6B6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
