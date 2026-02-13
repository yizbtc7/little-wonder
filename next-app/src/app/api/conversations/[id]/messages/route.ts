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

type ConversationOwnerRow = {
  id: string;
  user_id: string;
  child_id: string;
};

function dbClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

async function getOwnedConversation(conversationId: string, userId: string): Promise<ConversationOwnerRow | null> {
  const db = dbClient();
  const { data, error } = await db
    .from('conversations')
    .select('id,user_id,child_id')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as ConversationOwnerRow | null) ?? null;
}

function extractWonderTitleFromAssistantContent(content: string): string | null {
  try {
    const parsed = JSON.parse(content) as { wonder?: { title?: string } | null };
    const title = parsed?.wonder?.title?.trim();
    return title && title.length > 0 ? title : null;
  } catch {
    return null;
  }
}

async function resolveWonderId(params: {
  conversation: ConversationOwnerRow;
  role: 'user' | 'assistant';
  content: string;
  requestedWonderId?: string | null;
}): Promise<string | null> {
  const { conversation, role, content, requestedWonderId } = params;
  const db = dbClient();

  if (role !== 'assistant') return null;

  if (requestedWonderId) {
    const { data } = await db
      .from('wonders')
      .select('id')
      .eq('id', requestedWonderId)
      .eq('child_id', conversation.child_id)
      .maybeSingle();

    return data?.id ?? null;
  }

  const wonderTitle = extractWonderTitleFromAssistantContent(content);
  if (!wonderTitle) return null;

  const { data } = await db
    .from('wonders')
    .select('id,title,created_at')
    .eq('child_id', conversation.child_id)
    .eq('title', wonderTitle)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.id ?? null;
}

async function refreshWonderCount(conversationId: string) {
  const db = dbClient();
  const { data } = await db
    .from('chat_messages')
    .select('wonder_id')
    .eq('conversation_id', conversationId)
    .not('wonder_id', 'is', null);

  const wonderCount = new Set((data ?? []).map((row) => row.wonder_id).filter((id): id is string => Boolean(id))).size;

  await db
    .from('conversations')
    .update({
      wonder_count: wonderCount,
      last_message_at: new Date().toISOString(),
    })
    .eq('id', conversationId);
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

  let conversation: ConversationOwnerRow | null = null;
  try {
    conversation = await getOwnedConversation(id, user.id);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }

  if (!conversation) {
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
      .from('wonders')
      .select('id,title,article,schemas_detected,created_at')
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

  let conversation: ConversationOwnerRow | null = null;
  try {
    conversation = await getOwnedConversation(id, user.id);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }

  if (!conversation) {
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

  const resolvedWonderId = await resolveWonderId({
    conversation,
    role,
    content,
    requestedWonderId: body.wonder_id,
  });

  const db = dbClient();
  const { data, error } = await db
    .from('chat_messages')
    .insert({
      conversation_id: id,
      role,
      content,
      wonder_id: resolvedWonderId,
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

  await db.from('conversations').update(updates).eq('id', id);
  await refreshWonderCount(id);

  return NextResponse.json({ message: data }, { status: 201 });
}
