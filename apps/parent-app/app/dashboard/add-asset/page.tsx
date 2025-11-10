'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createAsset } from '@/app/actions/assets'
import { getStockPrice } from '@/app/actions/stocks'
import Card from '@/components/Card'
import PageHeader, { HeaderButton } from '@/components/PageHeader'
import { pageStyles } from '@/lib/constants/pageStyles'
import { ArrowLeft } from 'lucide-react'
import { useCurrency } from '@/lib/context/CurrencyContext'
import { ConfettiEffect } from '@/components/ConfettiEffect'

type AssetCategory = 'stocks' | 'cash' | 'debt' | null

type Stock = {
  name: string
  ticker: string
  type: string
}

const SVG_PATHS = {
  leftArrow: "M6.61689 12.2885L0.94527 6.61689L6.61689 0.94527",
  rightArrow: "M0.94527 12.2885L6.61689 6.61689L0.94527 0.94527",
}

export default function AddAssetPage() {
  const router = useRouter()
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  const returnUrl = searchParams.get('returnUrl') || '/dashboard/accounts'
  const { exchangeRate } = useCurrency()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory>(null)
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [stockPrice, setStockPrice] = useState<number>(0)
  const [shares, setShares] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Cash/Debt specific state
  const [accountName, setAccountName] = useState('')
  const [accountEmoji, setAccountEmoji] = useState('💰')
  const [accountAmount, setAccountAmount] = useState('')
  const [accountCurrency, setAccountCurrency] = useState<'USD' | 'JPY'>('USD')

  // Update emoji when category changes
  useEffect(() => {
    if (selectedCategory === 'cash' || selectedCategory === 'debt') {
      // Don't reset accountName - it was set in step 1
      setAccountEmoji(selectedCategory === 'cash' ? '💰' : '💸')
      setAccountAmount('')
      setAccountCurrency('USD')
    }
  }, [selectedCategory])

  const canProceed = () => {
    if (currentStep === 1) return accountName.trim() !== '' && accountEmoji !== ''
    if (currentStep === 2) return selectedCategory !== null
    if (currentStep === 3) {
      if (selectedCategory === 'stocks') {
        return selectedStock !== null
      } else {
        // Cash or debt - check if amount is filled
        return parseFloat(accountAmount) > 0
      }
    }
    if (currentStep === 4) return shares > 0
    if (currentStep === 5) return selectedDate !== null
    return false
  }

  const handleNext = async () => {
    // For cash/debt, skip step 4 (shares) and go from step 3 to step 5
    if (selectedCategory === 'cash' || selectedCategory === 'debt') {
      if (currentStep === 3) {
        setCurrentStep(5) // Skip step 4 (shares)
      } else if (currentStep < 5) {
        setCurrentStep(currentStep + 1)
      } else {
        await handleSave()
      }
    } else {
      // For stocks, we have 5 steps
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1)
      } else {
        await handleSave()
      }
    }
  }

  const handleSave = async () => {
    if (!selectedCategory || !selectedDate) return

    setLoading(true)

    const formData = new FormData()

    if (selectedCategory === 'stocks') {
      if (!selectedStock || !stockPrice) return

      formData.append('name', accountName)
      formData.append('type', 'stock')
      formData.append('ticker', selectedStock.ticker)
      formData.append('shares', shares.toString())
      formData.append('pricePerShare', stockPrice.toString())
      formData.append('currentValue', (shares * stockPrice).toString())
      formData.append('acquisitionDate', selectedDate.toISOString())
      formData.append('emoji', accountEmoji)
    } else {
      // Cash or Debt
      const amountUSD = accountCurrency === 'USD'
        ? parseFloat(accountAmount)
        : parseFloat(accountAmount) / exchangeRate

      formData.append('name', accountName)
      formData.append('type', selectedCategory) // 'cash' or 'debt'
      formData.append('ticker', '') // No ticker for cash/debt
      formData.append('shares', '0')
      formData.append('pricePerShare', '0')
      formData.append('currentValue', amountUSD.toString())
      formData.append('acquisitionDate', selectedDate.toISOString())
      formData.append('emoji', accountEmoji)
    }

    const result = await createAsset(formData)

    if (!result?.error) {
      setLoading(false)
      setShowConfetti(true)
    } else {
      setLoading(false)
      // Handle error
      console.error(result.error)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      router.back()
    }
  }

  // Step 4: Date Selection
  const DateStep = () => {
    const [month, setMonth] = useState(selectedDate.getMonth())
    const [year, setYear] = useState(selectedDate.getFullYear())
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()
    const today = new Date()

    const days = []
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

    return (
      <>
        <div className="relative h-[193px] mb-8">
          <Card className="absolute bottom-0 h-[133px] left-0 w-full">
            <p className="absolute font-medium leading-[30px] left-1/2 text-[#5c4033] text-[20px] text-center top-[79px] tracking-[-0.4492px] -translate-x-1/2 w-[238px]">
              Date to start tracking
            </p>
          </Card>
          <div className="absolute h-[116.088px] left-1/2 top-[0.99px] -translate-x-1/2 w-[256.857px]">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img alt="" className="absolute h-[138.58%] left-[-0.11%] max-w-none top-[-17.67%] w-[100.21%]" src="/54306542bfc20377c281368aeba8dd257e39d540.png" />
            </div>
          </div>
        </div>

        <Card>
          {/* Month/Year selector */}
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
            {days.map((day, idx) => {
              if (day === null) return <div key={`empty-${idx}`} />
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
      </>
    )
  }

  // Step 2: Category Selection
  const CategoryStep = () => {
    const categories = [
      {
        type: 'stocks' as AssetCategory,
        name: 'Stocks',
        emoji: '📈',
        color: 'from-[#00bcd4] to-[#0097a7]',
        descriptions: ['Google stock', 'Index funds'],
      },
      {
        type: 'cash' as AssetCategory,
        name: 'Cash',
        emoji: '💵',
        color: 'from-[#52c41a] to-[#389e0d]',
        descriptions: ['Bank accounts', 'Birthday money'],
      },
      {
        type: 'debt' as AssetCategory,
        name: 'I owe money',
        emoji: '💸',
        color: 'from-[#ffc107] to-[#ffa000]',
        descriptions: ['Loans', 'Money borrowed'],
      },
    ]

    return (
      <>
        <div className="relative h-[193px] mb-8">
          <Card className="absolute bottom-0 h-[133px] left-0 w-full">
            <p className="absolute font-medium leading-[30px] left-1/2 text-[#5c4033] text-[20px] text-center top-[79px] tracking-[-0.4492px] -translate-x-1/2 w-[238px]">
              What are you adding?
            </p>
          </Card>
          <div className="absolute h-[160px] left-1/2 top-[-20px] -translate-x-1/2 w-[176px]">
            <div className="absolute inset-0 overflow-visible pointer-events-none">
              <img alt="" className="absolute max-w-none w-full h-full object-contain" src="/e0bea88ac19658dbf72e7cc433401d42ef6ea838.png" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {categories.map((category) => (
            <motion.button
              key={category.type}
              onClick={() => setSelectedCategory(category.type)}
              className="bg-white rounded-[24px] p-6 border border-[rgba(0,0,0,0.1)] w-full"
              animate={{
                scale: selectedCategory === category.type ? 1.05 : 1,
                boxShadow: selectedCategory === category.type
                  ? '0px 12px 20px 0px rgba(0,0,0,0.25)'
                  : '0px 8px 8px 0px rgba(0,0,0,0.14)'
              }}
              transition={{
                duration: 0.36,
                ease: [0.68, -0.15, 0.265, 1.15]
              }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-20 h-20 bg-gradient-to-b ${category.color} rounded-[24px] flex items-center justify-center shadow-lg`}>
                  <span className="text-4xl">{category.emoji}</span>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-[#5c4033] mb-1 font-semibold">{category.name}</h3>
                  {category.descriptions.map((desc, i) => (
                    <p key={i} className="text-sm text-[#8b7355]">{desc}</p>
                  ))}
                </div>
                <AnimatePresence>
                  {selectedCategory === category.type && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-8 h-8 bg-[#52c41a] rounded-full flex items-center justify-center"
                    >
                      <span className="text-white text-xl">✓</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.button>
          ))}
        </div>
      </>
    )
  }

  // Helper function to scroll input into view on focus
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 300)
  }

  // Step 1: Name and Emoji Selection
  const NameEmojiStep = () => {
    const allEmojiOptions = [
      '💰', '🏦', '💵', '💳', '🪙', '💸', '💴', '💶', '💷', '💲',
      '📈', '📊', '📉', '💹', '🎯', '🏆', '⭐', '✨', '🌟', '💎',
      '🚀', '🎨', '🎮', '🏠', '🚗', '✈️', '🎓', '💼', '🛍️', '🎁'
    ]

    const suggestionPills = ['My account', 'Savings', 'Checking']

    return (
      <>
        <div className="relative h-[193px] mb-8">
          <Card className="absolute bottom-0 h-[133px] left-0 w-full">
            <p className="absolute font-medium leading-[30px] left-1/2 text-[#5c4033] text-[20px] text-center top-[79px] tracking-[-0.4492px] -translate-x-1/2 w-[238px]">
              Name your account
            </p>
          </Card>
          <div className="absolute h-[140px] left-1/2 top-[-19px] -translate-x-1/2 w-[176px]">
            <div className="absolute inset-0 overflow-visible pointer-events-none">
              <img alt="" className="absolute max-w-none w-full h-full object-contain" src="/e0bea88ac19658dbf72e7cc433401d42ef6ea838.png" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Account Name */}
          <Card>
            <label className="block text-sm font-semibold text-[#5c4033] mb-3">Account Name</label>
            <input
              ref={nameInputRef}
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              onFocus={handleInputFocus}
              autoFocus
              autoCapitalize="words"
              autoComplete="off"
              className="w-full px-4 py-3 bg-[#E3F2FD] border-0 rounded-2xl focus:ring-2 focus:ring-[#FF9933] text-[#5c4033] placeholder-[#8B7355]"
              placeholder="e.g., My savings"
            />

            {/* Suggestion Pills */}
            <div className="flex flex-wrap gap-2 mt-3">
              {suggestionPills.map((pill) => (
                <button
                  key={pill}
                  onClick={() => setAccountName(pill)}
                  className="px-4 py-2 bg-[rgba(255,201,7,0.2)] hover:bg-[rgba(255,201,7,0.3)] rounded-full text-sm text-[#5c4033] transition-colors"
                >
                  {pill}
                </button>
              ))}
            </div>
          </Card>

          {/* Emoji Picker */}
          <Card>
            <label className="block text-sm font-semibold text-[#5c4033] mb-3">Choose Icon</label>
            <div className="grid grid-cols-5 gap-2">
              {allEmojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setAccountEmoji(emoji)}
                  className={`aspect-square rounded-2xl text-2xl transition-all flex items-center justify-center ${
                    accountEmoji === emoji
                      ? 'bg-gradient-to-br from-[#FFA93D] to-[#FFD740] scale-110'
                      : 'bg-[#E3F2FD] hover:bg-[#D0E8F2]'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </>
    )
  }

  // Step 3: Cash/Debt Amount Setup
  const CashDebtStep = () => {
    const [amountInput, setAmountInput] = useState<string>('')
    const [isEditing, setIsEditing] = useState(false)

    // Sync amountInput with accountAmount when not editing
    useEffect(() => {
      if (!isEditing) {
        if (accountCurrency === 'JPY') {
          const amount = parseFloat(accountAmount) || 0
          setAmountInput(amount > 0 ? Math.round(amount).toString() : '')
        } else {
          const amount = parseFloat(accountAmount) || 0
          setAmountInput(amount > 0 ? amount.toString() : '')
        }
      }
    }, [accountAmount, accountCurrency, isEditing])

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
      setAccountAmount(value.toString())
    }

    const handleCurrencyChange = (newCurrency: 'USD' | 'JPY') => {
      const currentAmountUSD = accountCurrency === 'USD'
        ? parseFloat(accountAmount) || 0
        : (parseFloat(accountAmount) || 0) / exchangeRate

      setAccountCurrency(newCurrency)
      setIsEditing(false)

      if (newCurrency === 'JPY') {
        const jpyAmount = currentAmountUSD * exchangeRate
        setAccountAmount(Math.round(jpyAmount).toString())
      } else {
        setAccountAmount(currentAmountUSD.toFixed(2))
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

    return (
      <>
        <div className="relative h-[193px] mb-8">
          <Card className="absolute bottom-0 h-[133px] left-0 w-full">
            <p className="absolute font-medium leading-[30px] left-1/2 text-[#5c4033] text-[20px] text-center top-[79px] tracking-[-0.4492px] -translate-x-1/2 w-[238px]">
              {selectedCategory === 'cash' ? 'Add your cash' : 'Money you owe'}
            </p>
          </Card>
          <div className="absolute h-[100px] left-1/2 top-0 -translate-x-1/2 w-[100px]">
            <div className="w-[100px] h-[100px] bg-gradient-to-b from-[#fff8e1] to-[#ffecb3] rounded-full flex items-center justify-center shadow-lg translate-y-[16px]">
              <span className="text-4xl">{selectedCategory === 'cash' ? '💰' : '💸'}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Amount Input */}
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
        </div>
      </>
    )
  }

  // Step 3: Stock Selection
  const StockStep = () => {
    // Pre-defined stocks to show (no search)
    const defaultStocks: Stock[] = [
      { name: 'Alphabet', ticker: 'GOOGL', type: 'stock' },
      { name: 'Total stock', ticker: 'VTI', type: 'etf' },
      { name: 'S&P 500', ticker: 'VOO', type: 'etf' },
      { name: 'All country', ticker: 'VT', type: 'etf' },
    ]

    const handleStockSelect = async (stock: Stock) => {
      // Fetch the price for the selected stock first
      const priceData = await getStockPrice(stock.ticker)
      // Then update both states together to batch the render
      setSelectedStock(stock)
      if (priceData) {
        setStockPrice(priceData.price)
      }
    }

    return (
      <>
        <div className="relative h-[193px] mb-8">
          <Card className="absolute bottom-0 h-[133px] left-0 w-full">
            <p className="absolute font-medium leading-[30px] left-1/2 text-[#5c4033] text-[20px] text-center top-[79px] tracking-[-0.4492px] -translate-x-1/2 w-[238px]">
              Which stock is it?
            </p>
          </Card>
          <div className="absolute h-[110px] left-1/2 top-0 -translate-x-1/2 w-[240px]">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img alt="" className="absolute max-w-none w-full h-auto" src="/f32f28c3123af7b9aacf3b54f85a9b5ada274549.png" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {defaultStocks.map((stock) => (
            <motion.button
              key={stock.ticker}
              onClick={() => handleStockSelect(stock)}
              className="bg-white rounded-[24px] p-6 border border-[rgba(0,0,0,0.1)] w-full"
              animate={{
                scale: selectedStock?.ticker === stock.ticker ? 1.05 : 1,
                boxShadow: selectedStock?.ticker === stock.ticker
                  ? '0px 12px 20px 0px rgba(0,0,0,0.25)'
                  : '0px 8px 8px 0px rgba(0,0,0,0.14)'
              }}
              transition={{
                duration: 0.36,
                ease: [0.68, -0.15, 0.265, 1.15]
              }}
            >
              <div className="flex items-center gap-4">
                <div className="flex-1 text-left">
                  <h3 className="text-[#5c4033] font-semibold">{stock.name}</h3>
                  <p className="text-sm text-[#8b7355]">{stock.ticker}</p>
                  <p className="text-xs text-[#8b7355] capitalize">{stock.type}</p>
                </div>
                <AnimatePresence>
                  {selectedStock?.ticker === stock.ticker && (
                    <motion.div
                      layoutId="stock-checkmark"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-8 h-8 bg-[#52c41a] rounded-full flex items-center justify-center"
                    >
                      <span className="text-white text-lg">✓</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.button>
          ))}
        </div>
      </>
    )
  }

  // Step 4: Amount Entry (Shares)
  const AmountStep = () => {
    const pricePerShare = stockPrice
    const [currency, setCurrency] = useState<'USD' | 'JPY'>('USD')
    const [amountInput, setAmountInput] = useState<string>('')
    const [isEditing, setIsEditing] = useState(false)
    const [isEditingShares, setIsEditingShares] = useState(false)
    const [sharesInput, setSharesInput] = useState<string>('')

    // Sync amountInput with shares
    useEffect(() => {
      if (!isEditing) {
        const baseAmount = shares * pricePerShare
        if (currency === 'JPY') {
          const jpyAmount = Math.round(baseAmount * exchangeRate)
          setAmountInput(jpyAmount > 0 ? jpyAmount.toLocaleString('en-US') : '')
        } else {
          setAmountInput(baseAmount > 0 ? baseAmount.toFixed(2) : '')
        }
      }
    }, [shares, currency, pricePerShare, isEditing, exchangeRate])

    // Sync sharesInput with shares
    useEffect(() => {
      if (!isEditingShares) {
        setSharesInput(shares > 0 ? shares.toString() : '')
      }
    }, [shares, isEditingShares])

    const updateAmountFromShares = (newShares: number) => {
      const baseAmount = newShares * pricePerShare
      if (currency === 'JPY') {
        const jpyAmount = Math.round(baseAmount * exchangeRate)
        setAmountInput(jpyAmount > 0 ? jpyAmount.toLocaleString('en-US') : '')
      } else {
        setAmountInput(baseAmount > 0 ? baseAmount.toFixed(2) : '')
      }
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

    const handleCurrencyChange = (newCurrency: 'USD' | 'JPY') => {
      const currentAmountUSD = currency === 'USD'
        ? parseFloat(amountInput) || 0
        : (parseFloat(amountInput.replace(/,/g, '')) || 0) / exchangeRate

      setCurrency(newCurrency)
      setIsEditing(false)

      if (newCurrency === 'JPY') {
        const jpyAmount = currentAmountUSD * exchangeRate
        setAmountInput(Math.round(jpyAmount).toLocaleString('en-US'))
      } else {
        setAmountInput(currentAmountUSD.toFixed(2))
      }
    }

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsEditing(true)
      let value = e.target.value.replace(/[^0-9.]/g, '')

      if (currency === 'JPY') {
        value = value.replace(/\./g, '')
        setAmountInput(value ? parseInt(value).toLocaleString('en-US') : '')
      } else {
        setAmountInput(value)
      }
    }

    const handleAmountBlur = () => {
      setIsEditing(false)

      if (currency === 'JPY') {
        const jpyValue = parseFloat(amountInput.replace(/,/g, '')) || 0
        const usdValue = jpyValue / exchangeRate
        const calculatedShares = usdValue / pricePerShare
        setShares(Math.round(calculatedShares * 10) / 10)
      } else {
        const usdValue = parseFloat(amountInput) || 0
        const calculatedShares = usdValue / pricePerShare
        setShares(Math.round(calculatedShares * 10) / 10)
      }
    }

    const getCurrencySymbol = () => {
      return currency === 'USD' ? '$' : '¥'
    }

    const formatDisplayValue = () => {
      const symbol = getCurrencySymbol()
      if (!amountInput) return `${symbol}0`
      return `${symbol}${amountInput}`
    }

    return (
      <>
        <div className="relative h-[193px] mb-8">
          <Card className="absolute bottom-0 h-[133px] left-0 w-full">
            <p className="absolute font-medium leading-[30px] left-1/2 text-[#5c4033] text-[20px] text-center top-[79px] tracking-[-0.4492px] -translate-x-1/2 w-[238px]">
              {selectedStock?.name}
            </p>
            <p className="absolute left-1/2 text-[#8b7355] text-xs text-center top-[105px] -translate-x-1/2">
              ${pricePerShare.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} per share
            </p>
          </Card>
          <div className="absolute h-[100px] left-1/2 top-0 -translate-x-1/2 w-[100px]">
            <div className="w-[100px] h-[100px] bg-gradient-to-b from-[#fff8e1] to-[#ffecb3] rounded-full flex items-center justify-center shadow-lg translate-y-[16px]">
              <span className="text-4xl">{accountEmoji}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
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
                    handleInputFocus(e)
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
                  value={formatDisplayValue()}
                  onChange={handleAmountChange}
                  onBlur={handleAmountBlur}
                  onFocus={handleInputFocus}
                  onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                  className={`bg-transparent border-none outline-none min-w-[60px] text-[42px] text-center font-medium ${shares > 0 ? 'text-[#5c4033]' : 'text-[#d4c4b0]'}`}
                  placeholder={`${getCurrencySymbol()}0`}
                />
              </div>
            </div>

            {/* Currency toggle */}
            <div className="bg-[rgba(255,255,255,0.3)] relative flex h-[34px] items-center justify-center p-[2px] rounded-[10px]">
              <div
                className="absolute bg-white rounded-[8px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] transition-all duration-300 ease-out top-[2px] bottom-[2px]"
                style={{
                  left: currency === 'USD' ? '2px' : '50px',
                  width: '46px',
                }}
              />
              <button
                onClick={() => handleCurrencyChange('USD')}
                className="h-[30px] relative rounded-[8px] w-[46px] z-10 flex items-center justify-center"
              >
                <p className={`font-semibold text-[12px] transition-colors duration-200 ${currency === 'USD' ? 'text-[#5c4033]' : 'text-[#8b7355]'}`}>
                  USD
                </p>
              </button>
              <button
                onClick={() => handleCurrencyChange('JPY')}
                className="h-[30px] relative rounded-[8px] w-[46px] z-10 flex items-center justify-center"
              >
                <p className={`font-semibold text-[12px] transition-colors duration-200 ${currency === 'JPY' ? 'text-[#5c4033]' : 'text-[#8b7355]'}`}>
                  JPY
                </p>
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen pb-32">
      <div className="px-6 pt-8">
        <PageHeader
          title="Add money"
          buttonColor={pageStyles.dashboard.buttonColor}
          leftAction={
            <HeaderButton onClick={handleBack} color={pageStyles.dashboard.buttonColor}>
              <ArrowLeft className="h-5 w-5" />
            </HeaderButton>
          }
        />

        {currentStep === 1 && <NameEmojiStep />}
        {currentStep === 2 && <CategoryStep />}
        {currentStep === 3 && selectedCategory === 'stocks' && <StockStep />}
        {currentStep === 3 && (selectedCategory === 'cash' || selectedCategory === 'debt') && <CashDebtStep />}
        {currentStep === 4 && <AmountStep />}
        {currentStep === 5 && <DateStep />}
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#FFD740] via-[#FFD740] to-transparent">
        <button
          className={`w-full h-16 text-lg shadow-2xl transition-all rounded-[18px] font-semibold ${
            canProceed()
              ? 'bg-gradient-to-b from-[#52C41A] to-[#389E0D] text-white hover:from-[#389E0D] hover:to-[#52C41A]'
              : 'bg-white/30 text-white/70 cursor-not-allowed opacity-50'
          }`}
          onClick={handleNext}
          disabled={!canProceed() || loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          ) : (
            <>
              <span className="mr-2">
                {(currentStep === 5 || (currentStep === 3 && (selectedCategory === 'cash' || selectedCategory === 'debt'))) ? 'Save' : 'Next'}
              </span>
              <span className="text-xl">→</span>
            </>
          )}
        </button>

        {/* Progress dots */}
        <div className="flex justify-center gap-3 mt-3">
          {(selectedCategory === 'cash' || selectedCategory === 'debt' ? [1, 2, 3, 4] : [1, 2, 3, 4, 5]).map((step) => (
            <div
              key={step}
              className={`h-1.5 rounded-full transition-all ${
                step === currentStep ? 'w-10 bg-white' : 'w-10 bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Confetti Effect */}
      <ConfettiEffect
        trigger={showConfetti}
        onComplete={() => {
          // Always go to accounts page with animation trigger
          router.replace('/dashboard/accounts?new=true')
        }}
      />
    </div>
  )
}
