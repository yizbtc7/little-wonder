import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { getAgeInMonths } from '@/lib/childAge';
import { getUserLanguage, languagePriority } from '@/lib/language';

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
  const preferredLanguage = await getUserLanguage(user.id, 'es');

  const loadBrainCards = async (language: 'en' | 'es') =>
    db
      .from('explore_content')
      .select('id,icon,title,domain,preview,article,language')
      .eq('type', 'brain_card')
      .eq('language', language)
      .lte('age_range_start', ageMonths)
      .gte('age_range_end', ageMonths)
      .order('created_at', { ascending: false })
      .limit(3);

  const loadDailyTip = async (language: 'en' | 'es') =>
    db
      .from('explore_content')
      .select('id,article,source,language')
      .eq('type', 'daily_tip')
      .eq('language', language)
      .lte('age_range_start', ageMonths)
      .gte('age_range_end', ageMonths)
      .order('created_at', { ascending: false })
      .limit(1);

  let brainCards: unknown[] = [];
  let dailyTipRows: unknown[] = [];

  for (const language of languagePriority(preferredLanguage)) {
    const [brainRes, tipRes] = await Promise.all([loadBrainCards(language), loadDailyTip(language)]);
    if (brainRes.error || tipRes.error) {
      return NextResponse.json({ error: brainRes.error?.message ?? tipRes.error?.message }, { status: 500 });
    }
    if ((brainRes.data?.length ?? 0) > 0 || (tipRes.data?.length ?? 0) > 0) {
      brainCards = brainRes.data ?? [];
      dailyTipRows = tipRes.data ?? [];
      break;
    }
  }

  return NextResponse.json({
    brain_cards: brainCards,
    daily_tip: dailyTipRows?.[0] ?? null,
  });
}
