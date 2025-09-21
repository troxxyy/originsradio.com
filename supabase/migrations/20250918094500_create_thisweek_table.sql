-- Create `thisweek` table with required schema
-- Idempotent and safe to run multiple times

-- Ensure pgcrypto is available for gen_random_uuid
create extension if not exists pgcrypto;

-- Create table if not exists
do $$ begin
  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'thisweek'
  ) then
    create table public.thisweek (
      id uuid primary key default gen_random_uuid(),
      club_name text not null,
      event_artist text not null,
      price text not null,
      image_url text not null,
      event_date date not null,
      created_at timestamptz default now()
    );
  end if;
end $$;

-- Enable RLS
do $$ begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'thisweek'
  ) then
    alter table public.thisweek enable row level security;
  end if;
end $$;

-- Public read access policy (allow select for anyone)
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'thisweek' and policyname = 'Allow select on thisweek'
  ) then
    create policy "Allow select on thisweek" on public.thisweek
      for select using (true);
  end if;
end $$;

-- Restrict write operations (insert/update/delete) to service role
-- Approach: Do not create any INSERT/UPDATE/DELETE policies for anon/authenticated roles.
-- Only grant table privileges to service role so it can bypass RLS with appropriate key.

-- Revoke public and authenticated roles from write actions (idempotent)
do $$ begin
  -- Revoke generic public
  revoke insert, update, delete on table public.thisweek from public;
  -- Revoke authenticated role if it exists
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke insert, update, delete on table public.thisweek from authenticated;
  end if;
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke insert, update, delete on table public.thisweek from anon;
  end if;
end $$;

-- Grant write privileges to service_role (role exists in Supabase)
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant insert, update, delete on table public.thisweek to service_role;
  end if;
end $$;



