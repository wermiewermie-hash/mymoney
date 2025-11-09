-- Create stocks reference table (master list of supported stocks)
CREATE TABLE public.stocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  current_price DECIMAL(12, 4),
  last_updated TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create stock_prices historical table (for tracking price over time)
CREATE TABLE public.stock_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stock_id UUID REFERENCES public.stocks(id) ON DELETE CASCADE NOT NULL,
  price DECIMAL(12, 4) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(stock_id, date)
);

-- Create indexes for performance
CREATE INDEX stock_prices_stock_date_idx ON public.stock_prices(stock_id, date DESC);
CREATE INDEX stocks_symbol_idx ON public.stocks(symbol);

-- Enable RLS on new tables
ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_prices ENABLE ROW LEVEL SECURITY;

-- Stocks are public (everyone can read)
CREATE POLICY "Anyone can view stocks"
  ON public.stocks FOR SELECT
  USING (true);

-- Stock prices are public (everyone can read)
CREATE POLICY "Anyone can view stock prices"
  ON public.stock_prices FOR SELECT
  USING (true);

-- Only service role can insert/update stocks and prices
-- (This will be done via API routes/cron jobs)

-- Seed with MVP stocks
INSERT INTO public.stocks (symbol, name, currency) VALUES
  ('GOOGL', 'Google', 'USD'),
  ('DASH', 'DoorDash', 'USD'),
  ('VTI', 'Vanguard Total Stock Market', 'USD'),
  ('VXUS', 'Vanguard Total International Stock', 'USD'),
  ('VT', 'Vanguard Total World Stock', 'USD'),
  ('VOO', 'Vanguard S&P 500', 'USD');

-- Add comments
COMMENT ON TABLE public.stocks IS 'Master list of supported stocks for tracking';
COMMENT ON TABLE public.stock_prices IS 'Historical daily prices for stocks';
COMMENT ON COLUMN public.stocks.current_price IS 'Most recent price, updated daily';
COMMENT ON COLUMN public.stocks.last_updated IS 'When current_price was last updated';
