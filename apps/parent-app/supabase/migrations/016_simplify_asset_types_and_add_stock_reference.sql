-- Add stock_id reference to assets table
ALTER TABLE public.assets
  ADD COLUMN stock_id UUID REFERENCES public.stocks(id) ON DELETE SET NULL;

-- Add index for stock_id lookups
CREATE INDEX assets_stock_id_idx ON public.assets(stock_id);

-- FIRST: Drop the old constraint
ALTER TABLE public.assets
  DROP CONSTRAINT IF EXISTS assets_type_check;

-- SECOND: Migrate existing asset types to simplified types
-- Map: stocks/retirement_account/index_funds -> stock
--      bank_account/cash -> cash
--      debt -> debt

UPDATE public.assets
SET type = 'stock'
WHERE type IN ('stocks', 'retirement_account', 'index_funds');

UPDATE public.assets
SET type = 'cash'
WHERE type = 'bank_account';

-- THIRD: Add the new constraint with simplified types
ALTER TABLE public.assets
  ADD CONSTRAINT assets_type_check
  CHECK (type IN ('stock', 'cash', 'debt'));

-- For existing stock assets, try to match ticker to stock_id
-- This will only work for the 6 MVP stocks we seeded
UPDATE public.assets a
SET stock_id = s.id
FROM public.stocks s
WHERE a.type = 'stock'
  AND a.ticker IS NOT NULL
  AND UPPER(a.ticker) = s.symbol;

-- Add comment
COMMENT ON COLUMN public.assets.stock_id IS 'Reference to stocks table for stock assets';
