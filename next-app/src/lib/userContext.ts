import { createSupabaseServerClient } from '@/lib/supabaseServer';

export type ParentProfile = {
  user_id: string;
  parent_name: string;
  parent_role?: string | null;
};

export type ChildProfile = {
  id: string;
  user_id: string;
  name: string;
  birthdate: string;
};

export async function getAuthenticatedUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

export async function getParentProfile(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('user_id,parent_name,parent_role')
    .eq('user_id', userId)
    .maybeSingle<ParentProfile>();

  return data;
}

export async function getFirstChildProfile(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string
) {
  const { data: owned } = await supabase
    .from('children')
    .select('id,user_id,name,birthdate')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle<ChildProfile>();

  if (owned) return owned;

  const { data: caregivingLink } = await supabase
    .from('child_caregivers')
    .select('child_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle<{ child_id: string }>();

  if (!caregivingLink?.child_id) return null;

  const { data: child } = await supabase
    .from('children')
    .select('id,user_id,name,birthdate')
    .eq('id', caregivingLink.child_id)
    .maybeSingle<ChildProfile>();

  return child ?? null;
}
