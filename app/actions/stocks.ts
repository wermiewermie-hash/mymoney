'use server'

import { getStockPrice as getStockPriceFromAPI } from '@/lib/services/stockPrice'

export interface StockSearchResult {
  name: string
  ticker: string
  type: string
  exchange?: string
}

export interface StockPrice {
  ticker: string
  price: number
  currency: string
}

/**
 * Search for stocks by ticker or company name
 * Using Yahoo Finance search via API
 */
export async function searchStocks(query: string): Promise<StockSearchResult[]> {
  if (!query || query.length < 1) {
    return []
  }

  try {
    // Using Yahoo Finance API via RapidAPI
    // For now, we'll use a mock implementation that searches a predefined list
    // In production, you'd integrate with a real API like Alpha Vantage, Finnhub, or Yahoo Finance

    const popularStocks: StockSearchResult[] = [
      // Tech Giants
      { name: 'Apple Inc.', ticker: 'AAPL', type: 'stock' },
      { name: 'Microsoft Corporation', ticker: 'MSFT', type: 'stock' },
      { name: 'Alphabet Inc. (Google)', ticker: 'GOOGL', type: 'stock' },
      { name: 'Amazon.com Inc.', ticker: 'AMZN', type: 'stock' },
      { name: 'Meta Platforms Inc. (Facebook)', ticker: 'META', type: 'stock' },
      { name: 'NVIDIA Corporation', ticker: 'NVDA', type: 'stock' },
      { name: 'Tesla Inc.', ticker: 'TSLA', type: 'stock' },
      { name: 'Netflix Inc.', ticker: 'NFLX', type: 'stock' },

      // Index Funds & ETFs
      { name: 'Vanguard Total Stock Market ETF', ticker: 'VTI', type: 'etf' },
      { name: 'Vanguard S&P 500 ETF', ticker: 'VOO', type: 'etf' },
      { name: 'SPDR S&P 500 ETF Trust', ticker: 'SPY', type: 'etf' },
      { name: 'Invesco QQQ Trust', ticker: 'QQQ', type: 'etf' },
      { name: 'Vanguard Total Bond Market ETF', ticker: 'BND', type: 'etf' },
      { name: 'iShares Core U.S. Aggregate Bond ETF', ticker: 'AGG', type: 'etf' },

      // Popular Stocks
      { name: 'Berkshire Hathaway Inc.', ticker: 'BRK.B', type: 'stock' },
      { name: 'JPMorgan Chase & Co.', ticker: 'JPM', type: 'stock' },
      { name: 'Johnson & Johnson', ticker: 'JNJ', type: 'stock' },
      { name: 'Visa Inc.', ticker: 'V', type: 'stock' },
      { name: 'Walmart Inc.', ticker: 'WMT', type: 'stock' },
      { name: 'Procter & Gamble Co.', ticker: 'PG', type: 'stock' },
      { name: 'Coca-Cola Company', ticker: 'KO', type: 'stock' },
      { name: 'McDonald\'s Corporation', ticker: 'MCD', type: 'stock' },
      { name: 'Disney (Walt Disney Company)', ticker: 'DIS', type: 'stock' },
      { name: 'Nike Inc.', ticker: 'NKE', type: 'stock' },

      // Crypto-related
      { name: 'Coinbase Global Inc.', ticker: 'COIN', type: 'stock' },
      { name: 'MicroStrategy Inc.', ticker: 'MSTR', type: 'stock' },
    ]

    const searchTerm = query.toLowerCase()
    const results = popularStocks.filter(stock =>
      stock.name.toLowerCase().includes(searchTerm) ||
      stock.ticker.toLowerCase().includes(searchTerm)
    )

    return results.slice(0, 10) // Return top 10 matches
  } catch (error) {
    console.error('Error searching stocks:', error)
    return []
  }
}

/**
 * Get current stock price
 * Uses Alpha Vantage API with fallback to mock prices
 */
export async function getStockPrice(ticker: string): Promise<StockPrice | null> {
  try {
    const price = await getStockPriceFromAPI(ticker)

    if (price === null) {
      return null
    }

    return {
      ticker,
      price,
      currency: 'USD'
    }
  } catch (error) {
    console.error('Error fetching stock price:', error)
    return null
  }
}

