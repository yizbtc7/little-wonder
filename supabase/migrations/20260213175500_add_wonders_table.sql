create table if not exists public.wonders (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  observation_text text not null,
  title text not null,
  article jsonb not null,
  schemas_detected text[] default '{}',
  language text not null default 'en',
  created_at timestamptz not null default now()
);

create index if not exists wonders_child_created_idx
  on public.wonders(child_id, created_at desc);
