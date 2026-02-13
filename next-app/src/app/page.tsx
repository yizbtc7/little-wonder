import { redirect } from 'next/navigation';
import SignInButton from '@/components/SignInButton';
import { getAuthenticatedUser, getFirstChildProfile, getParentProfile } from '@/lib/userContext';

export default async function HomePage() {
  const { supabase, user } = await getAuthenticatedUser();

  if (user) {
    const [profile, child] = await Promise.all([
      getParentProfile(supabase, user.id),
      getFirstChildProfile(supabase, user.id),
    ]);

    if (!profile || !child) {
      redirect('/onboarding');
    }

    redirect('/home');
  }

  return (
    <main style={{ padding: 24, maxWidth: 640, margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>Little Wonder</h1>
      <p>Inicia sesión para continuar.</p>
      <SignInButton />
    </main>
  );
}
