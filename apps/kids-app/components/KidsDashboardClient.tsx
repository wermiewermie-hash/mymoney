'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, ChevronRight, Trash2 } from 'lucide-react'
import { motion } from 'motion/react'
import StarProgress from '@/components/StarProgress'
import { useCurrency } from '@/lib/context/CurrencyContext'
import Card from '@/components/Card'
import { useRouter } from 'next/navigation'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import StockModal from '@/components/StockModal'
import CashModal from '@/components/CashModal'
import Modal from '@/components/Modal'
import { deleteAsset } from '@/app/actions/assets'
import { deleteGoal } from '@/app/actions/goals'

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
}

export default function KidsDashboardClient({ totalNetWorth, googleStock, cash, snapshots, goal }: KidsDashboardClientProps) {
  const { formatCurrency } = useCurrency()
  const router = useRouter()

  // Track viewport visibility for each card
  const [progressCardInView, setProgressCardInView] = useState(false)
  const [stockCardInView, setStockCardInView] = useState(false)
  const [goalCardInView, setGoalCardInView] = useState(false)

  // Modal states
  const [isStockModalOpen, setIsStockModalOpen] = useState(false)
  const [isCashModalOpen, setIsCashModalOpen] = useState(false)
  const [isDeleteStockModalOpen, setIsDeleteStockModalOpen] = useState(false)
  const [isDeleteCashModalOpen, setIsDeleteCashModalOpen] = useState(false)
  const [isDeleteGoalModalOpen, setIsDeleteGoalModalOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

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

        {/* Google Stock Card */}
        <Card
          onViewportEnter={() => setStockCardInView(true)}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="flex items-center justify-between py-2 mb-4">
            <h3 className="text-[#5C4033] font-semibold" style={{ fontSize: '18px', lineHeight: '28px' }}>
              Google Stock 📈
            </h3>
            {googleStock && (
              <button
                onClick={() => setIsDeleteStockModalOpen(true)}
                className="p-2 rounded-xl hover:bg-[#52C41A]/10 transition-colors"
              >
                <Trash2 className="w-5 h-5 text-[#52C41A]" />
              </button>
            )}
          </div>

          {googleStock ? (
            <>
              {/* Stock Visual */}
              <div className="flex items-center justify-center mb-6 p-8 bg-gradient-to-br from-[#52C41A]/10 to-[#389E0D]/10 rounded-2xl">
                <div className="text-center">
                  <div className="text-6xl mb-4">📈</div>
                  <p className="text-[#8B7355] text-sm mb-2">{googleStock.shares || 0} share{(googleStock.shares || 0) !== 1 ? 's' : ''}</p>
                  <p className="text-[#5C4033] font-bold text-3xl">{formatCurrency(googleStock.current_value)}</p>
                  <p className="text-[#8B7355] text-xs mt-1">
                    {formatCurrency(googleStock.price_per_share || 0)} per share
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 mb-6">
              <div className="text-6xl mb-4">📈</div>
              <p className="text-[#5C4033]">Add your Google stock</p>
            </div>
          )}

          {/* Full-width action button */}
          <button
            onClick={() => setIsStockModalOpen(true)}
            className="w-full bg-gradient-to-b from-[#52C41A] to-[#389E0D] text-white font-semibold py-3 rounded-[18px] shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            {googleStock ? 'Update stocks' : 'Add your stock'}
          </button>
        </Card>

        {/* Cash Card */}
        <Card>
          <div className="flex items-center justify-between py-2 mb-4">
            <h3 className="text-[#5C4033] font-semibold" style={{ fontSize: '18px', lineHeight: '28px' }}>
              Cash 💰
            </h3>
            {cash && (
              <button
                onClick={() => setIsDeleteCashModalOpen(true)}
                className="p-2 rounded-xl hover:bg-[#0bd2ec]/10 transition-colors"
              >
                <Trash2 className="w-5 h-5 text-[#0bd2ec]" />
              </button>
            )}
          </div>

          {cash ? (
            <>
              {/* Cash Visual */}
              <div className="flex items-center justify-center mb-6 p-8 bg-gradient-to-br from-[#0bd2ec]/10 to-[#15acc0]/10 rounded-2xl">
                <div className="text-center">
                  <div className="text-6xl mb-4">💰</div>
                  <p className="text-[#5C4033] font-bold text-3xl">{formatCurrency(cash.current_value)}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 mb-6">
              <div className="text-6xl mb-4">💰</div>
              <p className="text-[#5C4033]">Add your cash</p>
            </div>
          )}

          {/* Full-width action button */}
          <button
            onClick={() => setIsCashModalOpen(true)}
            className="w-full bg-gradient-to-b from-[#0bd2ec] to-[#15acc0] text-white font-semibold py-3 rounded-[18px] shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            {cash ? 'Update' : 'Add cash'}
          </button>
        </Card>

        {/* Savings Goal Card */}
        <Card
          onClick={goal ? () => router.push('/dashboard/goals') : undefined}
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
                    setIsDeleteGoalModalOpen(true)
                  }}
                  className="p-2 rounded-xl hover:bg-[#FFD740]/10 transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-[#FFD740]" />
                </button>
              )}
              {goal && <ChevronRight className="w-5 h-5 text-[#1E1E1E]" />}
            </div>
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
                <button className="bg-gradient-to-b from-[#FFD740] to-[#FFA93D] text-white font-semibold px-6 py-3 rounded-[18px] shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform">
                  Set your goal
                </button>
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* Stock Modal */}
      <StockModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        existingShares={googleStock?.shares || 0}
      />

      {/* Cash Modal */}
      <CashModal
        isOpen={isCashModalOpen}
        onClose={() => setIsCashModalOpen(false)}
        existingAmount={cash?.current_value || 0}
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
