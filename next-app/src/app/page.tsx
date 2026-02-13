import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import SignIn from '@/components/SignIn';
import ObserveFlow from '@/components/ObserveFlow';

type HomeProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: HomeProps) {
  const supabase = await createSupabaseServerClient();
  const params = await searchParams;
  const code = typeof params.code === 'string' ? params.code : undefined;

  // Fallback: if OAuth lands on /?code=... (old callback setups), exchange it here.
  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
    redirect('/');
  }

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
