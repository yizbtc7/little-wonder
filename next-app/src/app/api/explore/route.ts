import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { getAgeInMonths } from '@/lib/childAge';
import { getUserLanguage, languagePriority } from '@/lib/language';

type ExploreArticleRow = {
  id: string;
  title: string;
  emoji: string;
  type: 'article' | 'research' | 'guide';
  summary: string | null;
  body: string;
  age_min_months: number;
  age_max_months: number;
  domain: string | null;
  language: 'en' | 'es';
  read_time_minutes: number | null;
  created_at: string;
  is_read?: boolean;
};

type LegacyBrainCardRow = {
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
    return NextResponse.json({ brain_cards: [], daily_tip: null, brain_cards_source: 'none' });
  }

  const ageMonths = getAgeInMonths(child.birthdate);
  const preferredLanguage = await getUserLanguage(user.id, 'es');

  let brainCards: ExploreArticleRow[] = [];
  let dailyTip: DailyTipRow | null = null;
  let brainCardsSource: 'explore_articles' | 'legacy_brain_cards_fallback_temporary' | 'none' = 'none';
  let hadLongArticleRows = false;

  for (const language of languagePriority(preferredLanguage)) {
    const [articlesRes, tipRes] = await Promise.all([
      db
        .from('explore_articles')
        .select('id,title,emoji,type,summary,body,age_min_months,age_max_months,domain,language,read_time_minutes,created_at')
        .eq('language', language)
        .lte('age_min_months', ageMonths)
        .gte('age_max_months', ageMonths)
        .order('created_at', { ascending: false })
        .limit(60),
      db
        .from('daily_tips')
        .select('id,body,language')
        .eq('language', language)
        .lte('age_min_months', ageMonths)
        .gte('age_max_months', ageMonths)
        .order('created_at', { ascending: false })
        .limit(1),
    ]);

    if (articlesRes.error || tipRes.error) {
      return NextResponse.json({ error: articlesRes.error?.message ?? tipRes.error?.message }, { status: 500 });
    }

    const hasLongArticles = (articlesRes.data?.length ?? 0) > 0;
    const hasDailyTip = (tipRes.data?.length ?? 0) > 0;

    if (hasLongArticles || hasDailyTip) {
      brainCards = (articlesRes.data ?? []) as ExploreArticleRow[];
      hadLongArticleRows = hasLongArticles;
      dailyTip = ((tipRes.data ?? [])[0] as DailyTipRow | undefined) ?? null;
      brainCardsSource = hasLongArticles ? 'explore_articles' : 'none';
      break;
    }
  }

  // Mark read status and hide already-read items from "Dentro del cerebro".
  if (brainCards.length > 0) {
    const ids = brainCards.map((card) => card.id);
    const { data: reads, error: readsError } = await db
      .from('article_reads')
      .select('article_id,read_completed')
      .eq('user_id', user.id)
      .in('article_id', ids);

    if (readsError) {
      return NextResponse.json({ error: readsError.message }, { status: 500 });
    }

    const readSet = new Set(
      (reads ?? [])
        .filter((row) => row.read_completed)
        .map((row) => row.article_id)
    );

    brainCards = brainCards
      .map((card) => ({ ...card, is_read: readSet.has(card.id) }))
      .filter((card) => !card.is_read);

    // Top up with nearby-age unread long-form articles so this section stays populated.
    if (brainCards.length < 3) {
      const { data: nearbyRows, error: nearbyError } = await db
        .from('explore_articles')
        .select('id,title,emoji,type,summary,body,age_min_months,age_max_months,domain,language,read_time_minutes,created_at')
        .eq('language', preferredLanguage)
        .lte('age_min_months', ageMonths)
        .gte('age_max_months', ageMonths)
        .order('created_at', { ascending: false })
        .limit(60);

      if (nearbyError) {
        return NextResponse.json({ error: nearbyError.message }, { status: 500 });
      }

      if ((nearbyRows?.length ?? 0) > 0) {
        const candidateIds = (nearbyRows ?? []).map((row) => row.id);
        const { data: nearbyReads, error: nearbyReadsError } = await db
          .from('article_reads')
          .select('article_id,read_completed')
          .eq('user_id', user.id)
          .in('article_id', candidateIds);

        if (nearbyReadsError) {
          return NextResponse.json({ error: nearbyReadsError.message }, { status: 500 });
        }

        const nearbyReadSet = new Set((nearbyReads ?? []).filter((row) => row.read_completed).map((row) => row.article_id));
        const existingIds = new Set(brainCards.map((card) => card.id));
        const topUp = ((nearbyRows ?? []) as ExploreArticleRow[])
          .filter((row) => !existingIds.has(row.id) && !nearbyReadSet.has(row.id))
          .slice(0, 3 - brainCards.length)
          .map((row) => ({ ...row, is_read: false }));

        brainCards = [...brainCards, ...topUp];
      }
    }
  }

  // Temporary explicit fallback only when no long-form article rows exist for this age/language set.
  if (!hadLongArticleRows && brainCards.length === 0) {
    for (const language of languagePriority(preferredLanguage)) {
      const fallbackRes = await db
        .from('explore_brain_cards')
        .select('id,emoji,title,body,domain,language')
        .eq('language', language)
        .lte('age_min_months', ageMonths)
        .gte('age_max_months', ageMonths)
        .order('created_at', { ascending: false })
        .limit(3);

      if (fallbackRes.error) {
        return NextResponse.json({ error: fallbackRes.error.message }, { status: 500 });
      }

      if ((fallbackRes.data?.length ?? 0) > 0) {
        const legacyRows = (fallbackRes.data ?? []) as LegacyBrainCardRow[];
        brainCards = legacyRows.map((row) => ({
          id: row.id,
          title: row.title,
          emoji: row.emoji,
          type: 'article',
          summary: row.body,
          body: row.body,
          age_min_months: ageMonths,
          age_max_months: ageMonths,
          domain: row.domain,
          language: row.language,
          read_time_minutes: 3,
          created_at: new Date().toISOString(),
        }));
        brainCardsSource = 'legacy_brain_cards_fallback_temporary';
        break;
      }
    }
  }

  return NextResponse.json({
    brain_cards: brainCards,
    brain_cards_source: brainCardsSource,
    daily_tip: dailyTip
      ? {
          id: dailyTip.id,
          language: dailyTip.language,
          article: {
            tip: dailyTip.body,
            why:
              dailyTip.language === 'es'
                ? 'Este tipo de micro-momentos fortalece funciones ejecutivas, lenguaje y vínculo emocional cuando se repiten con calma y presencia.'
                : 'These small daily moments strengthen executive function, language, and emotional connection when repeated with calm presence.',
          },
        }
      : null,
  });
}
