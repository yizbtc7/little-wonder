import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import LogoutButton from '@/components/LogoutButton';

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const userName =
    (typeof user.user_metadata?.name === 'string' && user.user_metadata.name) ||
    user.email ||
    'usuario';

  return (
    <main style={{ padding: 24, maxWidth: 640, margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>Hola {userName}. Estás autenticado.</h1>
      <LogoutButton />
    </main>
  );
}
