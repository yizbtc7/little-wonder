import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { buildCuriosityQuote } from '@/lib/childProfile';
import { getUserLanguage } from '@/lib/language';

function dbClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function POST(_: Request, context: { params: Promise<{ childId: string }> }) {
  const supabaseAuth = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { childId } = await context.params;
  const db = dbClient();

  const { data: child } = await db
    .from('children')
    .select('id,name')
    .eq('id', childId)
    .eq('user_id', user.id)
    .maybeSingle<{ id: string; name: string }>();

  if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const locale = await getUserLanguage(user.id, 'es');
  const quote = buildCuriosityQuote({
    childName: child.name,
    locale,
  });

  const now = new Date().toISOString();
  const { error } = await db
    .from('children')
    .update({ curiosity_quote: quote, curiosity_quote_updated_at: now })
    .eq('id', childId)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ curiosity_quote: quote, curiosity_quote_updated_at: now });
}
