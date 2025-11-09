import { createClient } from '@/lib/supabase/server'
import { updateStockPricesInDB } from '@/lib/services/stockPrice'
import { NextResponse } from 'next/server'

/**
 * API endpoint to update stock prices for all stocks in the database
 * This endpoint should be called daily by a cron job
 *
 * For Vercel deployment, add a vercel.json with:
 * {
 *   "crons": [{
 *     "path": "/api/update-stock-prices",
 *     "schedule": "0 0 * * *"
 *   }]
 * }
 *
 * For other platforms, use an external cron service to hit this endpoint daily
 */
export async function GET(request: Request) {
  try {
    // Optional: Add authentication to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    // Get all unique stock symbols from the stocks table
    const { data: stocks, error: fetchError } = await supabase
      .from('stocks')
      .select('symbol')

    if (fetchError) {
      console.error('Error fetching stocks:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch stocks' },
        { status: 500 }
      )
    }

    if (!stocks || stocks.length === 0) {
      return NextResponse.json(
        { message: 'No stocks to update' },
        { status: 200 }
      )
    }

    const symbols = stocks.map(s => s.symbol)

    // Update prices for all stocks
    await updateStockPricesInDB(symbols)

    console.log(`Successfully updated prices for ${symbols.length} stocks: ${symbols.join(', ')}`)

    return NextResponse.json(
      {
        success: true,
        updated: symbols.length,
        symbols: symbols
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in update-stock-prices endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
