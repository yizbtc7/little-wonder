create table if not exists public.explore_brain_cards (
  id uuid primary key default gen_random_uuid(),
  emoji text not null,
  title text not null,
  body text not null,
  domain text not null,
  age_min_months integer not null,
  age_max_months integer not null,
  language text not null default 'es',
  created_at timestamptz default now()
);

create table if not exists public.daily_tips (
  id uuid primary key default gen_random_uuid(),
  body text not null,
  age_min_months integer not null,
  age_max_months integer not null,
  language text not null default 'es',
  created_at timestamptz default now()
);

create index if not exists idx_brain_cards_age_lang
  on public.explore_brain_cards(age_min_months, age_max_months, language);

create index if not exists idx_daily_tips_age_lang
  on public.daily_tips(age_min_months, age_max_months, language);
