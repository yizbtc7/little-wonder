-- Chat persistence: conversations + chat_messages

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  preview text,
  wonder_count int not null default 0,
  language text not null default 'en'
);

create index if not exists conversations_child_last_message_idx
  on public.conversations(child_id, last_message_at desc);

create index if not exists conversations_user_last_message_idx
  on public.conversations(user_id, last_message_at desc);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  wonder_id uuid references public.insights(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_conversation_created_idx
  on public.chat_messages(conversation_id, created_at asc);

create index if not exists chat_messages_wonder_idx
  on public.chat_messages(wonder_id);
