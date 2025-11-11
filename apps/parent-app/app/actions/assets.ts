'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Asset, AssetType } from '@/lib/types/database.types'
import { createAssetHistory } from './assetHistory'
import { getStockPrice } from '@/lib/services/stockPrice'

export async function getAssets(): Promise<Asset[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

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

  if (!data) {
    return []
  }

  // For stock assets, calculate current value dynamically
  const updatedAssets = await Promise.all(
    data.map(async (asset) => {
      if (asset.type === 'stocks' && asset.ticker && asset.shares) {
        const currentPrice = await getStockPrice(asset.ticker)
        if (currentPrice !== null) {
          return {
            ...asset,
            current_value: asset.shares * currentPrice,
            price_per_share: currentPrice,
          }
        }
      }
      return asset
    })
  )

  return updatedAssets
}

export async function createAsset(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const name = formData.get('name') as string
  const type = formData.get('type') as AssetType
  const currentValue = parseFloat(formData.get('currentValue') as string)
  const notes = formData.get('notes') as string
  const acquisitionDate = formData.get('acquisitionDate') as string
  const ticker = formData.get('ticker') as string
  const shares = formData.get('shares') ? parseFloat(formData.get('shares') as string) : null
  const pricePerShare = formData.get('pricePerShare') ? parseFloat(formData.get('pricePerShare') as string) : null
  const emoji = formData.get('emoji') as string

  const { data: insertedAsset, error } = await supabase
    .from('assets')
    .insert({
      user_id: user.id,
      name,
      type,
      current_value: currentValue,
      notes: notes || null,
      acquisition_date: acquisitionDate || new Date().toISOString(),
      ticker: ticker || null,
      shares: shares,
      price_per_share: pricePerShare,
      emoji: emoji || null,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Create initial asset history entry
  if (insertedAsset) {
    if (type === 'stock' && shares) {
      // For stocks, track shares
      await createAssetHistory(
        insertedAsset.id,
        shares,
        acquisitionDate || new Date().toISOString()
      )
    } else if (type === 'cash' || type === 'debt') {
      // For cash/debt, track value
      await createAssetHistory(
        insertedAsset.id,
        0, // shares is 0 for cash/debt
        acquisitionDate || new Date().toISOString(),
        currentValue
      )
    }
  }

  // Create a snapshot after adding an asset
  await createSnapshot()

  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateAsset(id: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const name = formData.get('name') as string
  const type = formData.get('type') as AssetType
  const notes = formData.get('notes') as string
  const emoji = formData.get('emoji') as string

  // Get the existing asset to check if it's a stock
  const { data: existingAsset } = await supabase
    .from('assets')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!existingAsset) {
    return { error: 'Asset not found' }
  }

  let updateData: any = {
    name,
    type,
    notes: notes || null,
    emoji: emoji || null,
  }

  // Handle stock assets differently
  if (type === 'stock' && existingAsset.ticker) {
    const shares = parseFloat(formData.get('shares') as string)
    const changeDate = formData.get('changeDate') as string

    // Get current price and calculate value
    const currentPrice = await getStockPrice(existingAsset.ticker)
    if (currentPrice !== null) {
      updateData.shares = shares
      updateData.price_per_share = currentPrice
      updateData.current_value = shares * currentPrice
    }

    // Create asset history entry for the share change
    await createAssetHistory(id, shares, changeDate || new Date().toISOString())
  } else {
    // For non-stock assets (cash/debt), update current_value directly
    const currentValue = parseFloat(formData.get('currentValue') as string)
    const changeDate = formData.get('changeDate') as string
    updateData.current_value = currentValue

    // Create history entry for cash/debt value changes
    if (type === 'cash' || type === 'debt') {
      await createAssetHistory(
        id,
        0, // shares is 0 for cash/debt
        changeDate || new Date().toISOString(),
        currentValue
      )
    }
  }

  const { error } = await supabase
    .from('assets')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  // Create a snapshot after updating an asset
  await createSnapshot()

  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteAsset(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('assets')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  // Create a snapshot after deleting an asset
  await createSnapshot()

  revalidatePath('/dashboard')
  return { success: true }
}

export async function getTotalNetWorth(): Promise<number> {
  const assets = await getAssets()
  return assets.reduce((total, asset) => {
    // Subtract debt from net worth, add assets
    if (asset.type === 'debt') {
      return total - Number(asset.current_value)
    }
    return total + Number(asset.current_value)
  }, 0)
}

async function createSnapshot() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return
  }

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
      total_net_worth: totalNetWorth,
    })

  if (error) {
    console.error('❌ Error creating snapshot:', error)
  } else {
    console.log('✅ Snapshot created successfully')
  }

  // Revalidate the dashboard to ensure the new snapshot data is fetched
  revalidatePath('/dashboard')
}

export async function getSnapshots() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from('snapshots')
    .select('*')
    .eq('user_id', user.id)
    .order('snapshot_date', { ascending: true })
    .limit(30) // Last 30 snapshots

  if (error) {
    console.error('❌ Error fetching snapshots:', error)
    return []
  }

  console.log('📊 RAW snapshots from database:', JSON.stringify(data, null, 2))

  return data || []
}
