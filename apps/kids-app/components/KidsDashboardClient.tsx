'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Sparkles, ChevronRight, Trash2, Pencil } from 'lucide-react'
import { motion, useMotionValue, useTransform, animate } from 'motion/react'
import StarProgress from '@/components/StarProgress'
import { useCurrency } from '@/lib/context/CurrencyContext'
import Card from '@/components/Card'
import { useRouter } from 'next/navigation'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import StockModal from '@/components/StockModal'
import CashModal from '@/components/CashModal'
import Modal from '@/components/Modal'
import { deleteAsset } from '@/app/actions/assets'
import { deleteGoal, updateGoal, createGoal } from '@/app/actions/goals'
import { ConfettiEffect } from '@/components/ConfettiEffect'
import GiftNotification from '@/components/GiftNotification'
import type { StockGift } from '@/app/actions/gifts'

interface Goal {
  id: string
  name: string
  emoji: string
  target_amount: number
  current_amount: number
  user_id: string
}

interface StockAsset {
  id: string
  name: string
  shares?: number
  current_value: number
  price_per_share?: number
}

interface CashAsset {
  id: string
  name: string
  current_value: number
}

interface Snapshot {
  snapshot_date: string
  total_net_worth: number
}

interface KidsDashboardClientProps {
  totalNetWorth: number
  googleStock: StockAsset | null
  cash: CashAsset | null
  snapshots: Snapshot[]
  goal: Goal | null
  pendingGifts: StockGift[]
}

// Component to display animated net worth value
function AnimatedNetWorth({ value, formatCurrency }: { value: any, formatCurrency: (n: number) => string }) {
  const [displayValue, setDisplayValue] = useState(() => value.get())

  useEffect(() => {
    const unsubscribe = value.on('change', (latest: number) => {
      setDisplayValue(Math.round(latest))
    })
    return unsubscribe
  }, [value])

  return (
    <div className="text-[#5C4033] font-lora font-semibold" style={{ fontSize: '48px', lineHeight: '48px' }}>
      {formatCurrency(displayValue)}
    </div>
  )
}

export default function KidsDashboardClient({ totalNetWorth, googleStock, cash, snapshots, goal, pendingGifts }: KidsDashboardClientProps) {
  const { formatCurrency } = useCurrency()
  const router = useRouter()
  const [activeGiftId, setActiveGiftId] = useState<string | null>(null)

  // Auto-open first gift modal on mount if there are pending gifts
  useEffect(() => {
    if (pendingGifts.length > 0 && !activeGiftId) {
      setActiveGiftId(pendingGifts[0].id)
    }
  }, [pendingGifts, activeGiftId])

  // Calculate changes from snapshots
  const getChangeFromDate = (targetDate: Date) => {
    if (snapshots.length === 0) return 0

    // Find the snapshot closest to the target date
    const targetTime = targetDate.getTime()
    let closestSnapshot = snapshots[0]
    let smallestDiff = Math.abs(new Date(snapshots[0].snapshot_date).getTime() - targetTime)

    snapshots.forEach(snapshot => {
      const snapshotTime = new Date(snapshot.snapshot_date).getTime()
      const diff = Math.abs(snapshotTime - targetTime)
      if (snapshotTime <= targetTime && diff < smallestDiff) {
        closestSnapshot = snapshot
        smallestDiff = diff
      }
    })

    return totalNetWorth - closestSnapshot.total_net_worth
  }

  // Get start of this month
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const changeThisMonth = getChangeFromDate(startOfMonth)

  // Get start of this year
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const changeThisYear = getChangeFromDate(startOfYear)

  // Refs for scrolling to cards
  const stockCardRef = useRef<HTMLDivElement>(null)
  const cashCardRef = useRef<HTMLDivElement>(null)
  const goalCardRef = useRef<HTMLDivElement>(null)

  // Track viewport visibility for each card
  const [progressCardInView, setProgressCardInView] = useState(false)
  const [stockCardInView, setStockCardInView] = useState(false)
  const [cashCardInView, setCashCardInView] = useState(false)
  const [goalCardInView, setGoalCardInView] = useState(false)

  // Track if we've done initial animations
  const [hasAnimatedStockOnLoad, setHasAnimatedStockOnLoad] = useState(false)
  const [hasAnimatedCashOnLoad, setHasAnimatedCashOnLoad] = useState(false)

  // Net worth flipboard animation
  const netWorthMotionValue = useMotionValue(0)
  const roundedNetWorth = useTransform(netWorthMotionValue, (latest) => Math.round(latest))

  // Modal states
  const [isStockModalOpen, setIsStockModalOpen] = useState(false)
  const [isCashModalOpen, setIsCashModalOpen] = useState(false)
  const [isDeleteStockModalOpen, setIsDeleteStockModalOpen] = useState(false)
  const [isDeleteCashModalOpen, setIsDeleteCashModalOpen] = useState(false)
  const [isDeleteGoalModalOpen, setIsDeleteGoalModalOpen] = useState(false)
  const [isEditGoalModalOpen, setIsEditGoalModalOpen] = useState(false)
  const [isCreateGoalModalOpen, setIsCreateGoalModalOpen] = useState(false)
  const [isUpdateGoalSavingsModalOpen, setIsUpdateGoalSavingsModalOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [lastUpdatedCard, setLastUpdatedCard] = useState<'stock' | 'cash' | 'goal' | null>(null)
  const [celebrateStar, setCelebrateStar] = useState(false)
  const [celebrateStock, setCelebrateStock] = useState(false)
  const [celebrateCash, setCelebrateCash] = useState(false)
  const [editGoalName, setEditGoalName] = useState('')
  const [editGoalEmoji, setEditGoalEmoji] = useState('🎮')
  const [editGoalTarget, setEditGoalTarget] = useState('')
  const [createGoalName, setCreateGoalName] = useState('')
  const [createGoalEmoji, setCreateGoalEmoji] = useState('🎮')
  const [createGoalTarget, setCreateGoalTarget] = useState('')
  const [createGoalCurrent, setCreateGoalCurrent] = useState('0')
  const [updateGoalAmount, setUpdateGoalAmount] = useState('')

  // Debug logging for confetti state
  useEffect(() => {
    if (showConfetti) {
      console.log('🎊 Dashboard: showConfetti is TRUE')
    }
  }, [showConfetti])

  // Animate net worth number on mount (flipboard effect)
  useEffect(() => {
    // Start from a value close to the target to animate just the last 2 digits
    const startValue = Math.max(0, totalNetWorth - (Math.random() * 50 + 20))
    netWorthMotionValue.set(startValue)

    const controls = animate(netWorthMotionValue, totalNetWorth, {
      duration: 0.6,
      ease: [0.45, 0.05, 0.55, 0.95] // gentler easing
    })
    return controls.stop
  }, [totalNetWorth, netWorthMotionValue])

  // Trigger jiggle animation for stock image on first appear
  useEffect(() => {
    if (stockCardInView && googleStock && !hasAnimatedStockOnLoad) {
      setHasAnimatedStockOnLoad(true)
      setCelebrateStock(true)
      setTimeout(() => setCelebrateStock(false), 1400)
    }
  }, [stockCardInView, googleStock, hasAnimatedStockOnLoad])

  // Trigger jiggle animation for cash image on first appear
  useEffect(() => {
    if (cashCardInView && cash && !hasAnimatedCashOnLoad) {
      setHasAnimatedCashOnLoad(true)
      setCelebrateCash(true)
      setTimeout(() => setCelebrateCash(false), 1400)
    }
  }, [cashCardInView, cash, hasAnimatedCashOnLoad])

  // Prepare timeline data - show all history up to 6 months
  const generateTimelineData = () => {
    console.log('📈 CHART: Starting chart data generation')
    console.log('📈 CHART: Raw snapshots received:', snapshots.length)

    if (snapshots.length === 0) {
      console.log('📈 CHART: No snapshots - returning empty array')
      return []
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
      snapshotsByDate.set(dateKey, snapshot.total_net_worth)

      console.log(`   ${index + 1}. ${snapshot.snapshot_date} → ${dateKey} = $${snapshot.total_net_worth}`)
    })

    console.log(`📈 CHART: Deduplicated to ${snapshotsByDate.size} unique dates`)

    // Step 2: Filter to last 6 months
    const today = new Date()
    const sixMonthsAgo = new Date(today)
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    console.log('📈 CHART: Step 2 - Filtering to last 6 months')
    console.log(`   Today: ${today.toISOString().split('T')[0]}`)
    console.log(`   6 months ago: ${sixMonthsAgo.toISOString().split('T')[0]}`)

    const filteredEntries = Array.from(snapshotsByDate.entries()).filter(([dateKey, _]) => {
      const date = new Date(dateKey + 'T12:00:00') // Use noon to avoid timezone issues
      return date >= sixMonthsAgo
    })

    console.log(`📈 CHART: Filtered to ${filteredEntries.length} dates in last 6 months`)

    // Step 3: Sort by date and format for chart
    console.log('📈 CHART: Step 3 - Sorting and formatting for chart')
    const chartData = filteredEntries
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
          month: formatted,
          value
        }
      })

    console.log('📈 CHART: Final chart data:', chartData)
    console.log('📈 CHART: ✅ Chart data generation complete')

    return chartData
  }

  const timelineData = generateTimelineData()

  // Goal data
  const goalCurrent = goal?.current_amount || 0
  const goalTarget = goal?.target_amount || 1
  const goalProgress = (goalCurrent / goalTarget) * 100
  const goalEmoji = goal?.emoji || '🎯'
  const goalName = goal?.name || 'Your Goal'

  // Delete handlers
  const handleDeleteStock = async () => {
    if (!googleStock) return

    setDeleteLoading(true)
    setDeleteError(null)

    const result = await deleteAsset(googleStock.id)

    if (result.error) {
      setDeleteError(result.error)
      setDeleteLoading(false)
    } else {
      router.refresh()
      setIsDeleteStockModalOpen(false)
      setDeleteLoading(false)
    }
  }

  const handleDeleteCash = async () => {
    if (!cash) return

    setDeleteLoading(true)
    setDeleteError(null)

    const result = await deleteAsset(cash.id)

    if (result.error) {
      setDeleteError(result.error)
      setDeleteLoading(false)
    } else {
      router.refresh()
      setIsDeleteCashModalOpen(false)
      setDeleteLoading(false)
    }
  }

  const handleDeleteGoal = async () => {
    if (!goal) return

    setDeleteLoading(true)
    setDeleteError(null)

    const result = await deleteGoal(goal.id)

    if (result.error) {
      setDeleteError(result.error)
      setDeleteLoading(false)
    } else {
      router.refresh()
      setIsDeleteGoalModalOpen(false)
      setDeleteLoading(false)
    }
  }

  const handleUpdateGoal = async () => {
    if (!goal) return

    setDeleteLoading(true)
    setDeleteError(null)

    const formData = new FormData()
    formData.append('name', editGoalName)
    formData.append('emoji', editGoalEmoji)
    formData.append('targetAmount', editGoalTarget)

    const result = await updateGoal(goal.id, formData)

    if (result?.error) {
      setDeleteError(result.error)
      setDeleteLoading(false)
    } else {
      router.refresh()
      setIsEditGoalModalOpen(false)
      setDeleteLoading(false)
    }
  }

  const handleUpdateGoalSavings = async () => {
    if (!goal) return

    setDeleteLoading(true)
    setDeleteError(null)

    const amountNum = parseFloat(updateGoalAmount)
    if (isNaN(amountNum) || amountNum < 0) {
      setDeleteError('Please enter a valid amount')
      setDeleteLoading(false)
      return
    }

    const formData = new FormData()
    formData.append('currentAmount', updateGoalAmount)

    const result = await updateGoal(goal.id, formData)

    if (result?.error) {
      setDeleteError(result.error)
      setDeleteLoading(false)
    } else {
      setDeleteLoading(false)
      setLastUpdatedCard('goal')
      if (showConfetti) {
        setShowConfetti(false)
      }
      setShowConfetti(true)

      // Trigger star jiggle animation
      setCelebrateStar(true)
      setTimeout(() => {
        setCelebrateStar(false)
      }, 1400) // Reset after animation completes (0.7s delay + 0.6s duration + buffer)

      setTimeout(() => {
        setIsUpdateGoalSavingsModalOpen(false)
        router.refresh()
      }, 600)
    }
  }

  const handleCreateGoal = async () => {
    setDeleteLoading(true)
    setDeleteError(null)

    const formData = new FormData()
    formData.append('name', createGoalName)
    formData.append('emoji', createGoalEmoji)
    formData.append('targetAmount', createGoalTarget)
    formData.append('currentAmount', createGoalCurrent)

    const result = await createGoal(formData)

    if (result?.error) {
      setDeleteError(result.error)
      setDeleteLoading(false)
    } else {
      setDeleteLoading(false)
      setLastUpdatedCard('goal')
      if (showConfetti) {
        setShowConfetti(false)
      }
      setShowConfetti(true)

      // Trigger star jiggle animation
      setCelebrateStar(true)
      setTimeout(() => {
        setCelebrateStar(false)
      }, 1400) // Reset after animation completes (0.7s delay + 0.6s duration + buffer)

      setTimeout(() => {
        setIsCreateGoalModalOpen(false)
        router.refresh()
      }, 600)
    }
  }

  return (
    <>
      <ConfettiEffect
        trigger={showConfetti}
        onComplete={() => {
          setShowConfetti(false)
          // Scroll to the updated card after confetti completes
          setTimeout(() => {
            if (lastUpdatedCard === 'stock' && stockCardRef.current) {
              stockCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
            } else if (lastUpdatedCard === 'cash' && cashCardRef.current) {
              cashCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
            } else if (lastUpdatedCard === 'goal' && goalCardRef.current) {
              goalCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
            setLastUpdatedCard(null)
          }, 100)
        }}
      />

      {/* Gift Notifications - Show as modal */}
      {activeGiftId && pendingGifts.find(g => g.id === activeGiftId) && (
        <GiftNotification
          gift={pendingGifts.find(g => g.id === activeGiftId)!}
          isOpen={true}
          onClose={() => {
            // Close current gift and open next one if available
            const currentIndex = pendingGifts.findIndex(g => g.id === activeGiftId)
            const nextGift = pendingGifts[currentIndex + 1]

            if (nextGift) {
              setActiveGiftId(nextGift.id)
            } else {
              setActiveGiftId(null)
            }
          }}
        />
      )}

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

          <div className="absolute bottom-0 h-[170px] left-0 rounded-[24px] w-full border-[0.592px] border-[rgba(0,0,0,0.1)] border-solid shadow-[0px_8px_8px_0px_rgba(0,0,0,0.14)]" style={{ backgroundImage: 'linear-gradient(rgb(255, 255, 255) 0%, rgb(255, 248, 225) 100%)' }}>
            <div className="text-center pt-[79px] pb-6">
              <AnimatedNetWorth value={roundedNetWorth} formatCurrency={formatCurrency} />
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
        {/* My Progress - Area Chart */}
        {snapshots.length > 0 && (
          <Card
            onViewportEnter={() => setProgressCardInView(true)}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="flex items-center justify-between py-2 mb-6">
              <h3 className="text-[#5C4033] font-semibold" style={{ fontSize: '18px', lineHeight: '28px' }}>My Progress</h3>
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
                    width={60}
                    tickFormatter={(value) => `$${value}`}
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

        {/* Google Stock Card */}
        <Card
          ref={stockCardRef}
          onViewportEnter={() => setStockCardInView(true)}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="flex items-center justify-between py-2 mb-4">
            <h3 className="text-[#5C4033] font-semibold" style={{ fontSize: '18px', lineHeight: '28px' }}>
              Google Stock
            </h3>
            {googleStock && (
              <button
                onClick={() => setIsDeleteStockModalOpen(true)}
                className="p-2 rounded-xl hover:bg-[#8B7355]/10 transition-colors"
              >
                <Trash2 className="w-5 h-5 text-[#8B7355]" />
              </button>
            )}
          </div>

          {googleStock ? (
            <>
              {/* Stock Visual */}
              <div className="flex items-center justify-center mb-6 px-8 pb-8 pt-[26px] bg-gradient-to-br from-[#52C41A]/10 to-[#389E0D]/10 rounded-2xl">
                <div className="text-center">
                  <div className="mb-2 flex justify-center">
                    <motion.img
                      src="/stocks.png"
                      alt="Stocks"
                      className="w-[80px] h-[80px]"
                      animate={celebrateStock ? {
                        rotate: [0, -8, 8, -6, 6, -4, 4, 0]
                      } : {}}
                      transition={{
                        duration: 0.6,
                        ease: "easeInOut",
                        delay: 0.7
                      }}
                    />
                  </div>
                  <p className="font-lora text-[#5c4033] font-semibold" style={{ fontSize: '32px', lineHeight: '1' }}>
                    {googleStock.shares || 0} share{(googleStock.shares || 0) !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Stock Details */}
              <div className="flex justify-between items-start px-3 mb-6">
                <div>
                  <p className="text-[#8B7355] mb-1" style={{ fontSize: '14px', lineHeight: '20px' }}>Total</p>
                  <p className="text-[#5C4033]" style={{ fontSize: '18px', lineHeight: '28px' }}>{formatCurrency(googleStock.current_value)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#8B7355] mb-1" style={{ fontSize: '14px', lineHeight: '20px' }}>Share price</p>
                  <p className="text-[#5C4033]" style={{ fontSize: '18px', lineHeight: '28px' }}>{formatCurrency(googleStock.price_per_share || 0)}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center pt-2 pb-2 mb-0">
              <div className="mb-4 flex justify-center">
                <img src="/stocks.png" alt="Stocks" className="w-[160px] h-[160px]" />
              </div>
              <p className="text-[#5C4033] mb-6">Add your Google stock</p>
            </div>
          )}

          {/* Full-width action button */}
          <button
            onClick={() => setIsStockModalOpen(true)}
            className="w-full bg-gradient-to-b from-[#52C41A] to-[#389E0D] text-white font-semibold py-3 rounded-[18px] shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            {googleStock ? 'Update stocks' : 'Add stocks'}
          </button>
        </Card>

        {/* Cash Card */}
        <Card
          ref={cashCardRef}
          onViewportEnter={() => setCashCardInView(true)}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="flex items-center justify-between py-2 mb-4">
            <h3 className="text-[#5C4033] font-semibold" style={{ fontSize: '18px', lineHeight: '28px' }}>
              Cash
            </h3>
            {cash && (
              <button
                onClick={() => setIsDeleteCashModalOpen(true)}
                className="p-2 rounded-xl hover:bg-[#8B7355]/10 transition-colors"
              >
                <Trash2 className="w-5 h-5 text-[#8B7355]" />
              </button>
            )}
          </div>

          {cash ? (
            <>
              {/* Cash Visual */}
              <div className="flex items-center justify-center mb-6 px-8 pb-8 pt-[26px] bg-gradient-to-br from-[#0bd2ec]/10 to-[#15acc0]/10 rounded-2xl">
                <div className="text-center">
                  <div className="mb-2 flex justify-center">
                    <motion.img
                      src="/cash.png"
                      alt="Cash"
                      className="w-[80px] h-[80px]"
                      animate={celebrateCash ? {
                        rotate: [0, -8, 8, -6, 6, -4, 4, 0]
                      } : {}}
                      transition={{
                        duration: 0.6,
                        ease: "easeInOut",
                        delay: 0.7
                      }}
                    />
                  </div>
                  <p className="font-lora text-[#5c4033] font-semibold" style={{ fontSize: '32px', lineHeight: '1' }}>
                    {formatCurrency(cash.current_value)}
                  </p>
                </div>
              </div>

              {/* Cash Details */}
              <div className="flex justify-between items-start px-3 mb-6">
                <div>
                  <p className="text-[#8B7355] mb-1" style={{ fontSize: '14px', lineHeight: '20px' }}>This month</p>
                  <p className={`${changeThisMonth >= 0 ? 'text-[#52C41A]' : 'text-[#FF6B6B]'}`} style={{ fontSize: '18px', lineHeight: '28px' }}>
                    {changeThisMonth >= 0 ? '+' : ''}{formatCurrency(changeThisMonth)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[#8B7355] mb-1" style={{ fontSize: '14px', lineHeight: '20px' }}>This year</p>
                  <p className={`${changeThisYear >= 0 ? 'text-[#52C41A]' : 'text-[#FF6B6B]'}`} style={{ fontSize: '18px', lineHeight: '28px' }}>
                    {changeThisYear >= 0 ? '+' : ''}{formatCurrency(changeThisYear)}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 mb-6">
              <div className="mb-4 flex justify-center">
                <img src="/cash.png" alt="Cash" className="w-[160px] h-[160px]" />
              </div>
              <p className="text-[#5C4033]">Add your cash</p>
            </div>
          )}

          {/* Full-width action button */}
          <button
            onClick={() => setIsCashModalOpen(true)}
            className="w-full bg-gradient-to-b from-[#0bd2ec] to-[#15acc0] text-white font-semibold py-3 rounded-[18px] shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            {cash ? 'Update cash' : 'Add cash'}
          </button>
        </Card>

        {/* Savings Goal Card */}
        <Card
          ref={goalCardRef}
          onViewportEnter={() => setGoalCardInView(true)}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="flex items-center justify-between py-2 mb-6">
            <h3 className="text-[#5C4033] font-semibold" style={{ fontSize: '18px', lineHeight: '28px' }}>{goalName}</h3>
            <div className="flex items-center gap-2">
              {goal && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditGoalName(goal.name)
                    setEditGoalEmoji(goal.emoji)
                    setEditGoalTarget(goal.target_amount.toString())
                    setIsEditGoalModalOpen(true)
                  }}
                  className="p-2 rounded-xl hover:bg-[#8B7355]/10 transition-colors"
                >
                  <Pencil className="w-5 h-5 text-[#8B7355]" />
                </button>
              )}
            </div>
          </div>

          {goal ? (
            <>
              {/* Goal Visual - Star Progress */}
              <div className="relative flex items-center justify-center mb-6">
                <StarProgress progress={goalProgress} size={182} inView={goalCardInView} celebrate={celebrateStar} />
                {goalProgress >= 100 && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <p className="font-lora text-[#5c4033] font-semibold text-center px-4" style={{ fontSize: '32px', lineHeight: '1.2' }}>
                      Congrats!<br />You did it!
                    </p>
                  </div>
                )}
              </div>

              {/* Goal Details */}
              <div className="flex justify-between items-start px-3 mb-6">
                <div>
                  <p className="text-[#8B7355] mb-1" style={{ fontSize: '14px', lineHeight: '20px' }}>Saved</p>
                  <p className="text-[#5C4033]" style={{ fontSize: '18px', lineHeight: '28px' }}>{formatCurrency(goalCurrent)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#8B7355] mb-1" style={{ fontSize: '14px', lineHeight: '20px' }}>Goal</p>
                  <p className="text-[#5C4033]" style={{ fontSize: '18px', lineHeight: '28px' }}>{formatCurrency(goalTarget)}</p>
                </div>
              </div>

              {/* Update savings button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setUpdateGoalAmount(goalCurrent.toString())
                  setIsUpdateGoalSavingsModalOpen(true)
                }}
                className="w-full bg-gradient-to-b from-[#FFD740] to-[#FFA93D] text-white font-semibold py-3 rounded-[18px] shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                Update savings
              </button>
            </>
          ) : (
            <>
              <div className="text-center py-8 mb-6">
                <div className="mb-4 flex justify-center">
                  <img src="/goal.png" alt="Goal" className="w-[160px] h-[160px]" />
                </div>
                <p className="text-[#5C4033]">Create your savings goal</p>
              </div>

              {/* Full-width action button */}
              <button
                onClick={() => setIsCreateGoalModalOpen(true)}
                className="w-full bg-gradient-to-b from-[#FFD740] to-[#FFA93D] text-white font-semibold py-3 rounded-[18px] shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                Set your goal
              </button>
            </>
          )}
        </Card>
      </div>

      {/* Stock Modal */}
      <StockModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        existingShares={googleStock?.shares || 0}
        onSuccess={() => {
          console.log('📢 Stock onSuccess called, setting showConfetti to true')
          setLastUpdatedCard('stock')
          setShowConfetti(true)

          // Trigger stock jiggle animation
          setCelebrateStock(true)
          setTimeout(() => {
            setCelebrateStock(false)
          }, 1400)
        }}
      />

      {/* Cash Modal */}
      <CashModal
        isOpen={isCashModalOpen}
        onClose={() => setIsCashModalOpen(false)}
        existingAmount={cash?.current_value || 0}
        onSuccess={() => {
          console.log('📢 Cash onSuccess called, setting showConfetti to true')
          setLastUpdatedCard('cash')
          setShowConfetti(true)

          // Trigger cash jiggle animation
          setCelebrateCash(true)
          setTimeout(() => {
            setCelebrateCash(false)
          }, 1400)
        }}
      />

      {/* Delete Stock Modal */}
      <Modal isOpen={isDeleteStockModalOpen} onClose={() => setIsDeleteStockModalOpen(false)} loading={deleteLoading}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#52C41A] to-[#389E0D] rounded-full mb-4 shadow-lg">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-[#5C4033] mb-2">Delete Google Stock?</h2>
          <p className="text-[#8B7355] mb-4">
            This will permanently delete your Google stock information. This action cannot be undone.
          </p>
          <p className="text-sm text-[#52C41A] font-semibold">
            Are you sure?
          </p>
        </div>

        {deleteError && (
          <div className="flex gap-3 items-start p-4 bg-red-50 rounded-2xl">
            <span className="text-2xl shrink-0">⚠️</span>
            <p className="text-[#FF6B6B] font-medium">{deleteError}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => setIsDeleteStockModalOpen(false)}
            disabled={deleteLoading}
            className="flex-1 bg-[#E0E0E0] text-[#5C4033] font-bold py-3 px-6 rounded-2xl transition-all hover:bg-[#D0D0D0] active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteStock}
            disabled={deleteLoading}
            className="flex-1 bg-gradient-to-r from-[#52C41A] to-[#389E0D] text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50"
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>

      {/* Delete Cash Modal */}
      <Modal isOpen={isDeleteCashModalOpen} onClose={() => setIsDeleteCashModalOpen(false)} loading={deleteLoading}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#0bd2ec] to-[#15acc0] rounded-full mb-4 shadow-lg">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-[#5C4033] mb-2">Delete Cash?</h2>
          <p className="text-[#8B7355] mb-4">
            This will permanently delete your cash information. This action cannot be undone.
          </p>
          <p className="text-sm text-[#0bd2ec] font-semibold">
            Are you sure?
          </p>
        </div>

        {deleteError && (
          <div className="flex gap-3 items-start p-4 bg-red-50 rounded-2xl">
            <span className="text-2xl shrink-0">⚠️</span>
            <p className="text-[#FF6B6B] font-medium">{deleteError}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => setIsDeleteCashModalOpen(false)}
            disabled={deleteLoading}
            className="flex-1 bg-[#E0E0E0] text-[#5C4033] font-bold py-3 px-6 rounded-2xl transition-all hover:bg-[#D0D0D0] active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteCash}
            disabled={deleteLoading}
            className="flex-1 bg-gradient-to-r from-[#0bd2ec] to-[#15acc0] text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50"
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>

      {/* Edit Goal Modal */}
      <Modal isOpen={isEditGoalModalOpen} onClose={() => !deleteLoading && setIsEditGoalModalOpen(false)} loading={deleteLoading}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#5C4033]">Edit Your Goal</h2>
          <button
            onClick={() => {
              setIsEditGoalModalOpen(false)
              setIsDeleteGoalModalOpen(true)
            }}
            disabled={deleteLoading}
            className="p-2 rounded-full hover:bg-[#8B7355]/10 transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-5 w-5 text-[#8B7355]" />
          </button>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#5C4033] mb-2">Goal Name</label>
          <input
            type="text"
            value={editGoalName}
            onChange={(e) => setEditGoalName(e.target.value)}
            className="w-full px-4 py-3 bg-[#E3F2FD] border-0 rounded-2xl focus:ring-2 focus:ring-[#FF9933] text-[#5C4033] placeholder-[#8B7355] outline-none"
            placeholder="e.g., Video Game Console"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#5C4033] mb-2">Choose Icon</label>
          <div className="grid grid-cols-5 gap-2">
            {['🎮', '🚗', '🏠', '✈️', '💻', '🎸', '⚽', '🎨', '🎯', '💎'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => setEditGoalEmoji(emoji)}
                className={`aspect-square rounded-2xl text-2xl transition-all flex items-center justify-center ${
                  editGoalEmoji === emoji
                    ? 'bg-gradient-to-br from-[#FFA93D] to-[#FFD740] scale-110'
                    : 'bg-[#E3F2FD] hover:bg-[#D0E8F2]'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#5C4033] mb-2">Target Amount</label>
          <input
            type="number"
            step="1"
            inputMode="numeric"
            value={editGoalTarget}
            onChange={(e) => setEditGoalTarget(e.target.value)}
            className="w-full px-4 py-3 bg-[#E3F2FD] border-0 rounded-2xl focus:ring-2 focus:ring-[#FF9933] text-[#5C4033] placeholder-[#8B7355] outline-none"
            placeholder="450"
          />
        </div>

        {deleteError && (
          <div className="flex gap-3 items-start p-4 bg-red-50 rounded-2xl">
            <span className="text-2xl shrink-0">⚠️</span>
            <p className="text-[#FF6B6B] font-medium">{deleteError}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => setIsEditGoalModalOpen(false)}
            disabled={deleteLoading}
            className="flex-1 bg-[#E0E0E0] text-[#5C4033] font-bold py-3 px-6 rounded-2xl transition-all hover:bg-[#D0D0D0] active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateGoal}
            disabled={deleteLoading || !editGoalName || !editGoalTarget}
            className="flex-1 bg-gradient-to-r from-[#52C41A] to-[#389E0D] text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50"
          >
            {deleteLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </Modal>

      {/* Create Goal Modal */}
      <Modal isOpen={isCreateGoalModalOpen} onClose={() => !deleteLoading && setIsCreateGoalModalOpen(false)} loading={deleteLoading}>
        <h2 className="text-xl font-bold text-[#5C4033]">Create Your Goal</h2>

        <div>
          <label className="block text-sm font-semibold text-[#5C4033] mb-2">Goal Name</label>
          <input
            type="text"
            value={createGoalName}
            onChange={(e) => setCreateGoalName(e.target.value)}
            className="w-full px-4 py-3 bg-[#E3F2FD] border-0 rounded-2xl focus:ring-2 focus:ring-[#FF9933] text-[#5C4033] placeholder-[#8B7355] outline-none"
            placeholder="e.g., Video Game Console"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#5C4033] mb-2">Choose Icon</label>
          <div className="grid grid-cols-5 gap-2">
            {['🎮', '🚗', '🏠', '✈️', '💻', '🎸', '⚽', '🎨', '🎯', '💎'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => setCreateGoalEmoji(emoji)}
                className={`aspect-square rounded-2xl text-2xl transition-all flex items-center justify-center ${
                  createGoalEmoji === emoji
                    ? 'bg-gradient-to-br from-[#FFA93D] to-[#FFD740] scale-110'
                    : 'bg-[#E3F2FD] hover:bg-[#D0E8F2]'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#5C4033] mb-2">Target Amount</label>
          <input
            type="number"
            step="1"
            inputMode="numeric"
            value={createGoalTarget}
            onChange={(e) => setCreateGoalTarget(e.target.value)}
            className="w-full px-4 py-3 bg-[#E3F2FD] border-0 rounded-2xl focus:ring-2 focus:ring-[#FF9933] text-[#5C4033] placeholder-[#8B7355] outline-none"
            placeholder="450"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#5C4033] mb-2">Current Savings (optional)</label>
          <input
            type="number"
            step="1"
            inputMode="numeric"
            value={createGoalCurrent}
            onChange={(e) => setCreateGoalCurrent(e.target.value)}
            onFocus={(e) => {
              if (e.target.value === '0') {
                setCreateGoalCurrent('')
              }
            }}
            className="w-full px-4 py-3 bg-[#E3F2FD] border-0 rounded-2xl focus:ring-2 focus:ring-[#FF9933] text-[#5C4033] placeholder-[#8B7355] outline-none"
            placeholder="0.00"
          />
        </div>

        {deleteError && (
          <div className="flex gap-3 items-start p-4 bg-red-50 rounded-2xl">
            <span className="text-2xl shrink-0">⚠️</span>
            <p className="text-[#FF6B6B] font-medium">{deleteError}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => setIsCreateGoalModalOpen(false)}
            disabled={deleteLoading}
            className="flex-1 bg-[#E0E0E0] text-[#5C4033] font-bold py-3 px-6 rounded-2xl transition-all hover:bg-[#D0D0D0] active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateGoal}
            disabled={deleteLoading || !createGoalName || !createGoalTarget}
            className="flex-1 bg-gradient-to-r from-[#52C41A] to-[#389E0D] text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50"
          >
            {deleteLoading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </Modal>

      {/* Update Goal Savings Modal */}
      <Modal isOpen={isUpdateGoalSavingsModalOpen} onClose={() => !deleteLoading && setIsUpdateGoalSavingsModalOpen(false)} loading={deleteLoading}>
        <h2 className="text-xl font-bold text-[#5C4033]">
          How much have you saved for your goal?
        </h2>

        <Card className="my-9">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5c4033] text-[36px] font-semibold">
              $
            </span>
            <input
              type="number"
              value={updateGoalAmount}
              onChange={(e) => setUpdateGoalAmount(e.target.value)}
              step="0.01"
              min="0"
              autoFocus
              inputMode="decimal"
              className="w-full pl-16 pr-4 py-4 bg-transparent border-0 rounded-2xl focus:outline-none text-[#5c4033] text-[36px] font-semibold text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0"
            />
          </div>
        </Card>

        {deleteError && (
          <div className="flex gap-3 items-start p-4 bg-red-50 rounded-2xl">
            <span className="text-2xl shrink-0">⚠️</span>
            <p className="text-[#FF6B6B] font-medium">{deleteError}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => setIsUpdateGoalSavingsModalOpen(false)}
            disabled={deleteLoading}
            className="flex-1 bg-[#E0E0E0] text-[#5C4033] font-bold py-3 px-6 rounded-2xl transition-all hover:bg-[#D0D0D0] active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateGoalSavings}
            disabled={deleteLoading || !updateGoalAmount || parseFloat(updateGoalAmount) < 0}
            className="flex-1 bg-gradient-to-r from-[#FFD740] to-[#FFA93D] text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50"
          >
            {deleteLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </Modal>

      {/* Delete Goal Modal */}
      <Modal isOpen={isDeleteGoalModalOpen} onClose={() => setIsDeleteGoalModalOpen(false)} loading={deleteLoading}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#FFD740] to-[#FFA93D] rounded-full mb-4 shadow-lg">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-[#5C4033] mb-2">Delete Goal?</h2>
          <p className="text-[#8B7355] mb-4">
            This will permanently delete your savings goal. This action cannot be undone.
          </p>
          <p className="text-sm text-[#FFA93D] font-semibold">
            Are you sure?
          </p>
        </div>

        {deleteError && (
          <div className="flex gap-3 items-start p-4 bg-red-50 rounded-2xl">
            <span className="text-2xl shrink-0">⚠️</span>
            <p className="text-[#FF6B6B] font-medium">{deleteError}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => setIsDeleteGoalModalOpen(false)}
            disabled={deleteLoading}
            className="flex-1 bg-[#E0E0E0] text-[#5C4033] font-bold py-3 px-6 rounded-2xl transition-all hover:bg-[#D0D0D0] active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteGoal}
            disabled={deleteLoading}
            className="flex-1 bg-gradient-to-r from-[#FFD740] to-[#FFA93D] text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50"
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>
    </>
  )
}
