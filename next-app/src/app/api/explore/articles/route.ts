import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { getAgeInMonths } from '@/lib/childAge';

function dbClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function GET(request: Request) {
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
    return NextResponse.json({ articles: [] });
  }

  const ageMonths = getAgeInMonths(child.birthdate);
  const search = new URL(request.url).searchParams;
  const lang = (search.get('language') || 'en').toLowerCase().startsWith('es') ? 'es' : 'en';

  const { data, error } = await db
    .from('explore_articles')
    .select('id,title,emoji,type,summary,body,age_min_months,age_max_months,domain,language,read_time_minutes,created_at')
    .eq('language', lang)
    .lte('age_min_months', ageMonths)
    .gte('age_max_months', ageMonths)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ articles: data ?? [] });
}
