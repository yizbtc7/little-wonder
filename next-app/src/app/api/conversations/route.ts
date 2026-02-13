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
  const childId = searchParams.get('child_id');
  const limit = Math.min(Number(searchParams.get('limit') ?? '20'), 100);

  if (!childId) {
    return NextResponse.json({ error: 'child_id is required' }, { status: 400 });
  }

  const db = dbClient();
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

  return NextResponse.json({ conversations: data ?? [] });
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

  if (!body.child_id) {
    return NextResponse.json({ error: 'child_id is required' }, { status: 400 });
  }

  const db = dbClient();
  const { data, error } = await db
    .from('conversations')
    .insert({
      child_id: body.child_id,
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
