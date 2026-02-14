import { NextResponse, type NextRequest } from 'next/server';

export function middleware(_request: NextRequest) {
  // Temporarily disable host canonical redirects to prevent redirect loops
  // between apex/www domain-level rules and app-level middleware.
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|api).*)'],
};
