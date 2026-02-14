import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { getAgeInMonths } from '@/lib/childAge';
import { getUserLanguage } from '@/lib/language';
import { normalizeSchemaList } from '@/lib/schemas';

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
  is_featured?: boolean | null;
  created_at: string;
};

const MIN_AVAILABLE_TO_DO = 6;

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

function canonicalTitleKey(title: string): string {
  return title
    .replace(/\s*[·•]\s*refill-[^\n]+$/i, '')
    .replace(/\s*[·•]\s*v\d+$/i, '')
    .replace(/\s*[·•]\s*b\d+(?:-[\w-]+)?$/i, '')
    .replace(/\s+\d{10,}$/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function rankActivities(rows: ActivityRow[], schemaCounts: Map<string, number>): ActivityRow[] {
  return [...rows].sort((a, b) => {
    const aFeatured = a.is_featured ? 1 : 0;
    const bFeatured = b.is_featured ? 1 : 0;
    if (bFeatured !== aFeatured) return bFeatured - aFeatured;

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
  const preferredLanguage = await getUserLanguage(user.id, 'es');

  let childQuery = db.from('children').select('id,birthdate').eq('user_id', user.id).order('created_at', { ascending: true }).limit(1);
  if (requestedChildId) {
    childQuery = db.from('children').select('id,birthdate').eq('user_id', user.id).eq('id', requestedChildId).limit(1);
  }

  const { data: child } = await childQuery.maybeSingle();

  if (!child?.id || !child.birthdate) {
    return NextResponse.json({
      featured: null,
      activities: [],
      saved: [],
      completed: [],
      stats: { total: 0, completed: 0 },
      child_schemas: [],
      shortages: {
        available_to_do: {
          required: MIN_AVAILABLE_TO_DO,
          available_uncompleted: 0,
          returned: 0,
          shortage: MIN_AVAILABLE_TO_DO,
        },
      },
      inventory: { languages_checked: [preferredLanguage], sources_used: [] },
    });
  }

  const ageMonths = getAgeInMonths(child.birthdate);

  const { data: wonderRows } = await db
    .from('wonders')
    .select('schemas_detected')
    .eq('child_id', child.id)
    .order('created_at', { ascending: false })
    .limit(50);

  const schemaList = normalizeSchemaList(
    (wonderRows ?? []).flatMap((row) => ((row as { schemas_detected?: string[] | null }).schemas_detected ?? []))
  );

  const schemaCounts = toCountMap(schemaList);
  const topSchemas = Array.from(schemaCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([schema]) => schema);

  const prioritizedLanguages = [preferredLanguage];
  const rowsByLanguage = new Map<string, ActivityRow[]>();

  const { data: languageRows, error: languageError } = await db
    .from('activities')
    .select('id,title,subtitle,emoji,schema_target,domain,duration_minutes,materials,steps,science_note,age_min_months,age_max_months,language,is_featured,created_at')
    .eq('language', preferredLanguage)
    .lte('age_min_months', ageMonths)
    .gte('age_max_months', ageMonths)
    .order('created_at', { ascending: false });

  if (languageError) {
    return NextResponse.json({ error: languageError.message }, { status: 500 });
  }

  const typedRows = (languageRows ?? []) as ActivityRow[];
  rowsByLanguage.set(preferredLanguage, typedRows);

  const mergedRows: ActivityRow[] = [];
  const seenTitles = new Set<string>();
  for (const row of typedRows) {
    const key = canonicalTitleKey(row.title);
    if (seenTitles.has(key)) continue;
    seenTitles.add(key);
    mergedRows.push(row);
  }

  if (mergedRows.length === 0) {
    return NextResponse.json({
      featured: null,
      activities: [],
      saved: [],
      completed: [],
      stats: { total: 0, completed: 0 },
      child_schemas: topSchemas,
      language: preferredLanguage,
      shortages: {
        available_to_do: {
          required: MIN_AVAILABLE_TO_DO,
          available_uncompleted: 0,
          returned: 0,
          shortage: MIN_AVAILABLE_TO_DO,
        },
      },
      inventory: { languages_checked: prioritizedLanguages, sources_used: [] },
    });
  }

  const activityIds = mergedRows.map((r) => r.id);

  const [{ data: savesRows }, { data: completionRows }] = await Promise.all([
    db.from('activity_saves').select('activity_id,saved_at').eq('user_id', user.id).in('activity_id', activityIds),
    db.from('activity_completions').select('activity_id,completed_at,rating,note').eq('user_id', user.id).in('activity_id', activityIds),
  ]);

  const saveMap = new Map((savesRows ?? []).map((r) => [r.activity_id as string, r]));
  const completionMap = new Map((completionRows ?? []).map((r) => [r.activity_id as string, r]));

  const decorated = rankActivities(mergedRows, schemaCounts).map((row) => ({
    ...row,
    is_saved: saveMap.has(row.id),
    saved_at: (saveMap.get(row.id) as { saved_at?: string } | undefined)?.saved_at ?? null,
    is_completed: completionMap.has(row.id),
    completed_at: (completionMap.get(row.id) as { completed_at?: string } | undefined)?.completed_at ?? null,
    rating: (completionMap.get(row.id) as { rating?: number | null } | undefined)?.rating ?? null,
    note: (completionMap.get(row.id) as { note?: string | null } | undefined)?.note ?? null,
  }));

  const nonCompleted = decorated.filter((a) => !a.is_completed);
  const featured = nonCompleted.find((a) => a.is_featured) ?? nonCompleted[0] ?? decorated.find((a) => a.is_featured) ?? decorated[0] ?? null;
  const nonFeatured = decorated.filter((a) => !featured || a.id !== featured.id);
  const moreToTry = nonFeatured.filter((a) => !a.is_completed);
  const saved = decorated.filter((a) => a.is_saved && !a.is_completed);
  const completed = decorated.filter((a) => a.is_completed);

  const returnedAvailable = (featured && !featured.is_completed ? 1 : 0) + moreToTry.length;
  const availableUncompleted = nonCompleted.length;

  return NextResponse.json({
    featured,
    activities: moreToTry,
    saved,
    completed,
    stats: {
      total: decorated.length,
      completed: completed.length,
    },
    child_schemas: topSchemas,
    language: preferredLanguage,
    inventory: {
      min_available_to_do: MIN_AVAILABLE_TO_DO,
      languages_checked: prioritizedLanguages,
      sources_used: prioritizedLanguages.filter((lang) => (rowsByLanguage.get(lang)?.length ?? 0) > 0),
      by_language: prioritizedLanguages.map((lang) => ({
        language: lang,
        total: rowsByLanguage.get(lang)?.length ?? 0,
      })),
    },
    shortages: {
      available_to_do: {
        required: MIN_AVAILABLE_TO_DO,
        available_uncompleted: availableUncompleted,
        returned: returnedAvailable,
        shortage: Math.max(0, MIN_AVAILABLE_TO_DO - availableUncompleted),
      },
    },
  });
}
