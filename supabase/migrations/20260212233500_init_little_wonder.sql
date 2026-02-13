-- Little Wonder initial schema
create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key,
  name text,
  created_at timestamptz default now()
);

create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  birthdate date,
  gender text,
  created_at timestamptz default now()
);

create table if not exists public.observations (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  observation_text text not null,
  observed_at timestamptz default now(),
  created_by uuid references public.users(id),
  created_at timestamptz default now()
);

create table if not exists public.insights (
  id uuid primary key default gen_random_uuid(),
  observation_id uuid not null references public.observations(id) on delete cascade,
  insight_text text not null,
  json_response jsonb,
  generated_at timestamptz default now()
);

create index if not exists idx_children_user_id on public.children(user_id);
create index if not exists idx_observations_child_id on public.observations(child_id);
create index if not exists idx_observations_observed_at on public.observations(observed_at);
create index if not exists idx_insights_observation_id on public.insights(observation_id);

alter table public.users enable row level security;
alter table public.children enable row level security;
alter table public.observations enable row level security;
alter table public.insights enable row level security;

do $$ begin
  create policy "Users can manage their own data" on public.users
    for all using (auth.uid() = id) with check (auth.uid() = id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can manage their children" on public.children
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can manage their observations" on public.observations
    for all using (auth.uid() = (select user_id from public.children where id = child_id))
    with check (auth.uid() = (select user_id from public.children where id = child_id));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can view their insights" on public.insights
    for select using (
      auth.uid() = (
        select c.user_id
        from public.children c
        join public.observations o on c.id = o.child_id
        where o.id = observation_id
      )
    );
exception when duplicate_object then null; end $$;
