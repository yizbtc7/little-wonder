alter table if exists public.profiles
  add column if not exists parent_role text,
  add column if not exists parent_priorities text[];

alter table if exists public.children
  add column if not exists interests text[];
