'use client'

import { signIn } from '@/app/actions/auth'
import Link from 'next/link'
import { useState } from 'react'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await signIn(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  async function handlePasswordReset() {
    if (!email) {
      setError('Please enter your email address first')
      return
    }

    setResetLoading(true)
    setError(null)

    const { resetPassword } = await import('@/app/actions/auth')
    const result = await resetPassword(email)

    setResetLoading(false)

    if (result?.error) {
      setError(result.error)
    } else {
      setResetSent(true)
      setTimeout(() => setResetSent(false), 5000)
    }
  }

  return (
    <div className="bg-gradient-to-b from-[#ff4e8d] via-[#ff9966] via-50% to-[#ffd93d] min-h-screen relative">
      {/* Header with Title and Illustration */}
      <div className="flex flex-col gap-[36px] items-center px-[40px] pt-[77px] pb-[38px]">
        <p className="font-lora font-semibold text-center text-white w-full" style={{ fontSize: '36px', lineHeight: '42px' }}>
          My Money
        </p>
        <div className="w-[300px] flex items-center justify-center">
          <img
            alt="Welcome illustration"
            className="w-[300px] h-auto"
            src="/welcome.png"
          />
        </div>
      </div>

      {/* Login Form Container */}
      <div className="px-[23px] -mt-[12px]">
        <div className="flex flex-col gap-[24px] items-center w-full">
          {/* Form Card */}
          <div className="kids-card w-full">
            <form action={handleSubmit} className="flex flex-col gap-[24px]">
              {/* Email Field */}
              <div className="flex flex-col gap-[8px] w-full">
                <label className="font-semibold text-[14px] leading-[18px] text-[#5c4033]">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[rgba(255,149,0,0.1)] h-[64px] rounded-[18px] w-full px-4 font-semibold text-[16px] text-[#5c4033] outline-none focus:ring-2 focus:ring-[#ff9500] transition-all"
                  placeholder=""
                />
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-[8px] w-full">
                <label className="font-semibold text-[14px] leading-[18px] text-[#5c4033]">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[rgba(255,149,0,0.1)] h-[64px] rounded-[18px] w-full px-4 font-semibold text-[16px] text-[#5c4033] outline-none focus:ring-2 focus:ring-[#ff9500] transition-all"
                  placeholder=""
                />
              </div>

              {resetSent && (
                <div className="bg-gradient-to-br from-white to-[#E8F5E9] border-2 border-[#52C41A]/20 rounded-2xl p-4">
                  <div className="flex gap-3 items-start">
                    <span className="text-2xl shrink-0">✅</span>
                    <p className="text-[#52C41A] font-medium">Password reset email sent! Check your inbox.</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-gradient-to-br from-white to-[#FFEBEE] border-2 border-[#FF6B6B]/20 rounded-2xl p-4">
                  <div className="flex gap-3 items-start">
                    <span className="text-2xl shrink-0">⚠️</span>
                    <div className="flex-1">
                      <p className="text-[#FF6B6B] font-medium">{error}</p>
                      <button
                        type="button"
                        onClick={handlePasswordReset}
                        disabled={resetLoading}
                        className="text-[#5C4033] font-semibold text-sm mt-2 underline hover:opacity-80 disabled:opacity-50 transition-opacity"
                      >
                        {resetLoading ? 'Sending...' : 'Forgot your password? Reset it through email.'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Login Button */}
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
                    Logging In...
                  </span>
                ) : (
                  'Log in'
                )}
              </button>
            </form>
          </div>

          {/* Sign Up Link */}
          <p className="font-normal text-[14px] leading-[18px] text-[#5c4033] text-center w-full">
            <span>Don't have an account? </span>
            <Link
              href="/signup"
              className="font-semibold underline decoration-solid hover:opacity-80 active:scale-[0.98] inline-block transition-all"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
