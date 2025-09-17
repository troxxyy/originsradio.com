-- Create storage buckets and policies for 'sets' and 'waveforms'
-- Idempotent migration: safe to run multiple times

-- Ensure buckets exist
insert into storage.buckets (id, name, public)
select 'sets', 'sets', true
where not exists (select 1 from storage.buckets where id = 'sets');

insert into storage.buckets (id, name, public)
select 'waveforms', 'waveforms', true
where not exists (select 1 from storage.buckets where id = 'waveforms');

-- Allow public read access to objects in 'sets' and 'waveforms'
do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public read sets'
  ) then
    create policy "Public read sets" on storage.objects
      for select using (bucket_id = 'sets');
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public read waveforms'
  ) then
    create policy "Public read waveforms" on storage.objects
      for select using (bucket_id = 'waveforms');
  end if;
end $$;

-- Allow authenticated users to insert/update/delete within these buckets
do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Authenticated write sets'
  ) then
    create policy "Authenticated write sets" on storage.objects
      for all to authenticated
      using (bucket_id = 'sets')
      with check (bucket_id = 'sets');
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Authenticated write waveforms'
  ) then
    create policy "Authenticated write waveforms" on storage.objects
      for all to authenticated
      using (bucket_id = 'waveforms')
      with check (bucket_id = 'waveforms');
  end if;
end $$;

-- Optional: tighten delete to only service role, but keep authenticated for now
-- Note: AdminUploads uses service role; normal clients use anon/auth for reads


