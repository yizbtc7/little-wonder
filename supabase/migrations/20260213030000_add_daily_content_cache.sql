create table if not exists public.daily_content (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  date date not null,
  content jsonb not null,
  created_at timestamptz not null default now(),
  unique (child_id, date)
);

alter table public.daily_content enable row level security;

create policy "daily_content_select_own"
on public.daily_content
for select
using (
  exists (
    select 1
    from public.children c
    where c.id = daily_content.child_id
      and c.user_id = auth.uid()
  )
);

create policy "daily_content_insert_own"
on public.daily_content
for insert
with check (
  exists (
    select 1
    from public.children c
    where c.id = daily_content.child_id
      and c.user_id = auth.uid()
  )
);
