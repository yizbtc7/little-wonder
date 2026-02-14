import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { getAgeInMonths } from '@/lib/childAge';
import { getUserLanguage } from '@/lib/language';
import { canonicalTitleKey, cleanArticleTitle, dedupeByTitleKey, normalizeLanguage, pickUnreadSection, type ExploreArticle } from '@/lib/exploreGuarantees';
import { resolveAccessibleChild } from '@/lib/childAccess';

type DailyTipRow = {
  id: string;
  body: string;
  language: 'en' | 'es';
};

function dbClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function GET(request: NextRequest) {
  const supabaseAuth = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = dbClient();
  const child = await resolveAccessibleChild(db, user.id);

  if (!child?.birthdate) {
    return NextResponse.json({ brain_cards: [], daily_tip: null, brain_cards_source: 'none', shortages: { dentro_del_cerebro: { required: 3, available_unread: 0, returned: 0, shortage: 3 } } });
  }

  const ageMonths = getAgeInMonths(child.birthdate);
  const preferredLanguage = await getUserLanguage(user.id, 'es');
  const selectedLanguage = normalizeLanguage(request.nextUrl.searchParams.get('language'), preferredLanguage);

  const [articlesRes, tipRes] = await Promise.all([
    db
      .from('explore_articles')
      .select('id,title,emoji,type,summary,body,age_min_months,age_max_months,domain,language,read_time_minutes,created_at')
      .eq('language', selectedLanguage)
      .lte('age_min_months', ageMonths)
      .gte('age_max_months', ageMonths)
      .order('created_at', { ascending: false })
      .limit(120),
    db
      .from('daily_tips')
      .select('id,body,language')
      .eq('language', selectedLanguage)
      .lte('age_min_months', ageMonths)
      .gte('age_max_months', ageMonths)
      .order('created_at', { ascending: false })
      .limit(1),
  ]);

  if (articlesRes.error || tipRes.error) {
    return NextResponse.json({ error: articlesRes.error?.message ?? tipRes.error?.message }, { status: 500 });
  }

  const pool = (articlesRes.data ?? []) as ExploreArticle[];
  const ids = pool.map((card) => card.id);

  const { data: reads, error: readsError } = ids.length
    ? await db.from('article_reads').select('article_id,read_completed').eq('user_id', user.id).in('article_id', ids)
    : { data: [], error: null as { message: string } | null };

  if (readsError) {
    return NextResponse.json({ error: readsError.message }, { status: 500 });
  }

  const readSet = new Set((reads ?? []).filter((row) => row.read_completed).map((row) => row.article_id));
  const readTitleKeys = new Set(pool.filter((card) => readSet.has(card.id)).map((card) => canonicalTitleKey(card.title)));
  const unreadPool = dedupeByTitleKey(
    pool.filter((card) => !readSet.has(card.id) && !readTitleKeys.has(canonicalTitleKey(card.title)))
  );

  const usedIds = new Set<string>();
  const brainSection = pickUnreadSection(unreadPool, usedIds, 3, (a) => a.type !== 'research');
  const brainCards = brainSection.items.map((card) => ({ ...card, title: cleanArticleTitle(card.title), is_read: false }));

  const dailyTip = ((tipRes.data ?? [])[0] as DailyTipRow | undefined) ?? null;

  return NextResponse.json({
    brain_cards: brainCards,
    brain_cards_source: pool.length > 0 ? 'explore_articles' : 'none',
    shortages: {
      dentro_del_cerebro: brainSection.shortage,
    },
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
