'use client'

import Link from 'next/link'
import { Star, TrendingUp, Edit, ArrowLeft, Trash2 } from 'lucide-react'
import { useCurrency } from '@/lib/context/CurrencyContext'
import { motion, AnimatePresence } from 'motion/react'
import { useState, useEffect, useMemo, useRef } from 'react'
import { updateGoal, deleteGoal, createGoal } from '@/app/actions/goals'
import { useRouter } from 'next/navigation'
import confetti from 'canvas-confetti'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'
import PageHeader, { HeaderButton } from '@/components/PageHeader'
import { pageStyles } from '@/lib/constants/pageStyles'
import Card from '@/components/Card'
import StarProgress from '@/components/StarProgress'
import type { GoalHistory } from '@/lib/types/database.types'
import { ConfettiEffect } from '@/components/ConfettiEffect'

interface Goal {
  id: string | null
  name: string
  target_amount: number
  current_amount: number
  emoji: string
  user_id: string
}

interface GoalsClientProps {
  goal: Goal
  goalHistory: GoalHistory[]
}

// Scrollable chart component with scroll to end behavior
function ScrollableChart({ monthlyData, goalAmount }: { monthlyData: any[], goalAmount: number }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate if content needs scrolling
  const numBars = monthlyData.length
  const barWidth = 40 // maxBarSize
  const spacing = 20 // approximate spacing between bars
  const estimatedWidth = numBars * (barWidth + spacing) + 100 // +100 for margins
  const containerWidth = containerRef.current?.clientWidth || 0
  const needsScroll = estimatedWidth > containerWidth

  useEffect(() => {
    // Scroll to the right end (most recent data) after a brief delay to ensure rendering
    const timer = setTimeout(() => {
      if (scrollRef.current && needsScroll) {
        const maxScroll = scrollRef.current.scrollWidth - scrollRef.current.clientWidth
        scrollRef.current.scrollLeft = maxScroll
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [monthlyData, needsScroll])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget
    const maxScroll = element.scrollWidth - element.clientWidth

    // Prevent scrolling past the left edge (negative scroll)
    if (element.scrollLeft < 0) {
      element.scrollLeft = 0
    }
    // Prevent scrolling past the right edge (to the "future")
    if (element.scrollLeft > maxScroll) {
      element.scrollLeft = maxScroll
    }
  }

  const chartWidth = needsScroll ? '700px' : '100%'

  return (
    <div
      ref={containerRef}
      className={needsScroll ? "overflow-x-auto overflow-y-hidden" : "overflow-hidden"}
      style={{
        width: 'calc(100% - 40px - 12px)',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
      }}
    >
      <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          width: chartWidth,
          height: '220px',
          minWidth: chartWidth,
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={monthlyData}
            margin={{ top: 10, right: 0, left: -60, bottom: 0 }}
            barGap={0}
            barCategoryGap="10%"
          >
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FBBF24" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#FFD740" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8B7355', fontSize: 12 }}
              padding={{ left: 0, right: 0 }}
            />
            <YAxis
              hide
              domain={[0, goalAmount]}
              width={0}
            />
            <Bar
              dataKey="amount"
              radius={[8, 8, 0, 0]}
              maxBarSize={40}
            >
              {monthlyData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="url(#barGradient)" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default function GoalsClient({ goal: initialGoal, goalHistory }: GoalsClientProps) {
  const { formatCurrency } = useCurrency()
  const router = useRouter()
  const [goal, setGoal] = useState(initialGoal)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isAtTop, setIsAtTop] = useState(true)
  const [celebrateStar, setCelebrateStar] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  // Helper function to scroll input into view on focus
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 300)
  }

  const handleBack = () => {
    router.back()
  }
  const [editName, setEditName] = useState(goal.name)
  const [editEmoji, setEditEmoji] = useState(goal.emoji)
  const [editTargetAmount, setEditTargetAmount] = useState(goal.target_amount.toString())
  const [updateAmount, setUpdateAmount] = useState(goal.current_amount.toString())
  const [loading, setLoading] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createEmoji, setCreateEmoji] = useState('🎮')
  const [createTarget, setCreateTarget] = useState('')
  const [createCurrent, setCreateCurrent] = useState('0')

  // Sync local state with prop when it changes (after router.refresh())
  useEffect(() => {
    setGoal(initialGoal)
    setEditName(initialGoal.name)
    setEditEmoji(initialGoal.emoji)
    setEditTargetAmount(initialGoal.target_amount.toString())
    setUpdateAmount(initialGoal.current_amount.toString())
  }, [initialGoal])

  const remainingAmount = goal.target_amount - goal.current_amount
  const progressPercentage = (goal.current_amount / goal.target_amount) * 100

  // Calculate monthly contribution data from goal history
  const monthlyData = useMemo(() => {
    if (goalHistory.length === 0) {
      return []
    }

    // Group history by month and calculate increments
    const monthlyMap = new Map<string, number>()

    // Sort history by date
    const sortedHistory = [...goalHistory].sort((a, b) =>
      new Date(a.change_date).getTime() - new Date(b.change_date).getTime()
    )

    // Calculate incremental changes by month
    let previousAmount = 0
    sortedHistory.forEach((entry) => {
      const date = new Date(entry.change_date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short' })

      const increment = entry.amount - previousAmount

      if (monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + increment)
      } else {
        monthlyMap.set(monthKey, increment)
      }

      previousAmount = entry.amount
    })

    // Convert to array and get last 12 months
    const data = Array.from(monthlyMap.entries())
      .map(([key, amount]) => {
        const [year, month] = key.split('-')
        const date = new Date(parseInt(year), parseInt(month) - 1)
        return {
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          amount: Math.abs(amount),
          key
        }
      })
      .slice(-12) // Most recent last (on right, next to Y axis)

    return data
  }, [goalHistory])

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      setIsAtTop(scrollTop < 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const triggerConfetti = () => {
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      }))
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      }))
    }, 250)
  }

  const handleEditSave = async () => {
    if (!goal.id) return
    setLoading(true)

    const formData = new FormData()
    formData.append('name', editName)
    formData.append('emoji', editEmoji)
    formData.append('targetAmount', editTargetAmount)

    const result = await updateGoal(goal.id, formData)

    if (result?.error) {
      alert(result.error)
    } else {
      setGoal({ ...goal, name: editName, emoji: editEmoji, target_amount: parseFloat(editTargetAmount) })
      setIsEditModalOpen(false)
      router.refresh()
    }
    setLoading(false)
  }

  const handleUpdateSave = async () => {
    if (!goal.id) return
    setLoading(true)

    const formData = new FormData()
    formData.append('currentAmount', updateAmount)

    const result = await updateGoal(goal.id, formData)

    if (result?.error) {
      alert(result.error)
    } else {
      const newAmount = parseFloat(updateAmount)
      setGoal({ ...goal, current_amount: newAmount })

      // Check if goal is reached
      const newProgress = (newAmount / goal.target_amount) * 100
      if (newProgress >= 100) {
        setCelebrateStar(true)
        setTimeout(() => setCelebrateStar(false), 1400) // 0.7s delay + 0.6s animation + 0.1s buffer
      }

      triggerConfetti()
      setTimeout(() => {
        setIsUpdateModalOpen(false)
      }, 300)
      router.refresh()
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!goal.id) return
    setLoading(true)

    const result = await deleteGoal(goal.id)

    if (result?.error) {
      alert(result.error)
      setLoading(false)
    } else {
      setIsDeleteModalOpen(false)
      setLoading(false)
      router.refresh()
    }
  }

  const handleCreateGoal = async () => {
    setLoading(true)

    const formData = new FormData()
    formData.append('name', createName)
    formData.append('emoji', createEmoji)
    formData.append('targetAmount', createTarget)
    formData.append('currentAmount', createCurrent)

    const result = await createGoal(formData)

    if (result?.error) {
      alert(result.error)
      setLoading(false)
    } else {
      setLoading(false)
      setShowConfetti(true)
    }
  }

  const emojiOptions = ['🎮', '🚗', '🏠', '✈️', '💻', '🎸', '⚽', '🎨', '🎯', '💎']

  // Zero state - no goal exists
  if (!goal.id) {
    return (
      <>
        <ConfettiEffect
          trigger={showConfetti}
          onComplete={() => {
            setIsCreateModalOpen(false)
            setShowConfetti(false)
            router.refresh()
          }}
        />
        <div className="min-h-screen pb-8" style={{ background: pageStyles.goal.background, backgroundAttachment: 'fixed' }}>
        {/* Header */}
        <div className="px-6 pt-7 pb-0">
          <PageHeader
            title="My Goal"
            buttonColor={pageStyles.goal.buttonColor}
            leftAction={
              <HeaderButton onClick={handleBack} color={pageStyles.goal.buttonColor}>
                <ArrowLeft className="h-5 w-5" />
              </HeaderButton>
            }
          />
        </div>

        {/* Zero State Card */}
        <div className="px-6">
          <Card className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-[#9C27B0] to-[#7B1FA2] rounded-full mb-6 shadow-lg">
              <span className="text-5xl">🎯</span>
            </div>
            <h2 className="text-2xl font-bold text-[#5C4033] mb-3">Create Your Goal</h2>
            <p className="text-[#8B7355] mb-6">
              Set a savings goal and track your progress toward something special!
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full bg-gradient-to-r from-[#52C41A] to-[#389E0D] text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              Create Goal
            </button>
          </Card>
        </div>

        {/* Create Goal Modal */}
        <AnimatePresence>
          {isCreateModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
              onClick={() => !loading && setIsCreateModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto"
              >
                <h2 className="text-xl font-bold text-[#5C4033]">Create Your Goal</h2>

                <div>
                  <label className="block text-sm font-semibold text-[#5C4033] mb-2">Goal Name</label>
                  <input
                    type="text"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    onFocus={handleInputFocus}
                    className="w-full px-4 py-3 bg-[#E3F2FD] border-0 rounded-2xl focus:ring-2 focus:ring-[#FF9933] text-[#5C4033] placeholder-[#8B7355]"
                    placeholder="e.g., Video Game Console"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#5C4033] mb-2">Choose Icon</label>
                  <div className="grid grid-cols-5 gap-2">
                    {emojiOptions.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setCreateEmoji(emoji)}
                        className={`aspect-square rounded-2xl text-2xl transition-all flex items-center justify-center ${
                          createEmoji === emoji
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
                    value={createTarget}
                    onChange={(e) => setCreateTarget(e.target.value)}
                    onFocus={handleInputFocus}
                    className="w-full px-4 py-3 bg-[#E3F2FD] border-0 rounded-2xl focus:ring-2 focus:ring-[#FF9933] text-[#5C4033] placeholder-[#8B7355]"
                    placeholder="450"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#5C4033] mb-2">Current Savings (optional)</label>
                  <input
                    type="number"
                    step="1"
                    inputMode="numeric"
                    value={createCurrent}
                    onChange={(e) => setCreateCurrent(e.target.value)}
                    onFocus={(e) => {
                      if (e.target.value === '0') {
                        setCreateCurrent('')
                      }
                      handleInputFocus(e)
                    }}
                    className="w-full px-4 py-3 bg-[#E3F2FD] border-0 rounded-2xl focus:ring-2 focus:ring-[#FF9933] text-[#5C4033] placeholder-[#8B7355]"
                    placeholder="0.00"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setIsCreateModalOpen(false)}
                    disabled={loading}
                    className="flex-1 bg-[#E0E0E0] text-[#5C4033] font-bold py-3 px-6 rounded-2xl transition-all hover:bg-[#D0D0D0] active:scale-95 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateGoal}
                    disabled={loading || !createName || !createTarget}
                    className="flex-1 bg-gradient-to-r from-[#52C41A] to-[#389E0D] text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen pb-8" style={{ background: pageStyles.goal.background, backgroundAttachment: 'fixed' }}>
      {/* Header */}
      <div className="px-6 pt-7 pb-0">
        <PageHeader
          title="My Goal"
          buttonColor={pageStyles.goal.buttonColor}
          leftAction={
            <HeaderButton onClick={handleBack} color={pageStyles.goal.buttonColor}>
              <ArrowLeft className="h-5 w-5" />
            </HeaderButton>
          }
          rightAction={
            <HeaderButton
              onClick={() => {
                setEditName(goal.name)
                setEditEmoji(goal.emoji)
                setEditTargetAmount(goal.target_amount.toString())
                setIsEditModalOpen(true)
              }}
              color={pageStyles.goal.buttonColor}
            >
              <Edit className="h-5 w-5" />
            </HeaderButton>
          }
        />
      </div>

      {/* Content */}
      <div className="px-6 space-y-4">
        {/* Goal Title Card with Image */}
        <div className="h-[240px] relative w-full">
          {/* The main card */}
          <div className="absolute bg-gradient-to-b from-[#ffffff] to-[#fff8e1] bottom-0 flex flex-col gap-[24px] h-[169.994px] left-0 pb-[24px] pt-[79.565px] px-[24px] rounded-[24px] w-full">
            <div className="absolute border-[0.572px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_8px_8px_0px_rgba(0,0,0,0.14)]" />

            <div className="h-[48.002px] w-full">
              <p className="font-lora font-semibold text-[#5c4033] text-center" style={{ fontSize: '24px', lineHeight: '30px' }}>{goal.name}</p>
            </div>
          </div>

          {/* Target Image */}
          <div className="absolute h-[140px] left-[calc(50%+0.088px)] top-[-19px] translate-x-[-50%] w-[140.903px]">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img
                alt=""
                className="absolute h-[128.69%] left-[-51.5%] max-w-none top-[-13.21%] w-[204.59%]"
                src="/3ba8b21fc0883109330c801a66eb33a69170e201.png"
              />
            </div>
          </div>
        </div>

        {/* Progress Card */}
        <Card noPadding>
          <div className="flex flex-col items-center size-full p-[25px]">
            {/* Info Banner */}
            <div className="bg-gradient-to-b from-[rgba(69,226,235,0.22)] to-[rgba(69,226,235,0.05)] flex h-[80px] items-center justify-center rounded-[12px] w-full mb-[24px]">
              <div className="flex gap-[8px] items-center justify-center text-[#5c4033]">
                <p className="font-normal text-[18px] leading-[28px]">{goal.emoji}</p>
                <p className="font-medium text-[14px] leading-[20px]">
                  {progressPercentage >= 100
                    ? "Congratulations! You reached your goal!"
                    : `Only ${formatCurrency(remainingAmount)} more to go!`}
                </p>
              </div>
            </div>

            {/* Star Progress Visualization */}
            <div className="relative flex items-center justify-center mb-[24px]" style={{ marginTop: '12px' }}>
              <StarProgress progress={progressPercentage} size={182} inView={true} celebrate={celebrateStar} />
            </div>

            {/* Saved and Goal amounts */}
            <div className="flex justify-between items-start px-3 w-full">
              <div>
                <p className="text-[#8B7355] mb-1" style={{ fontSize: '14px', lineHeight: '20px' }}>Saved</p>
                <p className="text-[#5C4033]" style={{ fontSize: '18px', lineHeight: '28px' }}>{formatCurrency(goal.current_amount)}</p>
              </div>
              <div className="text-right">
                <p className="text-[#8B7355] mb-1" style={{ fontSize: '14px', lineHeight: '20px' }}>Goal</p>
                <p className="text-[#5C4033]" style={{ fontSize: '18px', lineHeight: '28px' }}>{formatCurrency(goal.target_amount)}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* What I've Saved Card */}
        {monthlyData.length > 0 && (
          <Card noPadding>
            <div className="size-full overflow-hidden rounded-[24px]">
              <div className="flex flex-col gap-[35.995px] items-start pb-[24.568px] pt-[24.568px] pl-[24.568px] w-full">
                {/* Header */}
                <div className="w-full pr-[24.568px]">
                  <h3 className="font-semibold leading-[28px] text-[#5c4033] text-[18px]">What I've saved</h3>
                </div>

                {/* Chart with fixed Y-axis and scrollable bars */}
                <div className="h-[220px] w-full flex pr-0 gap-[12px]">
                  {/* Fixed Y-axis */}
                  <div className="flex-shrink-0 flex flex-col justify-end" style={{ width: '40px', height: '220px', paddingBottom: '30px' }}>
                    <div className="flex flex-col-reverse justify-between h-full">
                      {(() => {
                        const step = goal.target_amount / 4
                        return Array.from({ length: 5 }, (_, i) => (
                          <p key={i} className="text-[#8B7355] text-[12px] text-right pr-2">
                            {Math.round(i * step)}
                          </p>
                        ))
                      })()}
                    </div>
                  </div>

                  {/* Scrollable chart area */}
                  <ScrollableChart monthlyData={monthlyData} goalAmount={goal.target_amount} />
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Add Savings Button */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#45E2EB] via-[#45E2EB] to-transparent z-10"
        initial={{ y: 0 }}
        animate={{ y: isAtTop ? 0 : 200 }}
        transition={{ duration: 0.5, ease: [0.6, 0, 0.1, 1] }}
      >
        <button
          onClick={() => {
            setUpdateAmount(goal.current_amount.toString())
            setIsUpdateModalOpen(true)
          }}
          className="w-full h-16 text-lg shadow-2xl transition-all rounded-[18px] bg-gradient-to-b from-[#D061DE] to-[#B84BC4] text-white hover:from-[#B84BC4] hover:to-[#D061DE] active:scale-[0.98]"
        >
          <span>Add savings</span>
        </button>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#FF6B6B] to-[#FF5252] rounded-full mb-4 shadow-lg">
                  <span className="text-3xl">⚠️</span>
                </div>
                <h2 className="text-xl font-bold text-[#5C4033] mb-2">Delete Goal?</h2>
                <p className="text-[#8B7355] mb-4">
                  Are you sure you want to delete your goal "{goal.name}"? This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={loading}
                  className="flex-1 bg-[#E0E0E0] text-[#5C4033] font-bold py-3 px-6 rounded-2xl transition-all hover:bg-[#D0D0D0] active:scale-95 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-[#FF6B6B] to-[#FF5252] text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
            onClick={() => setIsEditModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 relative"
            >
              {/* Trash Icon in top right corner */}
              <button
                onClick={() => {
                  setIsEditModalOpen(false)
                  setIsDeleteModalOpen(true)
                }}
                disabled={loading}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#E3F2FD] transition-colors disabled:opacity-50"
              >
                <Trash2 className="h-5 w-5 text-[#5C4033]" />
              </button>

              <h2 className="text-xl font-bold text-[#5C4033] text-center">Edit Goal</h2>

              <div className="pb-3">
                <label className="block text-sm font-semibold text-[#5C4033] mb-2">Goal Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onFocus={handleInputFocus}
                  className="w-full px-4 py-3 bg-[#E3F2FD] border-0 rounded-2xl focus:ring-2 focus:ring-[#FF9933] text-[#5C4033] placeholder-[#8B7355]"
                  placeholder="e.g., Video Game Console"
                />
              </div>

              <div className="pb-3">
                <label className="block text-sm font-semibold text-[#5C4033] mb-2">Choose Icon</label>
                <div className="grid grid-cols-5 gap-2">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setEditEmoji(emoji)}
                      className={`aspect-square rounded-2xl text-2xl transition-all flex items-center justify-center ${
                        editEmoji === emoji
                          ? 'bg-gradient-to-br from-[#FFA93D] to-[#FFD740] scale-110'
                          : 'bg-[#E3F2FD] hover:bg-[#D0E8F2]'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pb-3">
                <label className="block text-sm font-semibold text-[#5C4033] mb-2">Goal Amount</label>
                <input
                  type="number"
                  step="1"
                  inputMode="numeric"
                  value={editTargetAmount}
                  onChange={(e) => setEditTargetAmount(e.target.value)}
                  onFocus={handleInputFocus}
                  className="w-full px-4 py-3 bg-[#E3F2FD] border-0 rounded-2xl focus:ring-2 focus:ring-[#FF9933] text-[#5C4033] placeholder-[#8B7355]"
                  placeholder="450"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={loading}
                  className="flex-1 bg-[#E0E0E0] text-[#5C4033] font-bold py-3 px-6 rounded-2xl transition-all hover:bg-[#D0D0D0] active:scale-95 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-[#52C41A] to-[#389E0D] text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Savings Modal */}
      <AnimatePresence>
        {isUpdateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
            onClick={() => !loading && setIsUpdateModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4"
            >
              <h2 className="text-xl font-bold text-[#5C4033]">Update Savings</h2>

              <div>
                <label className="block text-sm font-semibold text-[#5C4033] mb-2">Current Savings</label>
                <input
                  type="number"
                  step="1"
                  inputMode="numeric"
                  value={updateAmount}
                  onChange={(e) => setUpdateAmount(e.target.value)}
                  onFocus={handleInputFocus}
                  className="w-full px-4 py-3 bg-[#E3F2FD] border-0 rounded-2xl focus:ring-2 focus:ring-[#FF9933] text-[#5C4033] text-2xl font-bold"
                  placeholder="0"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsUpdateModalOpen(false)}
                  disabled={loading}
                  className="flex-1 bg-[#E0E0E0] text-[#5C4033] font-bold py-3 px-6 rounded-2xl transition-all hover:bg-[#D0D0D0] active:scale-95 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateSave}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-[#52C41A] to-[#389E0D] text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
