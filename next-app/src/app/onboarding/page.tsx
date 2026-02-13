import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import OnboardingForm from '@/components/OnboardingForm';

export default async function Onboarding() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/');

  const { data: child } = await supabase
    .from('children')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (child) redirect('/');

  return <OnboardingForm userId={user.id} userEmail={user.email ?? ''} />;
}
