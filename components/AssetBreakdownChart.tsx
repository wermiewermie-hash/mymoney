'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { Asset } from '@/lib/types/database.types'
import { useCurrency } from '@/lib/context/CurrencyContext'

interface AssetBreakdownChartProps {
  assets: Asset[]
}

const COLORS = {
  bank_account: '#00BCD4', // cyan/blue
  stocks: '#52C41A', // green
  retirement_account: '#FFC107', // yellow
  index_funds: '#9C27B0', // purple
}

const LABELS = {
  bank_account: 'Bank Accounts',
  stocks: 'Stocks',
  retirement_account: 'Retirement',
  index_funds: 'Index Funds',
}

export default function AssetBreakdownChart({ assets }: AssetBreakdownChartProps) {
  const { formatCurrency } = useCurrency()

  if (assets.length === 0) {
    return null
  }

  // Group assets by type and sum their values
  const breakdown = assets.reduce((acc, asset) => {
    const value = Number(asset.current_value)
    if (acc[asset.type]) {
      acc[asset.type] += value
    } else {
      acc[asset.type] = value
    }
    return acc
  }, {} as Record<string, number>)

  // Format data for the chart
  const chartData = Object.entries(breakdown).map(([type, value]) => ({
    name: LABELS[type as keyof typeof LABELS] || type,
    value,
    type,
  }))

  return (
    <div className="kids-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-[#FFF3E0] rounded-2xl flex items-center justify-center">
          <span className="text-2xl">📊</span>
        </div>
        <div>
          <h3 className="text-[#5C4033]">Asset Breakdown</h3>
          <p className="text-sm text-[#8B7355]">By category</p>
        </div>
      </div>
      <div className="outline-none [&_*]:outline-none">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            innerRadius={50}
            outerRadius={70}
            paddingAngle={5}
            fill="#8884d8"
            dataKey="value"
            strokeWidth={0}
          >
            {chartData.map((entry) => (
              <Cell
                key={`cell-${entry.type}`}
                fill={COLORS[entry.type as keyof typeof COLORS]}
              />
            ))}
          </Pie>
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
        </PieChart>
      </ResponsiveContainer>
      </div>

      {/* Custom legend */}
      <div className="flex justify-center gap-4 mt-4 flex-wrap">
        {chartData.map((entry) => (
          <div key={entry.type} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: COLORS[entry.type as keyof typeof COLORS] }}
            />
            <span className="text-sm text-[#5C4033]">
              {entry.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
