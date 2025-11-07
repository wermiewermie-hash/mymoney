'use client'

import Link from 'next/link'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { uploadProfilePhoto } from '@/app/actions/profile'

interface Profile {
  id: string
  username: string | null
  email: string
  profile_photo_url: string | null
}

interface SettingsClientProps {
  user: User
  profile: Profile | null
}

export default function SettingsClient({ user, profile }: SettingsClientProps) {
  const router = useRouter()
  const [isChanged, setIsChanged] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Helper function to scroll input into view on focus
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 300)
  }

  const handleBack = () => {
    router.back()
  }

  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingPhoto(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData()
    formData.append('photo', file)

    const result = await uploadProfilePhoto(formData)
    setIsUploadingPhoto(false)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess('Profile photo updated successfully!')
      router.refresh()
    }
  }

  const [formData, setFormData] = useState({
    username: profile?.username || '',
    email: user.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setIsChanged(true)
    setError(null)
    setSuccess(null)
  }

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Validate password change if attempted
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setError('New passwords do not match')
          setLoading(false)
          return
        }
        if (formData.newPassword.length < 6) {
          setError('Password must be at least 6 characters')
          setLoading(false)
          return
        }
      }

      // Call server actions to update profile
      const response = await fetch('/api/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          newPassword: formData.newPassword || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to update profile')
        setLoading(false)
        return
      }

      setSuccess('Profile updated successfully!')
      setIsChanged(false)
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }))

      // Refresh the page to get updated data
      router.refresh()
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/delete-account', {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to delete account')
        setLoading(false)
        return
      }

      // Redirect to home page after successful deletion
      router.push('/')
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="px-6 pt-8 pb-0">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#FFA93D] to-[#FFD740] hover:opacity-90 text-white shadow-md transition-opacity"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-white text-2xl [text-shadow:rgba(0,0,0,0.1)_0px_4px_6px]">Settings</h1>
          <div className="w-9" /> {/* Spacer */}
        </div>
      </div>

      {/* Settings Form */}
      <div className="px-6 space-y-4">
        <div className="kids-card space-y-6">
          {/* Profile Photo */}
          <div className="flex flex-col items-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={handlePhotoClick}
              disabled={isUploadingPhoto}
              className="w-24 h-24 rounded-full border-4 border-[#FFA93D] shadow-lg bg-white flex items-center justify-center overflow-hidden mb-4 cursor-pointer hover:opacity-80 transition-opacity relative group disabled:opacity-50"
            >
              {profile?.profile_photo_url ? (
                <img src={profile.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl">👦</span>
              )}
              {isUploadingPhoto && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <svg className="animate-spin h-8 w-8 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </button>
            <button
              onClick={handlePhotoClick}
              disabled={isUploadingPhoto}
              className="text-sm text-[#00BCD4] font-semibold hover:underline disabled:opacity-50"
            >
              {isUploadingPhoto ? 'Uploading...' : 'Change Photo'}
            </button>
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-[#5C4033] mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              onFocus={handleInputFocus}
              className="w-full px-4 py-3 bg-[#E3F2FD] border-0 rounded-2xl focus:ring-2 focus:ring-[#FF9933] text-[#5C4033] placeholder-[#8B7355]"
              placeholder="Your username"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-[#5C4033] mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onFocus={handleInputFocus}
              className="w-full px-4 py-3 bg-[#E3F2FD] border-0 rounded-2xl focus:ring-2 focus:ring-[#FF9933] text-[#5C4033] placeholder-[#8B7355]"
              placeholder="your.email@example.com"
            />
          </div>

          {/* Password Change Section */}
          <div className="pt-4 border-t border-[rgba(0,0,0,0.08)]">
            <h3 className="text-[#5C4033] font-semibold mb-4">Change Password</h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-semibold text-[#5C4033] mb-2">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  onFocus={handleInputFocus}
                  className="w-full px-4 py-3 bg-[#E3F2FD] border-0 rounded-2xl focus:ring-2 focus:ring-[#FF9933] text-[#5C4033] placeholder-[#8B7355]"
                  placeholder="Leave blank to keep current password"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#5C4033] mb-2">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  onFocus={handleInputFocus}
                  className="w-full px-4 py-3 bg-[#E3F2FD] border-0 rounded-2xl focus:ring-2 focus:ring-[#FF9933] text-[#5C4033] placeholder-[#8B7355]"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-gradient-to-br from-white to-[#FFEBEE] border-2 border-[#FF6B6B]/20 rounded-2xl p-4">
              <div className="flex gap-3 items-start">
                <span className="text-2xl shrink-0">⚠️</span>
                <p className="text-[#FF6B6B] font-medium">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-gradient-to-br from-white to-[#E8F5E9] border-2 border-[#52C41A]/20 rounded-2xl p-4">
              <div className="flex gap-3 items-start">
                <span className="text-2xl shrink-0">✅</span>
                <p className="text-[#52C41A] font-medium">{success}</p>
              </div>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!isChanged || loading}
            className="w-full bg-gradient-to-r from-[#52C41A] to-[#389E0D] text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl active:scale-95"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>

        {/* Delete Account */}
        <div className="kids-card bg-gradient-to-br from-white to-[#FFEBEE]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B6B] to-[#FF5252] rounded-full flex items-center justify-center shadow-lg">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-[#5C4033] font-semibold">Danger Zone</h3>
              <p className="text-sm text-[#8B7355]">Permanently delete your account</p>
            </div>
          </div>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="w-full bg-gradient-to-r from-[#FF6B6B] to-[#FF5252] text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#FF6B6B] to-[#FF5252] rounded-full mb-4 shadow-lg">
                <span className="text-3xl">⚠️</span>
              </div>
              <h2 className="text-xl font-bold text-[#5C4033] mb-2">Delete Account?</h2>
              <p className="text-[#8B7355] mb-4">
                This will permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <p className="text-sm text-[#FF6B6B] font-semibold">
                Are you absolutely sure?
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={loading}
                className="flex-1 bg-[#E0E0E0] text-[#5C4033] font-bold py-3 px-6 rounded-2xl transition-all hover:bg-[#D0D0D0] active:scale-95 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-[#FF6B6B] to-[#FF5252] text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
