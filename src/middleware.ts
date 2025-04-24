import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Temporarily disabled middleware for debugging
  console.log('Middleware called for path:', request.nextUrl.pathname);

  // Always allow the request to proceed
  return NextResponse.next();

  /*
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const publicPaths = [
    '/',
    '/student/login',
    '/admin/login',
  ];

  // Check if the path is public
  const isPublicPath = publicPaths.some(publicPath => path === publicPath);

  // Get cookies for authentication
  const studentCookie = request.cookies.get('student')?.value;
  const adminCookie = request.cookies.get('admin')?.value;

  // Redirect logic for student routes
  if (path.startsWith('/student') && !isPublicPath && !studentCookie) {
    return NextResponse.redirect(new URL('/student/login', request.url));
  }

  // Redirect logic for admin routes
  if (path.startsWith('/admin') && !isPublicPath && !adminCookie) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
  */
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
