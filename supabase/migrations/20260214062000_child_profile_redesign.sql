-- Child profile redesign: streak, quote, interests

alter table if exists public.children
  add column if not exists photo_url text,
  add column if not exists curiosity_quote text,
  add column if not exists curiosity_quote_updated_at timestamptz,
  add column if not exists current_streak int not null default 0,
  add column if not exists last_moment_date date;

create table if not exists public.child_interests (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  interest text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists child_interests_child_interest_unique
  on public.child_interests(child_id, interest);

create index if not exists child_interests_child_id_idx
  on public.child_interests(child_id);

create or replace function public.update_streak(p_child_id uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date := current_date;
  v_last_date date;
  v_current_streak int := 0;
  v_new_streak int := 1;
begin
  select c.last_moment_date, coalesce(c.current_streak, 0)
  into v_last_date, v_current_streak
  from public.children c
  where c.id = p_child_id
  for update;

  if not found then
    raise exception 'Child % not found', p_child_id;
  end if;

  if v_last_date is null then
    v_new_streak := 1;
  elsif v_last_date = v_today then
    v_new_streak := greatest(v_current_streak, 1);
  elsif v_last_date = (v_today - interval '1 day')::date then
    v_new_streak := greatest(v_current_streak, 0) + 1;
  else
    v_new_streak := 1;
  end if;

  update public.children
  set current_streak = v_new_streak,
      last_moment_date = v_today
  where id = p_child_id;

  return v_new_streak;
end;
$$;