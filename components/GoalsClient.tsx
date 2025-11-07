'use client'

import Link from 'next/link'
import { Star, TrendingUp, Edit } from 'lucide-react'
import { useCurrency } from '@/lib/context/CurrencyContext'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { updateGoal, deleteGoal, createGoal } from '@/app/actions/goals'
import { useRouter } from 'next/navigation'
import confetti from 'canvas-confetti'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

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
}

export default function GoalsClient({ goal: initialGoal }: GoalsClientProps) {
  const { formatCurrency } = useCurrency()
  const router = useRouter()
  const [goal, setGoal] = useState(initialGoal)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

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
    setUpdateAmount(initialGoal.current_amount.toString())
  }, [initialGoal])

  const remainingAmount = goal.target_amount - goal.current_amount
  const progressPercentage = (goal.current_amount / goal.target_amount) * 100

  // Mock history data - in a real app, this would come from the database
  const historyData = [
    { month: 'Jan', value: 0 },
    { month: 'Feb', value: 100 },
    { month: 'Mar', value: 200 },
    { month: 'Apr', value: 280 },
    { month: 'May', value: goal.current_amount },
  ]

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

    const result = await updateGoal(goal.id, formData)

    if (result?.error) {
      alert(result.error)
    } else {
      setGoal({ ...goal, name: editName, emoji: editEmoji })
      setIsEditModalOpen(false)
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
      setGoal({ ...goal, current_amount: parseFloat(updateAmount) })
      triggerConfetti()
      setTimeout(() => {
        setIsUpdateModalOpen(false)
      }, 1000)
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
      setIsCreateModalOpen(false)
      setLoading(false)
      router.refresh()
    }
  }

  const emojiOptions = ['🎮', '🚗', '🏠', '✈️', '💻', '🎸', '⚽', '🎨', '🎯', '💎']

  // Zero state - no goal exists
  if (!goal.id) {
    return (
      <div className="min-h-screen pb-8">
        {/* Header */}
        <div className="px-6 pt-8 pb-0">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handleBack}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#FFA93D] to-[#FFD740] hover:opacity-90 text-white shadow-md transition-opacity"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-white text-2xl [text-shadow:rgba(0,0,0,0.1)_0px_4px_6px]">My Goal</h1>
            <div className="w-9" /> {/* Spacer */}
          </div>
        </div>

        {/* Zero State Card */}
        <div className="px-6">
          <div className="kids-card text-center">
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
          </div>
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
    )
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="px-6 pt-8 pb-0">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#FFA93D] to-[#FFD740] hover:opacity-90 text-white shadow-md transition-opacity"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-white text-2xl [text-shadow:rgba(0,0,0,0.1)_0px_4px_6px]">My Goal</h1>
          <button
            onClick={() => {
              setEditName(goal.name)
              setEditEmoji(goal.emoji)
              setIsEditModalOpen(true)
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#FFA93D] to-[#FFD740] hover:opacity-90 text-white shadow-md transition-opacity"
          >
            <Edit className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Goal Illustration */}
      <div className="px-6 mb-6">
        <div className="kids-card relative overflow-hidden bg-gradient-to-br from-white via-[#F0F9FF] to-[#E3F2FD]">
          {/* Decorative stars */}
          <div className="absolute top-4 right-4">
            <Star className="w-6 h-6 text-[#FFC107] fill-[#FFC107] animate-pulse" />
          </div>
          <div className="absolute top-12 right-16">
            <Star className="w-4 h-4 text-[#FFC107] fill-[#FFC107] animate-pulse" style={{ animationDelay: '0.2s' }} />
          </div>
          <div className="absolute top-8 left-8">
            <Star className="w-5 h-5 text-[#FFC107] fill-[#FFC107] animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>

          {/* Console Illustration */}
          <div className="relative py-12 flex justify-center items-center">
            <div className="relative">
              {/* Main console body */}
              <div className="w-64 h-40 bg-gradient-to-br from-[#5C4033] via-[#8B5A3C] to-[#5C4033] rounded-3xl shadow-2xl relative overflow-hidden">
                {/* Screen area */}
                <div className="absolute top-3 left-3 right-3 h-20 bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1e] rounded-2xl border-4 border-[#4a3829] shadow-inner">
                  <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#4A90E2] to-[#2E5C8A]">
                      <div className="absolute top-1 left-4 w-6 h-3 bg-white/40 rounded-full"></div>
                      <div className="absolute top-2 right-8 w-8 h-3 bg-white/30 rounded-full"></div>
                      <div className="absolute bottom-0 left-0 right-0 h-6 bg-[#52C41A]"></div>
                      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                        <div className="w-4 h-6 bg-[#FF6B6B] rounded-sm"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* D-pad */}
                <div className="absolute bottom-6 left-8 w-14 h-14">
                  <div className="relative w-full h-full">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-12 bg-gradient-to-b from-[#2d2d2d] to-[#1a1a1a] rounded"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-5 bg-gradient-to-r from-[#2d2d2d] to-[#1a1a1a] rounded"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#1a1a1a] rounded-full"></div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="absolute bottom-8 right-8 flex gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-[#FF6B6B] to-[#d94444] rounded-full shadow-lg border-2 border-[#4a3829]"></div>
                  <div className="w-6 h-6 bg-gradient-to-br from-[#52C41A] to-[#389E0D] rounded-full shadow-lg border-2 border-[#4a3829]"></div>
                </div>

                {/* Small buttons */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
                  <div className="w-8 h-2 bg-[#2d2d2d] rounded-full"></div>
                  <div className="w-8 h-2 bg-[#2d2d2d] rounded-full"></div>
                </div>
              </div>

              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-radial from-[#FFC107]/20 to-transparent blur-xl -z-10"></div>
            </div>
          </div>

          <div className="text-center pt-4">
            <h2 className="text-[#5C4033] mb-2">{goal.name}</h2>
            <p className="text-[#8B7355]">The ultimate gaming experience!</p>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="px-6 space-y-4">
        {/* Current Savings Card */}
        <div className="kids-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-[#8B7355] mb-1">Current Savings</p>
              <div className="text-4xl text-[#5C4033]">{formatCurrency(goal.current_amount)}</div>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#8B7355] mb-1">Goal</p>
              <div className="text-[18px] text-[#5C4033]">{formatCurrency(goal.target_amount)}</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2 mb-6">
            <div className="relative h-4 bg-[#E0E0E0] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#52C41A] to-[#389E0D] rounded-full"
              />
            </div>
            <div className="flex justify-between text-sm text-[#8B7355]">
              <span>{Math.round(progressPercentage)}% complete</span>
              <span>{formatCurrency(remainingAmount)} to go</span>
            </div>
          </div>

          {/* Milestone indicator */}
          <div className="bg-gradient-to-r from-[#FFF3E0] to-[#FFE4C4] rounded-2xl p-4 flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FFC107] to-[#FFA000] rounded-full flex items-center justify-center shadow-md flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[#8B5A3C]">You're almost there!</p>
              <p className="text-sm text-[#8B7355]">Keep saving to reach your goal</p>
            </div>
          </div>

          {/* Update Button */}
          <button
            onClick={() => {
              setUpdateAmount(goal.current_amount.toString())
              setIsUpdateModalOpen(true)
            }}
            className="w-full bg-gradient-to-r from-[#52C41A] to-[#389E0D] text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            Update Savings
          </button>
        </div>

        {/* History Card */}
        <div className="kids-card">
          <h3 className="text-[#5C4033] mb-4">Progress History</h3>
          <div className="h-48 outline-none [&_*]:outline-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="goalColorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9C27B0" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#9C27B0" stopOpacity={0}/>
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
                  stroke="#9C27B0"
                  strokeWidth={3}
                  fill="url(#goalColorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/dashboard/add-asset" className="kids-card text-center cursor-pointer hover:shadow-xl transition-all">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#52C41A] to-[#389E0D] rounded-2xl mb-3 shadow-md">
              <span className="text-2xl">💵</span>
            </div>
            <p className="text-[#5C4033]">Add Money</p>
          </Link>

          <Link href="/dashboard" className="kids-card text-center cursor-pointer hover:shadow-xl transition-all">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#00BCD4] to-[#0097A7] rounded-2xl mb-3 shadow-md">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-[#5C4033]">View History</p>
          </Link>
        </div>

        {/* Encouragement Card */}
        <div className="kids-card bg-gradient-to-br from-[#9C27B0] to-[#7B1FA2] text-white">
          <div className="flex items-center gap-4">
            <div className="text-5xl">🎉</div>
            <div>
              <h3 className="mb-1">Great Progress!</h3>
              <p className="text-sm text-white/90">
                You've saved {Math.round(progressPercentage)}% of your goal. Keep up the amazing work!
              </p>
            </div>
          </div>
        </div>

        {/* Delete Goal Button */}
        <div className="kids-card bg-gradient-to-br from-white to-[#FFEBEE]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B6B] to-[#FF5252] rounded-full flex items-center justify-center shadow-lg">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h3 className="text-[#5C4033] font-semibold">Delete Goal</h3>
              <p className="text-sm text-[#8B7355]">Permanently remove this goal</p>
            </div>
          </div>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="w-full bg-gradient-to-r from-[#FF6B6B] to-[#FF5252] text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            Delete Goal
          </button>
        </div>
      </div>

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
              className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4"
            >
              <h2 className="text-xl font-bold text-[#5C4033]">Edit Goal</h2>

              <div>
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

              <div>
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
