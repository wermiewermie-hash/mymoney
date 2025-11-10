/**
 * Get emoji for stock type
 */
export function getStockEmoji(ticker: string, type: string): string {
  // Tech companies
  if (['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA'].includes(ticker)) {
    return '💻'
  }
  // ETFs and Index Funds
  if (type === 'etf' || ['VTI', 'VOO', 'SPY', 'QQQ'].includes(ticker)) {
    return '📊'
  }
  // Automotive
  if (ticker === 'TSLA') {
    return '🚗'
  }
  // Entertainment
  if (['NFLX', 'DIS'].includes(ticker)) {
    return '🎬'
  }
  // Finance
  if (['JPM', 'BRK.B', 'V', 'COIN'].includes(ticker)) {
    return '💰'
  }
  // Consumer Goods
  if (['WMT', 'PG', 'KO', 'MCD', 'NKE'].includes(ticker)) {
    return '🛍️'
  }
  // Healthcare
  if (ticker === 'JNJ') {
    return '⚕️'
  }
  // Crypto-related
  if (['COIN', 'MSTR'].includes(ticker)) {
    return '₿'
  }

  // Default
  return '📈'
}
