-- Add a nullable price column for simple pricing when tiers are absent
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'our_work_projects' and column_name = 'price'
  ) then
    alter table public.our_work_projects add column price numeric(12,2);
  end if;
end $$;


