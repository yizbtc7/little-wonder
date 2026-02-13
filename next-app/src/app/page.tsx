import { redirect } from 'next/navigation';
import SignInButton from '@/components/SignInButton';
import FadeIn from '@/components/ui/FadeIn';
import { theme } from '@/styles/theme';
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
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        background: `linear-gradient(180deg, ${theme.colors.cream} 0%, ${theme.colors.white} 100%)`,
        padding: '40px 24px',
      }}
    >
      <FadeIn delay={100}>
        <div style={{ fontSize: 64, marginBottom: 10 }}>✨</div>
      </FadeIn>
      <FadeIn delay={250}>
        <h1 style={{ color: theme.colors.dark, fontSize: 56, marginBottom: 10 }}>Little Wonder</h1>
      </FadeIn>
      <FadeIn delay={400}>
        <p style={{ color: theme.colors.gray, fontSize: 22, maxWidth: 540, lineHeight: 1.4, marginBottom: 28 }}>
          See the extraordinary things your child is already doing.
        </p>
      </FadeIn>
      <FadeIn delay={550}>
        <SignInButton />
      </FadeIn>
    </main>
  );
}
