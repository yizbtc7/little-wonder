-- Caregiver invite + shared child access model

create table if not exists public.caregiver_invites (
  token text primary key,
  child_id uuid not null references public.children(id) on delete cascade,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  claimed_by_user_id uuid references auth.users(id) on delete set null,
  claimed_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists caregiver_invites_child_idx on public.caregiver_invites (child_id);
create index if not exists caregiver_invites_creator_idx on public.caregiver_invites (created_by_user_id);
create index if not exists caregiver_invites_active_idx on public.caregiver_invites (child_id, created_by_user_id, expires_at)
  where revoked_at is null;

create table if not exists public.child_caregivers (
  child_id uuid not null references public.children(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'caregiver',
  created_at timestamptz not null default now(),
  primary key (child_id, user_id)
);

create index if not exists child_caregivers_user_idx on public.child_caregivers (user_id, created_at desc);
