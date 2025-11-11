'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Sparkles, ChevronRight } from 'lucide-react'
import { motion, useInView } from 'motion/react'
import StarProgress from '@/components/StarProgress'
import { useCurrency } from '@/lib/context/CurrencyContext'
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'
import { Progress } from '@/components/ui/Progress'
import WelcomeCarousel from '@/components/WelcomeCarousel'
import { markWelcomeSeen } from '@/app/actions/profile'
import type { Asset } from '@/lib/types/database.types'
import Card from '@/components/Card'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()
  const [showCarousel, setShowCarousel] = useState(!hasSeenWelcome)

  // Track viewport visibility for each card
  const [progressCardInView, setProgressCardInView] = useState(false)
  const [goalCardInView, setGoalCardInView] = useState(false)
  const [assetsCardInView, setAssetsCardInView] = useState(false)

  const handleDismissCarousel = async () => {
    setShowCarousel(false)
    await markWelcomeSeen()
  }

  // Color palette harmonizing with the app's design
  const colorPalette = [
    '#52C41A', // Green (stocks/growth)
    '#0bd2ec', // Cyan (cash)
    '#4a90e2', // Blue
    '#9b59b6', // Purple
    '#FFA93D', // Orange
    '#FFD740', // Gold/Yellow
    '#15acc0', // Turquoise
    '#389e0d', // Dark green
    '#ff9500', // Amber
    '#52c4a8', // Teal
  ]

  // Prepare asset breakdown for pie chart - assign unique color to each account
  const assetBreakdown = assets.map((asset, index) => ({
    id: asset.id,
    name: asset.name,
    value: asset.current_value,
    type: asset.type,
    color: asset.type === 'debt' ? '#9E9E9E' : colorPalette[index % colorPalette.length]
  })).sort((a, b) => {
    // Sort order: stock first, then cash, then debt last
    const order = { stock: 1, cash: 2, debt: 3 }
    return (order[a.type as keyof typeof order] || 2) - (order[b.type as keyof typeof order] || 2)
  })

  // Filter debt out of pie chart data (but keep it for legend)
  const pieChartData = assetBreakdown.filter(item => item.type !== 'debt')

  // Prepare timeline data - show all history up to 6 months
  const generateTimelineData = () => {
    if (snapshots.length === 0) return []

    const today = new Date()
    const sixMonthsAgo = new Date(today)
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    // Find the earliest snapshot
    const earliestSnapshot = snapshots.reduce((earliest, current) => {
      const currentDate = new Date(current.snapshot_date)
      const earliestDate = new Date(earliest.snapshot_date)
      return currentDate < earliestDate ? current : earliest
    })

    const firstDate = new Date(earliestSnapshot.snapshot_date)

    // Determine cutoff date: if account is newer than 6 months, use first date, otherwise use 6 months ago
    const cutoffDate = firstDate > sixMonthsAgo ? firstDate : sixMonthsAgo

    // Filter snapshots to only include those after the cutoff date
    const filteredSnapshots = snapshots.filter(snapshot => {
      return new Date(snapshot.snapshot_date) >= cutoffDate
    })

    // Convert to chart format
    return filteredSnapshots.map(snapshot => {
      const date = new Date(snapshot.snapshot_date)
      return {
        month: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: snapshot.total_net_worth
      }
    })
  }

  const timelineData = generateTimelineData()

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
            <Sparkles className="w-8 h-8 fill-[#FFD740] stroke-none" />
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
            <Sparkles className="w-8 h-8 fill-[#FFD740] stroke-none" />
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
            <Sparkles className="w-8 h-8 fill-[#FFD740] stroke-none" />
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
            <Sparkles className="w-8 h-8 fill-[#FFD740] stroke-none" />
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
            <Sparkles className="w-8 h-8 fill-[#FFD740] stroke-none" />
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
            <Sparkles className="w-8 h-8 fill-[#FFD740] stroke-none" />
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
            <Sparkles className="w-8 h-8 fill-[#FFD740] stroke-none" />
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
            <Sparkles className="w-8 h-8 fill-[#FFD740] stroke-none" />
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
            <Sparkles className="w-8 h-8 fill-[#FFD740] stroke-none" />
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
            <Sparkles className="w-8 h-8 fill-[#FFD740] stroke-none" />
          </motion.div>

          <div className="absolute bottom-0 h-[170px] left-0 rounded-[24px] w-full border-[0.592px] border-[rgba(0,0,0,0.1)] border-solid shadow-[0px_8px_8px_0px_rgba(0,0,0,0.14)]" style={{ backgroundImage: 'linear-gradient(rgb(255, 255, 255) 0%, rgb(255, 248, 225) 100%)' }}>
            <div className="text-center pt-[79px] pb-6">
              <div className="text-[#5C4033] font-lora font-semibold" style={{ fontSize: '48px', lineHeight: '48px' }}>{formatCurrency(totalNetWorth)}</div>
            </div>
          </div>

          {/* Illustration */}
          <div className="absolute h-[140px] left-1/2 top-[-18px] -translate-x-1/2 w-[140px] overflow-hidden">
            <img
              alt="Money illustration"
              className="absolute max-w-none"
              style={{
                height: '116.2%',
                left: '-40.52%',
                top: '-3.62%',
                width: '185.91%'
              }}
              src="/55e7760cadc7ed914731026b6310ff4e8252991e.png"
            />
          </div>
        </div>
      </div>

      {/* Content Cards */}
      <div className="px-6 space-y-4">
        {assets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4 }}
          >
            <Card className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-[#5C4033] mb-2">
              No Assets Yet
            </h3>
            <p className="text-[#8B7355] mb-6">
              Tap the button above to add your first asset and start tracking your net worth!
            </p>
          </Card>
          </motion.div>
        ) : (
          <>
            {/* My Progress - Area Chart */}
            {snapshots.length > 0 && (
              <Card
                onViewportEnter={() => setProgressCardInView(true)}
                viewport={{ once: true, margin: "-100px" }}
              >
                <div
                  className="flex items-center justify-between py-2 mb-6 cursor-pointer"
                  onClick={() => router.push('/dashboard/history')}
                >
                  <h3 className="text-[#5C4033] font-semibold" style={{ fontSize: '18px', lineHeight: '28px' }}>My Progress</h3>
                  <ChevronRight className="w-5 h-5 text-[#1E1E1E]" />
                </div>

                <div className="h-[216px] py-3 mb-6 outline-none [&_*]:outline-none">
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
                        formatter={(value: number) => [formatCurrency(value), 'Net Worth']}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#52C41A"
                        strokeWidth={3}
                        fill="url(#colorValue)"
                        animationBegin={progressCardInView ? 0 : undefined}
                        animationDuration={800}
                        isAnimationActive={progressCardInView}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

            {/* Savings Goal Card */}
            <Card
              onClick={goal ? () => router.push('/dashboard/goals') : undefined}
              onViewportEnter={() => setGoalCardInView(true)}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="flex items-center justify-between py-2 mb-6">
                <h3 className="text-[#5C4033] font-semibold" style={{ fontSize: '18px', lineHeight: '28px' }}>{goalName}</h3>
                {goal && <ChevronRight className="w-5 h-5 text-[#1E1E1E]" />}
              </div>

              {goal ? (
                <>
                  {/* Goal Visual - Star Progress */}
                  <div className="relative flex items-center justify-center mb-6">
                    <StarProgress progress={goalProgress} size={182} inView={goalCardInView} />
                  </div>

                  {/* Goal Details */}
                  <div className="flex justify-between items-start px-3">
                    <div>
                      <p className="text-[#8B7355] mb-1" style={{ fontSize: '14px', lineHeight: '20px' }}>Saved</p>
                      <p className="text-[#5C4033]" style={{ fontSize: '18px', lineHeight: '28px' }}>{formatCurrency(goalCurrent)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#8B7355] mb-1" style={{ fontSize: '14px', lineHeight: '20px' }}>Goal</p>
                      <p className="text-[#5C4033]" style={{ fontSize: '18px', lineHeight: '28px' }}>{formatCurrency(goalTarget)}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎯</div>
                  <p className="text-[#5C4033] mb-4">Create your savings goal</p>
                  <Link href="/dashboard/goals">
                    <button className="bg-gradient-to-b from-[#52C41A] to-[#389E0D] text-white font-semibold px-6 py-3 rounded-[18px] shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform">
                      Set your goal
                    </button>
                  </Link>
                </div>
              )}
            </Card>

            {/* What I own - Pie Chart */}
            {assetBreakdown.length > 0 ? (
              <Card
                onClick={() => router.push('/dashboard/accounts')}
                onViewportEnter={() => setAssetsCardInView(true)}
                viewport={{ once: true, margin: "-100px" }}
              >
                <div className="flex items-center justify-between py-2">
                  <h3 className="text-[#5C4033] font-semibold" style={{ fontSize: '18px', lineHeight: '28px' }}>What I own</h3>
                  <ChevronRight className="w-5 h-5 text-[#1E1E1E]" />
                </div>

                {/* Pie Chart */}
                <div className="mt-0 mb-3 outline-none [&_*]:outline-none" style={{ height: '212px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        animationBegin={assetsCardInView ? 0 : undefined}
                        animationDuration={800}
                        isAnimationActive={assetsCardInView}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="space-y-2">
                  {assetBreakdown.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-[#5C4033]" style={{ fontSize: '14px', lineHeight: '20px' }}>{item.name}</span>
                      </div>
                      <span className="text-[#5C4033]" style={{ fontSize: '14px', lineHeight: '20px' }}>
                        {item.type === 'debt' ? '-' : ''}{formatCurrency(Math.abs(item.value))}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <Card onViewportEnter={() => setAssetsCardInView(true)} viewport={{ once: true, margin: "-100px" }}>
                <div className="flex items-center justify-between py-2 mb-4">
                  <h3 className="text-[#5C4033] font-semibold" style={{ fontSize: '18px', lineHeight: '28px' }}>What I own</h3>
                </div>
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">💰</div>
                  <p className="text-[#5C4033] mb-4">Start by adding your money</p>
                  <Link href="/dashboard/add-asset?returnUrl=%2Fdashboard">
                    <button className="bg-gradient-to-b from-[#52C41A] to-[#389E0D] text-white font-semibold px-6 py-3 rounded-[18px] shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform">
                      Add an account
                    </button>
                  </Link>
                </div>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Welcome Carousel */}
      {showCarousel && <WelcomeCarousel onDismiss={handleDismissCarousel} />}
    </>
  )
}
