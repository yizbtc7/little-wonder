import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

type Body = { interests?: string[] };

function dbClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function POST(request: Request, context: { params: Promise<{ childId: string }> }) {
  const supabaseAuth = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { childId } = await context.params;
  const body = (await request.json()) as Body;
  const interests = Array.from(
    new Set((body.interests ?? []).map((value) => value.trim()).filter((value) => value.length > 0))
  ).slice(0, 20);

  const db = dbClient();
  const { data: child } = await db.from('children').select('id').eq('id', childId).eq('user_id', user.id).maybeSingle();
  if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { error: deleteError } = await db.from('child_interests').delete().eq('child_id', childId);
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

  if (interests.length > 0) {
    const { error: insertError } = await db.from('child_interests').insert(interests.map((interest) => ({ child_id: childId, interest })));
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // backward compatibility with existing children.interests array usage in prompts
  await db.from('children').update({ interests }).eq('id', childId).eq('user_id', user.id);

  return NextResponse.json({ interests });
}
