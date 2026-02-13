'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';

type OnboardingFormProps = {
  userId: string;
  userEmail: string;
};

export default function OnboardingForm({ userId, userEmail }: OnboardingFormProps) {
  const [parentName, setParentName] = useState('');
  const [childName, setChildName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const submit = async () => {
    if (!parentName.trim() || !childName.trim() || !birthdate) {
      setStatus('Por favor completa todos los campos.');
      return;
    }

    setIsSaving(true);
    setStatus('Guardando...');

    const profileResult = await supabase.from('profiles').upsert({
      user_id: userId,
      parent_name: parentName.trim(),
    });

    if (profileResult.error) {
      setStatus(`No pudimos guardar tu perfil: ${profileResult.error.message}`);
      setIsSaving(false);
      return;
    }

    const childResult = await supabase.from('children').insert({
      user_id: userId,
      name: childName.trim(),
      birthdate,
    });

    if (childResult.error) {
      setStatus(`No pudimos guardar el perfil de tu hijo/a: ${childResult.error.message}`);
      setIsSaving(false);
      return;
    }

    setStatus('Listo. Redirigiendo...');
    router.push('/home');
    router.refresh();
  };

  return (
    <main style={{ padding: 24, maxWidth: 560, margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>Onboarding</h1>
      <p>Configurémoslo en menos de un minuto.</p>
      <p style={{ opacity: 0.7 }}>Sesión: {userEmail}</p>

      <label htmlFor="parent-name">Nombre del padre/madre</label>
      <input
        id="parent-name"
        value={parentName}
        onChange={(event) => setParentName(event.target.value)}
        style={{ display: 'block', width: '100%', padding: 10, marginBottom: 12 }}
      />

      <label htmlFor="child-name">Nombre del hijo/a</label>
      <input
        id="child-name"
        value={childName}
        onChange={(event) => setChildName(event.target.value)}
        style={{ display: 'block', width: '100%', padding: 10, marginBottom: 12 }}
      />

      <label htmlFor="child-birthdate">Fecha de nacimiento</label>
      <input
        id="child-birthdate"
        type="date"
        value={birthdate}
        onChange={(event) => setBirthdate(event.target.value)}
        style={{ display: 'block', width: '100%', padding: 10, marginBottom: 14 }}
      />

      <button disabled={isSaving} onClick={submit} style={{ padding: '10px 14px' }}>
        Continuar
      </button>
      {status ? <p style={{ marginTop: 12 }}>{status}</p> : null}
    </main>
  );
}
