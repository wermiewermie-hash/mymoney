-- Create asset_history table to track share changes over time
create table public.asset_history (
  id uuid default gen_random_uuid() primary key,
  asset_id uuid references public.assets(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  shares decimal(20, 8) not null,
  change_date timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index asset_history_asset_id_idx on public.asset_history(asset_id);
create index asset_history_user_id_idx on public.asset_history(user_id);
create index asset_history_change_date_idx on public.asset_history(change_date desc);

-- Enable Row Level Security (RLS)
alter table public.asset_history enable row level security;

-- Asset history policies: Users can only see and manage their own history
create policy "Users can view own asset history"
  on public.asset_history for select
  using (auth.uid() = user_id);

create policy "Users can insert own asset history"
  on public.asset_history for insert
  with check (auth.uid() = user_id);

create policy "Users can update own asset history"
  on public.asset_history for update
  using (auth.uid() = user_id);

create policy "Users can delete own asset history"
  on public.asset_history for delete
  using (auth.uid() = user_id);
