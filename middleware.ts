import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'academic_session';

// Helper decode payload token di Edge Runtime
function parseJwtPayload(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const jsonStr = atob(base64);
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /home routes
  if (pathname.startsWith('/home')) {
    const sessionCookie = request.cookies.get(COOKIE_NAME);

    if (!sessionCookie?.value) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = parseJwtPayload(sessionCookie.value);
    // Tolak jika token expired atau bukan role admin
    if (!payload || payload.exp < Date.now() || payload.role !== 'admin') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If already logged in as admin and visits /login, redirect to /home
  if (pathname === '/login') {
    const sessionCookie = request.cookies.get(COOKIE_NAME);
    if (sessionCookie?.value) {
      const payload = parseJwtPayload(sessionCookie.value);
      if (payload && payload.exp > Date.now() && payload.role === 'admin') {
        return NextResponse.redirect(new URL('/home', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/home/:path*', '/home', '/login'],
};
