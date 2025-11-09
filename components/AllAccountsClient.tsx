'use client'

import Link from 'next/link'
import { useCurrency } from '@/lib/context/CurrencyContext'
import type { Asset } from '@/lib/types/database.types'
import type { AssetHistory } from '@/lib/types/database.types'
import { useState, useEffect } from 'react'
import { deleteAsset } from '@/app/actions/assets'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ArrowLeft, Plus, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import PageHeader, { HeaderButton } from '@/components/PageHeader'
import { pageStyles } from '@/lib/constants/pageStyles'

interface AssetWithHistory extends Asset {
  history?: AssetHistory[]
}

interface AllAccountsClientProps {
  assets: AssetWithHistory[]
}

export default function AllAccountsClient({ assets }: AllAccountsClientProps) {
  const assetTypeEmojis: Record<string, string> = {
    cash: '💰',
    stock: '📈',
    debt: '💸',
    bank_account: '💰',
    stocks: '📈',
    retirement_account: '🏦',
    index_funds: '📊',
  }

  const assetTypeLabels: Record<string, string> = {
    cash: 'Cash',
    stock: 'Stock',
    debt: 'Debt',
    bank_account: 'Cash',
    stocks: 'Stocks',
    retirement_account: 'Retirement',
    index_funds: 'Index Funds',
  }

  // Color palette matching the dashboard donut chart
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

  // Sort assets by type (same as dashboard) to assign colors
  const assetsSortedByType = [...assets].sort((a, b) => {
    const order = { stock: 1, cash: 2, debt: 3 }
    return (order[a.type as keyof typeof order] || 2) - (order[b.type as keyof typeof order] || 2)
  })

  // Create a color map for each asset ID
  const assetColorMap = new Map(
    assetsSortedByType.map((asset, index) => [
      asset.id,
      asset.type === 'debt' ? '#9E9E9E' : colorPalette[index % colorPalette.length]
    ])
  )

  const getAssetColors = (assetId: string, type: string) => {
    const color = assetColorMap.get(assetId) || '#0bd2ec'

    // Create a slightly darker shade for the gradient end
    const darkenColor = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      const darker = (c: number) => Math.max(0, Math.floor(c * 0.8))
      return `#${darker(r).toString(16).padStart(2, '0')}${darker(g).toString(16).padStart(2, '0')}${darker(b).toString(16).padStart(2, '0')}`
    }

    const darkerColor = darkenColor(color)

    return {
      bgGradient: `linear-gradient(to bottom, ${color}, ${darkerColor})`,
      text: darkerColor
    }
  }
  const { formatCurrency } = useCurrency()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isAtTop, setIsAtTop] = useState(true)
  const searchParamsValue = searchParams.get('new')
  const [hasNewAccount, setHasNewAccount] = useState(searchParamsValue === 'true')

  const handleBack = () => {
    router.back()
  }

  // Sort assets: Newest first by created_at date
  const sortedAssets = [...assets].sort((a, b) => {
    const dateA = new Date(a.created_at || 0).getTime()
    const dateB = new Date(b.created_at || 0).getTime()
    return dateB - dateA // Newest first
  })

  // Detect if a new account was just added and clear after animation
  useEffect(() => {
    const newAccount = searchParams.get('new')
    if (newAccount === 'true') {
      setHasNewAccount(true)
      // Clear the parameter after animation completes
      const timer = setTimeout(() => {
        setHasNewAccount(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      setIsAtTop(scrollTop < 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Get details text for asset
  const getAssetDetails = (asset: Asset) => {
    if (asset.type === 'stock' && asset.shares) {
      return `${asset.shares} share${asset.shares !== 1 ? 's' : ''}`
    }
    return assetTypeLabels[asset.type] || 'Asset'
  }

  return (
    <div
      className="min-h-screen pb-16"
      style={{ background: pageStyles.allAccounts.background, backgroundAttachment: 'fixed' }}
    >
      {/* Content */}
      <div className="px-6 pt-7 pb-24">
        {/* Header */}
        <PageHeader
          title="What I own"
          buttonColor={pageStyles.allAccounts.buttonColor}
          leftAction={
            <HeaderButton onClick={handleBack} color={pageStyles.allAccounts.buttonColor}>
              <ArrowLeft className="h-5 w-5" />
            </HeaderButton>
          }
          rightAction={
            <Link href={`/dashboard/add-asset?returnUrl=${encodeURIComponent(pathname)}`}>
              <HeaderButton color={pageStyles.allAccounts.buttonColor}>
                <Plus className="h-5 w-5" />
              </HeaderButton>
            </Link>
          }
        />

        {/* Celebration Card with Illustration */}
        <div className="h-[240px] relative mb-4 mt-8">
          <div className="absolute bottom-0 h-[170px] left-0 rounded-[24px] w-full border-[0.592px] border-[rgba(0,0,0,0.1)] border-solid shadow-[0px_8px_8px_0px_rgba(0,0,0,0.14)]" style={{ backgroundImage: 'linear-gradient(rgb(255, 255, 255) 0%, rgb(255, 248, 225) 100%)' }}>
            <div className="text-center pt-[79px] pb-6">
              <p className="text-[#5c4033] font-lora font-semibold" style={{ fontSize: '24px', lineHeight: '30px' }}>
                Good job tracking
                <br />
                your money!
              </p>
            </div>
          </div>

          {/* Illustration */}
          <div className="absolute h-[140px] left-1/2 top-[-19px] -translate-x-1/2 w-[140px] overflow-hidden">
            <img
              alt="Money illustration"
              className="absolute max-w-none"
              style={{
                height: '122.86%',
                left: '-45.53%',
                top: '-7.14%',
                width: '195.31%'
              }}
              src="/7156af634b9530bc013ae076a622c1c916c1a50f.png"
            />
          </div>
        </div>

        {/* Account List */}
        <div className="space-y-[16px]">
          {sortedAssets.length === 0 ? (
            <div className="rounded-[24px] p-6 border-[0.592px] border-[rgba(0,0,0,0.1)] border-solid shadow-[0px_8px_8px_0px_rgba(0,0,0,0.14)] text-center" style={{ backgroundImage: 'linear-gradient(rgb(255, 255, 255) 0%, rgb(255, 248, 225) 100%)' }}>
              <div className="text-6xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-[#5C4033] mb-2">No Accounts Yet</h3>
              <p className="text-[#8B7355] mb-6">
                Start tracking your money by adding your first account
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {sortedAssets.map((asset, index) => {
                const colors = getAssetColors(asset.id, asset.type)
                const isDebt = asset.type === 'debt'
                const isNew = index === 0 && hasNewAccount

                return (
                  <motion.div
                    key={asset.id}
                    layout
                    initial={isNew ? {
                      opacity: 0.1,
                      x: 400,
                      scale: 0.98
                    } : false}
                    animate={{
                      opacity: 1,
                      x: 0,
                      scale: 1
                    }}
                    exit={{
                      opacity: 0,
                      x: -100
                    }}
                    transition={isNew ? {
                      duration: 0.8,
                      ease: [0.6, 0, 0.1, 1],
                      delay: 0.1
                    } : {
                      layout: {
                        duration: 0.5,
                        ease: [0.4, 0, 0.2, 1]
                      }
                    }}
                  >
                    <Link href={`/dashboard/accounts/${asset.id}`} className="block">
                      <motion.div
                        className="rounded-[24px] p-6 border-[0.592px] border-[rgba(0,0,0,0.1)] border-solid shadow-[0px_8px_8px_0px_rgba(0,0,0,0.14)] cursor-pointer w-full"
                        style={{ backgroundImage: 'linear-gradient(rgb(255, 255, 255) 0%, rgb(255, 248, 225) 100%)' }}
                        whileHover={{ scale: 1.005, boxShadow: '0px 10px 12px 0px rgba(0,0,0,0.16)' }}
                        whileTap={{ scale: 0.995 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center gap-4 w-full">
                          {/* Icon with colored background */}
                          <div
                            className="rounded-[16px] shadow-[0px_2px_3px_0px_rgba(0,0,0,0.1)] shrink-0 size-[64px] flex items-center justify-center"
                            style={{ backgroundImage: colors.bgGradient }}
                          >
                            <span className="text-[28px] leading-[28px]">{asset.emoji || assetTypeEmojis[asset.type] || '💵'}</span>
                          </div>

                          {/* Account Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[#5c4033] font-semibold mb-1" style={{ fontSize: '18px', lineHeight: '20px' }}>
                              {asset.name}
                            </p>
                            <div className="flex flex-col gap-[2px]">
                              <p className="text-[#8b7355] text-[14px] leading-[18px]">
                                {getAssetDetails(asset)}
                              </p>
                              <p className={`text-[14px] leading-[18px] ${isDebt ? 'text-[#ff9500]' : 'text-[#52C41A]'}`}>
                                {isDebt ? '- ' : ''}{formatCurrency(asset.current_value)}
                              </p>
                            </div>
                          </div>

                          {/* Chevron */}
                          <ChevronRight className="w-6 h-6 text-[#8B7355] shrink-0" />
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Bottom Button - Fixed at bottom with slide animation */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#9dfaff] via-[#9dfaff] to-transparent z-10"
        initial={{ y: 0 }}
        animate={{ y: isAtTop ? 0 : 200 }}
        transition={{ duration: 0.5, ease: [0.6, 0, 0.1, 1] }}
      >
        <Link href={`/dashboard/add-asset?returnUrl=${encodeURIComponent(pathname)}`}>
          <button
            className="w-full h-16 text-lg shadow-2xl transition-all rounded-[18px] bg-gradient-to-b from-[#52c41a] to-[#389e0d] text-white hover:from-[#389e0d] hover:to-[#52c41a] active:scale-[0.98]"
          >
            <span>Add new account</span>
          </button>
        </Link>
      </motion.div>
    </div>
  )
}
