'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { signOut } from '@/app/actions/auth'
import { useCurrency } from '@/lib/context/CurrencyContext'
import { uploadProfilePhoto } from '@/app/actions/profile'
import { useRouter } from 'next/navigation'

interface MobileMenuProps {
  username?: string
  totalNetWorth: number
  profilePhotoUrl?: string | null
}

export default function MobileMenu({ username, totalNetWorth, profilePhotoUrl }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { currency, setCurrency, formatCurrency } = useCurrency()
  const router = useRouter()

  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('photo', file)

    const result = await uploadProfilePhoto(formData)
    setIsUploading(false)

    if (result.error) {
      alert(result.error)
    } else {
      router.refresh()
    }
  }

  return (
    <>
      {/* Hamburger Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#FFA93D] to-[#FFD740] hover:opacity-90 text-white shadow-md transition-opacity"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-in Menu Panel - White background */}
      <div
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Profile Section - Orange gradient header */}
        <div className="bg-gradient-to-br from-[#FF9933] to-[#FFA93D] pt-6 pb-8 flex flex-col items-center">
          {/* Avatar */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={handlePhotoClick}
            disabled={isUploading}
            className="w-20 h-20 rounded-full border-4 border-white shadow-lg bg-white flex items-center justify-center overflow-hidden mb-6 hover:opacity-80 transition-opacity relative group disabled:opacity-50"
          >
            {profilePhotoUrl ? (
              <img src={profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl">👦</span>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </button>

          <div className="text-white text-center mb-6">
            <h3 className="text-[28px] leading-[28px] mb-1">{username || 'User'}</h3>
            <p className="text-sm text-white/90 leading-[20px]">Total {formatCurrency(totalNetWorth)}</p>
          </div>

          {/* Currency Toggle */}
          <div className="inline-flex bg-[#FFF3E0] rounded-full relative h-8 w-[118px]">
            <button
              onClick={() => setCurrency('USD')}
              className={`relative z-10 flex-1 rounded-full text-xs font-semibold transition-colors flex items-center justify-center ${
                currency === 'USD'
                  ? 'text-white'
                  : 'text-[#8B7355]'
              }`}
            >
              USD
            </button>
            <button
              onClick={() => setCurrency('JPY')}
              className={`relative z-10 flex-1 rounded-full text-xs font-semibold transition-colors flex items-center justify-center ${
                currency === 'JPY'
                  ? 'text-white'
                  : 'text-[#8B7355]'
              }`}
            >
              JPY
            </button>
            <div
              className="absolute top-1 bottom-1 w-[54px] bg-gradient-to-b from-[#FFA93D] to-[#FFD740] rounded-full shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] transition-all duration-200 ease-in-out"
              style={{
                left: currency === 'USD' ? '4px' : '60px'
              }}
            />
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="px-6 pt-8 space-y-2">
          <Link
            href="/dashboard"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-5 p-2 rounded-2xl hover:bg-[#FFF3E0]/50 transition-colors"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#FFF3E0] to-[#FFE4C4] rounded-3xl flex items-center justify-center shrink-0">
              <span className="text-xl leading-none">🏠</span>
            </div>
            <span className="text-sm text-[#5C4033]">Home</span>
          </Link>

          <Link
            href="/dashboard/accounts"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-5 p-2 rounded-2xl hover:bg-[#FFF3E0]/50 transition-colors"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#FFF3E0] to-[#FFE4C4] rounded-3xl flex items-center justify-center shrink-0">
              <span className="text-xl leading-none">💵</span>
            </div>
            <span className="text-sm text-[#5C4033]">My Money</span>
          </Link>

          <Link
            href="/dashboard/add-asset"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-5 p-2 rounded-2xl hover:bg-[#FFF3E0]/50 transition-colors"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#FFF3E0] to-[#FFE4C4] rounded-3xl flex items-center justify-center shrink-0">
              <span className="text-xl leading-none">➕</span>
            </div>
            <span className="text-sm text-[#5C4033]">Add money</span>
          </Link>

          <Link
            href="/dashboard/goals"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-5 p-2 rounded-2xl hover:bg-[#FFF3E0]/50 transition-colors"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#FFF3E0] to-[#FFE4C4] rounded-3xl flex items-center justify-center shrink-0">
              <span className="text-xl leading-none">🎯</span>
            </div>
            <span className="text-sm text-[#5C4033]">Goals</span>
          </Link>
        </div>

        {/* Divider */}
        <div className="mx-6 mt-8 border-t border-[rgba(0,0,0,0.08)]" />

        {/* Settings Options */}
        <div className="px-6 pt-8 space-y-2">
          <Link
            href="/dashboard/settings"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-5 px-3 py-3.5 rounded-2xl hover:bg-[#FFF3E0]/50 transition-colors"
          >
            <svg className="h-4 w-4 text-[#8B7355]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm text-[#5C4033]">Settings</span>
          </Link>

          <form action={signOut}>
            <button
              type="submit"
              className="w-full flex items-center gap-5 px-3 py-3.5 rounded-2xl hover:bg-[#FFEBEE]/50 transition-colors"
            >
              <svg className="h-4 w-4 text-[#FF6B6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm text-[#FF6B6B]">Log Out</span>
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
