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

  const { data: existing, error: existingError } = await db
    .from('article_bookmarks')
    .select('user_id,article_id')
    .eq('user_id', user.id)
    .eq('article_id', id)
    .maybeSingle();

  if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 });

  if (existing) {
    const { error } = await db
      .from('article_bookmarks')
      .delete()
      .eq('user_id', user.id)
      .eq('article_id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ bookmarked: false });
  }

  const { error } = await db.from('article_bookmarks').insert({
    user_id: user.id,
    article_id: id,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ bookmarked: true });
}
