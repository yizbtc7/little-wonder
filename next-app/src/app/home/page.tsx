import { redirect } from 'next/navigation';
import ObserveFlow from '@/components/ObserveFlow';
import LogoutButton from '@/components/LogoutButton';
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
    <main style={{ padding: 24, maxWidth: 760, margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Hola {profile.parent_name}</h1>
        <LogoutButton />
      </div>

      <p style={{ marginTop: 0, opacity: 0.85 }}>
        {child.name} · {ageLabel}
      </p>

      <ObserveFlow childName={child.name} />
    </main>
  );
}
