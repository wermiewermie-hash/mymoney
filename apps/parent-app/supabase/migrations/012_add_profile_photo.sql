-- Add profile_photo_url column to profiles table
alter table public.profiles
add column profile_photo_url text;

-- Create storage bucket for profile photos
insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', true);

-- Set up RLS policies for profile photos bucket
create policy "Users can upload their own profile photo"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update their own profile photo"
on storage.objects for update
to authenticated
using (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete their own profile photo"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Anyone can view profile photos"
on storage.objects for select
to public
using (bucket_id = 'profile-photos');
