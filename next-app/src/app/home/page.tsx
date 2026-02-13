import { redirect } from 'next/navigation';
import ObserveFlow from '@/components/ObserveFlow';
import { formatAgeLabel, getAgeInMonths } from '@/lib/childAge';
import { getAuthenticatedUser, getFirstChildProfile, getParentProfile } from '@/lib/userContext';

type DailyContentRow = {
  content: unknown;
};

function getBogotaToday(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

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

  const today = getBogotaToday();
  const { data: dailyContentRow } = await supabase
    .from('daily_content')
    .select('content')
    .eq('child_id', child.id)
    .eq('date', today)
    .maybeSingle<DailyContentRow>();

  const ageInMonths = getAgeInMonths(child.birthdate);
  const ageLabel = formatAgeLabel(ageInMonths);

  return (
    <ObserveFlow
      parentName={profile.parent_name}
      childName={child.name}
      childAgeLabel={ageLabel}
      childBirthdate={child.birthdate}
      initialDailyContent={(dailyContentRow?.content as Record<string, unknown> | null) ?? null}
    />
  );
}
