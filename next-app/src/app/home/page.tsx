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

  const [profile, child, userRow] = await Promise.all([
    getParentProfile(supabase, user.id),
    getFirstChildProfile(supabase, user.id),
    supabase.from('users').select('language').eq('id', user.id).maybeSingle<{ language?: 'en' | 'es' | null }>(),
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

  const initialLanguage = userRow.data?.language === 'en' ? 'en' : 'es';

  const ageInMonths = getAgeInMonths(child.birthdate);
  const ageLabel = formatAgeLabel(ageInMonths, initialLanguage);

  return (
    <ObserveFlow
      parentName={profile.parent_name}
      parentRole={profile.parent_role ?? null}
      childName={child.name}
      childAgeLabel={ageLabel}
      childBirthdate={child.birthdate}
      childId={child.id}
      initialLanguage={initialLanguage}
      initialDailyContent={(dailyContentRow?.content as Record<string, unknown> | null) ?? null}
    />
  );
}
