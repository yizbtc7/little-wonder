import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export async function GET(request: Request) {
  const reqUrl = new URL(request.url);
  const code = reqUrl.searchParams.get('code');
  const redirectTo = reqUrl.origin;

  if (!code) return NextResponse.redirect(`${redirectTo}/`);

  const supabase = await createSupabaseServerClient();
  await supabase.auth.exchangeCodeForSession(code);

  return NextResponse.redirect(`${redirectTo}/`);
}
