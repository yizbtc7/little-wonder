-- Remove child streak tracking fields and helper function (safe, idempotent)

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'children'
      and column_name = 'current_streak'
  ) then
    alter table public.children drop column current_streak;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'children'
      and column_name = 'last_moment_date'
  ) then
    alter table public.children drop column last_moment_date;
  end if;
end $$;

drop function if exists public.update_streak(uuid);
