import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = ['/skyview', '/login', '/register'];

// Routes that should redirect to home if already authenticated
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if user is authenticated by looking for the auth_user cookie/localStorage indicator
  // Since we can't access localStorage from middleware, we'll check a cookie
  const authCookie = request.cookies.get('auth_user');
  const isAuthenticated = !!authCookie;

  // Check if current route is an auth route (login/register)
  const isAuthRoute = authRoutes.some(route => pathname === route);

  // Check if current route is public
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/api/'));

  // If user is authenticated and trying to access login/register, redirect to home
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is not authenticated and trying to access a protected route, redirect to skyview
  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL('/skyview', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
