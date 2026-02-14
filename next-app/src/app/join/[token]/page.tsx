'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';

type InviteStatus = {
  valid: boolean;
  expired?: boolean;
  revoked?: boolean;
  claimed?: boolean;
  child?: { id: string; name: string } | null;
};

export default function JoinInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [invite, setInvite] = useState<InviteStatus | null>(null);
  const [error, setError] = useState('');
  const [isAuthed, setIsAuthed] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const isSpanish = useMemo(() => {
    if (typeof window === 'undefined') return true;
    return window.navigator.language.toLowerCase().startsWith('es');
  }, []);

  useEffect(() => {
    void params.then((p) => setToken(p.token));
  }, [params]);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setIsAuthed(Boolean(data.user));
      setAuthLoading(false);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(Boolean(session?.user));
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  useEffect(() => {
    if (!token) return;
    let mounted = true;
    setLoading(true);

    void fetch(`/api/invites/${token}`)
      .then(async (res) => {
        const payload = (await res.json()) as InviteStatus;
        if (!mounted) return;
        setInvite(payload);
      })
      .catch(() => {
        if (!mounted) return;
        setInvite({ valid: false });
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [token]);

  const handleSignIn = async () => {
    const origin = window.location.origin;
    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(`/join/${token}`)}`;
    const { error: signInError } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
    if (signInError) setError(signInError.message);
  };

  const claimInvite = async () => {
    setClaiming(true);
    setError('');
    try {
      const response = await fetch(`/api/invites/${token}/claim`, { method: 'POST' });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error ?? 'claim_failed');
      }
      router.replace('/home');
    } catch (claimError) {
      setError(claimError instanceof Error ? claimError.message : 'Could not accept invite');
    } finally {
      setClaiming(false);
    }
  };

  if (loading || authLoading) {
    return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', fontFamily: 'sans-serif' }}>{isSpanish ? 'Cargando invitación…' : 'Loading invite…'}</main>;
  }

  if (!invite?.valid) {
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', fontFamily: 'sans-serif', padding: 24, textAlign: 'center' }}>
        <div>
          <h1>{isSpanish ? 'Esta invitación no está disponible' : 'This invite is not available'}</h1>
          <p>{invite?.expired ? (isSpanish ? 'La invitación expiró.' : 'The invite has expired.') : invite?.revoked ? (isSpanish ? 'La invitación fue revocada.' : 'The invite was revoked.') : isSpanish ? 'El enlace no es válido.' : 'The link is not valid.'}</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', fontFamily: 'sans-serif', padding: 24 }}>
      <div style={{ maxWidth: 480, width: '100%', border: '1px solid #eee', borderRadius: 14, padding: 20 }}>
        <h1 style={{ marginTop: 0 }}>{isSpanish ? 'Invitación de cuidador' : 'Caregiver invite'}</h1>
        <p>
          {isSpanish ? 'Te invitaron a colaborar en el perfil de' : 'You were invited to collaborate on'}{' '}
          <strong>{invite.child?.name ?? (isSpanish ? 'este niño' : 'this child')}</strong>.
        </p>

        {!isAuthed ? (
          <button onClick={() => void handleSignIn()} style={{ width: '100%', border: 'none', borderRadius: 10, padding: '12px 16px', background: '#222', color: '#fff', fontWeight: 700 }}>
            {isSpanish ? 'Iniciar sesión con Google' : 'Sign in with Google'}
          </button>
        ) : (
          <button disabled={claiming} onClick={() => void claimInvite()} style={{ width: '100%', border: 'none', borderRadius: 10, padding: '12px 16px', background: '#0F766E', color: '#fff', fontWeight: 700, opacity: claiming ? 0.7 : 1 }}>
            {claiming ? (isSpanish ? 'Aceptando…' : 'Accepting…') : isSpanish ? 'Aceptar invitación' : 'Accept invite'}
          </button>
        )}

        {error ? <p style={{ color: 'crimson', marginTop: 10 }}>{error}</p> : null}
      </div>
    </main>
  );
}
