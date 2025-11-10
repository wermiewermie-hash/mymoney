export type AssetType = 'stock' | 'cash' | 'debt'

export interface Profile {
  id: string
  email: string | null
  username: string | null
  full_name: string | null
  profile_photo_url: string | null
  has_seen_welcome: boolean
  created_at: string
  updated_at: string
}

export interface Stock {
  id: string
  symbol: string
  name: string
  currency: string
  current_price: number | null
  last_updated: string | null
  created_at: string
}

export interface StockPrice {
  id: string
  stock_id: string
  price: number
  date: string
  created_at: string
}

export interface Asset {
  id: string
  user_id: string
  name: string
  type: AssetType
  current_value: number
  notes: string | null
  acquisition_date: string
  ticker: string | null
  shares: number | null
  price_per_share: number | null
  emoji: string | null
  stock_id: string | null
  created_at: string
  updated_at: string
}

export interface Snapshot {
  id: string
  user_id: string
  total_net_worth: number
  snapshot_date: string
  created_at: string
}

export interface AssetHistory {
  id: string
  asset_id: string
  user_id: string
  shares: number
  value?: number  // For cash/debt accounts
  change_date: string
  created_at: string
}

export interface GoalHistory {
  id: string
  goal_id: string
  user_id: string
  amount: number
  change_date: string
  created_at: string
}
