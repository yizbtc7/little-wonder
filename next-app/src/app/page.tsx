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
        background: `linear-gradient(180deg, ${theme.colors.blush} 0%, ${theme.colors.cream} 40%, ${theme.colors.warmWhite} 100%)`,
        padding: '40px 28px',
      }}
    >
      <FadeIn delay={100}>
        <div style={{ fontSize: 56, marginBottom: 4 }}>✨</div>
      </FadeIn>
      <FadeIn delay={250}>
        <h1 style={{ color: theme.colors.charcoal, fontSize: 38, marginBottom: 8, letterSpacing: -0.5, lineHeight: 1.1 }}>Little Wonder</h1>
      </FadeIn>
      <FadeIn delay={400}>
        <p style={{ color: theme.colors.midText, fontFamily: theme.fonts.sans, fontSize: 16, maxWidth: 280, lineHeight: 1.6, marginBottom: 48 }}>
          Descubre la ciencia extraordinaria dentro de los momentos cotidianos de tu hijo.
        </p>
      </FadeIn>
      <FadeIn delay={550}>
        <SignInButton />
      </FadeIn>
    </main>
  );
}
