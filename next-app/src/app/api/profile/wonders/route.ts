import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

type WonderRow = {
  id: string;
  title: string;
  observation_text: string;
  schemas_detected: string[] | null;
  created_at: string;
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
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!child?.id) {
    return NextResponse.json({ timeline: [], schema_stats: [] });
  }

  const { data: wonders, error } = await db
    .from('wonders')
    .select('id,title,observation_text,schemas_detected,created_at')
    .eq('child_id', child.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const wonderRows = (wonders ?? []) as WonderRow[];

  const schemaWonderMap = new Map<string, Set<string>>();
  for (const wonder of wonderRows) {
    const uniqueSchemasInWonder = new Set((wonder.schemas_detected ?? []).filter((s): s is string => typeof s === 'string' && s.length > 0));
    for (const schema of uniqueSchemasInWonder) {
      if (!schemaWonderMap.has(schema)) {
        schemaWonderMap.set(schema, new Set());
      }
      schemaWonderMap.get(schema)?.add(wonder.id);
    }
  }

  const schemaStats = Array.from(schemaWonderMap.entries())
    .map(([name, wonderIds]) => ({ name, count: wonderIds.size }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const timeline = wonderRows.map((wonder) => ({
    id: wonder.id,
    created_at: wonder.created_at,
    title: wonder.title,
    observation: wonder.observation_text,
    schemas: Array.from(new Set((wonder.schemas_detected ?? []).filter((s): s is string => typeof s === 'string' && s.length > 0))),
  }));

  return NextResponse.json({ timeline, schema_stats: schemaStats });
}
