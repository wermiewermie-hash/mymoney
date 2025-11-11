'use client'

import { updatePassword } from '@/app/actions/auth'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Modal from '@/components/Modal'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)

  useEffect(() => {
    // Verify the user has an active session from the password recovery flow
    const verifySession = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error || !session) {
          setError('Invalid or expired reset link. Please request a new password reset.')
        }
      } catch (err) {
        setError('Invalid or expired reset link. Please request a new password reset.')
      } finally {
        setIsVerifying(false)
      }
    }

    verifySession()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Validate passwords match
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError(null)
    setValidationError(null)

    const result = await updatePassword(password)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      // Success - show success message and redirect
      setLoading(false)
      setShowSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    }
  }

  return (
    <div className="bg-gradient-to-b from-[#ff4e8d] via-[#ff9966] via-50% to-[#ffd93d] min-h-screen relative">
      {/* Header with Title and Illustration */}
      <div className="flex flex-col gap-[36px] items-center px-[40px] pt-[77px] pb-[38px]">
        <p className="font-lora font-semibold text-center text-white w-full" style={{ fontSize: '36px', lineHeight: '42px' }}>
          Reset Your Password
        </p>
        <div className="w-[300px] flex items-center justify-center">
          <img
            alt="Reset password illustration"
            className="w-[300px] h-auto"
            src="/welcome.png"
          />
        </div>
      </div>

      {/* Reset Password Form Container */}
      <div className="px-[23px] -mt-[12px]">
        <div className="flex flex-col gap-[24px] items-center w-full">
          {/* Form Card */}
          <div className="kids-card w-full">
            {isVerifying ? (
              <div className="flex items-center justify-center py-12">
                <svg className="animate-spin h-8 w-8 text-[#5c4033]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : error ? (
              <div className="bg-gradient-to-br from-white to-[#FFEBEE] border-2 border-[#FF6B6B]/20 rounded-2xl p-4">
                <div className="flex gap-3 items-start">
                  <span className="text-2xl shrink-0">⚠️</span>
                  <p className="text-[#FF6B6B] font-medium">{error}</p>
                </div>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-[24px]">
              {/* New Password Field */}
              <div className="flex flex-col gap-[8px] w-full">
                <label className="font-semibold text-[14px] leading-[18px] text-[#5c4033]">
                  New Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[rgba(255,149,0,0.1)] h-[64px] rounded-[18px] w-full px-4 font-semibold text-[16px] text-[#5c4033] outline-none focus:ring-2 focus:ring-[#ff9500] transition-all"
                  placeholder=""
                />
              </div>

              {/* Confirm Password Field */}
              <div className="flex flex-col gap-[8px] w-full">
                <label className="font-semibold text-[14px] leading-[18px] text-[#5c4033]">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-[rgba(255,149,0,0.1)] h-[64px] rounded-[18px] w-full px-4 font-semibold text-[16px] text-[#5c4033] outline-none focus:ring-2 focus:ring-[#ff9500] transition-all"
                  placeholder=""
                />
              </div>

              {(error || validationError) && (
                <div className="bg-gradient-to-br from-white to-[#FFEBEE] border-2 border-[#FF6B6B]/20 rounded-2xl p-4">
                  <div className="flex gap-3 items-start">
                    <span className="text-2xl shrink-0">⚠️</span>
                    <p className="text-[#FF6B6B] font-medium">{error || validationError}</p>
                  </div>
                </div>
              )}

              {/* Reset Password Button */}
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-b from-[#ffc107] to-[#ffa000] h-[64px] rounded-[18px] shadow-[0px_2px_3px_3px_rgba(0,0,0,0.1)] w-full text-white font-semibold text-[18px] leading-[28px] flex items-center justify-center hover:scale-[1.005] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating Password...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
            )}
          </div>

          {!isVerifying && !error && (
          <p className="font-normal text-[14px] leading-[18px] text-[#5c4033] text-center w-full">
            Choose a strong password that you haven't used before.
          </p>
          )}
        </div>
      </div>

      {/* Success Modal */}
      <Modal isOpen={showSuccess} onClose={() => {}} loading={false}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#52C41A] to-[#389E0D] rounded-full mb-4 shadow-lg">
            <span className="text-3xl">✓</span>
          </div>
          <h2 className="text-xl font-bold text-[#5C4033] mb-2">Password Reset Successfully!</h2>
          <p className="text-[#8B7355] mb-6">
            Redirecting you to your dashboard...
          </p>
        </div>
      </Modal>
    </div>
  )
}
