import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { getAgeInMonths } from '@/lib/childAge';
import { getUserLanguage, languagePriority } from '@/lib/language';

type Article = {
  id: string;
  title: string;
  emoji: string;
  type: 'article' | 'research' | 'guide';
  summary: string | null;
  body: string;
  age_min_months: number;
  age_max_months: number;
  domain: string | null;
  language: string;
  read_time_minutes: number | null;
  created_at: string;
};

type ReadRow = {
  article_id: string;
  opened_at: string;
  read_completed: boolean;
  completed_at: string | null;
};

function dbClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

function enrich(articles: Article[], readsMap: Map<string, ReadRow>) {
  return articles.map((a) => {
    const r = readsMap.get(a.id);
    return {
      ...a,
      is_read: Boolean(r?.read_completed),
      opened_at: r?.opened_at ?? null,
      completed_at: r?.completed_at ?? null,
    };
  });
}

function interleaveByType(input: Article[]) {
  const byType: Record<'article' | 'guide' | 'research', Article[]> = {
    article: input.filter((a) => a.type === 'article'),
    guide: input.filter((a) => a.type === 'guide'),
    research: input.filter((a) => a.type === 'research'),
  };
  const order: Array<'article' | 'guide' | 'research'> = ['article', 'guide', 'research'];
  const out: Article[] = [];
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

function readingStreakDays(completedAts: Array<string | null>) {
  const days = new Set(
    completedAts
      .filter((v): v is string => Boolean(v))
      .map((v) => new Date(v).toISOString().slice(0, 10))
  );

  let streak = 0;
  let cursor = new Date();
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (!days.has(key)) break;
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
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
    return NextResponse.json({ new_for_you: [], keep_reading: [], deep_dives: [], recently_read: [], stats: { total_available: 0, total_read: 0, reading_streak_days: 0 }, coming_next: [] });
  }

  const ageMonths = getAgeInMonths(child.birthdate);
  const preferredLanguage = await getUserLanguage(user.id, 'es');

  let allArticles: Article[] = [];
  let chosenLanguage: 'en' | 'es' = preferredLanguage;

  for (const language of languagePriority(preferredLanguage)) {
    const { data: allRows, error } = await db
      .from('explore_articles')
      .select('id,title,emoji,type,summary,body,age_min_months,age_max_months,domain,language,read_time_minutes,created_at')
      .eq('language', language)
      .lte('age_min_months', ageMonths)
      .gte('age_max_months', ageMonths)
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if ((allRows?.length ?? 0) > 0) {
      allArticles = (allRows ?? []) as Article[];
      chosenLanguage = language;
      break;
    }
  }

  const { data: reads } = await db
    .from('article_reads')
    .select('article_id,opened_at,read_completed,completed_at')
    .eq('user_id', user.id);

  const readsMap = new Map<string, ReadRow>();
  for (const r of (reads ?? []) as ReadRow[]) {
    readsMap.set(r.article_id, r);
  }

  const unreadNeverOpened = allArticles.filter((a) => !readsMap.has(a.id));
  const newForYou = enrich(interleaveByType(unreadNeverOpened).slice(0, 3), readsMap);

  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  const keepReadingBase = allArticles
    .filter((a) => {
      const r = readsMap.get(a.id);
      if (!r || r.read_completed) return false;
      return new Date(r.opened_at).getTime() < fiveMinutesAgo;
    })
    .sort((a, b) => {
      const ra = readsMap.get(a.id)!;
      const rb = readsMap.get(b.id)!;
      return new Date(rb.opened_at).getTime() - new Date(ra.opened_at).getTime();
    })
    .slice(0, 2);
  const keepReading = enrich(keepReadingBase, readsMap);

  const deepDives = enrich(allArticles.filter((a) => a.type === 'research'), readsMap);

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

  const { data: upcomingRows } = await db
    .from('explore_articles')
    .select('id,title,emoji,type,summary,body,age_min_months,age_max_months,domain,language,read_time_minutes,created_at')
    .eq('language', chosenLanguage)
    .gte('age_min_months', ageMonths + 1)
    .lte('age_min_months', ageMonths + 3)
    .order('age_min_months', { ascending: true })
    .limit(3);

  return NextResponse.json({
    new_for_you: newForYou,
    keep_reading: keepReading,
    deep_dives: deepDives,
    recently_read: recentlyRead,
    coming_next: (upcomingRows ?? []) as Article[],
    stats: {
      total_available: totalAvailable,
      total_read: totalRead,
      reading_streak_days: readingStreakDays(Array.from(readsMap.values()).map((r) => r.completed_at)),
    },
  });
}
