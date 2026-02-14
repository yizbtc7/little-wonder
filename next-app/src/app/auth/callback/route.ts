import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const nextPath = requestUrl.searchParams.get('next');

  if (!code) {
    return NextResponse.redirect(new URL('/?error=missing_oauth_code', requestUrl.origin));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL('/?error=oauth_exchange_failed', requestUrl.origin));
  }

  const safePath = nextPath && nextPath.startsWith('/') ? nextPath : '/home';
  return NextResponse.redirect(new URL(safePath, requestUrl.origin));
}
