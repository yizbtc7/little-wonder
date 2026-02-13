import { redirect } from 'next/navigation';
import ObserveFlow from '@/components/ObserveFlow';
import { formatAgeLabel, getAgeInMonths } from '@/lib/childAge';
import { getAuthenticatedUser, getFirstChildProfile, getParentProfile } from '@/lib/userContext';

type InsightCard = {
  id: string;
  content: string;
  created_at: string;
  schema_detected: string | null;
  domain: string | null;
  json_response: Record<string, unknown> | null;
};

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

  const { data: insightRows } = await supabase
    .from('insights')
    .select('id,content,created_at,schema_detected,domain,json_response,observation:observations!inner(child_id,user_id)')
    .eq('observation.child_id', child.id)
    .eq('observation.user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(4);

  const insights: InsightCard[] = (insightRows ?? []).map((row) => ({
    id: row.id as string,
    content: row.content as string,
    created_at: row.created_at as string,
    schema_detected: (row.schema_detected as string | null) ?? null,
    domain: (row.domain as string | null) ?? null,
    json_response: (row.json_response as Record<string, unknown> | null) ?? null,
  }));

  const ageInMonths = getAgeInMonths(child.birthdate);
  const ageLabel = formatAgeLabel(ageInMonths);

  return (
    <ObserveFlow
      parentName={profile.parent_name}
      childName={child.name}
      childAgeLabel={ageLabel}
      childBirthdate={child.birthdate}
      insights={insights}
    />
  );
}
