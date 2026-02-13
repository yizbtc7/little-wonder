import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

type RouteContext = {
  params: Promise<{ id: string }>;
};

type CreateMessageBody = {
  role?: 'user' | 'assistant';
  content?: string;
  wonder_id?: string | null;
};

function dbClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

async function verifyConversationOwner(conversationId: string, userId: string) {
  const db = dbClient();
  const { data, error } = await db
    .from('conversations')
    .select('id,user_id')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  const supabaseAuth = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let ownsConversation = false;
  try {
    ownsConversation = await verifyConversationOwner(id, user.id);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }

  if (!ownsConversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  const db = dbClient();
  const { data, error } = await db
    .from('chat_messages')
    .select('id,conversation_id,role,content,wonder_id,created_at')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const wonderIds = (data ?? []).map((m) => m.wonder_id).filter((v): v is string => Boolean(v));
  let wondersById: Record<string, unknown> = {};

  if (wonderIds.length > 0) {
    const { data: wonders } = await db
      .from('insights')
      .select('id,title,revelation,brain_science_gem,activity_main,activity_express,observe_next,schema_detected,created_at')
      .in('id', wonderIds);

    wondersById = (wonders ?? []).reduce<Record<string, unknown>>((acc, row) => {
      acc[row.id] = row;
      return acc;
    }, {});
  }

  const messages = (data ?? []).map((message) => ({
    ...message,
    wonder: message.wonder_id ? wondersById[message.wonder_id] ?? null : null,
  }));

  return NextResponse.json({ messages });
}

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;

  const supabaseAuth = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let ownsConversation = false;
  try {
    ownsConversation = await verifyConversationOwner(id, user.id);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }

  if (!ownsConversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  const body = (await request.json()) as CreateMessageBody;
  const role = body.role;
  const content = body.content?.trim();

  if (!role || (role !== 'user' && role !== 'assistant')) {
    return NextResponse.json({ error: 'role must be user or assistant' }, { status: 400 });
  }

  if (!content) {
    return NextResponse.json({ error: 'content is required' }, { status: 400 });
  }

  const db = dbClient();
  const { data, error } = await db
    .from('chat_messages')
    .insert({
      conversation_id: id,
      role,
      content,
      wonder_id: body.wonder_id ?? null,
      created_at: new Date().toISOString(),
    })
    .select('id,conversation_id,role,content,wonder_id,created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const updates: Record<string, unknown> = {
    last_message_at: new Date().toISOString(),
  };

  if (role === 'user') {
    const { data: firstUserMessage } = await db
      .from('chat_messages')
      .select('id')
      .eq('conversation_id', id)
      .eq('role', 'user')
      .limit(1);

    if ((firstUserMessage ?? []).length === 1) {
      updates.preview = content.slice(0, 100);
    }
  }

  if (body.wonder_id) {
    const { data: conversationRow } = await db
      .from('conversations')
      .select('wonder_count')
      .eq('id', id)
      .maybeSingle();

    updates.wonder_count = ((conversationRow?.wonder_count as number | null) ?? 0) + 1;
  }

  await db.from('conversations').update(updates).eq('id', id);

  return NextResponse.json({ message: data }, { status: 201 });
}
