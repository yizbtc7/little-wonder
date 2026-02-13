import { redirect } from 'next/navigation';
import OnboardingForm from '@/components/OnboardingForm';
import { getAuthenticatedUser, getFirstChildProfile, getParentProfile } from '@/lib/userContext';

export default async function OnboardingPage() {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    redirect('/');
  }

  const [profile, child] = await Promise.all([
    getParentProfile(supabase, user.id),
    getFirstChildProfile(supabase, user.id),
  ]);

  if (profile && child) {
    redirect('/home');
  }

  return <OnboardingForm userId={user.id} />;
}
