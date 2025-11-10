// Stock price service with fallback to mock prices
// Uses Alpha Vantage API when available, falls back to mock prices

import { createClient } from '@/lib/supabase/server'

interface StockPrice {
  symbol: string
  price: number
  timestamp: number
}

// In-memory cache with 5-minute TTL
const priceCache = new Map<string, StockPrice>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Alpha Vantage API key from environment variable
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY || ''

// Mock prices as fallback
const mockPrices: Record<string, number> = {
  'AAPL': 178.50,
  'MSFT': 378.91,
  'GOOGL': 170.50,
  'AMZN': 176.34,
  'META': 485.20,
  'NVDA': 875.45,
  'TSLA': 242.80,
  'NFLX': 645.90,
  'VTI': 285.30,
  'VOO': 525.75,
  'SPY': 526.40,
  'QQQ': 445.23,
  'BND': 71.85,
  'AGG': 95.23,
  'BRK.B': 445.67,
  'JPM': 215.43,
  'JNJ': 156.78,
  'V': 287.92,
  'WMT': 178.34,
  'PG': 165.89,
  'KO': 62.45,
  'MCD': 295.67,
  'DIS': 112.34,
  'NKE': 98.76,
  'COIN': 234.56,
  'MSTR': 456.78,
}

export async function getStockPrice(ticker: string): Promise<number | null> {
  const normalizedTicker = ticker.toUpperCase()

  // Check cache first
  const cached = priceCache.get(normalizedTicker)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.price
  }

  // If no API key, use mock prices
  if (!API_KEY) {
    console.warn(`No Alpha Vantage API key found, using mock price for ${normalizedTicker}`)
    const price = mockPrices[normalizedTicker] || 100.00

    // Cache the result
    priceCache.set(normalizedTicker, {
      symbol: normalizedTicker,
      price,
      timestamp: Date.now()
    })

    return price
  }

  // Try to fetch from Alpha Vantage API
  try {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${normalizedTicker}&apikey=${API_KEY}`
    const response = await fetch(url)

    if (!response.ok) {
      console.warn(`Failed to fetch price for ${normalizedTicker}, using mock price`)
      return mockPrices[normalizedTicker] || 100.00
    }

    const data = await response.json()

    // Check for API errors
    if (data['Error Message']) {
      console.warn(`API error for ${normalizedTicker}:`, data['Error Message'], '- using mock price')
      return mockPrices[normalizedTicker] || 100.00
    }

    // Check for rate limiting
    if (data['Note']) {
      console.warn(`API rate limit reached for ${normalizedTicker} - using mock price`)
      return mockPrices[normalizedTicker] || 100.00
    }

    const quote = data['Global Quote']
    if (!quote || !quote['05. price']) {
      console.warn(`No price data found for ${normalizedTicker} - using mock price`)
      return mockPrices[normalizedTicker] || 100.00
    }

    const price = parseFloat(quote['05. price'])

    // Cache the result
    priceCache.set(normalizedTicker, {
      symbol: normalizedTicker,
      price,
      timestamp: Date.now()
    })

    console.log(`Successfully fetched real-time price for ${normalizedTicker}: $${price}`)
    return price
  } catch (error) {
    console.warn(`Error fetching stock price for ${normalizedTicker}, using mock price:`, error)
    return mockPrices[normalizedTicker] || 100.00
  }
}

export async function getMultipleStockPrices(tickers: string[]): Promise<Map<string, number>> {
  const prices = new Map<string, number>()

  // Fetch prices in parallel since we're using mock data
  const pricePromises = tickers.map(ticker => getStockPrice(ticker))
  const priceResults = await Promise.all(pricePromises)

  tickers.forEach((ticker, index) => {
    const price = priceResults[index]
    if (price !== null) {
      prices.set(ticker.toUpperCase(), price)
    }
  })

  return prices
}

// Helper to clear cache (useful for testing)
export function clearPriceCache() {
  priceCache.clear()
}

// Get historical stock price for a specific date
export async function getHistoricalStockPrice(symbol: string, date: Date): Promise<number | null> {
  const normalizedSymbol = symbol.toUpperCase()
  const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD format

  // First check database
  const supabase = await createClient()
  const { data: stock } = await supabase
    .from('stocks')
    .select('id')
    .eq('symbol', normalizedSymbol)
    .single()

  if (stock) {
    const { data: priceRecord } = await supabase
      .from('stock_prices')
      .select('price')
      .eq('stock_id', stock.id)
      .eq('date', dateStr)
      .single()

    if (priceRecord) {
      return priceRecord.price
    }
  }

  // If not in database and no API key, use mock price
  if (!API_KEY) {
    console.warn(`No historical data for ${normalizedSymbol} on ${dateStr}, using mock price`)
    return mockPrices[normalizedSymbol] || 100.00
  }

  // Try to fetch from Alpha Vantage API (TIME_SERIES_DAILY)
  try {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${normalizedSymbol}&apikey=${API_KEY}`
    const response = await fetch(url)

    if (!response.ok) {
      console.warn(`Failed to fetch historical price for ${normalizedSymbol}`)
      return mockPrices[normalizedSymbol] || 100.00
    }

    const data = await response.json()

    if (data['Error Message'] || data['Note']) {
      console.warn(`API error or rate limit for ${normalizedSymbol}`)
      return mockPrices[normalizedSymbol] || 100.00
    }

    const timeSeries = data['Time Series (Daily)']
    if (!timeSeries || !timeSeries[dateStr]) {
      console.warn(`No price data found for ${normalizedSymbol} on ${dateStr}`)
      return mockPrices[normalizedSymbol] || 100.00
    }

    const price = parseFloat(timeSeries[dateStr]['4. close'])

    // Cache in database if we have a stock_id
    if (stock) {
      await supabase.from('stock_prices').insert({
        stock_id: stock.id,
        price,
        date: dateStr
      }).select().single()
    }

    return price
  } catch (error) {
    console.warn(`Error fetching historical price for ${normalizedSymbol}:`, error)
    return mockPrices[normalizedSymbol] || 100.00
  }
}

// Update stock prices in database (for cron job)
export async function updateStockPricesInDB(symbols: string[]): Promise<void> {
  const supabase = await createClient()

  for (const symbol of symbols) {
    const price = await getStockPrice(symbol)
    if (price === null) continue

    const normalizedSymbol = symbol.toUpperCase()
    const today = new Date().toISOString().split('T')[0]

    // Update stocks table
    const { data: stock } = await supabase
      .from('stocks')
      .update({
        current_price: price,
        last_updated: new Date().toISOString()
      })
      .eq('symbol', normalizedSymbol)
      .select()
      .single()

    if (!stock) continue

    // Add to stock_prices history (ignore if already exists for today)
    await supabase
      .from('stock_prices')
      .upsert({
        stock_id: stock.id,
        price,
        date: today
      }, {
        onConflict: 'stock_id,date'
      })
  }
}
