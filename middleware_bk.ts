
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(request: NextRequest) {
    // Your additional middleware logic here if needed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // True if user is authenticated
    },
    pages: {
      signIn: '/login', // Custom sign-in page
      error: '/error', // Error page for auth errors
    }
  }
);

export const config = {
  matcher: [
    '/',
    '/profile/:path*',
    '/dashboard/:path*',
    '/settings/:path*',
    '/projects/:path*',
    '/tasks/:path*',
    '/notifications/:path*',
    '/messages/:path*',
    '/teams/:path*',
    '/analytics/:path*',
    '/reports/:path*',
  ]
};