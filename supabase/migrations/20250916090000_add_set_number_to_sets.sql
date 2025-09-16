-- Ensure sets table exists and add set_number column
do $$ begin
  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'sets'
  ) then
    create table public.sets (
      id uuid default gen_random_uuid() primary key,
      title text not null,
      artist_id uuid references public.artists(id) on delete cascade,
      audio_url text not null,
      peaks_url text,
      duration integer,
      release_date date not null,
      views_count integer default 0,
      created_at timestamptz default now(),
      updated_at timestamptz default now(),
      set_number integer
    );
  end if;
end $$;

-- Add set_number column if it doesn't exist
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'sets' and column_name = 'set_number'
  ) then
    alter table public.sets add column set_number integer;
  end if;
end $$;


