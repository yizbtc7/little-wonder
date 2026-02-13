-- Ensure schema required for onboarding -> home -> insight flow
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  parent_name text not null,
  created_at timestamptz not null default now()
);

-- children already exists in prior migration, ensure required columns exist
alter table if exists public.children
  add column if not exists created_at timestamptz not null default now();

-- observations: ensure required structure
alter table if exists public.observations
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists text text,
  add column if not exists created_at timestamptz not null default now();

-- Backfill from legacy columns when present
update public.observations
set text = coalesce(text, observation_text)
where text is null;

update public.observations
set user_id = coalesce(user_id, created_by)
where user_id is null;

-- Keep required constraints after backfill
alter table if exists public.observations
  alter column text set not null,
  alter column user_id set not null;

-- insights: ensure required structure
alter table if exists public.insights
  add column if not exists content text,
  add column if not exists schema_detected text,
  add column if not exists domain text,
  add column if not exists created_at timestamptz not null default now();

update public.insights
set content = coalesce(content, insight_text)
where content is null;

alter table if exists public.insights
  alter column content set not null;

-- Helpful indexes
create index if not exists idx_profiles_user_id on public.profiles(user_id);
create index if not exists idx_observations_user_id_created_at on public.observations(user_id, created_at desc);
create index if not exists idx_insights_observation_created_at on public.insights(observation_id, created_at desc);

-- RLS
alter table public.profiles enable row level security;

-- policies (idempotent)
do $$ begin
  create policy "Users can manage own profile" on public.profiles
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can manage own observations" on public.observations
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can manage own insights via observations" on public.insights
    for all using (
      exists (
        select 1 from public.observations o
        where o.id = observation_id and o.user_id = auth.uid()
      )
    )
    with check (
      exists (
        select 1 from public.observations o
        where o.id = observation_id and o.user_id = auth.uid()
      )
    );
exception when duplicate_object then null; end $$;
