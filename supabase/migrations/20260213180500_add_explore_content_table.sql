create table if not exists public.explore_content (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('brain_card', 'daily_tip', 'article')),
  age_range_start int not null,
  age_range_end int not null,
  language text not null default 'en',
  icon text,
  title text not null,
  domain text,
  category text,
  preview text,
  article jsonb not null,
  source text,
  tags text[] default '{}',
  read_time_minutes int,
  created_at timestamptz not null default now()
);

create index if not exists explore_content_age_type_lang_idx
  on public.explore_content(age_range_start, age_range_end, type, language);
