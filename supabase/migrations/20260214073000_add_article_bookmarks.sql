create table if not exists public.article_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  article_id uuid not null references public.explore_articles(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.article_bookmarks
  add column if not exists user_id uuid,
  add column if not exists article_id uuid,
  add column if not exists created_at timestamptz;

alter table public.article_bookmarks
  alter column created_at set default now();

update public.article_bookmarks
set created_at = now()
where created_at is null;

alter table public.article_bookmarks
  alter column user_id set not null,
  alter column article_id set not null,
  alter column created_at set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'article_bookmarks_user_article_unique'
      and conrelid = 'public.article_bookmarks'::regclass
  ) then
    alter table public.article_bookmarks
      add constraint article_bookmarks_user_article_unique unique (user_id, article_id);
  end if;
end;
$$;

create index if not exists article_bookmarks_user_created_idx
  on public.article_bookmarks(user_id, created_at desc);

create index if not exists article_bookmarks_article_idx
  on public.article_bookmarks(article_id);

alter table public.article_bookmarks enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'article_bookmarks'
      and policyname = 'article_bookmarks_select_own'
  ) then
    create policy article_bookmarks_select_own
      on public.article_bookmarks
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'article_bookmarks'
      and policyname = 'article_bookmarks_insert_own'
  ) then
    create policy article_bookmarks_insert_own
      on public.article_bookmarks
      for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'article_bookmarks'
      and policyname = 'article_bookmarks_delete_own'
  ) then
    create policy article_bookmarks_delete_own
      on public.article_bookmarks
      for delete
      using (auth.uid() = user_id);
  end if;
end;
$$;
