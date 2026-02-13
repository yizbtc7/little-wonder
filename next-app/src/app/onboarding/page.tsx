import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import OnboardingForm from '@/components/OnboardingForm';

export default async function Onboarding() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const { data: profile } = await supabase.from('profiles').select('onboarded').eq('id', user.id).single();

  if (profile && profile.onboarded) {
    redirect('/');
  }

  return <OnboardingForm userId={user.id} />;
}