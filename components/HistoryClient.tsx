'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useCurrency } from '@/lib/context/CurrencyContext'
import type { Asset, AssetHistory } from '@/lib/types/database.types'
import { ArrowLeft } from 'lucide-react'
import PageHeader, { HeaderButton } from '@/components/PageHeader'
import { pageStyles } from '@/lib/constants/pageStyles'
import { motion } from 'motion/react'

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
  assetHistory: AssetHistory[]
}

type TimeRange = 'month' | 'year' | 'all'

export default function HistoryClient({ snapshots, assets, assetHistory }: HistoryClientProps) {
  const { formatCurrency } = useCurrency()
  const router = useRouter()
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('year')
  const [progressCardInView, setProgressCardInView] = useState(true)

  const assetTypeEmojis: Record<string, string> = {
    cash: '💰',
    stock: '📈',
    debt: '💸',
    bank_account: '💰',
    stocks: '📈',
    retirement_account: '🏦',
    index_funds: '📊',
  }

  const handleBack = () => {
    router.back()
  }

  // Get chart data based on selected time range
  const chartData = useMemo(() => {
    // Filter snapshots based on selected time range
    const now = new Date()
    const cutoffDate = new Date()
    let filtered = snapshots

    if (selectedTimeRange === 'month') {
      cutoffDate.setMonth(now.getMonth() - 1)
      filtered = snapshots.filter(s => new Date(s.snapshot_date) >= cutoffDate)
    } else if (selectedTimeRange === 'year') {
      cutoffDate.setFullYear(now.getFullYear() - 1)
      filtered = snapshots.filter(s => new Date(s.snapshot_date) >= cutoffDate)
    }

    // Map to chart data format
    return filtered.map(snapshot => {
      const date = new Date(snapshot.snapshot_date)
      let label = ''

      if (selectedTimeRange === 'month') {
        label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      } else if (selectedTimeRange === 'year') {
        label = date.toLocaleDateString('en-US', { month: 'short' })
      } else {
        label = date.toLocaleDateString('en-US', { year: 'numeric' })
      }

      return {
        month: label,
        value: snapshot.total_net_worth
      }
    })
  }, [snapshots, selectedTimeRange])

  // Calculate increase amount based on selected time range
  const increaseAmount = useMemo(() => {
    if (chartData.length < 2) return 0
    return chartData[chartData.length - 1].value - chartData[0].value
  }, [chartData])

  // Get the appropriate text for the time range
  const getTimeRangeText = () => {
    switch (selectedTimeRange) {
      case 'month':
        return 'this month'
      case 'year':
        return 'this year'
      case 'all':
        return 'all time'
      default:
        return 'this year'
    }
  }

  // Create activity list from asset history with incremental changes
  const activityList = useMemo(() => {
    const activities: Array<{
      id: string
      date: Date
      title: string
      subtitle: string
      amount: number
      isPositive: boolean
      emoji: string
    }> = []

    // Group history by asset_id
    const historyByAsset = assetHistory.reduce((acc, history) => {
      if (!acc[history.asset_id]) {
        acc[history.asset_id] = []
      }
      acc[history.asset_id].push(history)
      return acc
    }, {} as Record<string, AssetHistory[]>)

    // Process each asset's history
    Object.entries(historyByAsset).forEach(([assetId, histories]) => {
      const asset = assets.find(a => a.id === assetId)
      if (!asset) return

      // Sort histories by date for this asset
      const sortedHistories = [...histories].sort(
        (a, b) => new Date(a.change_date).getTime() - new Date(b.change_date).getTime()
      )

      // Process each history entry to calculate incremental changes
      sortedHistories.forEach((history, index) => {
        const date = new Date(history.change_date)
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

        // Determine title (use ticker or asset name)
        const title = asset.ticker || asset.name

        // Determine subtitle and amount based on asset type
        let subtitle = ''
        let amount = 0
        let isPositive = true

        if (asset.ticker && history.shares !== undefined && history.shares !== null) {
          // For stocks: show share change
          const previousShares = index > 0 ? sortedHistories[index - 1].shares : 0
          const shareChange = history.shares - previousShares
          const absoluteShares = Math.abs(shareChange)

          subtitle = `${dateStr} · ${absoluteShares} share${absoluteShares !== 1 ? 's' : ''}`

          // Calculate value of the share change
          amount = Math.abs(shareChange * (asset.price_per_share || 0))
          isPositive = shareChange > 0
        } else if (history.value !== undefined && history.value !== null) {
          // For cash/debt: show value change
          const prevHistory = index > 0 ? sortedHistories[index - 1] : null
          const previousValue = prevHistory && prevHistory.value !== undefined && prevHistory.value !== null ? prevHistory.value : 0
          const valueChange = history.value - previousValue

          subtitle = index === 0 ? `${dateStr} · Created` : `${dateStr} · Updated`
          amount = Math.abs(valueChange)
          isPositive = valueChange > 0
        }

        // Use emoji from asset
        const emoji = asset.emoji || assetTypeEmojis[asset.type] || '💰'

        if (amount > 0 || index === 0) {
          activities.push({
            id: history.id,
            date,
            title,
            subtitle,
            amount,
            isPositive: asset.type === 'debt' ? !isPositive : isPositive,
            emoji
          })
        }
      })
    })

    // Sort by date, newest first, limit to 10
    return activities.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10)
  }, [assets, assetHistory])

  return (
    <div className="min-h-screen pb-8" style={{ background: pageStyles.history.background, backgroundAttachment: 'fixed' }}>
      {/* Header */}
      <div className="px-6 pt-7 pb-0">
        <PageHeader
          title="My Progress"
          buttonColor={pageStyles.history.buttonColor}
          leftAction={
            <HeaderButton onClick={handleBack} color={pageStyles.history.buttonColor}>
              <ArrowLeft className="h-5 w-5" />
            </HeaderButton>
          }
        />
      </div>

      {/* Content */}
      <div className="px-6 pt-8 pb-16">
        {/* Summary Card with Image */}
        <div className="h-[240px] relative w-full mb-4">
          {/* The main card */}
          <div className="absolute bg-gradient-to-b from-[#ffffff] to-[#fff8e1] bottom-0 flex flex-col gap-[24px] h-[169.994px] left-0 pb-[24px] pt-[75px] px-[24px] rounded-[24px] w-full">
            <div className="absolute border-[0.572px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_8px_8px_0px_rgba(0,0,0,0.14)]" />

            <div className="flex items-center justify-center w-full">
              <div className="flex flex-col font-lora font-semibold leading-[0] text-[#5c4033] text-[24px] text-center">
                <p className="leading-[30px]">
                  You {increaseAmount >= 0 ? 'added' : 'lost'} {formatCurrency(Math.abs(increaseAmount))}
                  <br />
                  {getTimeRangeText()}!
                </p>
              </div>
            </div>
          </div>

          {/* Piggy Bank Image */}
          <div className="absolute left-[calc(50%-5.348px)] size-[140px] top-[-18px] translate-x-[-50%]">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img
                alt="Piggy bank illustration"
                className="absolute h-[130.25%] left-[-52.86%] max-w-none top-[-17.39%] w-[208.4%]"
                src="/6299b0fc6367a55fa2e2bcf6969e45629c71041d.png"
              />
            </div>
          </div>
        </div>

        {/* Progress Chart Card with Toggle Buttons */}
        <motion.div
          className="relative bg-gradient-to-b from-[#ffffff] to-[#fff8e1] rounded-[24px] w-full mb-4"
          onViewportEnter={() => setProgressCardInView(true)}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="absolute border-[0.569px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_8px_8px_0px_rgba(0,0,0,0.14)]" />

          <div className="pt-[24px] pb-[24px] px-[24px] flex flex-col">
            {/* Chart Container */}
            {chartData.length > 0 ? (
              <div className="h-[216px] py-3 outline-none [&_*]:outline-none">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} key={selectedTimeRange}>
                    <defs>
                      <linearGradient id="historyColorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#52C41A" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#52C41A" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#8B7355', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#8B7355', fontSize: 12 }}
                      width={40}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value: number) => [formatCurrency(value), 'Net Worth']}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#52C41A"
                      strokeWidth={3}
                      fill="url(#historyColorValue)"
                      animationBegin={progressCardInView ? 0 : undefined}
                      animationDuration={800}
                      isAnimationActive={progressCardInView}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[216px] flex items-center justify-center">
                <p className="text-[#8B7355]">No data available</p>
              </div>
            )}

            {/* 16px gap */}
            <div className="h-[16px]" />

            {/* Time Range Toggle */}
            <div className="flex gap-[6px] h-[32px] w-full">
              <motion.button
                className={`basis-0 grow h-[32px] rounded-full flex items-center justify-center ${
                  selectedTimeRange === 'month'
                    ? 'bg-gradient-to-b from-[#52C41A] to-[#389E0D] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]'
                    : 'bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]'
                }`}
                onClick={() => setSelectedTimeRange('month')}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.15 }}
              >
                <p className={`font-medium leading-[20px] text-[14px] ${
                  selectedTimeRange === 'month' ? 'text-white' : 'text-[#8b7355]'
                }`}>
                  Month
                </p>
              </motion.button>
              <motion.button
                className={`basis-0 grow h-[32px] rounded-full flex items-center justify-center ${
                  selectedTimeRange === 'year'
                    ? 'bg-gradient-to-b from-[#52C41A] to-[#389E0D] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]'
                    : 'bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]'
                }`}
                onClick={() => setSelectedTimeRange('year')}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.15 }}
              >
                <p className={`font-medium leading-[20px] text-[14px] ${
                  selectedTimeRange === 'year' ? 'text-white' : 'text-[#8b7355]'
                }`}>
                  Year
                </p>
              </motion.button>
              <motion.button
                className={`basis-0 grow h-[32px] rounded-full flex items-center justify-center ${
                  selectedTimeRange === 'all'
                    ? 'bg-gradient-to-b from-[#52C41A] to-[#389E0D] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]'
                    : 'bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]'
                }`}
                onClick={() => setSelectedTimeRange('all')}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.15 }}
              >
                <p className={`font-medium leading-[20px] text-[14px] ${
                  selectedTimeRange === 'all' ? 'text-white' : 'text-[#8b7355]'
                }`}>
                  All
                </p>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Activity Card */}
        <motion.div
          className="relative bg-gradient-to-b from-[#ffffff] to-[#fff8e1] flex flex-col gap-[12px] p-[24px] rounded-[24px] w-full"
        >
          <div className="absolute border-[0.572px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_8px_8px_0px_rgba(0,0,0,0.14)]" />

          <div className="h-[43.991px] w-full">
            <div className="flex items-center justify-between h-full">
              <h3 className="text-[#5C4033] font-semibold leading-[28px] text-[18px]">Activity</h3>
            </div>
          </div>

          {activityList.length > 0 ? (
            <div className="flex flex-col gap-[16px] w-full">
              {activityList.map((item) => (
                <div key={item.id} className="flex items-start justify-between w-full">
                  <div className="flex gap-[16px] items-center">
                    <div className="bg-[rgba(255,179,102,0.25)] rounded-[12px] size-[39.993px] flex items-center justify-center">
                      <span className="leading-[28px] text-[16px] text-[#5c4033]">{item.emoji}</span>
                    </div>
                    <div className="flex flex-col">
                      <p className="font-semibold leading-[20px] text-[#5c4033] text-[14px]">{item.title}</p>
                      <div className="flex gap-[2px] leading-[20px] text-[#8b7355] text-[12px]">
                        <p>{item.subtitle}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center leading-[0]">
                    <p
                      className={`font-medium leading-[20px] text-[14px] text-right ${
                        item.isPositive ? 'text-[#389e0d]' : 'text-[#8b7355]'
                      }`}
                    >
                      {item.isPositive ? '+ ' : '- '}{formatCurrency(item.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-[#8B7355] mb-2">No activity yet</p>
              <p className="text-sm text-[#8B7355]">Track your net worth over time to see changes</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
