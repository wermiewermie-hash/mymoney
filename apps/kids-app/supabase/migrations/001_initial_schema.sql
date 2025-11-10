-- Create profiles table (stores user personal information)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  username text unique,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create assets table (stores bank accounts, stocks, etc.)
create table public.assets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('bank_account', 'stocks', 'retirement_account', 'index_funds')),
  current_value decimal(12, 2) not null default 0,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create snapshots table (tracks net worth history over time)
create table public.snapshots (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  total_net_worth decimal(12, 2) not null,
  snapshot_date timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index assets_user_id_idx on public.assets(user_id);
create index snapshots_user_id_idx on public.snapshots(user_id);
create index snapshots_date_idx on public.snapshots(snapshot_date desc);

-- Enable Row Level Security (RLS) on all tables
alter table public.profiles enable row level security;
alter table public.assets enable row level security;
alter table public.snapshots enable row level security;

-- Profiles policies: Users can only see and update their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Assets policies: Users can only see and manage their own assets
create policy "Users can view own assets"
  on public.assets for select
  using (auth.uid() = user_id);

create policy "Users can insert own assets"
  on public.assets for insert
  with check (auth.uid() = user_id);

create policy "Users can update own assets"
  on public.assets for update
  using (auth.uid() = user_id);

create policy "Users can delete own assets"
  on public.assets for delete
  using (auth.uid() = user_id);

-- Snapshots policies: Users can only see and manage their own snapshots
create policy "Users can view own snapshots"
  on public.snapshots for select
  using (auth.uid() = user_id);

create policy "Users can insert own snapshots"
  on public.snapshots for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own snapshots"
  on public.snapshots for delete
  using (auth.uid() = user_id);

-- Function to automatically create a profile when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, username)
  values (new.id, new.email, new.raw_user_meta_data->>'username');
  return new;
end;
$$;

-- Trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Triggers to update updated_at timestamps
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_assets_updated_at
  before update on public.assets
  for each row execute procedure public.handle_updated_at();
