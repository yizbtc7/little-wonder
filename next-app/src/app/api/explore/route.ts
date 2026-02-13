import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { getAgeInMonths } from '@/lib/childAge';

function dbClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function GET() {
  const supabaseAuth = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = dbClient();
  const { data: child } = await db
    .from('children')
    .select('id,birthdate')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!child?.birthdate) {
    return NextResponse.json({ brain_cards: [], daily_tip: null });
  }

  const ageMonths = getAgeInMonths(child.birthdate);

  const { data: brainCards, error: brainError } = await db
    .from('explore_content')
    .select('id,icon,title,domain,preview,article')
    .eq('type', 'brain_card')
    .eq('language', 'en')
    .lte('age_range_start', ageMonths)
    .gte('age_range_end', ageMonths)
    .order('created_at', { ascending: false })
    .limit(3);

  if (brainError) {
    return NextResponse.json({ error: brainError.message }, { status: 500 });
  }

  const { data: dailyTipRows, error: tipError } = await db
    .from('explore_content')
    .select('id,article,source')
    .eq('type', 'daily_tip')
    .eq('language', 'en')
    .lte('age_range_start', ageMonths)
    .gte('age_range_end', ageMonths)
    .order('created_at', { ascending: false })
    .limit(1);

  if (tipError) {
    return NextResponse.json({ error: tipError.message }, { status: 500 });
  }

  return NextResponse.json({
    brain_cards: brainCards ?? [],
    daily_tip: dailyTipRows?.[0] ?? null,
  });
}
