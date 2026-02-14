import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

type InviteRow = {
  token: string;
  child_id: string;
  created_by_user_id: string;
  expires_at: string;
  claimed_by_user_id: string | null;
  claimed_at: string | null;
  revoked_at: string | null;
};

function dbClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function POST(_: Request, context: { params: Promise<{ token: string }> }) {
  const supabaseAuth = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { token } = await context.params;
  const db = dbClient();

  const { data: invite } = await db
    .from('caregiver_invites')
    .select('token,child_id,created_by_user_id,expires_at,claimed_by_user_id,claimed_at,revoked_at')
    .eq('token', token)
    .maybeSingle<InviteRow>();

  if (!invite) return NextResponse.json({ error: 'Invite not found' }, { status: 404 });

  const nowIso = new Date().toISOString();
  if (invite.revoked_at) return NextResponse.json({ error: 'Invite revoked' }, { status: 410 });
  if (new Date(invite.expires_at).getTime() <= Date.now()) return NextResponse.json({ error: 'Invite expired' }, { status: 410 });

  if (invite.claimed_by_user_id && invite.claimed_by_user_id !== user.id) {
    return NextResponse.json({ error: 'Invite already claimed' }, { status: 409 });
  }

  if (invite.created_by_user_id !== user.id) {
    await db
      .from('child_caregivers')
      .upsert({ child_id: invite.child_id, user_id: user.id, role: 'caregiver' }, { onConflict: 'child_id,user_id', ignoreDuplicates: true });
  }

  if (!invite.claimed_by_user_id) {
    await db
      .from('caregiver_invites')
      .update({ claimed_by_user_id: user.id, claimed_at: nowIso })
      .eq('token', token)
      .is('claimed_by_user_id', null);
  }

  return NextResponse.json({ ok: true, child_id: invite.child_id });
}
