'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function sendGift(recipientEmail: string, stockAmount: number, parentName: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Validate inputs
  if (!recipientEmail || !recipientEmail.includes('@')) {
    return { error: 'Invalid email address' }
  }

  if (!stockAmount || stockAmount <= 0) {
    return { error: 'Stock amount must be greater than 0' }
  }

  // Create the gift record
  const { error: giftError } = await supabase
    .from('stock_gifts')
    .insert({
      from_user_id: user.id,
      to_email: recipientEmail.toLowerCase().trim(),
      parent_name: parentName,
      stock_amount: stockAmount,
      status: 'pending'
    })

  if (giftError) {
    console.error('Error creating gift:', giftError)
    return { error: 'Failed to send gift. Please try again.' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
