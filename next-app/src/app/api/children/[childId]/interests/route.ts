import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

type Body = {
  interests?: string[];
  interest?: string;
};

function dbClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

function normalizeInterest(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function dedupeInterests(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of values) {
    const normalized = normalizeInterest(raw);
    if (!normalized) continue;
    const key = normalized.toLocaleLowerCase('es-ES');
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(normalized);
    if (result.length >= 20) break;
  }

  return result;
}

async function getAuthorizedChildId(childId: string, userId: string): Promise<string | null> {
  const db = dbClient();
  const { data: child } = await db.from('children').select('id').eq('id', childId).eq('user_id', userId).maybeSingle();
  return child?.id ?? null;
}

async function readChildInterests(childId: string): Promise<string[]> {
  const db = dbClient();
  const { data } = await db.from('child_interests').select('interest').eq('child_id', childId).order('interest', { ascending: true });
  return (data ?? []).map((row) => row.interest).filter((v): v is string => typeof v === 'string' && v.trim().length > 0);
}

async function syncChildrenInterests(childId: string, userId: string, interests: string[]) {
  const db = dbClient();
  await db.from('children').update({ interests }).eq('id', childId).eq('user_id', userId);
}

async function getAuthenticatedUser() {
  const supabaseAuth = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  return user;
}

export async function GET(_: Request, context: { params: Promise<{ childId: string }> }) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { childId } = await context.params;
  const authorizedChildId = await getAuthorizedChildId(childId, user.id);
  if (!authorizedChildId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const interests = dedupeInterests(await readChildInterests(authorizedChildId));
  return NextResponse.json({ interests });
}

export async function POST(request: Request, context: { params: Promise<{ childId: string }> }) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { childId } = await context.params;
  const authorizedChildId = await getAuthorizedChildId(childId, user.id);
  if (!authorizedChildId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = (await request.json().catch(() => ({}))) as Body;

  // backward compatibility: if a full list comes in POST, treat as replace
  if (Array.isArray(body.interests)) {
    const interests = dedupeInterests(body.interests);
    const db = dbClient();
    const { error: deleteError } = await db.from('child_interests').delete().eq('child_id', authorizedChildId);
    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

    if (interests.length > 0) {
      const { error: insertError } = await db.from('child_interests').insert(interests.map((interest) => ({ child_id: authorizedChildId, interest })));
      if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    await syncChildrenInterests(authorizedChildId, user.id, interests);
    return NextResponse.json({ interests, added: false });
  }

  const candidate = typeof body.interest === 'string' ? normalizeInterest(body.interest) : '';
  if (!candidate) return NextResponse.json({ error: 'Interest is required' }, { status: 400 });

  const current = await readChildInterests(authorizedChildId);
  const normalizedCurrent = dedupeInterests(current);
  const exists = normalizedCurrent.some((value) => value.toLocaleLowerCase('es-ES') === candidate.toLocaleLowerCase('es-ES'));

  const nextInterests = exists ? normalizedCurrent : dedupeInterests([...normalizedCurrent, candidate]);

  if (!exists && nextInterests.length > normalizedCurrent.length) {
    const db = dbClient();
    const { error: insertError } = await db.from('child_interests').insert({ child_id: authorizedChildId, interest: candidate });
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await syncChildrenInterests(authorizedChildId, user.id, nextInterests);

  return NextResponse.json({ interests: nextInterests, added: !exists });
}

// Replace full interests list (backward compatible with existing clients)
export async function PUT(request: Request, context: { params: Promise<{ childId: string }> }) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { childId } = await context.params;
  const authorizedChildId = await getAuthorizedChildId(childId, user.id);
  if (!authorizedChildId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = (await request.json().catch(() => ({}))) as Body;
  const interests = dedupeInterests(body.interests ?? []);

  const db = dbClient();
  const { error: deleteError } = await db.from('child_interests').delete().eq('child_id', authorizedChildId);
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

  if (interests.length > 0) {
    const { error: insertError } = await db.from('child_interests').insert(interests.map((interest) => ({ child_id: authorizedChildId, interest })));
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await syncChildrenInterests(authorizedChildId, user.id, interests);

  return NextResponse.json({ interests });
}
