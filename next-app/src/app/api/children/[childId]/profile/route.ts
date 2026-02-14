import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

function dbClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

type TimelineRow = {
  id: string;
  created_at: string;
  title: string;
  observation_text: string;
  schemas_detected: string[] | null;
};

type SavedArticle = {
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

type SavedArticleRow = {
  created_at: string;
  explore_articles: SavedArticle[] | SavedArticle | null;
};

export async function GET(_: Request, context: { params: Promise<{ childId: string }> }) {
  const supabaseAuth = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { childId } = await context.params;
  const db = dbClient();

  const { data: child, error: childError } = await db
    .from('children')
    .select('id,name,birthdate,photo_url,curiosity_quote,curiosity_quote_updated_at,created_at')
    .eq('id', childId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (childError) return NextResponse.json({ error: childError.message }, { status: 500 });
  if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const [{ data: interests }, { data: timeline }, observationCountResult, { data: savedArticlesRows }] = await Promise.all([
    db.from('child_interests').select('interest').eq('child_id', childId).order('interest', { ascending: true }),
    db.from('wonders').select('id,created_at,title,observation_text,schemas_detected').eq('child_id', childId).order('created_at', { ascending: false }).limit(50),
    db.from('observations').select('id', { count: 'exact', head: true }).eq('child_id', childId).eq('user_id', user.id),
    db
      .from('article_bookmarks')
      .select('created_at, explore_articles(id,title,emoji,type,summary,body,age_min_months,age_max_months,domain,language,read_time_minutes,created_at)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ]);

  const timelineRows = (timeline ?? []) as TimelineRow[];
  const schemaCountMap = new Map<string, number>();

  for (const row of timelineRows) {
    const unique = new Set((row.schemas_detected ?? []).filter((s): s is string => typeof s === 'string' && s.length > 0));
    for (const schema of unique) {
      schemaCountMap.set(schema, (schemaCountMap.get(schema) ?? 0) + 1);
    }
  }

  const schema_stats = Array.from(schemaCountMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const top_schema = schema_stats[0] ?? null;
  const top_schemas = schema_stats.slice(0, 3);

  const savedArticles = ((savedArticlesRows ?? []) as unknown as SavedArticleRow[])
    .map((row) => {
      const linked = Array.isArray(row.explore_articles) ? row.explore_articles[0] : row.explore_articles;
      if (!linked) return null;
      return {
        ...linked,
        bookmarked_at: row.created_at,
        is_bookmarked: true,
      };
    })
    .filter((row): row is SavedArticle & { bookmarked_at: string; is_bookmarked: boolean } => Boolean(row));

  return NextResponse.json({
    child: {
      ...child,
      moments_count: observationCountResult.count ?? 0,
    },
    interests: (interests ?? []).map((row) => row.interest).filter((v): v is string => typeof v === 'string' && v.length > 0),
    schema_stats,
    top_schema,
    top_schemas,
    timeline: timelineRows.map((row) => ({
      id: row.id,
      created_at: row.created_at,
      title: row.title,
      observation: row.observation_text,
      schemas: Array.from(new Set((row.schemas_detected ?? []).filter((s): s is string => typeof s === 'string' && s.length > 0))),
    })),
    recent_moments: timelineRows.slice(0, 3).map((row) => ({
      id: row.id,
      title: row.title,
      observation: row.observation_text,
      created_at: row.created_at,
      schemas: Array.from(new Set((row.schemas_detected ?? []).filter((s): s is string => typeof s === 'string' && s.length > 0))),
    })),
    savedArticles,
  });
}
