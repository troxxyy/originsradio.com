-- Add non-null event_url column to public.thisweek
-- Idempotent: only adds if missing; ensures not null with a safe default then drops default

do $$ begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'thisweek' and column_name = 'event_url'
  ) then
    -- Column already exists; nothing to do
    raise notice 'Column event_url already exists on public.thisweek';
  else
    alter table public.thisweek add column event_url text;
    -- Backfill existing rows with an empty string to satisfy not null
    update public.thisweek set event_url = '' where event_url is null;
    alter table public.thisweek alter column event_url set not null;
  end if;
end $$;



