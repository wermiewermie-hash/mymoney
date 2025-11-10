-- Create goal_history table to track changes to goal savings over time
create table if not exists public.goal_history (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null,
  change_date timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.goal_history enable row level security;

-- Create policies
create policy "Users can view their own goal history"
  on public.goal_history
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own goal history"
  on public.goal_history
  for insert
  with check (auth.uid() = user_id);

-- Create index for faster queries
create index goal_history_goal_id_idx on public.goal_history(goal_id);
create index goal_history_user_id_idx on public.goal_history(user_id);
create index goal_history_change_date_idx on public.goal_history(change_date);
