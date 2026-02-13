'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';

export default function OnboardingForm({ userId, userEmail }: { userId: string; userEmail: string }) {
  const [parentName, setParentName] = useState('');
  const [childName, setChildName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [status, setStatus] = useState('');
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const submit = async () => {
    if (!parentName || !childName || !birthdate) {
      setStatus('Please complete all fields.');
      return;
    }

    setStatus('Saving…');

    const userUpsert = await supabase.from('users').upsert({ id: userId, name: parentName });
    if (userUpsert.error) {
      setStatus(`Could not save parent profile: ${userUpsert.error.message}`);
      return;
    }

    const childInsert = await supabase.from('children').insert({
      user_id: userId,
      name: childName,
      birthdate,
    });

    if (childInsert.error) {
      setStatus(`Could not save child profile: ${childInsert.error.message}`);
      return;
    }

    router.push('/');
  };

  return (
    <main style={{ padding: 24, maxWidth: 560, margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>Onboarding</h1>
      <p>Let’s set up your account in under a minute.</p>
      <p style={{ opacity: 0.7 }}>Signed in as: {userEmail}</p>

      <label>Parent name</label>
      <input value={parentName} onChange={(e) => setParentName(e.target.value)} style={{ display: 'block', width: '100%', padding: 10, marginBottom: 12 }} />

      <label>Child name</label>
      <input value={childName} onChange={(e) => setChildName(e.target.value)} style={{ display: 'block', width: '100%', padding: 10, marginBottom: 12 }} />

      <label>Child birthdate</label>
      <input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} style={{ display: 'block', width: '100%', padding: 10, marginBottom: 14 }} />

      <button onClick={submit} style={{ padding: '10px 14px' }}>
        Continue
      </button>
      {status ? <p style={{ marginTop: 12 }}>{status}</p> : null}
    </main>
  );
}
