-- Add value field to asset_history table to track cash/debt amounts over time
alter table public.asset_history
add column value decimal(20, 2);

-- For existing records, set value based on the asset type
-- For stocks, value will remain null (we calculate it from shares * price)
-- This column will be used for cash/debt accounts
