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

  await db.from('users').upsert(
    {
      id: user.id,
      name: (user.user_metadata?.name as string | undefined) ?? (user.user_metadata?.full_name as string | undefined) ?? user.email ?? null,
    },
    { onConflict: 'id' },
  );

  const { error } = await db.from('activity_saves').upsert({ user_id: user.id, activity_id: id }, { onConflict: 'user_id,activity_id' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const supabaseAuth = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await context.params;
  const db = dbClient();

  const { error } = await db.from('activity_saves').delete().eq('user_id', user.id).eq('activity_id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
