-- Create radio_schedule_weekly table with weekly reset support
-- Idempotent and safe to run multiple times

-- Ensure pgcrypto is available for gen_random_uuid
create extension if not exists pgcrypto;

-- Create table if not exists
do $$ begin
  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'radio_schedule_weekly'
  ) then
    create table public.radio_schedule_weekly (
      id uuid primary key default gen_random_uuid(),
      day_of_week integer not null check (day_of_week >= 0 and day_of_week <= 6),
      start_time_local text not null,
      duration_minutes integer not null default 60,
      content_type text not null check (content_type in ('set', 'stream')),
      set_id uuid references public.sets(id) on delete set null,
      stream_url text,
      title text not null,
      timezone text default 'Europe/Istanbul',
      is_active boolean default true,
      week_start_date date not null,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );

    -- Create index on week_start_date for faster filtering
    create index if not exists idx_radio_schedule_week_start on public.radio_schedule_weekly(week_start_date);
    
    -- Create index on is_active for filtering active schedules
    create index if not exists idx_radio_schedule_active on public.radio_schedule_weekly(is_active);
    
    -- Create composite index for common queries
    create index if not exists idx_radio_schedule_week_active on public.radio_schedule_weekly(week_start_date, is_active);
  end if;
end $$;

-- Add week_start_date column if it doesn't exist (for existing tables)
do $$ begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'radio_schedule_weekly'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'radio_schedule_weekly' and column_name = 'week_start_date'
  ) then
    -- Add the column
    alter table public.radio_schedule_weekly add column week_start_date date;
    
    -- Set default to current week's Monday for existing rows
    update public.radio_schedule_weekly 
    set week_start_date = date_trunc('week', current_date)::date
    where week_start_date is null;
    
    -- Make it not null
    alter table public.radio_schedule_weekly alter column week_start_date set not null;
    
    -- Add indexes
    create index if not exists idx_radio_schedule_week_start on public.radio_schedule_weekly(week_start_date);
    create index if not exists idx_radio_schedule_week_active on public.radio_schedule_weekly(week_start_date, is_active);
  end if;
end $$;

-- Enable RLS
do $$ begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'radio_schedule_weekly'
  ) then
    alter table public.radio_schedule_weekly enable row level security;
  end if;
end $$;

-- Public read access policy (allow select for anyone for active schedules)
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'radio_schedule_weekly' and policyname = 'Allow select on radio_schedule_weekly'
  ) then
    create policy "Allow select on radio_schedule_weekly" on public.radio_schedule_weekly
      for select using (true);
  end if;
end $$;

-- Allow authenticated users to insert/update/delete (for admin panel)
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'radio_schedule_weekly' and policyname = 'Allow authenticated write on radio_schedule_weekly'
  ) then
    create policy "Allow authenticated write on radio_schedule_weekly" on public.radio_schedule_weekly
      for all using (auth.role() = 'authenticated');
  end if;
end $$;

-- Create function to get current week's Monday
create or replace function get_current_week_monday()
returns date
language sql
immutable
as $$
  select date_trunc('week', current_date)::date;
$$;

-- Create function to archive old schedules (deactivate schedules from previous weeks)
create or replace function archive_old_radio_schedules()
returns void
language plpgsql
as $$
begin
  update public.radio_schedule_weekly
  set is_active = false,
      updated_at = now()
  where week_start_date < get_current_week_monday()
    and is_active = true;
end;
$$;

-- Grant execute permission on functions
grant execute on function get_current_week_monday() to anon, authenticated, service_role;
grant execute on function archive_old_radio_schedules() to authenticated, service_role;

