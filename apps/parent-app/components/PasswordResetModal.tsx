'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface PasswordResetModalProps {
  isOpen: boolean
  onClose: () => void
  email: string
}

export default function PasswordResetModal({ isOpen, onClose, email }: PasswordResetModalProps) {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSendResetLink() {
    if (!email) {
      setError('Please enter your email address first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Use parent app's password reset endpoint (unified flow)
      const response = await fetch('https://mymoney-agxx.vercel.app/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setSent(true)
        setTimeout(() => {
          onClose()
          setSent(false)
        }, 3000)
      }
    } catch (err) {
      setError('Failed to send reset link. Please try again.')
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
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#52C41A] to-[#389E0D] rounded-full mb-4 shadow-lg">
                  <span className="text-3xl">✓</span>
                </div>
                <h2 className="text-xl font-bold text-[#5C4033] mb-2">Reset Link Sent!</h2>
                <p className="text-[#8B7355]">
                  Check your email for the password reset link.
                </p>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#FF6B6B] to-[#EE5A52] rounded-full mb-4 shadow-lg">
                    <span className="text-3xl">⚠️</span>
                  </div>
                  <h2 className="text-xl font-bold text-[#5C4033] mb-2">Login Failed</h2>
                  <p className="text-[#8B7355] mb-4">
                    Your email and password don't match. You can reset your password via email or try again.
                  </p>
                </div>

                {error && (
                  <div className="bg-gradient-to-br from-white to-[#FFEBEE] border-2 border-[#FF6B6B]/20 rounded-2xl p-4">
                    <p className="text-[#FF6B6B] font-medium text-sm">{error}</p>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleSendResetLink}
                    disabled={loading}
                    className="bg-gradient-to-b from-[#ffc107] to-[#ffa000] h-[56px] rounded-[18px] shadow-[0px_2px_3px_3px_rgba(0,0,0,0.1)] w-full text-white font-semibold text-[16px] flex items-center justify-center hover:scale-[1.005] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
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
                      'Send Reset Link'
                    )}
                  </button>

                  <button
                    onClick={handleClose}
                    disabled={loading}
                    className="bg-white border-2 border-[#5C4033]/20 h-[56px] rounded-[18px] w-full text-[#5C4033] font-semibold text-[16px] flex items-center justify-center hover:scale-[1.005] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Try Again
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
