-- Fix onboarding FK issue: children.user_id must reference auth.users(id)

alter table if exists public.children
  drop constraint if exists children_user_id_fkey;

alter table if exists public.children
  add constraint children_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;

-- Also enforce observations.user_id FK to auth.users for consistency
alter table if exists public.observations
  drop constraint if exists observations_user_id_fkey;

alter table if exists public.observations
  add constraint observations_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;
