'use client'

import type { Asset } from '@/lib/types/database.types'
import { deleteAsset } from '@/app/actions/assets'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CurrencyDisplay from '@/components/CurrencyDisplay'
import Modal from '@/components/Modal'
import EditAssetModal from '@/components/EditAssetModal'

interface AssetListProps {
  assets: Asset[]
}

export default function AssetList({ assets }: AssetListProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)

  function handleDeleteClick(asset: Asset) {
    setAssetToDelete(asset)
    setIsDeleteModalOpen(true)
  }

  async function confirmDelete() {
    if (!assetToDelete) return

    setDeletingId(assetToDelete.id)
    await deleteAsset(assetToDelete.id)
    setDeletingId(null)
    setIsDeleteModalOpen(false)
    setAssetToDelete(null)
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
                {asset.type === 'stock' ? '📈' : asset.type === 'cash' ? '💰' : '🏦'}
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
            <button
              onClick={() => setEditingAsset(asset)}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white hover:bg-gray-50 active:scale-95 transition-all"
            >
              <svg className="w-4 h-4 text-[#5C4033]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              onClick={() => handleDeleteClick(asset)}
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setAssetToDelete(null)
        }}
        loading={deletingId !== null}
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#FF6B6B] to-[#FF5252] rounded-full mb-4 shadow-lg">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-[#5C4033] mb-2">Delete Asset?</h2>
          <p className="text-[#8B7355]">
            Are you sure you want to delete {assetToDelete?.name}? This action cannot be undone.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setIsDeleteModalOpen(false)
              setAssetToDelete(null)
            }}
            disabled={deletingId !== null}
            className="flex-1 bg-[#E0E0E0] text-[#5C4033] font-bold py-3 px-6 rounded-2xl transition-all hover:bg-[#D0D0D0] active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            disabled={deletingId !== null}
            className="flex-1 bg-gradient-to-r from-[#FF6B6B] to-[#FF5252] text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50"
          >
            {deletingId !== null ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>

      {/* Edit Asset Modal */}
      <EditAssetModal
        asset={editingAsset}
        isOpen={!!editingAsset}
        onClose={() => setEditingAsset(null)}
        onSuccess={() => {
          setEditingAsset(null)
          router.refresh()
        }}
      />
    </div>
  )
}
