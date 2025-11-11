'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getStockPrice } from './stocks'

export interface Snapshot {
  snapshot_date: string
  total_net_worth: number
}

// Get Google stock asset for the current user
export async function getGoogleStock() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', 'stock')
    .eq('ticker', 'GOOGL')
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching Google stock:', error)
    return null
  }

  return data
}

// Get cash asset for the current user
export async function getCash() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', 'cash')
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching cash:', error)
    return null
  }

  return data
}

// Get all assets for calculating total net worth
export async function getAssets() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching assets:', error)
    return []
  }

  return data || []
}

// Get total net worth
export async function getTotalNetWorth() {
  const assets = await getAssets()

  return assets.reduce((total, asset) => {
    if (asset.type === 'debt') {
      return total - asset.current_value
    }
    return total + asset.current_value
  }, 0)
}

// Add or update Google stock (simplified for kids - whole numbers only)
export async function upsertGoogleStock(shares: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Validate whole number
  if (!Number.isInteger(shares) || shares <= 0) {
    return { error: 'Please enter a whole number of shares' }
  }

  // Get current Google stock price
  const stockPrice = await getStockPrice('GOOGL')
  if (!stockPrice) {
    return { error: 'Could not fetch Google stock price' }
  }

  const currentValue = shares * stockPrice.price

  // Check if Google stock already exists
  const existing = await getGoogleStock()

  if (existing) {
    // Update existing
    const { error } = await supabase
      .from('assets')
      .update({
        shares,
        price_per_share: stockPrice.price,
        current_value: currentValue,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)

    if (error) {
      return { error: error.message }
    }
  } else {
    // Insert new with fixed defaults
    const { error } = await supabase
      .from('assets')
      .insert({
        user_id: user.id,
        type: 'stock',
        ticker: 'GOOGL',
        name: 'Google Stock',
        emoji: '📈',
        shares,
        price_per_share: stockPrice.price,
        current_value: currentValue
      })

    if (error) {
      return { error: error.message }
    }
  }

  // Create snapshot after updating assets
  await createSnapshot()

  revalidatePath('/dashboard')
  return { success: true }
}

// Add or update cash (simplified for kids)
export async function upsertCash(amount: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  if (amount < 0) {
    return { error: 'Amount must be positive' }
  }

  // Check if cash already exists
  const existing = await getCash()

  if (existing) {
    // Update existing
    const { error } = await supabase
      .from('assets')
      .update({
        current_value: amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)

    if (error) {
      return { error: error.message }
    }
  } else {
    // Insert new with fixed defaults
    const { error } = await supabase
      .from('assets')
      .insert({
        user_id: user.id,
        type: 'cash',
        name: 'Cash',
        emoji: '💰',
        current_value: amount
      })

    if (error) {
      return { error: error.message }
    }
  }

  // Create snapshot after updating assets
  await createSnapshot()

  revalidatePath('/dashboard')
  return { success: true }
}

// Get snapshots (net worth history over time)
export async function getSnapshots(): Promise<Snapshot[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from('snapshots')
    .select('snapshot_date, total_net_worth')
    .eq('user_id', user.id)
    .order('snapshot_date', { ascending: true })

  if (error) {
    console.error('❌ Error fetching snapshots:', error)
    return []
  }

  console.log('📊 RAW snapshots from database:', JSON.stringify(data, null, 2))

  // Return raw data - let the client handle formatting
  return data || []
}

// Create a snapshot of current net worth
export async function createSnapshot() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Calculate current total net worth
  const totalNetWorth = await getTotalNetWorth()

  // Get today's date in local timezone as YYYY-MM-DD
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const todayLocal = `${year}-${month}-${day}`

  // Create date string at midnight UTC for database
  const snapshotDate = `${todayLocal}T00:00:00Z`

  console.log(`💾 Creating snapshot for ${todayLocal} with net worth: $${totalNetWorth}`)

  // Delete ALL existing snapshots for today first (to avoid duplicates)
  const startOfDay = `${todayLocal}T00:00:00Z`
  const endOfDay = `${todayLocal}T23:59:59Z`

  const { error: deleteError } = await supabase
    .from('snapshots')
    .delete()
    .eq('user_id', user.id)
    .gte('snapshot_date', startOfDay)
    .lte('snapshot_date', endOfDay)

  if (deleteError) {
    console.error('❌ Error deleting old snapshots:', deleteError)
  } else {
    console.log('🗑️  Deleted old snapshots for today')
  }

  // Always create a fresh snapshot for today
  console.log('➕ Creating new snapshot')
  const { error } = await supabase
    .from('snapshots')
    .insert({
      user_id: user.id,
      snapshot_date: snapshotDate,
      total_net_worth: totalNetWorth
    })

  if (error) {
    console.error('❌ Error creating snapshot:', error)
    return { error: error.message }
  }
  console.log('✅ Snapshot created successfully')

  // Revalidate the dashboard to ensure the new snapshot data is fetched
  revalidatePath('/dashboard')

  return { success: true }
}
