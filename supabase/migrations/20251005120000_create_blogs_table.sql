-- Create blogs table for electronic music news
-- Idempotent and safe to run multiple times

-- Ensure pgcrypto is available for gen_random_uuid
create extension if not exists pgcrypto;

-- Create table if not exists
do $$ begin
  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'blogs'
  ) then
    create table public.blogs (
      id uuid primary key default gen_random_uuid(),
      title text not null,
      slug text unique not null,
      content text not null,
      excerpt text,
      author text not null,
      cover_image_url text,
      status text not null default 'draft' check (status in ('draft', 'published')),
      featured boolean default false,
      tags text[] default '{}',
      seo_title text,
      seo_description text,
      published_at timestamptz,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );

    -- Create index on slug for faster lookups
    create index if not exists idx_blogs_slug on public.blogs(slug);
    
    -- Create index on status for filtering published posts
    create index if not exists idx_blogs_status on public.blogs(status);
    
    -- Create index on published_at for sorting
    create index if not exists idx_blogs_published_at on public.blogs(published_at desc);
    
    -- Create index on tags for filtering
    create index if not exists idx_blogs_tags on public.blogs using gin(tags);
  end if;
end $$;

-- Enable RLS
do $$ begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'blogs'
  ) then
    alter table public.blogs enable row level security;
  end if;
end $$;

-- Public read access policy for published posts
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'blogs' and policyname = 'Allow select on published blogs'
  ) then
    create policy "Allow select on published blogs" on public.blogs
      for select using (status = 'published');
  end if;
end $$;

-- Restrict write operations (insert/update/delete) to service role
-- Revoke public and authenticated roles from write actions (idempotent)
do $$ begin
  -- Revoke generic public
  revoke insert, update, delete on table public.blogs from public;
  -- Revoke authenticated role if it exists
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke insert, update, delete on table public.blogs from authenticated;
  end if;
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke insert, update, delete on table public.blogs from anon;
  end if;
end $$;

-- Grant write privileges to service_role (role exists in Supabase)
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant insert, update, delete on table public.blogs to service_role;
  end if;
end $$;

-- Grant select to authenticated for admin panel (they can see drafts)
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    grant select on table public.blogs to authenticated;
  end if;
end $$;

-- Create updated_at trigger function if it doesn't exist
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
drop trigger if exists update_blogs_updated_at on public.blogs;
create trigger update_blogs_updated_at
  before update on public.blogs
  for each row
  execute function update_updated_at_column();

