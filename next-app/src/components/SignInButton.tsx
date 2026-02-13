'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';

export default function SignInButton() {
  const supabase = createSupabaseBrowserClient();
  const [error, setError] = useState<string>('');

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.length > 0
      ? process.env.NEXT_PUBLIC_APP_URL
      : window.location.origin;

  const handleGoogleSignIn = async () => {
    setError('');

    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${appUrl}/auth/callback`,
      },
    });

    if (signInError) {
      setError(signInError.message);
    }
  };

  return (
    <div>
      <button onClick={handleGoogleSignIn} style={{ padding: '10px 14px' }}>
        Sign in with Google
      </button>
      {error ? <p style={{ color: 'crimson', marginTop: 12 }}>{error}</p> : null}
    </div>
  );
}
