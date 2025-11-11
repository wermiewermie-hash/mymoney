'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { upsertGoogleStock, getGoogleStock } from './kidsAssets'

export interface StockGift {
  id: string
  from_user_id: string
  to_email: string
  to_user_id: string | null
  parent_name: string
  stock_amount: number
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  accepted_at: string | null
  updated_at: string
}

// Check for pending gifts sent to the current user's email
export async function getPendingGifts(): Promise<StockGift[]> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return []
    }

    const { data, error } = await supabase
      .from('stock_gifts')
      .select('*')
      .eq('to_email', user.email.toLowerCase().trim())
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      // Table might not exist yet - this is OK during development
      console.log('Note: stock_gifts table error:', error.message, error.code, error.details)
      return []
    }

    return data || []
  } catch (err) {
    console.error('Error in getPendingGifts:', JSON.stringify(err, null, 2))
    return []
  }
}

// Accept a gift and add the stocks to the user's account
export async function acceptGift(giftId: string) {
  console.log('🎁 acceptGift called with giftId:', giftId)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.log('❌ No user authenticated')
    return { error: 'Not authenticated' }
  }

  console.log('✅ User authenticated:', user.email)

  // Get the gift
  const { data: gift, error: giftError } = await supabase
    .from('stock_gifts')
    .select('*')
    .eq('id', giftId)
    .eq('to_email', user.email?.toLowerCase().trim())
    .eq('status', 'pending')
    .single()

  if (giftError || !gift) {
    console.log('❌ Gift not found, error:', giftError)
    return { error: 'Gift not found' }
  }

  console.log('✅ Gift found:', gift.stock_amount, 'shares')

  // Get current Google stock
  const currentStock = await getGoogleStock()
  const currentShares = currentStock?.shares || 0
  console.log('📊 Current shares:', currentShares)

  const newShares = currentShares + gift.stock_amount
  console.log('📊 New shares will be:', newShares)

  // Update or create Google stock with new share count
  const result = await upsertGoogleStock(newShares)

  if (result.error) {
    console.log('❌ Error upserting stock:', result.error)
    return { error: result.error }
  }

  console.log('✅ Stock updated successfully')

  // Update the gift status to accepted
  const { error: updateError } = await supabase
    .from('stock_gifts')
    .update({
      status: 'accepted',
      to_user_id: user.id,
      accepted_at: new Date().toISOString()
    })
    .eq('id', giftId)

  if (updateError) {
    console.error('❌ Error updating gift status:', updateError)
    return { error: 'Failed to update gift status' }
  }

  console.log('✅ Gift marked as accepted')

  revalidatePath('/dashboard')
  console.log('✅ Path revalidated')

  return { success: true, stockAmount: gift.stock_amount, parentName: gift.parent_name }
}

// Reject a gift
export async function rejectGift(giftId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Update the gift status to rejected
  const { error } = await supabase
    .from('stock_gifts')
    .update({
      status: 'rejected',
      updated_at: new Date().toISOString()
    })
    .eq('id', giftId)
    .eq('to_email', user.email?.toLowerCase().trim())
    .eq('status', 'pending')

  if (error) {
    console.error('Error rejecting gift:', error)
    return { error: 'Failed to reject gift' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
