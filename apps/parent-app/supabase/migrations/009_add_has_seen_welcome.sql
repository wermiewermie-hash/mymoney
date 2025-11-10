-- Add has_seen_welcome field to profiles table
alter table public.profiles
add column has_seen_welcome boolean default false not null;
