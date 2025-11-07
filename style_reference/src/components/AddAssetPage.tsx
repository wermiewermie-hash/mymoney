import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Screen } from '../App';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import svgPaths from '../imports/svg-0ee2cccma4';
import imgGeminiGeneratedImageLyc2Ylyc2Ylyc2Yl1 from 'figma:asset/54306542bfc20377c281368aeba8dd257e39d540.png';
import imgU1367431884KidsIllustrationOfACoinDoneInACute3DSty48C7Af76642C466BA38AEb395479F7A4011 from 'figma:asset/e0bea88ac19658dbf72e7cc433401d42ef6ea838.png';
import imgGeminiGeneratedImage5Y1Ms65Y1Ms65Y1M1 from 'figma:asset/f32f28c3123af7b9aacf3b54f85a9b5ada274549.png';

interface AddAssetPageProps {
  onNavigate: (screen: Screen) => void;
  onMenuOpen: () => void;
}

type AssetCategory = 'stocks' | 'cash' | 'debt' | null;
type Stock = {
  name: string;
  ticker: string;
  emoji: string;
  description: string;
};

const STOCKS: Stock[] = [
  { name: 'Alphabet', ticker: 'GOOGL', emoji: '🔤', description: "Google's parent company" },
  { name: 'Vanguard Total', ticker: 'VTI', emoji: '📊', description: 'Stock market index fund' },
  { name: 'S&P 500', ticker: 'VOO', emoji: '📊', description: 'Stock market index fund' },
];

// Current stock prices as of November 6, 2025
const STOCK_PRICES: Record<string, number> = {
  'GOOGL': 170.50,
  'VTI': 285.30,
  'VOO': 525.75,
};

export function AddAssetPage({ onNavigate }: AddAssetPageProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(2025, 10, 5)); // Nov 5, 2025
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory>(null);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [shares, setShares] = useState(0);

  const canProceed = () => {
    if (currentStep === 1) return selectedDate !== null;
    if (currentStep === 2) return selectedCategory !== null;
    if (currentStep === 3) return selectedStock !== null;
    if (currentStep === 4) return shares > 0;
    return false;
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save and go back to home
      onNavigate('home');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onNavigate('home');
    }
  };



  const PageHeader = () => (
    <div className="flex items-center justify-between mb-8">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleBack}
        className="rounded-full bg-gradient-to-br from-[#FFA93D] to-[#FFD740] hover:opacity-90 text-white shrink-0 size-9 shadow-md"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <h1 className="text-white text-2xl font-lora font-medium [text-shadow:rgba(0,0,0,0.1)_0px_4px_6px]">Add money</h1>
      <div className="w-9" />
    </div>
  );

  // Step 1: Date Selection
  const DateStep = () => {
    const [month, setMonth] = useState(10); // November
    const [year] = useState(2025);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const today = new Date(2025, 10, 5);

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    return (
      <>
        <div className="relative h-[193px] mb-8">
          <div className="absolute bottom-0 h-[133px] left-0 rounded-[24px] w-full" style={{ backgroundImage: 'linear-gradient(rgb(255, 255, 255) 0%, rgb(255, 248, 225) 100%)' }}>
            <div aria-hidden="true" className="absolute border-[0.592px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_8px_8px_0px_rgba(0,0,0,0.14)]" />
            <p className="absolute font-lora font-medium leading-[30px] left-1/2 text-[#5c4033] text-[20px] text-center top-[79px] tracking-[-0.4492px] translate-x-[-50%] w-[238px]">
              When did you get it?
            </p>
          </div>
          <div className="absolute h-[116.088px] left-[calc(50%-0.071px)] top-[0.99px] translate-x-[-50%] w-[256.857px]">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img alt="" className="absolute h-[138.58%] left-[-0.11%] max-w-none top-[-17.67%] w-[100.21%]" src={imgGeminiGeneratedImageLyc2Ylyc2Ylyc2Yl1} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[24px] p-6 shadow-[0px_2px_3px_3px_rgba(0,0,0,0.1)] border border-[rgba(0,0,0,0.1)]">
          {/* Month/Year selector */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setMonth(m => (m === 0 ? 11 : m - 1))}
              className="bg-[rgba(255,201,7,0.2)] rounded-full p-3 hover:bg-[rgba(255,201,7,0.3)]"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 8 14">
                <path d={svgPaths.p1c59e2c0} stroke="#5C4033" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.89054" />
              </svg>
            </button>
            <div className="text-center">
              <p className="text-[#5c4033] text-[18.908px]">{monthNames[month]}</p>
              <p className="text-[#8b7355] text-[15.127px]">{year}</p>
            </div>
            <button
              onClick={() => setMonth(m => (m === 11 ? 0 : m + 1))}
              className="bg-[rgba(255,201,7,0.2)] rounded-full p-3 hover:bg-[rgba(255,201,7,0.3)]"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 8 14">
                <path d={svgPaths.p2f5de840} stroke="#5C4033" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.89054" />
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
              if (day === null) return <div key={`empty-${idx}`} />;
              const isToday = day === today.getDate() && month === today.getMonth();
              const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === month;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(new Date(year, month, day))}
                  className={`rounded-[15px] h-[33px] flex items-center justify-center text-[15px] transition-all ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#52c41a] to-[#389e0d] text-white shadow-md scale-105'
                      : 'bg-white text-[#5c4033] shadow-sm hover:shadow-md'
                  }`}
                >
                  {day}
                </button>
              );
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
        </div>
      </>
    );
  };

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
        emoji: '💵',
        color: 'from-[#ffc107] to-[#ffa000]',
        descriptions: ['Bank accounts', 'Birthday money'],
      },
    ];

    return (
      <>
        <div className="relative h-[193px] mb-8">
          <div className="absolute bottom-0 h-[133px] left-0 rounded-[24px] w-full" style={{ backgroundImage: 'linear-gradient(rgb(255, 255, 255) 0%, rgb(255, 248, 225) 100%)' }}>
            <div aria-hidden="true" className="absolute border-[0.592px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_8px_8px_0px_rgba(0,0,0,0.14)]" />
            <p className="absolute font-lora font-medium leading-[30px] left-1/2 text-[#5c4033] text-[20px] text-center top-[79px] tracking-[-0.4492px] translate-x-[-50%] w-[238px]">
              What are you adding?
            </p>
          </div>
          <div className="absolute h-[160px] left-[calc(50%-0.071px)] top-[-20px] translate-x-[-50%] w-[176px]">
            <div className="absolute inset-0 overflow-visible pointer-events-none">
              <img alt="" className="absolute max-w-none w-full h-full object-contain" src={imgU1367431884KidsIllustrationOfACoinDoneInACute3DSty48C7Af76642C466BA38AEb395479F7A4011} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {categories.map((category) => (
            <button
              key={category.type}
              onClick={() => setSelectedCategory(category.type)}
              className="bg-white rounded-[24px] p-6 border border-[rgba(0,0,0,0.1)] w-full"
              style={{
                transform: selectedCategory === category.type ? 'scale(1.05)' : 'scale(1)',
                boxShadow: selectedCategory === category.type ? '0px 12px 20px 0px rgba(0,0,0,0.25)' : '0px 8px 8px 0px rgba(0,0,0,0.14)',
                transition: 'transform 600ms cubic-bezier(0.68, -0.15, 0.265, 1.15), box-shadow 600ms cubic-bezier(0.68, -0.15, 0.265, 1.15)'
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
                {selectedCategory === category.type && (
                  <div className="w-8 h-8 bg-[#52c41a] rounded-full flex items-center justify-center animate-in fade-in zoom-in duration-300">
                    <span className="text-white text-xl">✓</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </>
    );
  };

  // Step 3: Stock Selection
  const StockStep = () => {
    const [searchQuery, setSearchQuery] = useState('');

    return (
      <>
        <div className="relative h-[193px] mb-8">
          <div className="absolute bottom-0 h-[133px] left-0 rounded-[24px] w-full" style={{ backgroundImage: 'linear-gradient(rgb(255, 255, 255) 0%, rgb(255, 248, 225) 100%)' }}>
            <div aria-hidden="true" className="absolute border-[0.592px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_8px_8px_0px_rgba(0,0,0,0.14)]" />
            <p className="absolute font-lora font-medium leading-[30px] left-1/2 text-[#5c4033] text-[20px] text-center top-[79px] tracking-[-0.4492px] translate-x-[-50%] w-[238px]">
              Which stock is it?
            </p>
          </div>
          <div className="absolute h-[110px] left-[calc(50%-0.071px)] top-0 translate-x-[-50%] w-[240px]">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img alt="" className="absolute max-w-none w-full h-auto" src={imgGeminiGeneratedImage5Y1Ms65Y1Ms65Y1M1} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {STOCKS.map((stock) => (
            <button
              key={stock.ticker}
              onClick={() => setSelectedStock(stock)}
              className="bg-white rounded-[24px] p-6 border border-[rgba(0,0,0,0.1)] w-full"
              style={{
                transform: selectedStock?.ticker === stock.ticker ? 'scale(1.05)' : 'scale(1)',
                boxShadow: selectedStock?.ticker === stock.ticker ? '0px 12px 20px 0px rgba(0,0,0,0.25)' : '0px 8px 8px 0px rgba(0,0,0,0.14)',
                transition: 'transform 600ms cubic-bezier(0.68, -0.15, 0.265, 1.15), box-shadow 600ms cubic-bezier(0.68, -0.15, 0.265, 1.15)'
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-b from-[#fff8e1] to-[#ffecb3] rounded-full flex items-center justify-center shadow-md">
                  <span className="text-[28px]">{stock.emoji}</span>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-[#5c4033] font-semibold">{stock.name}</h3>
                  <p className="text-sm text-[#8b7355]">{stock.ticker}</p>
                  <p className="text-xs text-[#8b7355]">{stock.description}</p>
                </div>
                {selectedStock?.ticker === stock.ticker ? (
                  <div className="w-8 h-8 bg-[#52c41a] rounded-full flex items-center justify-center shrink-0 animate-in fade-in zoom-in duration-300">
                    <span className="text-white text-lg">✓</span>
                  </div>
                ) : (
                  <div className="w-11 h-11 bg-[rgba(255,201,7,0.2)] rounded-full flex items-center justify-center shrink-0">
                    <span className="text-[#5c4033] text-2xl">+</span>
                  </div>
                )}
              </div>
            </button>
          ))}

          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-13 bg-white rounded-[24px] px-12 text-[#8b7355] border border-[rgba(0,0,0,0.08)] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)]"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20">
                <circle cx="8.33" cy="8.33" r="5.83" stroke="#8B7355" strokeWidth="1.67" />
                <path d="M17.5 17.5L12.5 12.5" stroke="#8B7355" strokeLinecap="round" strokeWidth="1.67" />
              </svg>
            </div>
          </div>
        </div>
      </>
    );
  };

  // Step 4: Amount Entry
  const AmountStep = () => {
    const pricePerShare = selectedStock ? STOCK_PRICES[selectedStock.ticker] : 0;
    const [currency, setCurrency] = useState<'USD' | 'JPY'>('USD');
    const [amountInput, setAmountInput] = useState<string>('');
    const [isEditing, setIsEditing] = useState(false);
    const USD_TO_JPY = 150; // Exchange rate as of today

    // Initialize and sync amountInput with shares
    useEffect(() => {
      if (!isEditing) {
        const baseAmount = shares * pricePerShare;
        if (currency === 'JPY') {
          const jpyAmount = Math.round(baseAmount * USD_TO_JPY);
          setAmountInput(jpyAmount > 0 ? jpyAmount.toLocaleString('en-US') : '');
        } else {
          setAmountInput(baseAmount > 0 ? baseAmount.toFixed(2) : '');
        }
      }
    }, [shares, currency, pricePerShare, isEditing]);

    // Sync amountInput with shares when shares change via stepper
    const updateAmountFromShares = (newShares: number) => {
      const baseAmount = newShares * pricePerShare;
      if (currency === 'JPY') {
        const jpyAmount = Math.round(baseAmount * USD_TO_JPY);
        setAmountInput(jpyAmount > 0 ? jpyAmount.toLocaleString('en-US') : '');
      } else {
        setAmountInput(baseAmount > 0 ? baseAmount.toFixed(2) : '');
      }
    };

    // Handle stepper button clicks
    const handleIncrement = () => {
      const newShares = shares + 1;
      setShares(newShares);
      updateAmountFromShares(newShares);
      setIsEditing(false);
    };

    const handleDecrement = () => {
      const newShares = Math.max(0, shares - 1);
      setShares(newShares);
      updateAmountFromShares(newShares);
      setIsEditing(false);
    };

    // Handle currency switch
    const handleCurrencyChange = (newCurrency: 'USD' | 'JPY') => {
      const currentAmountUSD = currency === 'USD' 
        ? parseFloat(amountInput) || 0
        : (parseFloat(amountInput.replace(/,/g, '')) || 0) / USD_TO_JPY;

      setCurrency(newCurrency);
      setIsEditing(false);
      
      if (newCurrency === 'JPY') {
        const jpyAmount = currentAmountUSD * USD_TO_JPY;
        setAmountInput(Math.round(jpyAmount).toLocaleString('en-US'));
      } else {
        setAmountInput(currentAmountUSD.toFixed(2));
      }
    };

    // Handle amount input change (just update the display, don't convert yet)
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsEditing(true);
      let value = e.target.value.replace(/[^0-9.]/g, ''); // Remove non-numeric except decimal
      
      if (currency === 'JPY') {
        value = value.replace(/\./g, ''); // No decimals for JPY
        setAmountInput(value ? parseInt(value).toLocaleString('en-US') : '');
      } else {
        setAmountInput(value);
      }
    };

    // Convert the amount to shares when user is done editing
    const handleAmountBlur = () => {
      setIsEditing(false);
      
      if (currency === 'JPY') {
        const jpyValue = parseFloat(amountInput.replace(/,/g, '')) || 0;
        const usdValue = jpyValue / USD_TO_JPY;
        const calculatedShares = usdValue / pricePerShare;
        setShares(Math.round(calculatedShares * 10) / 10); // Round to 1 decimal
      } else {
        const usdValue = parseFloat(amountInput) || 0;
        const calculatedShares = usdValue / pricePerShare;
        setShares(Math.round(calculatedShares * 10) / 10); // Round to 1 decimal
      }
    };

    // Handle Enter key to commit the amount
    const handleAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.currentTarget.blur(); // Trigger blur which will handle the conversion
      }
    };

    const getCurrencySymbol = () => {
      return currency === 'USD' ? '$' : '¥';
    };

    const formatDisplayValue = () => {
      const symbol = getCurrencySymbol();
      if (!amountInput) return `${symbol}0`;
      return `${symbol}${amountInput}`;
    };

    return (
      <>
        <div className="relative h-[193px] mb-8">
          <div className="absolute bottom-0 h-[133px] left-0 rounded-[24px] w-full" style={{ backgroundImage: 'linear-gradient(rgb(255, 255, 255) 0%, rgb(255, 248, 225) 100%)' }}>
            <div aria-hidden="true" className="absolute border-[0.592px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_8px_8px_0px_rgba(0,0,0,0.14)]" />
            <p className="absolute font-lora font-medium leading-[30px] left-1/2 text-[#5c4033] text-[20px] text-center top-[79px] tracking-[-0.4492px] translate-x-[-50%] w-[238px]">
              {selectedStock?.name}
            </p>
            <p className="absolute left-1/2 text-[#8b7355] text-xs text-center top-[105px] translate-x-[-50%]">
              {selectedStock?.ticker} · ${pricePerShare} per share
            </p>
          </div>
          <div className="absolute h-[100px] left-[calc(50%-0.071px)] top-0 translate-x-[-50%] w-[100px]">
            <div className="w-[100px] h-[100px] bg-gradient-to-b from-[#fff8e1] to-[#ffecb3] rounded-full flex items-center justify-center shadow-lg translate-y-[16px]">
              <span className="text-4xl">{selectedStock?.emoji}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Stepper */}
          <div className="bg-white rounded-[24px] p-6 shadow-[0px_2px_3px_3px_rgba(0,0,0,0.1)] border border-[rgba(0,0,0,0.1)]">
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
                <p className="text-[#5c4033] text-[48px] font-lora font-medium">{shares}</p>
                <p className="text-[#8b7355] text-sm">shares</p>
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
          </div>

          {/* Amount display */}
          <div className="content-stretch flex flex-col gap-[12px] items-center relative w-full">
            {/* Main card */}
            <div className="bg-white h-[130px] relative rounded-[24px] shrink-0 w-full">
              <div aria-hidden="true" className="absolute border-[0.608px] border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_2px_3px_3px_rgba(0,0,0,0.1)]" />
              <div className="size-full">
                <div className="box-border content-stretch flex flex-col h-[130px] items-start pb-[0.608px] pt-[24.601px] px-[24.601px] relative w-full">
                  <div className="h-[80.978px] relative shrink-0 w-full">
                    <div className="flex flex-row justify-center size-full">
                      <div className="content-stretch flex gap-[15.992px] h-[80.978px] items-start justify-center relative w-full">
                        {/* Amount container */}
                        <div className="h-[81px] relative shrink-0">
                          <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[3.991px] h-[81px] items-center relative">
                            {/* Amount input */}
                            <div className="relative shrink-0">
                              <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-start justify-center relative">
                                <div className="content-stretch flex h-[55.997px] items-start overflow-clip relative shrink-0">
                                  <input
                                    type="text"
                                    value={formatDisplayValue()}
                                    onChange={handleAmountChange}
                                    onBlur={handleAmountBlur}
                                    onKeyDown={handleAmountKeyDown}
                                    className={`bg-transparent border-none outline-none min-w-[60px] text-[48px] text-center font-lora font-medium ${shares > 0 ? 'text-[#5c4033]' : 'text-[#d4c4b0]'}`}
                                    placeholder={`${getCurrencySymbol()}0`}
                                  />
                                </div>
                              </div>
                            </div>
                            {/* Currency label */}
                            <div className="h-[21px] relative shrink-0">
                              <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[21px] relative">

                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Currency toggle */}
            <div className="bg-[rgba(255,255,255,0.3)] box-border content-stretch flex gap-[1.995px] h-[33.98px] items-start justify-center pb-0 pl-[1.995px] pr-0 pt-[1.995px] relative rounded-[10px] shrink-0">
              <div className="relative">
                <div
                  className="absolute top-0 bottom-0 bg-white rounded-[8px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] transition-all duration-300 ease-out"
                  style={{
                    left: currency === 'USD' ? '0px' : '48.432px',
                    width: '46.437px',
                    height: '29.989px',
                  }}
                />
              </div>
              <button
                onClick={() => handleCurrencyChange('USD')}
                className="h-[29.989px] relative rounded-[8px] shrink-0 w-[46.437px] z-10"
              >
                <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[29.989px] relative w-[46.437px]">
                  <p className={`absolute font-['Fredoka:SemiBold',sans-serif] font-semibold leading-[18px] left-[11.99px] text-[12px] text-nowrap top-[6.21px] whitespace-pre transition-colors duration-200 ${currency === 'USD' ? 'text-[#5c4033]' : 'text-[#8b7355]'}`} style={{ fontVariationSettings: "'wdth' 100" }}>
                    USD
                  </p>
                </div>
              </button>
              <button
                onClick={() => handleCurrencyChange('JPY')}
                className="h-[29.989px] relative rounded-[8px] shrink-0 w-[44.993px] z-10"
              >
                <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[29.989px] relative w-[44.993px]">
                  <p className={`absolute font-['Fredoka:SemiBold',sans-serif] font-semibold leading-[18px] left-[11.99px] text-[12px] text-nowrap top-[6.21px] whitespace-pre transition-colors duration-200 ${currency === 'JPY' ? 'text-[#5c4033]' : 'text-[#8b7355]'}`} style={{ fontVariationSettings: "'wdth' 100" }}>
                    JPY
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };

  // Step 5: Celebration Screen
  const CelebrationStep = () => {
    return (
      <div className="h-[680px] relative w-full overflow-hidden">
        {/* Decorative emoji stars - positioned statically */}
        <motion.div 
          className="absolute left-[245px] top-[160px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
        >
          <p className="text-[24px]">✨</p>
        </motion.div>
        <motion.div 
          className="absolute left-[340px] top-[180px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        >
          <p className="text-[24px]">⭐</p>
        </motion.div>
        <motion.div 
          className="absolute left-[299px] top-[75px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        >
          <p className="text-[24px]">✨</p>
        </motion.div>
        <motion.div 
          className="absolute left-[20px] top-[25px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
        >
          <p className="text-[24px]">🌟</p>
        </motion.div>
        <motion.div 
          className="absolute left-[328px] top-[405px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        >
          <p className="text-[24px]">✨</p>
        </motion.div>
        <motion.div 
          className="absolute left-[143px] top-[300px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2.3, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        >
          <p className="text-[24px]">⭐</p>
        </motion.div>
        <motion.div 
          className="absolute left-[112px] top-[200px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        >
          <p className="text-[24px]">⭐</p>
        </motion.div>
        <motion.div 
          className="absolute left-[287px] top-[295px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        >
          <p className="text-[24px]">🌟</p>
        </motion.div>
        <motion.div 
          className="absolute left-[148px] top-[80px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        >
          <p className="text-[24px]">💫</p>
        </motion.div>
        <motion.div 
          className="absolute left-[141px] top-[180px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <p className="text-[24px]">⭐</p>
        </motion.div>
        <motion.div 
          className="absolute left-[278px] top-[250px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
        >
          <p className="text-[24px]">🌟</p>
        </motion.div>
        <motion.div 
          className="absolute left-[206px] top-[205px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0 }}
        >
          <p className="text-[24px]">💫</p>
        </motion.div>

        {/* Confetti dots */}
        <motion.div 
          className="absolute bg-[#52c41a] left-[319px] opacity-[0.513] rounded-[6px] size-[12px] top-[195px]"
          animate={{ scale: [1, 1.3, 1], opacity: [0.513, 0.8, 0.513] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
        />
        <motion.div 
          className="absolute bg-[#52c41a] left-[258px] opacity-[0.592] size-[12px] top-[238px]"
          animate={{ scale: [1, 1.3, 1], opacity: [0.592, 0.9, 0.592] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />
        <motion.div 
          className="absolute bg-[#ffd740] left-[179px] opacity-[0.524] size-[12px] top-[280px]"
          animate={{ scale: [1, 1.3, 1], opacity: [0.524, 0.8, 0.524] }}
          transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
        <motion.div 
          className="absolute bg-[#ffd740] left-[93px] opacity-[0.523] size-[12px] top-[55px]"
          animate={{ scale: [1, 1.3, 1], opacity: [0.523, 0.8, 0.523] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
        />
        <motion.div 
          className="absolute bg-[#52c41a] left-[67px] opacity-[0.598] size-[12px] top-[230px]"
          animate={{ scale: [1, 1.3, 1], opacity: [0.598, 0.9, 0.598] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        />
        <motion.div 
          className="absolute bg-[#52c41a] left-[123px] opacity-[0.578] rounded-[6px] size-[12px] top-[243px]"
          animate={{ scale: [1, 1.3, 1], opacity: [0.578, 0.85, 0.578] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        />
        <motion.div 
          className="absolute bg-[#4a90e2] left-[371px] opacity-[0.548] size-[12px] top-[85px]"
          animate={{ scale: [1, 1.3, 1], opacity: [0.548, 0.8, 0.548] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        />
        <motion.div 
          className="absolute bg-[#52c41a] left-[223px] opacity-[0.519] rounded-[6px] size-[12px] top-[240px]"
          animate={{ scale: [1, 1.3, 1], opacity: [0.519, 0.8, 0.519] }}
          transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        />
        <motion.div 
          className="absolute bg-[#ffa93d] left-[359px] opacity-[0.563] rounded-[6px] size-[12px] top-[215px]"
          animate={{ scale: [1, 1.3, 1], opacity: [0.563, 0.85, 0.563] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
        />
        <motion.div 
          className="absolute bg-[#4a90e2] left-[160px] opacity-[0.501] size-[12px] top-[240px]"
          animate={{ scale: [1, 1.3, 1], opacity: [0.501, 0.8, 0.501] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />
        <motion.div 
          className="absolute bg-[#4a90e2] left-[367px] opacity-50 rounded-[6px] size-[12px] top-[218px]"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
        <motion.div 
          className="absolute bg-[#4a90e2] left-[290px] opacity-[0.504] size-[12px] top-[125px]"
          animate={{ scale: [1, 1.3, 1], opacity: [0.504, 0.8, 0.504] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
        />
        <motion.div 
          className="absolute bg-[#9b59b6] left-[5px] opacity-[0.502] size-[12px] top-[215px]"
          animate={{ scale: [1, 1.3, 1], opacity: [0.502, 0.8, 0.502] }}
          transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        />
        <motion.div 
          className="absolute bg-[#4a90e2] left-[117px] opacity-[0.594] rounded-[6px] size-[12px] top-[170px]"
          animate={{ scale: [1, 1.3, 1], opacity: [0.594, 0.9, 0.594] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        />
        <motion.div 
          className="absolute bg-[#9b59b6] left-[112px] opacity-[0.575] size-[12px] top-[15px]"
          animate={{ scale: [1, 1.3, 1], opacity: [0.575, 0.85, 0.575] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        />
        <motion.div 
          className="absolute bg-[#ffa93d] left-[6px] opacity-[0.53] rounded-[6px] size-[12px] top-[200px]"
          animate={{ scale: [1, 1.3, 1], opacity: [0.53, 0.8, 0.53] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        />
        <motion.div 
          className="absolute bg-[#4a90e2] left-[119px] opacity-[0.506] rounded-[6px] size-[12px] top-[127px]"
          animate={{ scale: [1, 1.3, 1], opacity: [0.506, 0.8, 0.506] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
        />
        <motion.div 
          className="absolute bg-[#ffa93d] left-[33px] opacity-[0.526] size-[12px] top-[256px]"
          animate={{ scale: [1, 1.3, 1], opacity: [0.526, 0.8, 0.526] }}
          transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />
        <motion.div 
          className="absolute bg-[#ffa93d] left-[258px] opacity-[0.503] size-[12px] top-[225px]"
          animate={{ scale: [1, 1.3, 1], opacity: [0.503, 0.8, 0.503] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
        <motion.div 
          className="absolute bg-[#52c41a] left-[278px] opacity-[0.579] rounded-[6px] size-[12px] top-[180px]"
          animate={{ scale: [1, 1.3, 1], opacity: [0.579, 0.85, 0.579] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
        />

        {/* Main content */}
        <div className="absolute left-1/2 top-[230px] -translate-x-1/2 -translate-y-1/2">
          {/* Large emoji in gradient circle */}
          <motion.div 
            className="bg-gradient-to-b from-[#fff8e1] to-[#ffecb3] h-[128px] w-[129px] rounded-[200px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] flex items-center justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              duration: 0.6
            }}
          >
            <p className="text-[64px] leading-[72px]">🎉</p>
          </motion.div>
        </div>

        {/* Heading */}
        <div className="absolute left-1/2 top-[390px] -translate-x-1/2">
          <p className="text-[#5c4033] text-[36px] leading-[40px] text-center whitespace-nowrap font-lora font-medium">
            Awesome!
          </p>
        </div>

        {/* Paragraph */}
        <div className="absolute left-1/2 top-[445px] -translate-x-1/2 w-[294px]">
          <p className="text-[rgba(92,64,51,0.9)] text-[20px] leading-[28px] text-center font-lora font-medium">
            Saved {shares} {selectedStock?.name} stock{shares !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-32">
      <div className="px-6 pt-8">
        {currentStep < 5 && <PageHeader />}
        
        {currentStep === 1 && <DateStep />}
        {currentStep === 2 && <CategoryStep />}
        {currentStep === 3 && <StockStep />}
        {currentStep === 4 && <AmountStep />}
        {currentStep === 5 && <CelebrationStep />}
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#FFD740] via-[#FFD740] to-transparent">
        <Button
          className={`w-full h-16 text-lg shadow-2xl transition-all rounded-[18px] ${
            currentStep === 5
              ? 'bg-gradient-to-b from-[#52C41A] to-[#389E0D] text-white hover:from-[#389E0D] hover:to-[#52C41A]'
              : canProceed()
              ? 'bg-gradient-to-b from-[#52C41A] to-[#389E0D] text-white hover:from-[#389E0D] hover:to-[#52C41A]'
              : 'bg-white/30 text-white/70 cursor-not-allowed opacity-50'
          }`}
          onClick={handleNext}
          disabled={currentStep !== 5 && !canProceed()}
        >
          <span className="mr-2">{currentStep === 5 ? 'Done! 🏠' : currentStep === 4 ? 'Save' : 'Next'}</span>
          {currentStep !== 5 && <span className="text-xl">→</span>}
        </Button>

        {/* Progress dots */}
        {currentStep < 5 && (
          <div className="flex justify-center gap-3 mt-3">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-1.5 rounded-full transition-all ${
                  step === currentStep ? 'w-10 bg-white' : 'w-10 bg-white/30'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
