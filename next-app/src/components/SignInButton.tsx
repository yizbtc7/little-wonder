'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import Button from '@/components/ui/Button';

export default function SignInButton() {
  const supabase = createSupabaseBrowserClient();
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setError('');

    const origin = window.location.origin;

    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });

    if (signInError) {
      setError(signInError.message);
    }
  };

  return (
    <div>
      <Button onClick={handleGoogleSignIn} size="lg" style={{ width: '100%', maxWidth: 280 }}>
        Sign in with Google
      </Button>
      {error ? <p style={{ color: '#E8725A', marginTop: 12 }}>{error}</p> : null}
    </div>
  );
}
