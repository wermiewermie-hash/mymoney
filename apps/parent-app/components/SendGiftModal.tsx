'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Gift } from 'lucide-react'
import { sendGift } from '@/app/actions/gifts'

interface SendGiftModalProps {
  isOpen: boolean
  onClose: () => void
  username: string
}

export default function SendGiftModal({ isOpen, onClose, username }: SendGiftModalProps) {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recipientEmail, setRecipientEmail] = useState('')
  const [stockAmount, setStockAmount] = useState('')

  async function handleSendGift() {
    // Validation
    if (!recipientEmail) {
      setError('Please enter recipient email')
      return
    }

    const amount = parseInt(stockAmount)
    if (!stockAmount || isNaN(amount) || amount <= 0) {
      setError('Please enter a valid stock amount')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await sendGift(recipientEmail, amount, username)

      if (result.error) {
        setError(result.error)
      } else {
        setSent(true)
        setTimeout(() => {
          onClose()
          setSent(false)
          setRecipientEmail('')
          setStockAmount('')
        }, 2500)
      }
    } catch (err) {
      setError('Failed to send gift. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    if (!loading) {
      onClose()
      // Reset state after animation
      setTimeout(() => {
        setSent(false)
        setError(null)
        setRecipientEmail('')
        setStockAmount('')
      }, 300)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4"
          >
            {sent ? (
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#FF4E8D] to-[#FF9966] rounded-full mb-4 shadow-lg">
                  <Gift className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#5C4033] mb-2">Gift Sent!</h2>
                <p className="text-[#8B7355]">
                  Your gift has been sent to {recipientEmail}
                </p>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#FF4E8D] to-[#FF9966] rounded-full mb-4 shadow-lg">
                    <Gift className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-[#5C4033] mb-2">Send Gift</h2>
                  <p className="text-[#8B7355] text-sm mb-4">
                    Send Google stock to a kid's account
                  </p>
                </div>

                {error && (
                  <div className="bg-gradient-to-br from-white to-[#FFEBEE] border-2 border-[#FF6B6B]/20 rounded-2xl p-4">
                    <p className="text-[#FF6B6B] font-medium text-sm">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-[#5C4033] font-medium text-sm mb-2">
                      Recipient Email
                    </label>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="child@example.com"
                      className="w-full h-[56px] px-4 rounded-[18px] border-2 border-[#5C4033]/20 text-[#5C4033] placeholder:text-[#8B7355]/50 focus:outline-none focus:border-[#FF9966]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#5C4033] font-medium text-sm mb-2">
                      Number of Stocks
                    </label>
                    <input
                      type="number"
                      value={stockAmount}
                      onChange={(e) => setStockAmount(e.target.value)}
                      placeholder="1"
                      min="1"
                      className="w-full h-[56px] px-4 rounded-[18px] border-2 border-[#5C4033]/20 text-[#5C4033] placeholder:text-[#8B7355]/50 focus:outline-none focus:border-[#FF9966]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <button
                    onClick={handleSendGift}
                    disabled={loading}
                    className="bg-gradient-to-b from-[#FF4E8D] to-[#FF9966] h-[56px] rounded-[18px] shadow-[0px_2px_3px_3px_rgba(0,0,0,0.1)] w-full text-white font-semibold text-[16px] flex items-center justify-center hover:scale-[1.005] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      'Send Gift'
                    )}
                  </button>

                  <button
                    onClick={handleClose}
                    disabled={loading}
                    className="bg-white border-2 border-[#5C4033]/20 h-[56px] rounded-[18px] w-full text-[#5C4033] font-semibold text-[16px] flex items-center justify-center hover:scale-[1.005] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
