import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

type BookmarkedArticle = {
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

type BookmarkedArticleRow = {
  created_at: string;
  explore_articles: BookmarkedArticle[] | BookmarkedArticle | null;
};

function dbClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function GET() {
  const supabaseAuth = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = dbClient();

  const { data, error } = await db
    .from('article_bookmarks')
    .select('created_at, explore_articles(id,title,emoji,type,summary,body,age_min_months,age_max_months,domain,language,read_time_minutes,created_at)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const articles = ((data ?? []) as unknown as BookmarkedArticleRow[])
    .map((row) => {
      const linked = Array.isArray(row.explore_articles) ? row.explore_articles[0] : row.explore_articles;
      if (!linked) return null;
      return {
        ...linked,
        bookmarked_at: row.created_at,
        is_bookmarked: true,
      };
    })
    .filter((row): row is BookmarkedArticle & { bookmarked_at: string; is_bookmarked: boolean } => Boolean(row));

  return NextResponse.json({ articles, total: articles.length });
}
