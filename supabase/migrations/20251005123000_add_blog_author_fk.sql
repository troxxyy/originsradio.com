-- Link blogs.author_artist_id to artists.id (idempotent)
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'blogs' and column_name = 'author_artist_id'
  ) then
    alter table public.blogs
      add column author_artist_id uuid;
  end if;
end $$;

-- Add FK constraint if missing
do $$ begin
  if not exists (
    select 1 from information_schema.table_constraints tc
    join information_schema.key_column_usage kcu on tc.constraint_name = kcu.constraint_name
    where tc.table_schema = 'public'
      and tc.table_name = 'blogs'
      and tc.constraint_type = 'FOREIGN KEY'
      and kcu.column_name = 'author_artist_id'
  ) then
    alter table public.blogs
      add constraint blogs_author_artist_id_fkey
      foreign key (author_artist_id) references public.artists(id)
      on delete set null;
  end if;
end $$;

-- Index to speed up joins/filters
create index if not exists blogs_author_artist_id_idx on public.blogs(author_artist_id);


