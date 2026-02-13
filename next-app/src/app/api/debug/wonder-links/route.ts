import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

function dbClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get('limit') ?? '20'), 100);

  const supabaseAuth = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = dbClient();

  const { data: conversations, error: convError } = await db
    .from('conversations')
    .select('id,last_message_at,preview,wonder_count,child_id')
    .eq('user_id', user.id)
    .order('last_message_at', { ascending: false })
    .limit(limit);

  if (convError) {
    return NextResponse.json({ error: convError.message }, { status: 500 });
  }

  const conversationIds = (conversations ?? []).map((c) => c.id);
  if (conversationIds.length === 0) {
    return NextResponse.json({ conversations: [] });
  }

  const { data: messages, error: msgError } = await db
    .from('chat_messages')
    .select('id,conversation_id,role,content,wonder_id,created_at')
    .in('conversation_id', conversationIds)
    .order('created_at', { ascending: true });

  if (msgError) {
    return NextResponse.json({ error: msgError.message }, { status: 500 });
  }

  const wonderIds = Array.from(new Set((messages ?? []).map((m) => m.wonder_id).filter((v): v is string => Boolean(v))));
  let wondersById: Record<string, { id: string; title: string; created_at: string }> = {};

  if (wonderIds.length > 0) {
    const { data: wonders, error: wonderError } = await db
      .from('wonders')
      .select('id,title,created_at')
      .in('id', wonderIds);

    if (wonderError) {
      return NextResponse.json({ error: wonderError.message }, { status: 500 });
    }

    wondersById = (wonders ?? []).reduce<Record<string, { id: string; title: string; created_at: string }>>((acc, row) => {
      acc[row.id] = row;
      return acc;
    }, {});
  }

  const groupedMessages = (messages ?? []).reduce<Record<string, Array<{ id: string; role: string; created_at: string; wonder_id: string | null; wonder_title: string | null; content_preview: string }>>>((acc, row) => {
    if (!acc[row.conversation_id]) acc[row.conversation_id] = [];
    acc[row.conversation_id].push({
      id: row.id,
      role: row.role,
      created_at: row.created_at,
      wonder_id: row.wonder_id,
      wonder_title: row.wonder_id ? wondersById[row.wonder_id]?.title ?? null : null,
      content_preview: row.content.slice(0, 120),
    });
    return acc;
  }, {});

  const payload = (conversations ?? []).map((conversation) => ({
    ...conversation,
    linked_wonder_count: new Set((groupedMessages[conversation.id] ?? []).map((m) => m.wonder_id).filter((id): id is string => Boolean(id))).size,
    messages: groupedMessages[conversation.id] ?? [],
  }));

  return NextResponse.json({ conversations: payload, wonders: wondersById });
}
