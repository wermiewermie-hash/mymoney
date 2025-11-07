-- Fix the trigger function to handle errors and duplicates better
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, username)
  values (new.id, new.email, new.raw_user_meta_data->>'username')
  on conflict (id) do update
  set email = excluded.email,
      username = excluded.username;
  return new;
exception
  when others then
    -- Log the error but don't fail the user creation
    raise warning 'Error creating profile: %', sqlerrm;
    return new;
end;
$$;
