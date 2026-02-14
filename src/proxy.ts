import { auth } from "@/auth";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
    const session = await auth();
    const { pathname } = request.nextUrl;

    // Protected routes that require authentication
    const protectedRoutes = ['/dashboard', '/admin'];
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    // Admin-only routes
    const adminRoutes = ['/admin'];
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

    // Redirect to login if accessing protected route without authentication
    if (isProtectedRoute && !session) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect to dashboard if non-admin tries to access admin routes
    if (isAdminRoute && session?.user?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Redirect authenticated users away from auth pages
    const authPages = ['/login', '/register'];
    const isAuthPage = authPages.some(page => pathname.startsWith(page));

    if (isAuthPage && session) {
        // Redirect based on role
        const redirectUrl = session.user?.role === 'ADMIN' ? '/admin' : '/dashboard';
        return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/admin/:path*',
        '/login',
        '/register',
    ],
};