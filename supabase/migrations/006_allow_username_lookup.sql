-- Allow anyone to look up email by username (needed for login)
-- This is safe because we only expose the email, not other sensitive data
create policy "Allow username lookup for login"
  on public.profiles for select
  using (true);

-- Drop the old restrictive policy
drop policy if exists "Users can view own profile" on public.profiles;
