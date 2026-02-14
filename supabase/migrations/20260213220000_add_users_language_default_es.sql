alter table if exists public.users
  add column if not exists language text not null default 'es';

update public.users
set language = 'es'
where language is null or language = '';
