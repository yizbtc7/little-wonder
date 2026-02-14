create table if not exists public.explore_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  emoji text not null,
  type text not null check (type in ('article', 'research', 'guide')),
  body text not null,
  age_min_months int not null,
  age_max_months int not null,
  domain text,
  language text not null default 'en',
  created_at timestamptz not null default now()
);

create index if not exists explore_articles_age_lang_idx
  on public.explore_articles(age_min_months, age_max_months, language, type);
