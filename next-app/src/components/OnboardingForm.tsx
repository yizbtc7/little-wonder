'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';

export default function OnboardingForm({ userId }: { userId: string }) {
  const [name, setName] = useState('');
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const submit = async () => {
    const { error } = await supabase.from('profiles').upsert({ id: userId, name, onboarded: true });
    if (error) {
      console.error(error);
    } else {
      router.push('/');
    }
  };

  return (
    <div>
      <h1>Onboarding</h1>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
      />
      <button onClick={submit}>Submit</button>
    </div>
  );
}