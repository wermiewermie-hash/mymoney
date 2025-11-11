'use client'

import { signIn } from '@/app/actions/auth'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import PasswordResetModal from '../../components/PasswordResetModal'
import Modal from '@/components/Modal'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [showResetModal, setShowResetModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showBrowserWarning, setShowBrowserWarning] = useState(false)
  const [isEmbeddedBrowser, setIsEmbeddedBrowser] = useState(false)

  // Detect if user is in an embedded browser
  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera
    const isEmbedded =
      // Instagram
      ua.includes('Instagram') ||
      // Facebook
      ua.includes('FBAN') || ua.includes('FBAV') ||
      // Line (multiple patterns)
      ua.includes('Line') || ua.includes('LINE') || /Line\/[\d.]+/.test(ua) ||
      // Twitter
      ua.includes('Twitter') ||
      // TikTok
      ua.includes('BytedanceWebview') ||
      // WeChat
      ua.includes('MicroMessenger') ||
      // LinkedIn
      ua.includes('LinkedInApp') ||
      // Snapchat
      ua.includes('Snapchat')

    setIsEmbeddedBrowser(isEmbedded)
  }, [])

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const result = await signIn(formData)
    if (result?.error) {
      setShowResetModal(true)
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    // Check if in embedded browser
    if (isEmbeddedBrowser) {
      setShowBrowserWarning(true)
      return
    }

    setGoogleLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    })
    if (error) {
      console.error('Google sign-in error:', error)
      setGoogleLoading(false)
    }
  }

  function copyUrl() {
    navigator.clipboard.writeText(window.location.href)
  }

  return (
    <div className="bg-gradient-to-b from-[#ff4e8d] via-[#ff9966] via-50% to-[#ffd93d] min-h-screen relative">
      {/* Header with Title and Illustration */}
      <div className="flex flex-col gap-[36px] items-center px-[40px] pt-[141px] pb-[38px]">
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
      <div className="px-[23px] mt-[70px]">
        <div className="flex flex-col gap-[36px] items-center w-full">
          {/* Email/Password Form - Temporary for local testing */}
          <div className="w-full bg-white rounded-[24px] p-6 shadow-lg">
            <form action={handleSubmit} className="flex flex-col gap-[16px]">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[rgba(255,149,0,0.1)] h-[48px] rounded-[12px] w-full px-4 font-semibold text-[14px] text-[#5c4033] outline-none"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[rgba(255,149,0,0.1)] h-[48px] rounded-[12px] w-full px-4 font-semibold text-[14px] text-[#5c4033] outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-b from-[#ffc107] to-[#ffa000] h-[48px] rounded-[12px] text-white font-semibold"
              >
                {loading ? 'Logging in...' : 'Quick Login'}
              </button>
            </form>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 w-full">
            <div className="flex-1 h-[2px] bg-[#5c4033]/20"></div>
            <span className="font-semibold text-[12px] text-[#5c4033]/60">OR</span>
            <div className="flex-1 h-[2px] bg-[#5c4033]/20"></div>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
            className="bg-white h-[64px] rounded-[18px] shadow-[0px_2px_3px_3px_rgba(0,0,0,0.1)] w-full text-[#5c4033] font-semibold text-[18px] leading-[28px] flex items-center justify-center gap-3 hover:scale-[1.005] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed border-2 border-[#5c4033]/10"
          >
              {googleLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.8055 10.2292C19.8055 9.55197 19.7498 8.86725 19.6305 8.19775H10.2002V12.0492H15.6014C15.3773 13.2911 14.6571 14.3898 13.6025 15.088V17.5866H16.825C18.7171 15.8449 19.8055 13.2728 19.8055 10.2292Z" fill="#4285F4"/>
                    <path d="M10.2002 20.0006C12.952 20.0006 15.2564 19.1151 16.8285 17.5865L13.606 15.088C12.7096 15.698 11.5521 16.0433 10.2037 16.0433C7.54356 16.0433 5.30106 14.2834 4.51544 11.9097H1.18359V14.4765C2.79106 17.6757 6.32106 20.0006 10.2002 20.0006Z" fill="#34A853"/>
                    <path d="M4.51196 11.9097C4.08821 10.6678 4.08821 9.33586 4.51196 8.09394V5.52722H1.18363C-0.396558 8.66809 -0.396558 12.3356 1.18363 15.4765L4.51196 11.9097Z" fill="#FBBC04"/>
                    <path d="M10.2002 3.95805C11.6241 3.936 13.0016 4.47247 14.0373 5.4547L16.8911 2.60084C15.1701 0.990339 12.7289 0.0808396 10.2002 0.105506C6.32106 0.105506 2.79106 2.43038 1.18359 5.52717L4.51192 8.09389C5.29401 5.71672 7.54004 3.95805 10.2002 3.95805Z" fill="#EA4335"/>
                  </svg>
                  Sign in with Google
                </>
              )}
            </button>

          {/* Info Text */}
          <p className="font-normal text-[14px] leading-[18px] text-[#5c4033] text-center w-full">
            To get started, sign in with Google
          </p>
        </div>
      </div>

      {/* Password Reset Modal */}
      <PasswordResetModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        email={email}
      />

      {/* Browser Warning Modal */}
      <Modal isOpen={isEmbeddedBrowser || showBrowserWarning} onClose={() => setShowBrowserWarning(false)}>
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#5C4033] mb-4">Sign in on browser</h2>
          <p className="text-[#5C4033] text-[14px] mb-6">
            Copy the link below and open this app on a browser (like Chrome or Safari).
          </p>
          <button
            onClick={copyUrl}
            className="w-full bg-gradient-to-r from-[#52C41A] to-[#389E0D] text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            Copy link
          </button>
        </div>
      </Modal>
    </div>
  )
}
