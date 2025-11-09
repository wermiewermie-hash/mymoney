'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useCurrency } from '@/lib/context/CurrencyContext'
import type { Asset, AssetHistory } from '@/lib/types/database.types'
import PageHeader, { HeaderButton } from '@/components/PageHeader'
import { pageStyles } from '@/lib/constants/pageStyles'
import Card from '@/components/Card'
import { updateAsset, deleteAsset } from '@/app/actions/assets'

// SVG paths for calendar arrows
const SVG_PATHS = {
  leftArrow: 'M6.17578 6.96045L1.39502 1.88379L6.17578 1.14441e-05',
  rightArrow: 'M1.17578 6.96045L5.95654 1.88379L1.17578 1.14441e-05',
}

interface AccountDetailsClientProps {
  asset: Asset
  assetHistory: AssetHistory[]
  assetIndex: number
}

export default function AccountDetailsClient({ asset: initialAsset, assetHistory, assetIndex }: AccountDetailsClientProps) {
  const { formatCurrency, currency, exchangeRate } = useCurrency()
  const router = useRouter()
  const [asset, setAsset] = useState(initialAsset)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isAtTop, setIsAtTop] = useState(true)

  // Edit modal state
  const [editName, setEditName] = useState(asset.name)
  const [editEmoji, setEditEmoji] = useState(asset.emoji || '💰')

  // Form state
  const [step, setStep] = useState(1)
  const [currentValue, setCurrentValue] = useState(asset.current_value.toString())
  const [shares, setShares] = useState(parseFloat(asset.shares?.toString() || '0'))
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [month, setMonth] = useState(new Date().getMonth())
  const [year, setYear] = useState(new Date().getFullYear())
  const [amountInput, setAmountInput] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingShares, setIsEditingShares] = useState(false)
  const [sharesInput, setSharesInput] = useState('')
  const [accountCurrency, setAccountCurrency] = useState<'USD' | 'JPY'>('USD')
  const [stockCurrency, setStockCurrency] = useState<'USD' | 'JPY'>('USD')

  const assetTypeEmojis: Record<string, string> = {
    cash: '💰',
    stock: '📈',
    debt: '💸',
    bank_account: '💰',
    stocks: '📈',
    retirement_account: '🏦',
    index_funds: '📊',
  }

  // Sync with initialAsset when it changes (after router.refresh())
  useEffect(() => {
    setAsset(initialAsset)
    setCurrentValue(initialAsset.current_value.toString())
    setShares(parseFloat(initialAsset.shares?.toString() || '0'))
  }, [initialAsset])

  // Sync amountInput with shares for stock type
  useEffect(() => {
    if (!isEditing && asset.type === 'stock' && asset.price_per_share) {
      const baseAmount = shares * asset.price_per_share
      if (stockCurrency === 'JPY') {
        const jpyAmount = Math.round(baseAmount * exchangeRate)
        setAmountInput(jpyAmount > 0 ? jpyAmount.toLocaleString('en-US') : '')
      } else {
        setAmountInput(baseAmount > 0 ? baseAmount.toFixed(2) : '')
      }
    }
  }, [shares, stockCurrency, asset.price_per_share, isEditing, exchangeRate, asset.type])

  // Sync sharesInput with shares
  useEffect(() => {
    if (!isEditingShares) {
      setSharesInput(shares > 0 ? shares.toString() : '')
    }
  }, [shares, isEditingShares])

  // Color palette matching the All Accounts page
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

  // Get color for this asset (matching AllAccountsClient logic)
  const getAssetColor = () => {
    if (asset.type === 'debt') return '#9E9E9E'
    // Use the sorted index to assign color (same as AllAccountsClient)
    return colorPalette[assetIndex % colorPalette.length]
  }

  const assetColor = getAssetColor()

  const darkenColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    const darker = (c: number) => Math.max(0, Math.floor(c * 0.8))
    return `#${darker(r).toString(16).padStart(2, '0')}${darker(g).toString(16).padStart(2, '0')}${darker(b).toString(16).padStart(2, '0')}`
  }

  const darkerColor = darkenColor(assetColor)
  const bgGradient = `linear-gradient(to bottom, ${assetColor}, ${darkerColor})`

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      setIsAtTop(scrollTop < 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Calculate chart data from asset history
  const chartData = useMemo(() => {
    if (assetHistory.length === 0) return []

    return assetHistory.map(history => {
      const date = new Date(history.change_date)
      const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

      // Use the value field if it exists (for cash/debt accounts), otherwise calculate from shares
      const value = history.value !== undefined && history.value !== null
        ? history.value
        : history.shares * (asset.price_per_share || 0)

      return {
        month: label,
        value: value
      }
    })
  }, [assetHistory, asset.price_per_share])

  const handleBack = () => {
    router.back()
  }

  const emojiOptions = ['💰', '📈', '💸', '🏦', '📊', '🎯', '💎', '🚗', '🏠', '✈️']

  const handleEditSave = async () => {
    setLoading(true)

    const formData = new FormData()
    formData.append('name', editName)
    formData.append('type', asset.type)
    formData.append('notes', asset.notes || '')
    formData.append('emoji', editEmoji)

    if (asset.type === 'stock') {
      formData.append('shares', asset.shares?.toString() || '0')
      formData.append('pricePerShare', asset.price_per_share?.toString() || '0')
      formData.append('currentValue', asset.current_value.toString())
    } else {
      formData.append('currentValue', asset.current_value.toString())
    }

    const result = await updateAsset(asset.id, formData)

    if (result?.error) {
      alert(result.error)
    } else {
      setAsset({ ...asset, name: editName, emoji: editEmoji })
      setIsEditModalOpen(false)
      router.refresh()
    }

    setLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    const result = await deleteAsset(asset.id)

    if (result?.error) {
      alert(result.error)
      setLoading(false)
    } else {
      router.push('/dashboard/accounts')
    }
  }

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 300)
  }

  // Stock stepper handlers
  const updateAmountFromShares = (newShares: number) => {
    if (!asset.price_per_share) return
    const baseAmount = newShares * asset.price_per_share
    if (stockCurrency === 'JPY') {
      const jpyAmount = Math.round(baseAmount * exchangeRate)
      setAmountInput(jpyAmount > 0 ? jpyAmount.toLocaleString('en-US') : '')
    } else {
      setAmountInput(baseAmount > 0 ? baseAmount.toFixed(2) : '')
    }
    setCurrentValue((newShares * asset.price_per_share).toString())
  }

  const handleIncrement = () => {
    const newShares = shares + 1
    setShares(newShares)
    updateAmountFromShares(newShares)
    setIsEditing(false)
  }

  const handleDecrement = () => {
    const newShares = Math.max(0, shares - 1)
    setShares(newShares)
    updateAmountFromShares(newShares)
    setIsEditing(false)
  }

  const handleSharesInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsEditingShares(true)
    const value = e.target.value.replace(/[^0-9.]/g, '')
    // Allow only one decimal point and up to 1 decimal place
    const parts = value.split('.')
    if (parts.length > 2) return
    if (parts[1] && parts[1].length > 1) return
    setSharesInput(value)
  }

  const handleSharesBlur = () => {
    setIsEditingShares(false)
    const value = parseFloat(sharesInput) || 0
    const roundedShares = Math.round(value * 10) / 10
    setShares(roundedShares)
    updateAmountFromShares(roundedShares)
  }

  const formatSharesDisplay = () => {
    if (shares === Math.floor(shares)) {
      return shares.toString()
    }
    return shares.toFixed(1)
  }

  const handleStockCurrencyChange = (newCurrency: 'USD' | 'JPY') => {
    const currentAmountUSD = stockCurrency === 'USD'
      ? parseFloat(amountInput) || 0
      : (parseFloat(amountInput.replace(/,/g, '')) || 0) / exchangeRate

    setStockCurrency(newCurrency)
    setIsEditing(false)

    if (newCurrency === 'JPY') {
      const jpyAmount = currentAmountUSD * exchangeRate
      setAmountInput(Math.round(jpyAmount).toLocaleString('en-US'))
    } else {
      setAmountInput(currentAmountUSD.toFixed(2))
    }
  }

  const handleStockAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsEditing(true)
    let value = e.target.value.replace(/[^0-9.]/g, '')

    if (stockCurrency === 'JPY') {
      value = value.replace(/\./g, '')
      setAmountInput(value ? parseInt(value).toLocaleString('en-US') : '')
    } else {
      setAmountInput(value)
    }
  }

  const handleStockAmountBlur = () => {
    setIsEditing(false)

    if (!asset.price_per_share) return

    if (stockCurrency === 'JPY') {
      const jpyValue = parseFloat(amountInput.replace(/,/g, '')) || 0
      const usdValue = jpyValue / exchangeRate
      const calculatedShares = usdValue / asset.price_per_share
      const roundedShares = Math.round(calculatedShares * 10) / 10
      setShares(roundedShares)
      setCurrentValue((roundedShares * asset.price_per_share).toString())
    } else {
      const usdValue = parseFloat(amountInput) || 0
      const calculatedShares = usdValue / asset.price_per_share
      const roundedShares = Math.round(calculatedShares * 10) / 10
      setShares(roundedShares)
      setCurrentValue((roundedShares * asset.price_per_share).toString())
    }
  }

  const getStockCurrencySymbol = () => {
    return stockCurrency === 'USD' ? '$' : '¥'
  }

  const formatStockDisplayValue = () => {
    const symbol = getStockCurrencySymbol()
    if (!amountInput) return `${symbol}0`
    return `${symbol}${amountInput}`
  }

  // Amount input handlers (matching add-asset)
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsEditing(true)
    let value = e.target.value.replace(/[^0-9.]/g, '')

    if (accountCurrency === 'JPY') {
      value = value.replace(/\./g, '')
    }
    setAmountInput(value)
  }

  const handleAmountFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsEditing(true)
    handleInputFocus(e)
  }

  const handleAmountBlur = () => {
    setIsEditing(false)
    const value = parseFloat(amountInput) || 0
    if (asset.type === 'stock') {
      setCurrentValue(value.toString())
    } else {
      setCurrentValue(value.toString())
    }
  }

  const getCurrencySymbol = () => {
    return accountCurrency === 'USD' ? '$' : '¥'
  }

  const formatDisplayValue = () => {
    const symbol = getCurrencySymbol()
    if (!amountInput) return symbol
    return `${symbol}${amountInput}`
  }

  const handleCurrencyChange = (newCurrency: 'USD' | 'JPY') => {
    // Convert current amount to USD first
    const currentAmountUSD = accountCurrency === 'USD'
      ? parseFloat(amountInput) || 0
      : (parseFloat(amountInput) || 0) / exchangeRate

    setAccountCurrency(newCurrency)
    setIsEditing(false)

    // Convert to new currency
    if (newCurrency === 'JPY') {
      const jpyAmount = currentAmountUSD * exchangeRate
      const roundedJpy = Math.round(jpyAmount).toString()
      setAmountInput(roundedJpy)
      setCurrentValue(roundedJpy)
    } else {
      const usdAmount = currentAmountUSD.toFixed(2)
      setAmountInput(usdAmount)
      setCurrentValue(usdAmount)
    }
  }

  const handleUpdateSave = async () => {
    setLoading(true)

    const formData = new FormData()

    // Include required fields
    formData.append('name', asset.name)
    formData.append('type', asset.type)
    formData.append('notes', asset.notes || '')
    formData.append('changeDate', selectedDate.toISOString())

    if (asset.type === 'stock') {
      formData.append('shares', shares.toString())
      formData.append('pricePerShare', asset.price_per_share?.toString() || '0')
      formData.append('currentValue', currentValue)
    } else {
      formData.append('currentValue', currentValue)
    }

    const result = await updateAsset(asset.id, formData)

    if (result?.error) {
      alert(result.error)
    } else {
      setAsset({ ...asset, current_value: parseFloat(currentValue), shares: asset.type === 'stock' ? shares : null })
      setIsUpdateModalOpen(false)
      router.refresh()
    }

    setLoading(false)
  }

  const handleOpenModal = () => {
    setStep(1)
    setCurrentValue(asset.current_value.toString())
    setShares(parseFloat(asset.shares?.toString() || '0'))
    setAmountInput(asset.current_value.toString())
    setSelectedDate(new Date())
    setMonth(new Date().getMonth())
    setYear(new Date().getFullYear())
    setAccountCurrency('USD')
    setStockCurrency('USD')
    setIsUpdateModalOpen(true)
  }

  const handleCancelModal = () => {
    setIsUpdateModalOpen(false)
    setStep(1)
    setAmountInput('')
    setIsEditing(false)
  }

  // Calendar generation
  const getDaysInMonth = (month: number, year: number) => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days: (number | null)[] = Array(firstDay).fill(null)
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  return (
    <div
      className="min-h-screen pb-16"
      style={{ background: pageStyles.allAccounts.background, backgroundAttachment: 'fixed' }}
    >
      {/* Header */}
      <div className="px-6 pt-7 pb-0">
        <PageHeader
          title="Account details"
          buttonColor={pageStyles.allAccounts.buttonColor}
          leftAction={
            <HeaderButton onClick={handleBack} color={pageStyles.allAccounts.buttonColor}>
              <ArrowLeft className="h-5 w-5" />
            </HeaderButton>
          }
          rightAction={
            <HeaderButton onClick={() => {
              setEditName(asset.name)
              setEditEmoji(asset.emoji || '💰')
              setIsEditModalOpen(true)
            }} color={pageStyles.allAccounts.buttonColor}>
              <Pencil className="h-5 w-5" />
            </HeaderButton>
          }
        />
      </div>

      {/* Content */}
      <div className="px-6 pt-7 pb-24">
        {/* Account Value Card with Icon */}
        <div className="h-[240px] relative mb-4">
          <div className="absolute bottom-0 h-[170px] left-0 rounded-[24px] w-full border-[0.592px] border-[rgba(0,0,0,0.1)] border-solid shadow-[0px_8px_8px_0px_rgba(0,0,0,0.14)]" style={{ backgroundImage: 'linear-gradient(rgb(255, 255, 255) 0%, rgb(255, 248, 225) 100%)' }}>
            <div className="text-center pt-[79px] pb-6 px-4">
              <p className="text-[#5c4033] font-medium mb-2" style={{ fontSize: '18px', lineHeight: '22px' }}>{asset.name}</p>
              <p className="text-[#5c4033] font-lora font-semibold" style={{ fontSize: '32px', lineHeight: '38px' }}>
                {asset.type === 'debt' && '- '}{formatCurrency(asset.current_value)}
              </p>
            </div>
          </div>

          {/* Account Icon Circle */}
          <div className="absolute h-[100px] w-[100px] left-1/2 top-0 -translate-x-1/2 rounded-full shadow-[0px_2px_3px_0px_rgba(0,0,0,0.1)]" style={{ backgroundImage: bgGradient }}>
            <div className="flex items-center justify-center h-full w-full">
              <span className="text-[64px] leading-[64px]">{asset.emoji || assetTypeEmojis[asset.type] || '💵'}</span>
            </div>
          </div>
        </div>

        {/* History Card */}
        <Card noPadding>
          <div className="p-6">
            <h3 className="font-semibold text-[18px] leading-[28px] text-[#5c4033] mb-4">History</h3>

            {chartData.length > 0 ? (
              <div className="h-[216px] py-3">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="accountHistoryColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9b59b6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#9b59b6" stopOpacity={0}/>
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
                      formatter={(value: number) => [formatCurrency(value), 'Value']}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#9b59b6"
                      strokeWidth={3}
                      fill="url(#accountHistoryColor)"
                      animationDuration={800}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[216px] flex items-center justify-center">
                <p className="text-[#8B7355]">No history data available</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Update Amount Button - Fixed at bottom */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#9dfaff] via-[#9dfaff] to-transparent z-10"
        initial={{ y: 0 }}
        animate={{ y: isAtTop ? 0 : 200 }}
        transition={{ duration: 0.5, ease: [0.6, 0, 0.1, 1] }}
      >
        <button
          onClick={handleOpenModal}
          className="w-full h-16 text-lg shadow-2xl transition-all rounded-[18px] bg-gradient-to-b from-[#52c41a] to-[#389e0d] text-white hover:from-[#389e0d] hover:to-[#52c41a] active:scale-[0.98]"
        >
          <span>Update amount</span>
        </button>
      </motion.div>

      {/* Update Modal */}
      <AnimatePresence>
        {isUpdateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#9dfaff] z-50 overflow-y-auto"
          >
            <div className="px-6 pt-7 pb-24 min-h-screen">
              {/* Step 1: Amount Entry */}
              {step === 1 && (
                <>
                  <div className="relative h-[193px] mb-8">
                    <Card className="absolute bottom-0 h-[133px] left-0 w-full">
                      <p className="absolute font-medium leading-[30px] left-1/2 text-[#5c4033] text-[20px] text-center top-[79px] tracking-[-0.4492px] -translate-x-1/2 w-[238px]">
                        {asset.type === 'stock' ? asset.name : `Update your ${asset.type === 'debt' ? 'debt' : 'cash'}`}
                      </p>
                      {asset.type === 'stock' && asset.price_per_share && (
                        <p className="absolute left-1/2 text-[#8b7355] text-xs text-center top-[105px] -translate-x-1/2">
                          ${asset.price_per_share.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} per share
                        </p>
                      )}
                    </Card>
                    <div className="absolute h-[100px] left-1/2 top-0 -translate-x-1/2 w-[100px]">
                      <div className="w-[100px] h-[100px] bg-gradient-to-b from-[#fff8e1] to-[#ffecb3] rounded-full flex items-center justify-center shadow-lg translate-y-[16px]">
                        <span className="text-4xl">{asset.emoji || assetTypeEmojis[asset.type] || '💰'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Amount Input */}
                    {asset.type !== 'stock' ? (
                      <div className="flex flex-col gap-3 items-center w-full">
                        {/* Main card */}
                        <div className="bg-white h-[130px] relative rounded-[24px] w-full">
                          <div aria-hidden="true" className="absolute border-[0.608px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_2px_3px_3px_rgba(0,0,0,0.1)]" />
                          <div className="flex items-center justify-center h-full">
                            <input
                              type="text"
                              inputMode={accountCurrency === 'JPY' ? 'numeric' : 'decimal'}
                              value={isEditing ? amountInput : formatDisplayValue()}
                              onChange={handleAmountChange}
                              onBlur={handleAmountBlur}
                              onFocus={handleAmountFocus}
                              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                              className={`bg-transparent border-none outline-none min-w-[60px] text-[42px] text-center font-medium ${parseFloat(amountInput) > 0 ? 'text-[#5c4033]' : 'text-[#d4c4b0]'}`}
                              placeholder={`${getCurrencySymbol()}0`}
                            />
                          </div>
                        </div>

                        {/* Currency toggle */}
                        <div className="bg-[rgba(255,255,255,0.3)] relative flex h-[34px] items-center justify-center p-[2px] rounded-[10px]">
                          <div
                            className="absolute bg-white rounded-[8px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] transition-all duration-300 ease-out top-[2px] bottom-[2px]"
                            style={{
                              left: accountCurrency === 'USD' ? '2px' : '50px',
                              width: '46px',
                            }}
                          />
                          <button
                            onClick={() => handleCurrencyChange('USD')}
                            className="h-[30px] relative rounded-[8px] w-[46px] z-10 flex items-center justify-center"
                          >
                            <p className={`font-semibold text-[12px] transition-colors duration-200 ${accountCurrency === 'USD' ? 'text-[#5c4033]' : 'text-[#8b7355]'}`}>
                              USD
                            </p>
                          </button>
                          <button
                            onClick={() => handleCurrencyChange('JPY')}
                            className="h-[30px] relative rounded-[8px] w-[46px] z-10 flex items-center justify-center"
                          >
                            <p className={`font-semibold text-[12px] transition-colors duration-200 ${accountCurrency === 'JPY' ? 'text-[#5c4033]' : 'text-[#8b7355]'}`}>
                              JPY
                            </p>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Stepper */}
                        <Card>
                          <div className="flex items-center justify-between">
                            <button
                              onClick={handleDecrement}
                              className={`w-16 h-16 rounded-[16px] flex items-center justify-center shadow-md transition-all ${
                                shares > 0
                                  ? 'bg-gradient-to-b from-[#ffa93d] to-[#ffd740] hover:scale-105'
                                  : 'bg-[rgba(255,169,61,0.1)]'
                              }`}
                            >
                              <svg className="w-7 h-7" fill="none" viewBox="0 0 28 28">
                                <path d="M5.83199 13.9968H22.1616" stroke={shares > 0 ? 'white' : '#D4C4B0'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" />
                              </svg>
                            </button>

                            <div className="text-center">
                              <input
                                type="text"
                                inputMode="decimal"
                                value={isEditingShares ? sharesInput : formatSharesDisplay()}
                                onChange={handleSharesInputChange}
                                onBlur={handleSharesBlur}
                                onFocus={(e) => {
                                  setIsEditingShares(true)
                                  setSharesInput(shares > 0 ? shares.toString() : '')
                                }}
                                className="text-[#5c4033] font-medium bg-transparent border-none outline-none text-center"
                                style={{ fontSize: '42px', lineHeight: '1', width: '120px' }}
                              />
                              <p className="text-[#8b7355] text-sm mt-1">shares</p>
                            </div>

                            <button
                              onClick={handleIncrement}
                              className="w-16 h-16 bg-gradient-to-b from-[#52c41a] to-[#389e0d] rounded-[16px] flex items-center justify-center shadow-md hover:scale-105 transition-all"
                            >
                              <svg className="w-7 h-7" fill="none" viewBox="0 0 28 28">
                                <path d="M5.83199 13.9968H22.1616" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" />
                                <path d="M13.9968 5.83199V22.1616" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" />
                              </svg>
                            </button>
                          </div>
                        </Card>

                        {/* Amount display */}
                        <div className="flex flex-col gap-3 items-center w-full">
                          {/* Main card */}
                          <div className="bg-white h-[130px] relative rounded-[24px] w-full">
                            <div aria-hidden="true" className="absolute border-[0.608px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_2px_3px_3px_rgba(0,0,0,0.1)]" />
                            <div className="flex items-center justify-center h-full">
                              <input
                                type="text"
                                inputMode={stockCurrency === 'JPY' ? 'numeric' : 'decimal'}
                                value={isEditing ? formatStockDisplayValue() : formatStockDisplayValue()}
                                onChange={handleStockAmountChange}
                                onBlur={handleStockAmountBlur}
                                onFocus={(e) => {
                                  setIsEditing(true)
                                  handleInputFocus(e)
                                }}
                                className={`bg-transparent border-none outline-none min-w-[60px] text-[42px] text-center font-medium ${parseFloat(amountInput) > 0 ? 'text-[#5c4033]' : 'text-[#d4c4b0]'}`}
                                placeholder={`${getStockCurrencySymbol()}0`}
                              />
                            </div>
                          </div>

                          {/* Currency toggle */}
                          <div className="bg-[rgba(255,255,255,0.3)] relative flex h-[34px] items-center justify-center p-[2px] rounded-[10px]">
                            <div
                              className="absolute bg-white rounded-[8px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] transition-all duration-300 ease-out top-[2px] bottom-[2px]"
                              style={{
                                left: stockCurrency === 'USD' ? '2px' : '50px',
                                width: '46px',
                              }}
                            />
                            <button
                              onClick={() => handleStockCurrencyChange('USD')}
                              className="h-[30px] relative rounded-[8px] w-[46px] z-10 flex items-center justify-center"
                            >
                              <p className={`font-semibold text-[12px] transition-colors duration-200 ${stockCurrency === 'USD' ? 'text-[#5c4033]' : 'text-[#8b7355]'}`}>
                                USD
                              </p>
                            </button>
                            <button
                              onClick={() => handleStockCurrencyChange('JPY')}
                              className="h-[30px] relative rounded-[8px] w-[46px] z-10 flex items-center justify-center"
                            >
                              <p className={`font-semibold text-[12px] transition-colors duration-200 ${stockCurrency === 'JPY' ? 'text-[#5c4033]' : 'text-[#8b7355]'}`}>
                                JPY
                              </p>
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleCancelModal}
                        className="flex-1 bg-[#E0E0E0] text-[#5C4033] font-bold py-3 px-6 rounded-2xl transition-all hover:bg-[#D0D0D0] active:scale-95"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setStep(2)}
                        disabled={asset.type === 'stock' ? shares <= 0 : (!amountInput || parseFloat(amountInput) <= 0)}
                        className="flex-1 bg-gradient-to-r from-[#52C41A] to-[#389E0D] text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Step 2: Calendar */}
              {step === 2 && (
                <>
                  <Card className="mb-8">
                    {/* Month/Year Header */}
                    <div className="flex items-center justify-between mb-6">
                      <button
                        onClick={() => {
                          if (month === 0) {
                            setMonth(11)
                            setYear(year - 1)
                          } else {
                            setMonth(month - 1)
                          }
                        }}
                        className="bg-[rgba(255,201,7,0.2)] rounded-full p-3 hover:bg-[rgba(255,201,7,0.3)] transition-colors"
                      >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 8 14">
                          <path d={SVG_PATHS.leftArrow} stroke="#5C4033" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.89054" />
                        </svg>
                      </button>
                      <div className="text-center">
                        <p className="text-[#5c4033] text-[18.908px]">{monthNames[month]}</p>
                        <p className="text-[#8b7355] text-[15.127px]">{year}</p>
                      </div>
                      <button
                        onClick={() => {
                          if (month === 11) {
                            setMonth(0)
                            setYear(year + 1)
                          } else {
                            setMonth(month + 1)
                          }
                        }}
                        className="bg-[rgba(255,201,7,0.2)] rounded-full p-3 hover:bg-[rgba(255,201,7,0.3)] transition-colors"
                      >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 8 14">
                          <path d={SVG_PATHS.rightArrow} stroke="#5C4033" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.89054" />
                        </svg>
                      </button>
                    </div>

                    {/* Day labels */}
                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-[#8b7355] text-[11.345px]">{day}</div>
                      ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-2">
                      {getDaysInMonth(month, year).map((day, idx) => {
                        if (day === null) return <div key={`empty-${idx}`} />
                        const today = new Date()
                        const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
                        const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year

                        return (
                          <button
                            key={day}
                            onClick={() => setSelectedDate(new Date(year, month, day))}
                            className={`rounded-[15px] h-[33px] flex items-center justify-center text-[15px] transition-all ${
                              isSelected
                                ? 'bg-gradient-to-b from-[#52c41a] to-[#389e0d] text-white shadow-md scale-105'
                                : isToday
                                ? 'bg-gradient-to-b from-[#ffc107] to-[#ffa000] text-white shadow-md'
                                : 'bg-white text-[#5c4033] shadow-sm hover:shadow-md'
                            }`}
                          >
                            {day}
                          </button>
                        )
                      })}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-[rgba(0,0,0,0.08)]">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-to-b from-[#ffc107] to-[#ffa000] rounded-full" />
                        <span className="text-[#8b7355] text-[11px]">Today</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-to-b from-[#52c41a] to-[#389e0d] rounded-full" />
                        <span className="text-[#8b7355] text-[11px]">Selected</span>
                      </div>
                    </div>
                  </Card>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancelModal}
                      className="flex-1 bg-[#E0E0E0] text-[#5C4033] font-bold py-3 px-6 rounded-2xl transition-all hover:bg-[#D0D0D0] active:scale-95"
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
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Account Modal */}
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
              {/* Delete button in top right */}
              <button
                onClick={handleDelete}
                disabled={loading}
                className="absolute top-6 right-6 p-2 text-[#8B7355] hover:text-[#5C4033] transition-colors disabled:opacity-50"
                aria-label="Delete account"
              >
                <Trash2 className="h-5 w-5" />
              </button>

              <h2 className="text-xl font-bold text-[#5C4033] text-center">Edit Account</h2>

              <div className="pb-3">
                <label className="block text-sm font-semibold text-[#5C4033] mb-2">Account Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onFocus={handleInputFocus}
                  className="w-full px-4 py-3 bg-[#E3F2FD] border-0 rounded-2xl focus:ring-2 focus:ring-[#FF9933] text-[#5C4033] placeholder-[#8B7355]"
                  placeholder="e.g., Savings Account"
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
    </div>
  )
}
