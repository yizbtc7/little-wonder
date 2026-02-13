import { redirect } from 'next/navigation';
import ObserveFlow from '@/components/ObserveFlow';
import { formatAgeLabel, getAgeInMonths } from '@/lib/childAge';
import { getAuthenticatedUser, getFirstChildProfile, getParentProfile } from '@/lib/userContext';

export default async function HomePage() {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    redirect('/');
  }

  const [profile, child] = await Promise.all([
    getParentProfile(supabase, user.id),
    getFirstChildProfile(supabase, user.id),
  ]);

  if (!profile || !child || !child.birthdate) {
    redirect('/onboarding');
  }

  const ageInMonths = getAgeInMonths(child.birthdate);
  const ageLabel = formatAgeLabel(ageInMonths);

  return (
    <ObserveFlow
      parentName={profile.parent_name}
      childName={child.name}
      childAgeLabel={ageLabel}
      childBirthdate={child.birthdate}
    />
  );
}
