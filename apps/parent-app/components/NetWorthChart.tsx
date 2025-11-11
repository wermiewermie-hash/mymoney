'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { Snapshot } from '@/lib/types/database.types'
import { useCurrency } from '@/lib/context/CurrencyContext'
import Card from '@/components/Card'

interface NetWorthChartProps {
  snapshots: Snapshot[]
}

export default function NetWorthChart({ snapshots }: NetWorthChartProps) {
  const { formatCurrency, currency, exchangeRate } = useCurrency()

  console.log('📈 CHART: Starting chart data generation')
  console.log('📈 CHART: Raw snapshots received:', snapshots.length)

  if (snapshots.length === 0) {
    console.log('📈 CHART: No snapshots - returning empty state')
    return (
      <Card className="text-center">
        <div className="text-4xl mb-3">📈</div>
        <p className="font-bold text-[#5C4033] mb-2">No History Yet</p>
        <p className="text-[#8B7355] text-sm">
          Add some assets to start tracking your net worth over time!
        </p>
      </Card>
    )
  }

  // Step 1: Extract dates from timestamps and deduplicate
  console.log('📈 CHART: Step 1 - Extracting dates and deduplicating')
  const snapshotsByDate = new Map<string, number>()

  snapshots.forEach((snapshot, index) => {
    // Parse the timestamp (e.g., "2025-11-10T00:00:00+00:00")
    const timestamp = new Date(snapshot.snapshot_date)

    // Extract the date in UTC to avoid timezone shifts
    const year = timestamp.getUTCFullYear()
    const month = String(timestamp.getUTCMonth() + 1).padStart(2, '0')
    const day = String(timestamp.getUTCDate()).padStart(2, '0')
    const dateKey = `${year}-${month}-${day}`

    // Keep the latest value for this date (snapshots are ordered ascending, so later ones win)
    snapshotsByDate.set(dateKey, Number(snapshot.total_net_worth))

    console.log(`   ${index + 1}. ${snapshot.snapshot_date} → ${dateKey} = $${snapshot.total_net_worth}`)
  })

  console.log(`📈 CHART: Deduplicated to ${snapshotsByDate.size} unique dates`)

  // Step 2: Sort by date and format for chart
  console.log('📈 CHART: Step 2 - Sorting and formatting for chart')
  const chartData = Array.from(snapshotsByDate.entries())
    .sort((a, b) => {
      const dateA = new Date(a[0] + 'T12:00:00')
      const dateB = new Date(b[0] + 'T12:00:00')
      return dateA.getTime() - dateB.getTime()
    })
    .map(([dateKey, value]) => {
      const date = new Date(dateKey + 'T12:00:00')
      const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      console.log(`   ${dateKey} → "${formatted}" = $${value}`)
      return {
        date: formatted,
        netWorth: value,
      }
    })

  console.log('📈 CHART: Final chart data:', chartData)
  console.log('📈 CHART: ✅ Chart data generation complete')

  return (
    <Card>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-[#E3F2FD] rounded-2xl flex items-center justify-center">
          <span className="text-2xl">📈</span>
        </div>
        <div>
          <h3 className="text-[#5C4033]">Growth Over Time</h3>
          <p className="text-sm text-[#8B7355]">Net worth history</p>
        </div>
      </div>
      <div className="outline-none [&_*]:outline-none">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: '#8B7355' }}
            stroke="#E0E0E0"
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#8B7355' }}
            stroke="#E0E0E0"
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => {
              if (currency === 'USD') {
                return `$${Math.round(value / 1000)}k`
              } else {
                const jpy = value * exchangeRate
                return `¥${Math.round(jpy / 1000)}k`
              }
            }}
            width={45}
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
            formatter={(value: number) => formatCurrency(value)}
          />
          <Line
            type="monotone"
            dataKey="netWorth"
            stroke="#52C41A"
            strokeWidth={3}
            dot={{ fill: '#52C41A', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
      </div>
    </Card>
  )
}
