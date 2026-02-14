import type { SupabaseClient } from '@supabase/supabase-js';

export type AccessibleChild = {
  id: string;
  user_id: string;
  name?: string | null;
  birthdate?: string | null;
};

async function getChildById(db: SupabaseClient, childId: string): Promise<AccessibleChild | null> {
  const { data } = await db.from('children').select('id,user_id,name,birthdate').eq('id', childId).maybeSingle<AccessibleChild>();
  return data ?? null;
}

export async function userCanAccessChild(db: SupabaseClient, userId: string, childId: string): Promise<boolean> {
  const child = await getChildById(db, childId);
  if (!child) return false;
  if (child.user_id === userId) return true;

  const { data: caregiverLink } = await db
    .from('child_caregivers')
    .select('child_id')
    .eq('child_id', childId)
    .eq('user_id', userId)
    .maybeSingle();

  return Boolean(caregiverLink?.child_id);
}

export async function resolveAccessibleChild(
  db: SupabaseClient,
  userId: string,
  requestedChildId?: string | null
): Promise<AccessibleChild | null> {
  if (requestedChildId) {
    const child = await getChildById(db, requestedChildId);
    if (!child) return null;
    if (child.user_id === userId) return child;

    const canAccess = await userCanAccessChild(db, userId, requestedChildId);
    return canAccess ? child : null;
  }

  const { data: ownedChild } = await db
    .from('children')
    .select('id,user_id,name,birthdate')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle<AccessibleChild>();

  if (ownedChild) return ownedChild;

  const { data: caregiverLink } = await db
    .from('child_caregivers')
    .select('child_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle<{ child_id: string }>();

  if (!caregiverLink?.child_id) return null;

  return getChildById(db, caregiverLink.child_id);
}

export async function resolveOwnedChild(db: SupabaseClient, userId: string): Promise<AccessibleChild | null> {
  const { data } = await db
    .from('children')
    .select('id,user_id,name,birthdate')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle<AccessibleChild>();

  return data ?? null;
}
