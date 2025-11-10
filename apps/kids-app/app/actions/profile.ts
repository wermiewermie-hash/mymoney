'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getProfile() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return profile
}

export async function markWelcomeSeen() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ has_seen_welcome: true })
    .eq('id', user.id)

  if (error) {
    console.error('Error updating profile:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function uploadProfilePhoto(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const file = formData.get('photo') as File
  if (!file || file.size === 0) {
    return { error: 'No file provided' }
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return { error: 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.' }
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return { error: 'File too large. Maximum size is 5MB.' }
  }

  try {
    // Delete old photo if it exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('profile_photo_url')
      .eq('id', user.id)
      .single()

    if (profile?.profile_photo_url) {
      // Extract file path from URL
      const urlParts = profile.profile_photo_url.split('/profile-photos/')
      if (urlParts.length > 1) {
        const oldPath = urlParts[1]
        await supabase.storage.from('profile-photos').remove([oldPath])
      }
    }

    // Upload new photo
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/profile.${fileExt}`
    const filePath = fileName

    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { error: 'Failed to upload photo' }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(filePath)

    // Update profile with new photo URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ profile_photo_url: urlData.publicUrl })
      .eq('id', user.id)

    if (updateError) {
      console.error('Update error:', updateError)
      return { error: 'Failed to update profile' }
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/settings')
    return { success: true, photoUrl: urlData.publicUrl }
  } catch (error) {
    console.error('Error uploading photo:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function deleteProfilePhoto() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    // Get current photo URL
    const { data: profile } = await supabase
      .from('profiles')
      .select('profile_photo_url')
      .eq('id', user.id)
      .single()

    if (profile?.profile_photo_url) {
      // Extract file path from URL
      const urlParts = profile.profile_photo_url.split('/profile-photos/')
      if (urlParts.length > 1) {
        const filePath = urlParts[1]
        await supabase.storage.from('profile-photos').remove([filePath])
      }
    }

    // Remove photo URL from profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ profile_photo_url: null })
      .eq('id', user.id)

    if (updateError) {
      return { error: 'Failed to update profile' }
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/settings')
    return { success: true }
  } catch (error) {
    console.error('Error deleting photo:', error)
    return { error: 'An unexpected error occurred' }
  }
}
