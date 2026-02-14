import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

function dbClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const supabaseAuth = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await context.params;
  const payload = (await request.json().catch(() => ({}))) as { rating?: number; note?: string };

  const rating = typeof payload.rating === 'number' && payload.rating >= 1 && payload.rating <= 5 ? payload.rating : null;
  const note = typeof payload.note === 'string' ? payload.note.trim().slice(0, 1000) : null;

  const db = dbClient();

  const { error } = await db.from('activity_completions').upsert(
    {
      user_id: user.id,
      activity_id: id,
      rating,
      note,
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,activity_id' },
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
