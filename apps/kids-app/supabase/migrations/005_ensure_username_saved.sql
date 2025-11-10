-- Make sure username column exists and has no conflicts
alter table public.profiles alter column username drop not null;
alter table public.profiles drop constraint if exists profiles_username_key;

-- Recreate the unique constraint on username, allowing nulls
create unique index if not exists profiles_username_unique on public.profiles(username) where username is not null;

-- Update trigger function with better error handling and logging
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_username text;
begin
  -- Get username from metadata
  v_username := new.raw_user_meta_data->>'username';

  -- Insert or update the profile
  insert into public.profiles (id, email, username)
  values (new.id, new.email, v_username)
  on conflict (id) do update
  set email = excluded.email,
      username = excluded.username,
      updated_at = now();

  return new;
exception
  when others then
    raise warning 'Error in handle_new_user for user %: %', new.id, sqlerrm;
    -- Still return new so auth doesn't fail
    return new;
end;
$$;
