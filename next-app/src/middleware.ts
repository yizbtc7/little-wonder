import { NextRequest, NextResponse } from 'next/server';

const canonicalHost = 'little-wonder-tdf2.vercel.app';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';

  // Force all old preview/custom aliases to the canonical host to avoid OAuth returning to stale URLs.
  if (host !== canonicalHost) {
    const url = request.nextUrl.clone();
    url.host = canonicalHost;
    url.protocol = 'https';
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
