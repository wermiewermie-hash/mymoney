'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useCurrency } from '@/lib/context/CurrencyContext'
import type { Asset } from '@/lib/types/database.types'

interface Snapshot {
  id: string
  user_id: string
  total_net_worth: number
  snapshot_date: string
  created_at: string
}

interface HistoryClientProps {
  snapshots: Snapshot[]
  assets: Asset[]
}

type TimeFrame = 'month' | '6months' | 'year' | 'all'

export default function HistoryClient({ snapshots, assets }: HistoryClientProps) {
  const { formatCurrency, currency, exchangeRate } = useCurrency()
  const router = useRouter()
  const [timeframe, setTimeframe] = useState<TimeFrame>('all')

  const handleBack = () => {
    router.back()
  }

  // Filter snapshots based on selected timeframe
  const filteredSnapshots = useMemo(() => {
    const now = new Date()
    const cutoffDate = new Date()

    switch (timeframe) {
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1)
        break
      case '6months':
        cutoffDate.setMonth(now.getMonth() - 6)
        break
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1)
        break
      case 'all':
      default:
        return snapshots
    }

    return snapshots.filter(s => new Date(s.snapshot_date) >= cutoffDate)
  }, [snapshots, timeframe])

  // Prepare chart data
  const chartData = filteredSnapshots.map(snapshot => {
    const date = new Date(snapshot.snapshot_date)
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: snapshot.total_net_worth,
      fullDate: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    }
  })

  // Create activity list from assets
  const activityList = useMemo(() => {
    const activities: Array<{
      id: string
      date: Date
      type: 'created' | 'updated'
      asset: Asset
    }> = []

    assets.forEach(asset => {
      // Add creation event
      activities.push({
        id: `${asset.id}-created`,
        date: new Date(asset.created_at),
        type: 'created',
        asset
      })

      // Add update event if different from creation
      if (asset.updated_at !== asset.created_at) {
        activities.push({
          id: `${asset.id}-updated`,
          date: new Date(asset.updated_at),
          type: 'updated',
          asset
        })
      }
    })

    // Sort by date, newest first
    return activities.sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [assets])

  const timeframeButtons: Array<{ value: TimeFrame; label: string }> = [
    { value: 'month', label: 'This month' },
    { value: '6months', label: '6 months' },
    { value: 'year', label: '1 year' },
    { value: 'all', label: 'All time' }
  ]

  const assetTypeEmojis: Record<string, string> = {
    bank_account: '💰',
    stocks: '📈',
    retirement_account: '🏦',
    index_funds: '📊',
    debt: '💳'
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 hover:bg-white shadow-md transition-all"
          >
            <svg className="h-5 w-5 text-[#5C4033]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h1 className="text-white text-2xl [text-shadow:rgba(0,0,0,0.1)_0px_4px_6px]">History</h1>

          <div className="w-9" />
        </div>
      </div>

      {/* Chart Card */}
      <div className="px-6 mb-6">
        <div className="kids-card">
          <h3 className="text-[#5C4033] mb-4">Net Worth Over Time</h3>

          {/* Timeframe Toggles */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {timeframeButtons.map(btn => (
              <button
                key={btn.value}
                onClick={() => setTimeframe(btn.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  timeframe === btn.value
                    ? 'bg-gradient-to-b from-[#52C41A] to-[#389E0D] text-white shadow-md'
                    : 'bg-[#F5F5F5] text-[#8B7355] hover:bg-[#E0E0E0]'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Chart */}
          {chartData.length > 0 ? (
            <div className="h-64 outline-none [&_*]:outline-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="historyColorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#52C41A" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#52C41A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#8B7355', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#8B7355', fontSize: 12 }}
                    width={60}
                    tickFormatter={(value) => {
                      if (currency === 'USD') {
                        return `$${Math.round(value / 1000)}k`
                      } else {
                        const jpy = value * exchangeRate
                        return `¥${Math.round(jpy / 1000)}k`
                      }
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      color: '#5C4033',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        return payload[0].payload.fullDate
                      }
                      return label
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Net Worth']}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#52C41A"
                    strokeWidth={3}
                    fill="url(#historyColorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-[#8B7355]">No data available for this timeframe</p>
            </div>
          )}
        </div>
      </div>

      {/* Activity List */}
      <div className="px-6">
        <h2 className="text-[#5C4033] text-lg font-semibold mb-4">Activity</h2>

        {activityList.length > 0 ? (
          <div className="space-y-3">
            {activityList.map(activity => (
              <div
                key={activity.id}
                className="kids-card"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#FFF8E1] to-[#FFE4C4] rounded-2xl flex items-center justify-center shrink-0">
                    <span className="text-2xl">
                      {activity.asset.ticker ? '📈' : assetTypeEmojis[activity.asset.type] || '💰'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[#5C4033] font-medium truncate">
                      {activity.type === 'created' ? 'Added' : 'Updated'} {activity.asset.name}
                    </h3>
                    <p className="text-sm text-[#8B7355]">
                      {activity.date.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#5C4033] font-semibold">
                      {formatCurrency(Number(activity.asset.current_value))}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="kids-card text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-[#8B7355] mb-2">No activity yet</p>
            <p className="text-sm text-[#8B7355]">Add some assets to see your history</p>
          </div>
        )}
      </div>
    </div>
  )
}
