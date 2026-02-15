import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const host = nextUrl.hostname;

  // Keep one canonical origin so PWA/localStorage/session state is stable on iOS home-screen launches.
  if (host === 'www.littlewonder.ai') {
    const redirectUrl = new URL(nextUrl.pathname + nextUrl.search, 'https://littlewonder.ai');
    return NextResponse.redirect(redirectUrl, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|api).*)'],
};
