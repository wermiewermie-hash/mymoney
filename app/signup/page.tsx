'use client'

import { signUp } from '@/app/actions/auth'
import Link from 'next/link'
import { useState } from 'react'

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await signUp(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
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

      {/* Signup Form Container */}
      <div className="px-[23px] -mt-[12px]">
        <div className="flex flex-col gap-[24px] items-center w-full">
          {/* Form Card */}
          <div className="kids-card w-full">
            <form action={handleSubmit} className="flex flex-col gap-[24px]">
              {/* Username Field */}
              <div className="flex flex-col gap-[8px] w-full">
                <label className="font-semibold text-[14px] leading-[18px] text-[#5c4033]">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  required
                  autoComplete="username"
                  className="bg-[rgba(255,149,0,0.1)] h-[64px] rounded-[18px] w-full px-4 font-semibold text-[16px] text-[#5c4033] outline-none focus:ring-2 focus:ring-[#ff9500] transition-all"
                  placeholder=""
                />
              </div>

              {/* Email Field */}
              <div className="flex flex-col gap-[8px] w-full">
                <label className="font-semibold text-[14px] leading-[18px] text-[#5c4033]">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  inputMode="email"
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
                  minLength={6}
                  autoComplete="new-password"
                  className="bg-[rgba(255,149,0,0.1)] h-[64px] rounded-[18px] w-full px-4 font-semibold text-[16px] text-[#5c4033] outline-none focus:ring-2 focus:ring-[#ff9500] transition-all"
                  placeholder=""
                />
              </div>

              {error && (
                <div className="bg-gradient-to-br from-white to-[#FFEBEE] border-2 border-[#FF6B6B]/20 rounded-2xl p-4">
                  <div className="flex gap-3 items-start">
                    <span className="text-2xl shrink-0">⚠️</span>
                    <p className="text-[#FF6B6B] font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Signup Button */}
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
                    Creating Account...
                  </span>
                ) : (
                  'Sign up'
                )}
              </button>
            </form>
          </div>

          {/* Sign In Link */}
          <p className="font-normal text-[14px] leading-[18px] text-[#5c4033] text-center w-full">
            <span>Already have an account? </span>
            <Link
              href="/login"
              className="font-semibold underline decoration-solid hover:opacity-80 active:scale-[0.98] inline-block transition-all"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
