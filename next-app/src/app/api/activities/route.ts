import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { getAgeInMonths } from '@/lib/childAge';

type ActivityRow = {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  schema_target: string;
  domain: string;
  duration_minutes: number;
  materials: string[];
  steps: string;
  science_note: string;
  age_min_months: number;
  age_max_months: number;
  language: string;
  created_at: string;
};

function dbClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

function toCountMap(schemas: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const schema of schemas) {
    map.set(schema, (map.get(schema) ?? 0) + 1);
  }
  return map;
}

function rankActivities(rows: ActivityRow[], schemaCounts: Map<string, number>): ActivityRow[] {
  return [...rows].sort((a, b) => {
    const aScore = schemaCounts.get(a.schema_target) ?? 0;
    const bScore = schemaCounts.get(b.schema_target) ?? 0;
    if (bScore !== aScore) return bScore - aScore;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
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
  const search = new URL(request.url).searchParams;
  const requestedChildId = search.get('child_id');
  const language = 'en';

  let childQuery = db.from('children').select('id,birthdate').eq('user_id', user.id).order('created_at', { ascending: true }).limit(1);
  if (requestedChildId) {
    childQuery = db.from('children').select('id,birthdate').eq('user_id', user.id).eq('id', requestedChildId).limit(1);
  }

  const { data: child } = await childQuery.maybeSingle();

  if (!child?.id || !child.birthdate) {
    return NextResponse.json({ featured: null, activities: [], child_schemas: [] });
  }

  const ageMonths = getAgeInMonths(child.birthdate);

  const { data: wonderRows } = await db
    .from('wonders')
    .select('schemas_detected')
    .eq('child_id', child.id)
    .order('created_at', { ascending: false })
    .limit(50);

  const schemaList = (wonderRows ?? [])
    .flatMap((row) => ((row as { schemas_detected?: string[] | null }).schemas_detected ?? []))
    .filter((s): s is string => typeof s === 'string' && s.length > 0);

  const schemaCounts = toCountMap(schemaList);
  const topSchemas = Array.from(schemaCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([schema]) => schema);

  const activitiesQuery = db
    .from('activities')
    .select('id,title,subtitle,emoji,schema_target,domain,duration_minutes,materials,steps,science_note,age_min_months,age_max_months,language,created_at')
    .eq('language', language)
    .lte('age_min_months', ageMonths)
    .gte('age_max_months', ageMonths);

  const { data: languageRows, error: languageError } = await activitiesQuery.order('created_at', { ascending: false });
  if (languageError) {
    return NextResponse.json({ error: languageError.message }, { status: 500 });
  }

  let rows = (languageRows ?? []) as ActivityRow[];

  if (rows.length === 0) {
    return NextResponse.json({ featured: null, activities: [], child_schemas: topSchemas });
  }

  const ranked = rankActivities(rows, schemaCounts);
  const selected = ranked.slice(0, 6);

  const featured = selected[0] ?? null;
  const activities = selected.slice(1);

  return NextResponse.json({ featured, activities, child_schemas: topSchemas });
}
