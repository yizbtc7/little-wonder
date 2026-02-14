create table if not exists public.article_reads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  article_id uuid not null references public.explore_articles(id) on delete cascade,
  opened_at timestamptz not null default now(),
  read_completed boolean not null default false,
  completed_at timestamptz,
  read_time_seconds integer not null default 0,
  unique(user_id, article_id)
);

create index if not exists article_reads_user_opened_idx on public.article_reads(user_id, opened_at desc);
create index if not exists article_reads_user_completed_idx on public.article_reads(user_id, completed_at desc);
