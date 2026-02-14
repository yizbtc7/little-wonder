import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { resolveAccessibleChild } from '@/lib/childAccess';

const INVITE_TTL_HOURS = 24 * 14;

function dbClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

function toPublicInviteUrl(token: string): string {
  return `https://littlewonder.ai/join/${token}`;
}

function createInviteToken(): string {
  return crypto.randomUUID().replaceAll('-', '');
}

export async function POST() {
  const supabaseAuth = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = dbClient();
  const child = await resolveAccessibleChild(db, user.id);

  if (!child?.id) {
    return NextResponse.json({ error: 'No accessible child found for this user' }, { status: 400 });
  }

  const now = new Date();
  const nowIso = now.toISOString();

  const { data: existingInvite } = await db
    .from('caregiver_invites')
    .select('token,expires_at')
    .eq('child_id', child.id)
    .eq('created_by_user_id', user.id)
    .is('revoked_at', null)
    .is('claimed_at', null)
    .gt('expires_at', nowIso)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle<{ token: string; expires_at: string }>();

  if (existingInvite?.token) {
    return NextResponse.json({ token: existingInvite.token, url: toPublicInviteUrl(existingInvite.token), expires_at: existingInvite.expires_at });
  }

  const expiresAt = new Date(now.getTime() + INVITE_TTL_HOURS * 60 * 60 * 1000).toISOString();
  const token = createInviteToken();

  const { data: created, error } = await db
    .from('caregiver_invites')
    .insert({
      token,
      child_id: child.id,
      created_by_user_id: user.id,
      expires_at: expiresAt,
    })
    .select('token,expires_at')
    .single<{ token: string; expires_at: string }>();

  if (error || !created?.token) {
    return NextResponse.json({ error: error?.message ?? 'Could not create invite' }, { status: 500 });
  }

  return NextResponse.json({ token: created.token, url: toPublicInviteUrl(created.token), expires_at: created.expires_at });
}
