alter table public.chat_messages
  drop constraint if exists chat_messages_wonder_id_fkey;

alter table public.chat_messages
  add constraint chat_messages_wonder_id_fkey
  foreign key (wonder_id) references public.wonders(id) on delete set null;
