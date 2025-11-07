'use client'

import { signIn } from '@/app/actions/auth'
import Link from 'next/link'
import { useState } from 'react'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await signIn(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-6 py-8">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#FFA93D] to-[#FFD740] hover:opacity-90 text-white shadow-md transition-opacity"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
      </div>

      {/* Form container */}
      <div className="flex-1 px-6 pb-8 md:flex md:items-center md:justify-center">
        <div className="w-full max-w-md">
          <div className="kids-card text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-[#FFC107] to-[#FF9933] rounded-full mb-6 shadow-lg">
              <span className="text-5xl">👋</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#5C4033] mb-3">
              Welcome Back!
            </h1>
            <p className="text-[#8B7355] text-lg">
              Log in to see your money grow
            </p>
          </div>

          <div className="kids-card">
            <form action={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-semibold text-[#5C4033] mb-2"
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  className="w-full px-4 py-4 bg-[#E3F2FD] border-0 rounded-2xl focus:ring-2 focus:ring-[#FF9933] text-lg text-[#5C4033] placeholder-[#8B7355]"
                  placeholder="Your username"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-[#5C4033] mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-4 bg-[#E3F2FD] border-0 rounded-2xl focus:ring-2 focus:ring-[#FF9933] text-lg text-[#5C4033] placeholder-[#8B7355]"
                  placeholder="Your password"
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

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#FFC107] to-[#FF9933] text-white font-bold py-5 px-6 rounded-2xl transition-all text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl active:scale-95"
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
                    'Log In'
                  )}
                </button>
              </div>
            </form>
          </div>

          <p className="mt-8 text-center text-white text-lg">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="font-bold underline hover:text-white/90 active:scale-95 inline-block transition-all"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
