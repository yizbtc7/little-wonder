import { redirect } from 'next/navigation';
import SignInButton from '@/components/SignInButton';
import SparkLogo from '@/components/SparkLogo';
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
        background: 'linear-gradient(180deg, #FAF5EF 0%, #FFFFFF 100%)',
        padding: '40px 28px',
      }}
    >
      <div className="lw-auth-enter" style={{ animationDelay: '0ms' }}>
        <SparkLogo size={128} />
      </div>

      <h1
        className="lw-auth-enter"
        style={{
          animationDelay: '700ms',
          color: '#1E2340',
          fontSize: 36,
          lineHeight: 1.05,
          whiteSpace: 'nowrap',
          fontFamily: 'var(--font-display), Georgia, serif',
          fontWeight: 400,
          marginTop: 8,
        }}
      >
        Little Wonder
      </h1>

      <p
        className="lw-auth-fade"
        style={{
          animationDelay: '900ms',
          color: '#B5AFA5',
          letterSpacing: 4,
          fontSize: 11,
          fontWeight: 500,
          fontFamily: 'var(--font-body), sans-serif',
          marginTop: 8,
        }}
      >
        CURIOSITY COMPANION
      </p>

      <div className="lw-auth-enter" style={{ animationDelay: '1200ms', marginTop: 44, width: '100%', maxWidth: 280 }}>
        <SignInButton />
      </div>

      <p
        className="lw-auth-fade"
        style={{
          animationDelay: '1320ms',
          marginTop: 14,
          color: '#B5AFA5',
          fontFamily: 'var(--font-body), sans-serif',
          fontWeight: 300,
          fontSize: 13,
          lineHeight: 1.3,
        }}
      >
        Takes less than
        <br />
        2 min to set up
      </p>
    </main>
  );
}
