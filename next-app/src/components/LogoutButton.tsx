'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';

export default function LogoutButton() {
  const supabase = createSupabaseBrowserClient();
  const [error, setError] = useState<string>('');

  const handleLogout = async () => {
    setError('');
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError(signOutError.message);
      return;
    }
    window.location.href = '/';
  };

  return (
    <div>
      <button onClick={handleLogout} style={{ padding: '10px 14px' }}>
        Logout
      </button>
      {error ? <p style={{ color: 'crimson', marginTop: 12 }}>{error}</p> : null}
    </div>
  );
}
