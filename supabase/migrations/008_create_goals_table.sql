-- Create goals table (stores user savings goals)
create table public.goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  emoji text not null default '🎯',
  target_amount decimal(12, 2) not null,
  current_amount decimal(12, 2) not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index for better query performance
create index goals_user_id_idx on public.goals(user_id);

-- Enable Row Level Security (RLS)
alter table public.goals enable row level security;

-- Goals policies: Users can only see and manage their own goals
create policy "Users can view own goals"
  on public.goals for select
  using (auth.uid() = user_id);

create policy "Users can insert own goals"
  on public.goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own goals"
  on public.goals for update
  using (auth.uid() = user_id);

create policy "Users can delete own goals"
  on public.goals for delete
  using (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
create trigger handle_goals_updated_at
  before update on public.goals
  for each row execute procedure public.handle_updated_at();
