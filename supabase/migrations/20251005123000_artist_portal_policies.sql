-- Enable RLS on artists and sets
alter table if exists public.artists enable row level security;
alter table if exists public.sets enable row level security;

-- Allow authenticated users to read artists and sets
drop policy if exists artists_select_auth on public.artists;
create policy artists_select_auth on public.artists
  for select to authenticated using (true);

drop policy if exists sets_select_auth on public.sets;
create policy sets_select_auth on public.sets
  for select to authenticated using (true);

-- Allow authenticated users to update any artist (broad; refine later)
drop policy if exists artists_update_auth on public.artists;
create policy artists_update_auth on public.artists
  for update to authenticated using (true) with check (true);

-- Allow authenticated users to insert and update sets
drop policy if exists sets_insert_auth on public.sets;
create policy sets_insert_auth on public.sets
  for insert to authenticated with check (true);

drop policy if exists sets_update_auth on public.sets;
create policy sets_update_auth on public.sets
  for update to authenticated using (true) with check (true);


