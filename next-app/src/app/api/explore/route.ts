import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { getAgeInMonths } from '@/lib/childAge';
import { getUserLanguage, languagePriority } from '@/lib/language';

type BrainCardRow = {
  id: string;
  emoji: string;
  title: string;
  body: string;
  domain: string;
  language: 'en' | 'es';
};

type DailyTipRow = {
  id: string;
  body: string;
  language: 'en' | 'es';
};

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

  let brainCards: BrainCardRow[] = [];
  let dailyTip: DailyTipRow | null = null;

  for (const language of languagePriority(preferredLanguage)) {
    const [brainRes, tipRes] = await Promise.all([
      db
        .from('explore_brain_cards')
        .select('id,emoji,title,body,domain,language')
        .eq('language', language)
        .lte('age_min_months', ageMonths)
        .gte('age_max_months', ageMonths)
        .order('created_at', { ascending: false })
        .limit(3),
      db
        .from('daily_tips')
        .select('id,body,language')
        .eq('language', language)
        .lte('age_min_months', ageMonths)
        .gte('age_max_months', ageMonths)
        .order('created_at', { ascending: false })
        .limit(1),
    ]);

    if (brainRes.error || tipRes.error) {
      return NextResponse.json({ error: brainRes.error?.message ?? tipRes.error?.message }, { status: 500 });
    }

    if ((brainRes.data?.length ?? 0) > 0 || (tipRes.data?.length ?? 0) > 0) {
      brainCards = (brainRes.data ?? []) as BrainCardRow[];
      dailyTip = ((tipRes.data ?? [])[0] as DailyTipRow | undefined) ?? null;
      break;
    }
  }

  return NextResponse.json({
    brain_cards: brainCards.map((row) => {
      const defaultPresence =
        row.language === 'es'
          ? 'Escucha con curiosidad y acompaña sin corregir de inmediato. Tu presencia atenta le da seguridad para explorar más.'
          : 'Stay curious and join without correcting too quickly. Your attentive presence gives them safety to explore more.';

      return {
        id: row.id,
        icon: row.emoji,
        title: row.title,
        domain: row.domain,
        preview: row.body,
        language: row.language,
        article: {
          whats_happening: row.body,
          youll_see_it_when: [row.body],
          fascinating_part: row.body,
          how_to_be_present: defaultPresence,
        },
      };
    }),
    daily_tip: dailyTip
      ? {
          id: dailyTip.id,
          language: dailyTip.language,
          article: {
            tip: dailyTip.body,
            why: dailyTip.body,
          },
        }
      : null,
  });
}
