import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function dbClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

type InviteRow = {
  token: string;
  child_id: string;
  created_by_user_id: string;
  expires_at: string;
  claimed_by_user_id: string | null;
  claimed_at: string | null;
  revoked_at: string | null;
  children: { id: string; name: string } | { id: string; name: string }[] | null;
};

function toChild(childJoin: InviteRow['children']): { id: string; name: string } | null {
  if (!childJoin) return null;
  if (Array.isArray(childJoin)) return childJoin[0] ?? null;
  return childJoin;
}

export async function GET(_: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const db = dbClient();

  const { data: invite } = await db
    .from('caregiver_invites')
    .select('token,child_id,created_by_user_id,expires_at,claimed_by_user_id,claimed_at,revoked_at,children(id,name)')
    .eq('token', token)
    .maybeSingle<InviteRow>();

  if (!invite) return NextResponse.json({ valid: false, reason: 'not_found' }, { status: 404 });

  const now = Date.now();
  const isExpired = new Date(invite.expires_at).getTime() <= now;
  const isRevoked = Boolean(invite.revoked_at);
  const isClaimed = Boolean(invite.claimed_at);
  const child = toChild(invite.children);

  return NextResponse.json({
    valid: !isExpired && !isRevoked,
    expired: isExpired,
    revoked: isRevoked,
    claimed: isClaimed,
    child: child ? { id: child.id, name: child.name } : null,
    expires_at: invite.expires_at,
  });
}
