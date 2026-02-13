import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import SignIn from '@/components/SignIn';
import ObserveFlow from '@/components/ObserveFlow';

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <SignIn />;

  const { data: child } = await supabase
    .from('children')
    .select('id,name,birthdate')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!child) redirect('/onboarding');

  return <ObserveFlow userId={user.id} childId={child.id} childName={child.name} />;
}
