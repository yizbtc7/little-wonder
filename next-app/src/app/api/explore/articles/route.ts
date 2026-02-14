import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { getAgeInMonths } from '@/lib/childAge';
import { getUserLanguage } from '@/lib/language';
import { canonicalTitleKey, cleanArticleTitle, dedupeByTitleKey, normalizeLanguage, pickUnreadSection, type ExploreArticle } from '@/lib/exploreGuarantees';

type ReadRow = {
  article_id: string;
  opened_at: string;
  read_completed: boolean;
  completed_at: string | null;
};

function dbClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

function enrich(articles: ExploreArticle[], readsMap: Map<string, ReadRow>) {
  return articles.map((a) => {
    const r = readsMap.get(a.id);
    return {
      ...a,
      title: cleanArticleTitle(a.title),
      is_read: Boolean(r?.read_completed),
      opened_at: r?.opened_at ?? null,
      completed_at: r?.completed_at ?? null,
    };
  });
}

function interleaveByType(input: ExploreArticle[]) {
  const byType: Record<'article' | 'guide' | 'research', ExploreArticle[]> = {
    article: input.filter((a) => a.type === 'article'),
    guide: input.filter((a) => a.type === 'guide'),
    research: input.filter((a) => a.type === 'research'),
  };
  const order: Array<'article' | 'guide' | 'research'> = ['article', 'guide', 'research'];
  const out: ExploreArticle[] = [];
  let consumed = true;
  while (consumed) {
    consumed = false;
    for (const t of order) {
      const next = byType[t].shift();
      if (next) {
        out.push(next);
        consumed = true;
      }
    }
  }
  return out;
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

  const { data: child } = await db
    .from('children')
    .select('id,birthdate')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!child?.birthdate) {
    return NextResponse.json({
      new_for_you: [],
      keep_reading: [],
      deep_dives: [],
      recently_read: [],
      stats: { total_available: 0, total_read: 0 },
      coming_next: [],
      shortages: {
        nuevo_para_ti: { required: 3, available_unread: 0, returned: 0, shortage: 3 },
        investigaciones: { required: 3, available_unread: 0, returned: 0, shortage: 3 },
        mas_articulos_para_esta_edad: { required: 3, available_unread: 0, returned: 0, shortage: 3 },
      },
    });
  }

  const ageMonths = getAgeInMonths(child.birthdate);
  const preferredLanguage = await getUserLanguage(user.id, 'es');
  const selectedLanguage = normalizeLanguage(request.nextUrl.searchParams.get('language'), preferredLanguage);

  const { data: allRows, error } = await db
    .from('explore_articles')
    .select('id,title,emoji,type,summary,body,age_min_months,age_max_months,domain,language,read_time_minutes,created_at')
    .eq('language', selectedLanguage)
    .lte('age_min_months', ageMonths)
    .gte('age_max_months', ageMonths)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const allArticles = (allRows ?? []) as ExploreArticle[];

  const { data: reads } = await db
    .from('article_reads')
    .select('article_id,opened_at,read_completed,completed_at')
    .eq('user_id', user.id);

  const readsMap = new Map<string, ReadRow>();
  for (const r of (reads ?? []) as ReadRow[]) {
    readsMap.set(r.article_id, r);
  }

  const readTitleKeys = new Set(
    allArticles.filter((a) => readsMap.get(a.id)?.read_completed).map((a) => canonicalTitleKey(a.title))
  );
  const unreadPool = dedupeByTitleKey(
    allArticles.filter((a) => !readsMap.get(a.id)?.read_completed && !readTitleKeys.has(canonicalTitleKey(a.title)))
  );

  const usedIds = new Set<string>();
  const newForYouPick = pickUnreadSection(interleaveByType(unreadPool), usedIds, 3);
  const deepDivesPick = pickUnreadSection(unreadPool, usedIds, 3, (a) => a.type === 'research');
  const moreForAgePick = pickUnreadSection(unreadPool, usedIds, 3);

  const newForYou = enrich(newForYouPick.items, readsMap);
  const deepDives = enrich(deepDivesPick.items, readsMap);
  const keepReading = enrich(moreForAgePick.items, readsMap);

  const recentlyReadBase = allArticles
    .filter((a) => readsMap.get(a.id)?.read_completed)
    .sort((a, b) => {
      const ca = readsMap.get(a.id)?.completed_at ?? '';
      const cb = readsMap.get(b.id)?.completed_at ?? '';
      return new Date(cb).getTime() - new Date(ca).getTime();
    })
    .slice(0, 10);
  const recentlyRead = enrich(recentlyReadBase, readsMap);

  const totalAvailable = allArticles.length;
  const totalRead = allArticles.filter((a) => readsMap.get(a.id)?.read_completed).length;

  return NextResponse.json({
    new_for_you: newForYou,
    keep_reading: keepReading,
    deep_dives: deepDives,
    recently_read: recentlyRead,
    coming_next: [],
    shortages: {
      nuevo_para_ti: newForYouPick.shortage,
      investigaciones: deepDivesPick.shortage,
      mas_articulos_para_esta_edad: moreForAgePick.shortage,
    },
    stats: {
      total_available: totalAvailable,
      total_read: totalRead,
    },
  });
}
