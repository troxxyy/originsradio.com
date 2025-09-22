-- Create and link thisweek_lineup to thisweek and artists
-- Idempotent and safe to run multiple times

-- Ensure required extensions
create extension if not exists pgcrypto;
create extension if not exists unaccent;

-- Create join table if missing
do $$ begin
  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'thisweek_lineup'
  ) then
    create table public.thisweek_lineup (
      id uuid primary key default gen_random_uuid(),
      thisweek_id uuid not null references public.thisweek(id) on delete cascade,
      -- Raw lineup text as entered (for fallback/visibility)
      lineup text not null,
      -- Link to canonical artist record
      artist_id uuid references public.artists(id) on delete set null,
      position int,
      created_at timestamptz default now()
    );
  end if;
end $$;

-- Add missing columns or constraints if table already exists
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'thisweek_lineup' and column_name = 'artist_id'
  ) then
    alter table public.thisweek_lineup
      add column artist_id uuid references public.artists(id) on delete set null;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'thisweek_lineup' and column_name = 'position'
  ) then
    alter table public.thisweek_lineup add column position int;
  end if;
end $$;

-- Helpful indexes
do $$ begin
  if not exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where c.relname = 'thisweek_lineup_thisweek_id_idx' and n.nspname = 'public'
  ) then
    create index thisweek_lineup_thisweek_id_idx on public.thisweek_lineup(thisweek_id);
  end if;

  if not exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where c.relname = 'thisweek_lineup_artist_id_idx' and n.nspname = 'public'
  ) then
    create index thisweek_lineup_artist_id_idx on public.thisweek_lineup(artist_id);
  end if;

  if not exists (
    select 1 from information_schema.table_constraints
    where table_schema = 'public' and table_name = 'thisweek_lineup' and constraint_type = 'UNIQUE' and constraint_name = 'thisweek_lineup_unique_event_lineup'
  ) then
    alter table public.thisweek_lineup
      add constraint thisweek_lineup_unique_event_lineup unique (thisweek_id, lineup);
  end if;
end $$;

-- Enable RLS and public read policy
do $$ begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'thisweek_lineup'
  ) then
    alter table public.thisweek_lineup enable row level security;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = 'thisweek_lineup' and policyname = 'Allow select on thisweek_lineup'
    ) then
      create policy "Allow select on thisweek_lineup" on public.thisweek_lineup
        for select using (true);
    end if;
  end if;
end $$;

-- Restrict write operations to service_role (consistent with other tables)
do $$ begin
  revoke insert, update, delete on table public.thisweek_lineup from public;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke insert, update, delete on table public.thisweek_lineup from authenticated;
  end if;
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke insert, update, delete on table public.thisweek_lineup from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant insert, update, delete on table public.thisweek_lineup to service_role;
  end if;
end $$;

-- Backfill artist_id by matching lineup text to artists.name (case/diacritics-insensitive)
-- Only fills where artist_id is currently null
update public.thisweek_lineup l
set artist_id = a.id
from public.artists a
where l.artist_id is null
  and unaccent(lower(l.lineup)) = unaccent(lower(a.name));

-- Optional: attempt to split comma-separated lineup strings in public.thisweek into rows
-- This helps populate thisweek_lineup if it is empty and only thisweek.event_artist is present.
-- It is safe and will only insert when no rows exist for the event.
do $$ begin
  -- Only run if column event_artist exists on public.thisweek
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'thisweek' and column_name = 'event_artist'
  ) then
    insert into public.thisweek_lineup (thisweek_id, lineup, position)
    select t.id,
           btrim(value) as lineup,
           row_number() over (partition by t.id order by ord) as position
    from public.thisweek t
    cross join lateral (
      select regexp_split_to_table(t.event_artist, '\s*,\s*') as value,
             generate_series(1, greatest(1, length(t.event_artist) - length(replace(t.event_artist, ',', '')) + 1)) as ord
    ) s
    where not exists (
      select 1 from public.thisweek_lineup l where l.thisweek_id = t.id
    )
    and t.event_artist is not null and btrim(t.event_artist) <> '';
  end if;
end $$;


