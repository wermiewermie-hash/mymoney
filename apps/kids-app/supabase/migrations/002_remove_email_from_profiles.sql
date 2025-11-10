-- Remove email from profiles table since we don't need it
alter table public.profiles drop column if exists email;

-- Update the trigger function to not include email
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$;
