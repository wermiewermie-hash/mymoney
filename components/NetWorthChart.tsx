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

interface NetWorthChartProps {
  snapshots: Snapshot[]
}

export default function NetWorthChart({ snapshots }: NetWorthChartProps) {
  const { formatCurrency, currency, exchangeRate } = useCurrency()

  if (snapshots.length === 0) {
    return (
      <div className="kids-card text-center">
        <div className="text-4xl mb-3">📈</div>
        <p className="font-bold text-[#5C4033] mb-2">No History Yet</p>
        <p className="text-[#8B7355] text-sm">
          Add some assets to start tracking your net worth over time!
        </p>
      </div>
    )
  }

  // Format data for the chart
  const chartData = snapshots.map((snapshot) => ({
    date: new Date(snapshot.snapshot_date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    netWorth: Number(snapshot.total_net_worth),
  }))

  return (
    <div className="kids-card">
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
    </div>
  )
}
