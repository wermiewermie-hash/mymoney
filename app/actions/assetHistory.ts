'use server'

import { createClient } from '@/lib/supabase/server'
import type { AssetHistory } from '@/lib/types/database.types'

export async function createAssetHistory(
  assetId: string,
  shares: number,
  changeDate: string,
  value?: number  // Optional value for cash/debt accounts
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const insertData: any = {
    asset_id: assetId,
    user_id: user.id,
    shares,
    change_date: changeDate,
  }

  // Add value field if provided (for cash/debt accounts)
  if (value !== undefined) {
    insertData.value = value
  }

  const { error } = await supabase.from('asset_history').insert(insertData)

  if (error) {
    console.error('Error creating asset history:', error)
    return { error: error.message }
  }

  return { success: true }
}

export async function getAssetHistory(assetId: string): Promise<AssetHistory[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from('asset_history')
    .select('*')
    .eq('asset_id', assetId)
    .eq('user_id', user.id)
    .order('change_date', { ascending: true })

  if (error) {
    console.error('Error fetching asset history:', error)
    return []
  }

  return data || []
}

// Get the share count for an asset at a specific date
export async function getSharesAtDate(
  assetId: string,
  date: Date
): Promise<number | null> {
  const history = await getAssetHistory(assetId)

  if (history.length === 0) {
    return null
  }

  // Find the most recent history entry before or on the given date
  const relevantHistory = history.filter(
    (h) => new Date(h.change_date) <= date
  )

  if (relevantHistory.length === 0) {
    return null
  }

  // Return the shares from the most recent entry
  return relevantHistory[relevantHistory.length - 1].shares
}

// Get historical data points for an asset for graphing
export async function getAssetHistoricalValues(
  assetId: string,
  ticker: string | null,
  currentPrice: number,
  startDate?: Date
): Promise<Array<{ date: Date; shares: number; value: number }>> {
  const history = await getAssetHistory(assetId)

  if (history.length === 0) {
    return []
  }

  // For now, we'll use current price for all historical points
  // In a full implementation, you'd fetch historical prices from an API
  const dataPoints = history.map((h) => ({
    date: new Date(h.change_date),
    shares: h.shares,
    value: h.shares * currentPrice,
  }))

  // Filter by start date if provided
  if (startDate) {
    return dataPoints.filter((p) => p.date >= startDate)
  }

  return dataPoints
}

// Get all asset history for the current user
export async function getAllAssetHistory(): Promise<AssetHistory[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from('asset_history')
    .select('*')
    .eq('user_id', user.id)
    .order('change_date', { ascending: false })
    .limit(50) // Get last 50 changes

  if (error) {
    console.error('Error fetching all asset history:', error)
    return []
  }

  return data || []
}
