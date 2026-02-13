import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

type CreateConversationBody = {
  child_id?: string;
  preview?: string;
  language?: string;
};

function dbClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function GET(request: Request) {
  const supabaseAuth = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const childIdParam = searchParams.get('child_id');
  const limit = Math.min(Number(searchParams.get('limit') ?? '20'), 100);

  const db = dbClient();

  let childId = childIdParam;
  if (!childId) {
    const { data: childRow } = await db
      .from('children')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    childId = childRow?.id ?? null;
  }

  if (!childId) {
    return NextResponse.json({ conversations: [] });
  }

  const { data, error } = await db
    .from('conversations')
    .select('id,child_id,user_id,started_at,last_message_at,preview,wonder_count,language')
    .eq('user_id', user.id)
    .eq('child_id', childId)
    .order('last_message_at', { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const conversations = data ?? [];
  const conversationIds = conversations.map((c) => c.id);

  if (conversationIds.length === 0) {
    return NextResponse.json({ conversations: [] });
  }

  const { data: conversationMessages } = await db
    .from('chat_messages')
    .select('conversation_id,role,content,wonder_id')
    .in('conversation_id', conversationIds);

  const linkedCounts = (conversationMessages ?? []).reduce<Record<string, Set<string>>>((acc, row) => {
    if (!acc[row.conversation_id]) acc[row.conversation_id] = new Set();

    if (row.wonder_id) {
      acc[row.conversation_id].add(`id:${row.wonder_id}`);
      return acc;
    }

    if (row.role === 'assistant') {
      try {
        const parsed = JSON.parse(row.content) as { wonder?: { title?: string } | null };
        const wonderTitle = parsed?.wonder?.title?.trim();
        if (wonderTitle) {
          acc[row.conversation_id].add(`title:${wonderTitle.toLowerCase()}`);
        }
      } catch {
        // ignore legacy/plain text messages
      }
    }

    return acc;
  }, {});

  const hydrated = conversations.map((conversation) => ({
    ...conversation,
    wonder_count: linkedCounts[conversation.id]?.size ?? 0,
  }));

  return NextResponse.json({ conversations: hydrated });
}

export async function POST(request: Request) {
  const supabaseAuth = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as CreateConversationBody;

  const db = dbClient();

  let childId = body.child_id;
  if (!childId) {
    const { data: childRow } = await db
      .from('children')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    childId = childRow?.id ?? undefined;
  }

  if (!childId) {
    return NextResponse.json({ error: 'No child found for this user' }, { status: 400 });
  }

  const { data, error } = await db
    .from('conversations')
    .insert({
      child_id: childId,
      user_id: user.id,
      preview: body.preview?.slice(0, 100) ?? null,
      language: body.language ?? 'en',
      started_at: new Date().toISOString(),
      last_message_at: new Date().toISOString(),
    })
    .select('id,child_id,user_id,started_at,last_message_at,preview,wonder_count,language')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ conversation: data }, { status: 201 });
}
