'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';

export default function SignIn() {
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) console.error(error);
  };

  const signInWithEmail = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) console.error(error);
    // Note: For new users, might need signUp first
  };

  return (
    <div>
      <h1>Sign In</h1>
      <button onClick={signInWithGoogle}>Sign in with Google</button>
      <h2>Or with Email</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button onClick={signInWithEmail}>Sign in</button>
    </div>
  );
}