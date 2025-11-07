-- Add new fields to assets table for the 4-step add asset flow
alter table public.assets
  add column acquisition_date timestamp with time zone default timezone('utc'::text, now()) not null,
  add column ticker text,
  add column shares decimal(12, 4),
  add column price_per_share decimal(12, 4);

-- Update the type constraint to include new categories
alter table public.assets
  drop constraint if exists assets_type_check;

alter table public.assets
  add constraint assets_type_check
  check (type in ('bank_account', 'stocks', 'retirement_account', 'index_funds', 'cash', 'debt'));

-- Add index for date-based queries
create index assets_acquisition_date_idx on public.assets(acquisition_date desc);

-- Add comment to explain the new fields
comment on column public.assets.acquisition_date is 'Date when the asset was acquired';
comment on column public.assets.ticker is 'Stock ticker symbol (e.g., GOOGL, VTI)';
comment on column public.assets.shares is 'Number of shares owned';
comment on column public.assets.price_per_share is 'Price per share at acquisition time';
