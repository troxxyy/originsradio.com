-- Enable RLS and add policies for sets
-- Note: Prefer authenticated inserts; anonymous users will be signed in anonymously on the client

-- Enable RLS (idempotent)
do $$ begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'sets'
  ) then
    alter table public.sets enable row level security;
  end if;
end $$;

-- Allow anyone to select sets
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'sets' and policyname = 'Allow select on sets'
  ) then
    create policy "Allow select on sets" on public.sets for select using (true);
  end if;
end $$;

-- Allow authenticated users to insert sets
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'sets' and policyname = 'Allow insert on sets for authenticated'
  ) then
    create policy "Allow insert on sets for authenticated" on public.sets
      for insert to authenticated
      with check (true);
  end if;
end $$;


