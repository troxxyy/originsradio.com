-- Data fix: set upcoming=false for all our_work_projects currently marked as upcoming
update public.our_work_projects
set upcoming = false
where upcoming = true;


