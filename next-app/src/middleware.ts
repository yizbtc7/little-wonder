import { NextResponse, type NextRequest } from 'next/server';

const CANONICAL_HOST = 'www.littlewonder.ai';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';

  if (!host || host === CANONICAL_HOST || host.startsWith('localhost') || host.startsWith('127.0.0.1')) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.protocol = 'https:';
  url.host = CANONICAL_HOST;

  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|api).*)'],
};
