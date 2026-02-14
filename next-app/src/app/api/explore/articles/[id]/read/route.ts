import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

function dbClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const supabaseAuth = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await context.params;
  const db = dbClient();

  const { error } = await db.from('article_reads').upsert(
    {
      user_id: user.id,
      article_id: id,
      opened_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,article_id', ignoreDuplicates: false }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const supabaseAuth = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as { read_completed?: boolean; read_time_seconds?: number };

  const patch: Record<string, unknown> = {
    opened_at: new Date().toISOString(),
    read_time_seconds: Math.max(0, Number(body.read_time_seconds ?? 0)),
  };

  if (body.read_completed === true) {
    patch.read_completed = true;
    patch.completed_at = new Date().toISOString();
  }

  const db = dbClient();
  const { error } = await db.from('article_reads').upsert(
    {
      user_id: user.id,
      article_id: id,
      ...patch,
    },
    { onConflict: 'user_id,article_id', ignoreDuplicates: false }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
