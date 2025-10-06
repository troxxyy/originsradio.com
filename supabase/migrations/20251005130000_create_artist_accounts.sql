-- Create artist_accounts table to map a Supabase user to a single artist
create table if not exists public.artist_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  email text,
  artist_id uuid not null,
  created_at timestamptz not null default now(),
  unique(user_id)
);

-- Enable RLS
alter table public.artist_accounts enable row level security;

-- Policies: users can manage only their own mapping
drop policy if exists artist_accounts_select_self on public.artist_accounts;
create policy artist_accounts_select_self on public.artist_accounts
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists artist_accounts_insert_self on public.artist_accounts;
create policy artist_accounts_insert_self on public.artist_accounts
  for insert to authenticated with check (auth.uid() = user_id);

-- Optional: prevent updates/deletes by users (locking behavior)
drop policy if exists artist_accounts_update_none on public.artist_accounts;
create policy artist_accounts_update_none on public.artist_accounts
  for update to authenticated using (false);

drop policy if exists artist_accounts_delete_none on public.artist_accounts;
create policy artist_accounts_delete_none on public.artist_accounts
  for delete to authenticated using (false);


