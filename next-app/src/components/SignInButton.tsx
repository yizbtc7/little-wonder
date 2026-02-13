'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';

export default function SignInButton() {
  const supabase = createSupabaseBrowserClient();
  const [error, setError] = useState<string>('');

  const handleGoogleSignIn = async () => {
    setError('');

    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
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
