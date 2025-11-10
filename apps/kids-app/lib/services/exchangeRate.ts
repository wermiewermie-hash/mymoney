// Exchange rate service for USD/JPY conversion
// Uses ExchangeRate-API (free tier: 1500 requests/month)

interface ExchangeRateData {
  rate: number
  timestamp: number
  lastUpdated: string
}

const CACHE_KEY = 'usd_jpy_exchange_rate'
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

// ExchangeRate-API endpoint (no API key needed for free tier)
const API_URL = 'https://api.exchangerate-api.com/v4/latest/USD'

// Fallback rate if API fails
const FALLBACK_RATE = 149.5

/**
 * Get USD to JPY exchange rate
 * Uses cache with 24-hour TTL to minimize API calls
 */
export async function getExchangeRate(): Promise<number> {
  // Try to get from cache first
  const cached = getCachedRate()
  if (cached !== null) {
    return cached
  }

  // Fetch fresh rate from API
  try {
    const response = await fetch(API_URL)

    if (!response.ok) {
      console.warn('Failed to fetch exchange rate, using fallback')
      return FALLBACK_RATE
    }

    const data = await response.json()

    if (!data.rates || !data.rates.JPY) {
      console.warn('Invalid exchange rate data, using fallback')
      return FALLBACK_RATE
    }

    const rate = data.rates.JPY

    // Cache the result
    cacheRate(rate)

    console.log(`Fetched fresh USD to JPY exchange rate: ${rate}`)
    return rate
  } catch (error) {
    console.warn('Error fetching exchange rate, using fallback:', error)
    return FALLBACK_RATE
  }
}

/**
 * Get exchange rate from localStorage cache
 * Returns null if cache is invalid or expired
 */
function getCachedRate(): number | null {
  if (typeof window === 'undefined') {
    return null // Server-side, no cache available
  }

  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null

    const data: ExchangeRateData = JSON.parse(cached)
    const now = Date.now()

    // Check if cache is still valid
    if (now - data.timestamp < CACHE_TTL) {
      console.log(`Using cached exchange rate: ${data.rate} (updated: ${data.lastUpdated})`)
      return data.rate
    }

    // Cache expired
    return null
  } catch (error) {
    console.warn('Error reading cached exchange rate:', error)
    return null
  }
}

/**
 * Cache exchange rate in localStorage
 */
function cacheRate(rate: number): void {
  if (typeof window === 'undefined') {
    return // Server-side, can't cache
  }

  try {
    const data: ExchangeRateData = {
      rate,
      timestamp: Date.now(),
      lastUpdated: new Date().toISOString()
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch (error) {
    console.warn('Error caching exchange rate:', error)
  }
}

/**
 * Clear cached exchange rate (useful for testing or forcing refresh)
 */
export function clearExchangeRateCache(): void {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.removeItem(CACHE_KEY)
  console.log('Exchange rate cache cleared')
}

/**
 * Get last update time of cached rate
 */
export function getLastUpdateTime(): Date | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null

    const data: ExchangeRateData = JSON.parse(cached)
    return new Date(data.lastUpdated)
  } catch (error) {
    return null
  }
}
