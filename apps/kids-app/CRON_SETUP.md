# Stock Price Update Cron Job Setup

This app automatically updates stock prices daily using a cron job.

## How It Works

The `/api/update-stock-prices` endpoint:
1. Fetches all stocks from the database
2. Gets current prices from Alpha Vantage API
3. Updates both `stocks.current_price` and adds records to `stock_prices` history table

## Deployment Options

### Option 1: Vercel (Recommended)

The `vercel.json` file is already configured to run the cron job daily at midnight UTC:

```json
{
  "crons": [{
    "path": "/api/update-stock-prices",
    "schedule": "0 0 * * *"
  }]
}
```

**Setup Steps:**
1. Deploy to Vercel
2. The cron job will automatically run daily
3. (Optional) Add `CRON_SECRET` environment variable in Vercel dashboard for security
4. View cron job logs in Vercel dashboard

**Note:** Vercel cron jobs are only available on paid plans.

### Option 2: External Cron Service

Use a service like cron-job.org, EasyCron, or GitHub Actions:

1. **Set up authentication:**
   - Add `CRON_SECRET` to your `.env.local`:
     ```
     CRON_SECRET=your-random-secret-here
     ```
   - Add the same secret to your deployment environment variables

2. **Configure the cron service** to make a GET request to:
   ```
   https://your-domain.com/api/update-stock-prices
   ```

3. **Add authorization header:**
   ```
   Authorization: Bearer your-random-secret-here
   ```

4. **Set schedule:** Daily at midnight (or any preferred time)
   - Cron expression: `0 0 * * *`

### Option 3: GitHub Actions

Create `.github/workflows/update-stock-prices.yml`:

```yaml
name: Update Stock Prices
on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight UTC
  workflow_dispatch:  # Allow manual triggers

jobs:
  update-prices:
    runs-on: ubuntu-latest
    steps:
      - name: Call update endpoint
        run: |
          curl -X GET \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://your-domain.com/api/update-stock-prices
```

Add `CRON_SECRET` to your GitHub repository secrets.

## Manual Testing

Test the endpoint locally:

```bash
# Without auth (if CRON_SECRET is not set)
curl http://localhost:3000/api/update-stock-prices

# With auth
curl -H "Authorization: Bearer your-secret" http://localhost:3000/api/update-stock-prices
```

Expected response:
```json
{
  "success": true,
  "updated": 6,
  "symbols": ["GOOGL", "DASH", "VTI", "VXUS", "VT", "VOO"]
}
```

## API Rate Limits

- **Alpha Vantage:** 25 requests/day (free tier)
- **Current stocks:** 6 symbols
- **Daily updates:** Well within limits
- **Safety margin:** 19 requests remaining for manual price checks

## Monitoring

Check if prices are updating:
1. View the `stock_prices` table in Supabase
2. Check `stocks.last_updated` timestamps
3. Review deployment logs for "Successfully updated prices" messages

## Troubleshooting

**Prices not updating?**
- Check deployment logs for errors
- Verify `ALPHA_VANTAGE_API_KEY` is set in environment variables
- Ensure cron job is actually running (check Vercel dashboard or service logs)
- Verify API rate limits haven't been exceeded

**Authentication errors?**
- Ensure `CRON_SECRET` matches between service and deployment
- Check authorization header format: `Bearer <secret>`
