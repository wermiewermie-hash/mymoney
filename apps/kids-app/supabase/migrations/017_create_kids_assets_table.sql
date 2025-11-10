-- Create kids_assets table (simplified assets for kids: only Google stock and cash)
create table public.kids_assets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('google_stock', 'cash')),
  current_value decimal(12, 2) not null default 0,
  shares decimal(12, 4), -- Only used for google_stock
  price_per_share decimal(12, 2), -- Only used for google_stock
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Constraint: Each user can only have one of each type
  unique(user_id, type)
);

-- Create index for better query performance
create index kids_assets_user_id_idx on public.kids_assets(user_id);
create index kids_assets_type_idx on public.kids_assets(type);

-- Enable Row Level Security (RLS)
alter table public.kids_assets enable row level security;

-- RLS Policies: Users can only see and manage their own assets
create policy "Users can view own kids_assets"
  on public.kids_assets for select
  using (auth.uid() = user_id);

create policy "Users can insert own kids_assets"
  on public.kids_assets for insert
  with check (auth.uid() = user_id);

create policy "Users can update own kids_assets"
  on public.kids_assets for update
  using (auth.uid() = user_id);

create policy "Users can delete own kids_assets"
  on public.kids_assets for delete
  using (auth.uid() = user_id);

-- Add comment to table
comment on table public.kids_assets is 'Simplified assets table for kids app - supports only Google stock and cash';
