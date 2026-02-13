'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import { theme } from '@/styles/theme';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://little-wonder-tdf2.vercel.app';

export default function SignIn() {
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  const signInWithGoogle = async () => {
    setStatus('Redirecting to Google…');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${APP_URL}/auth/callback`,
      },
    });
    if (error) setStatus(error.message);
  };

  const signInWithEmail = async () => {
    setStatus('Signing in…');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      window.location.href = '/';
      return;
    }

    const signup = await supabase.auth.signUp({ email, password });
    if (signup.error) setStatus(signup.error.message);
    else setStatus('Check your email (if confirmation is enabled) or try sign in again.');
  };

  return (
    <main style={{ padding: 24, maxWidth: 520, margin: '0 auto', fontFamily: theme.fonts.sans }}>
      <h1>Little Wonder</h1>
      <p>Sign in to continue.</p>

      <button onClick={signInWithGoogle} style={{ padding: '12px 16px', marginBottom: 16 }}>
        Continue with Google
      </button>

      <h3>Or with Email</h3>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        style={{ display: 'block', padding: 10, marginBottom: 8, width: '100%' }}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        style={{ display: 'block', padding: 10, marginBottom: 8, width: '100%' }}
      />
      <button onClick={signInWithEmail} style={{ padding: '10px 14px' }}>
        Sign in / Sign up
      </button>

      {status ? <p style={{ marginTop: 12 }}>{status}</p> : null}
    </main>
  );
}
