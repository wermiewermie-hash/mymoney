'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { acceptGift, type StockGift } from '@/app/actions/gifts'
import { ConfettiEffect } from './ConfettiEffect'
import Modal from './Modal'
import { useRouter } from 'next/navigation'

interface GiftNotificationProps {
  gift: StockGift
  isOpen: boolean
  onClose: () => void
}

export default function GiftNotification({ gift, isOpen, onClose }: GiftNotificationProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  // Trigger confetti when modal first opens
  useEffect(() => {
    if (isOpen && !showConfetti) {
      setShowConfetti(true)
    }
  }, [isOpen, showConfetti])

  async function handleAccept() {
    setLoading(true)

    const result = await acceptGift(gift.id)

    if (result.error) {
      console.error('Error accepting gift:', result.error)
      alert(result.error)
      setLoading(false)
      return
    }

    console.log('✅ Gift accepted successfully')
    setLoading(false)

    // Close modal first
    onClose()

    // Wait for modal to close and DB changes to propagate, then refresh
    setTimeout(() => {
      console.log('🔄 Calling router.refresh()')
      router.refresh()
    }, 500)
  }

  function handleClose() {
    if (!loading) {
      onClose()
    }
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} loading={loading}>
        <div className="text-center">
          {/* Gift Image */}
          <div className="flex justify-center pt-6 mb-4">
            <Image
              src="/gift.png"
              alt="Gift"
              width={200}
              height={200}
              className="w-[200px] h-auto"
            />
          </div>

          {/* Message */}
          <h2 className="text-[#5C4033] font-lora font-semibold mb-2" style={{ fontSize: '28px', lineHeight: '34px' }}>
            Congratulations!
          </h2>
          <p className="text-[#8B7355] font-normal pb-12" style={{ fontSize: '14px', lineHeight: '20px' }}>
            {gift.parent_name} sent you {gift.stock_amount} Google stock{gift.stock_amount > 1 ? 's' : ''}
          </p>

          {/* Accept Button */}
          <button
            onClick={handleAccept}
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#52C41A] to-[#389E0D] text-white font-bold text-lg py-4 rounded-[18px] shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Accepting...
              </span>
            ) : (
              'Accept Gift'
            )}
          </button>
        </div>
      </Modal>

      <ConfettiEffect trigger={showConfetti} />
    </>
  )
}
