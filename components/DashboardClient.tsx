'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCurrency } from '@/lib/context/CurrencyContext'
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'
import { Progress } from '@/components/ui/Progress'
import WelcomeCarousel from '@/components/WelcomeCarousel'
import { markWelcomeSeen } from '@/app/actions/profile'
import type { Asset } from '@/lib/types/database.types'

interface Snapshot {
  snapshot_date: string
  total_net_worth: number
}

interface Goal {
  id: string
  name: string
  emoji: string
  target_amount: number
  current_amount: number
  user_id: string
}

interface DashboardClientProps {
  totalNetWorth: number
  assets: Asset[]
  snapshots: Snapshot[]
  goal: Goal | null
  hasSeenWelcome: boolean
}

export default function DashboardClient({ totalNetWorth, assets, snapshots, goal, hasSeenWelcome }: DashboardClientProps) {
  const { formatCurrency } = useCurrency()
  const [showCarousel, setShowCarousel] = useState(!hasSeenWelcome)

  const handleDismissCarousel = async () => {
    setShowCarousel(false)
    await markWelcomeSeen()
  }

  // Prepare asset breakdown for pie chart
  const assetBreakdown = assets.map(asset => ({
    name: asset.name,
    value: asset.current_value,
    type: asset.type,
    color: asset.type === 'stocks' ? '#52C41A' :
           asset.type === 'bank_account' ? '#9C27B0' :
           asset.type === 'debt' ? '#9E9E9E' : '#00BCD4'
  })).sort((a, b) => {
    // Sort order: stocks first, then bank_account, then debt last
    const order = { stocks: 1, bank_account: 2, debt: 3 }
    return (order[a.type as keyof typeof order] || 2) - (order[b.type as keyof typeof order] || 2)
  })

  // Filter debt out of pie chart data (but keep it for legend)
  const pieChartData = assetBreakdown.filter(item => item.type !== 'debt')

  // Prepare timeline data from snapshots
  const timelineData = snapshots.slice(-6).map((snapshot, index) => {
    const date = new Date(snapshot.snapshot_date)
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    return {
      month,
      value: snapshot.total_net_worth
    }
  })

  // Goal data from database
  const goalCurrent = goal?.current_amount || 0
  const goalTarget = goal?.target_amount || 1
  const goalProgress = (goalCurrent / goalTarget) * 100
  const goalEmoji = goal?.emoji || '🎯'
  const goalName = goal?.name || 'Your Goal'

  return (
    <>
      {/* Net Worth Card with animated sparkles */}
      <div className="px-6 pb-0">
        <div className="relative h-[240px] mb-4">
          {/* Decorative animated sparkles */}
          <motion.div
            className="absolute left-[20px] top-[10px]"
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Sparkles className="w-8 h-8 text-[#FFA93D] fill-[#FFD740]" />
          </motion.div>
          <motion.div
            className="absolute right-[25px] top-[15px]"
            animate={{
              y: [0, -8, 0],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          >
            <Sparkles className="w-8 h-8 text-[#FFA93D] fill-[#FFD740]" />
          </motion.div>
          <motion.div
            className="absolute left-[45px] bottom-[35px]"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3
            }}
          >
            <Sparkles className="w-8 h-8 text-[#FFA93D] fill-[#FFD740]" />
          </motion.div>
          <motion.div
            className="absolute right-[40px] bottom-[40px]"
            animate={{
              rotate: [0, -15, 15, 0],
              scale: [1, 1.15, 1]
            }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.8
            }}
          >
            <Sparkles className="w-8 h-8 text-[#FFA93D] fill-[#FFD740]" />
          </motion.div>
          <motion.div
            className="absolute left-[15px] top-[95px]"
            animate={{
              x: [0, 5, -5, 0],
              rotate: [0, 5, -5, 0],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.2
            }}
          >
            <Sparkles className="w-8 h-8 text-[#FFA93D] fill-[#FFD740]" />
          </motion.div>
          <motion.div
            className="absolute right-[15px] top-[65px]"
            animate={{
              rotate: [0, 20, -20, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 2.7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.0
            }}
          >
            <Sparkles className="w-8 h-8 text-[#FFA93D] fill-[#FFD740]" />
          </motion.div>
          <motion.div
            className="absolute left-[35%] top-[5px]"
            animate={{
              y: [0, 6, 0],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 3.3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.6
            }}
          >
            <Sparkles className="w-8 h-8 text-[#FFA93D] fill-[#FFD740]" />
          </motion.div>
          <motion.div
            className="absolute right-[60px] bottom-[15px]"
            animate={{
              x: [0, -4, 4, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 2.9,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.4
            }}
          >
            <Sparkles className="w-8 h-8 text-[#FFA93D] fill-[#FFD740]" />
          </motion.div>
          <motion.div
            className="absolute left-[60%] bottom-[20px]"
            animate={{
              rotate: [0, -10, 10, 0],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 3.1,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.7
            }}
          >
            <Sparkles className="w-8 h-8 text-[#FFA93D] fill-[#FFD740]" />
          </motion.div>
          <motion.div
            className="absolute left-[25%] bottom-[50px]"
            animate={{
              y: [0, -5, 0],
              scale: [1, 1.15, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 3.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.9
            }}
          >
            <Sparkles className="w-8 h-8 text-[#FFA93D] fill-[#FFD740]" />
          </motion.div>

          <div className="absolute bottom-0 h-[170px] left-0 rounded-[24px] w-full border-[0.592px] border-[rgba(0,0,0,0.1)] border-solid shadow-[0px_8px_8px_0px_rgba(0,0,0,0.14)]" style={{ backgroundImage: 'linear-gradient(rgb(255, 255, 255) 0%, rgb(255, 248, 225) 100%)' }}>
            <div className="text-center pt-[67px] pb-6">
              <div className="text-5xl text-[#5C4033] mb-1">{formatCurrency(totalNetWorth)}</div>
              <h2 className="text-[#5C4033]">Total</h2>
            </div>
          </div>

          {/* Illustration */}
          <div className="absolute h-[116px] left-1/2 top-0 -translate-x-1/2 w-[116px] overflow-hidden">
            <img
              alt="Money illustration"
              className="w-[140%] h-[140%] object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              src="/55e7760cadc7ed914731026b6310ff4e8252991e.png"
            />
          </div>
        </div>
      </div>

      {/* Content Cards */}
      <div className="px-6 space-y-4">
        {assets.length === 0 ? (
          <div className="kids-card text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-[#5C4033] mb-2">
              No Assets Yet
            </h3>
            <p className="text-[#8B7355] mb-6">
              Tap the button above to add your first asset and start tracking your net worth!
            </p>
          </div>
        ) : (
          <>
            {/* My Progress - Area Chart */}
            {timelineData.length > 0 && (
              <Link href="/dashboard/history" className="rounded-[24px] p-6 border-[0.592px] border-[rgba(0,0,0,0.1)] border-solid shadow-[0px_8px_8px_0px_rgba(0,0,0,0.14)] block hover:shadow-xl transition-shadow" style={{ backgroundImage: 'linear-gradient(rgb(255, 255, 255) 0%, rgb(255, 248, 225) 100%)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden">
                    <img
                      alt=""
                      className="w-[124.5px] h-[78px] object-cover object-center"
                      style={{ transform: 'translate(calc(-50% + 24px), calc(-22% + 12px))' }}
                      src="/fabdb3143d370089bb19fccafe4aaa3e4c004562.png"
                    />
                  </div>
                  <div>
                    <h3 className="text-[#5C4033]">My Progress</h3>
                  </div>
                </div>

                <div className="h-48 outline-none [&_*]:outline-none">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timelineData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
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
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#52C41A"
                        strokeWidth={3}
                        fill="url(#colorValue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Link>
            )}

            {/* What I own - Pie Chart */}
            {assetBreakdown.length > 0 && (
              <div className="rounded-[24px] p-6 border-[0.592px] border-[rgba(0,0,0,0.1)] border-solid shadow-[0px_8px_8px_0px_rgba(0,0,0,0.14)]" style={{ backgroundImage: 'linear-gradient(rgb(255, 255, 255) 0%, rgb(255, 248, 225) 100%)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden">
                    <img
                      alt=""
                      className="w-[124.5px] h-[78px] object-cover object-center"
                      style={{ transform: 'translate(calc(-50% + 24px), calc(-18% + 12px))' }}
                      src="/69444ef31be0f1c5b6089fd39f95e4c964529fb3.png"
                    />
                  </div>
                  <div>
                    <h3 className="text-[#5C4033]">What I own</h3>
                  </div>
                </div>

                {/* Pie Chart */}
                <div className="h-48 outline-none [&_*]:outline-none">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {assetBreakdown.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-[#5C4033]">
                        {item.name} {item.type === 'debt' ? `-${formatCurrency(item.value)}` : formatCurrency(item.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Types of money - List */}
            <Link href="/dashboard/accounts" className="rounded-[24px] p-6 border-[0.592px] border-[rgba(0,0,0,0.1)] border-solid shadow-[0px_8px_8px_0px_rgba(0,0,0,0.14)] block hover:shadow-xl transition-shadow" style={{ backgroundImage: 'linear-gradient(rgb(255, 255, 255) 0%, rgb(255, 248, 225) 100%)' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden">
                  <img
                    alt=""
                    className="w-[100.5px] h-[63px] object-cover object-center"
                    style={{ transform: 'translate(calc(-50% + 24px), calc(-12% + 12px))' }}
                    src="/b9b9950ef4c186e7bdd6237f8362f9deb2db47c3.png"
                  />
                </div>
                <div>
                  <h3 className="text-[#5C4033]">Types of money</h3>
                </div>
              </div>

              <div className="space-y-3">
                {assets.slice(0, 3).map((asset) => (
                  <div key={asset.id} className="flex items-center justify-between p-3 bg-[#F0F9FF] rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-lg">
                          {asset.type === 'stocks' ? '📈' :
                           asset.type === 'bank_account' ? '💵' :
                           asset.type === 'debt' ? '💸' : '📊'}
                        </span>
                      </div>
                      <div>
                        <p className="text-[#5C4033]">{asset.name}</p>
                        <p className="text-sm text-[#8B7355]">
                          {asset.shares ? `${asset.shares} shares` : asset.type.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[#5C4033]">
                        {asset.type === 'debt' ? `-${formatCurrency(asset.current_value)}` : formatCurrency(asset.current_value)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Link>

            {/* Savings Goal Card */}
            <Link
              href="/dashboard/goals"
              className="rounded-[24px] p-6 border-[0.592px] border-[rgba(0,0,0,0.1)] border-solid shadow-[0px_8px_8px_0px_rgba(0,0,0,0.14)] block hover:shadow-xl transition-shadow"
              style={{ backgroundImage: 'linear-gradient(rgb(255, 255, 255) 0%, rgb(255, 248, 225) 100%)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden">
                  <img
                    alt=""
                    className="w-[119.25px] h-[74.25px] object-cover object-center"
                    style={{ transform: 'translate(calc(-50% + 24px), calc(-17% + 12px))' }}
                    src="/dcc9736b6c40c21c90cc199d0eb3f6d6c42bd5f2.png"
                  />
                </div>
                <div>
                  <h3 className="text-[#5C4033]">{goalName}</h3>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-2xl text-[#5C4033]">{formatCurrency(goalCurrent)}</span>
                  <span className="text-[#8B7355]">of {formatCurrency(goalTarget)}</span>
                </div>

                <Progress value={goalProgress} className="h-3" />

                <div className="flex items-center gap-2 justify-center p-3 bg-gradient-to-r from-[#FFF3E0] to-[#FFE4C4] rounded-2xl">
                  <span className="text-2xl">{goalEmoji}</span>
                  <p className="text-sm text-[#8B5A3C]">Only {formatCurrency(goalTarget - goalCurrent)} more to go!</p>
                </div>
              </div>
            </Link>
          </>
        )}
      </div>

      {/* Welcome Carousel */}
      {showCarousel && <WelcomeCarousel onDismiss={handleDismissCarousel} />}
    </>
  )
}
