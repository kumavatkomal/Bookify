// src/middleware.ts
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Admin routes - only ADMIN can access
    if (path.startsWith('/admin')) {
      if (token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    // Organiser routes - ORGANISER and ADMIN can access
    if (path.startsWith('/organiser')) {
      if (token?.role !== 'ORGANISER' && token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    // Customer routes - any authenticated user (CUSTOMER, ORGANISER, ADMIN)
    if (path.startsWith('/dashboard') || path.startsWith('/my-bookings') || path.startsWith('/booking') || path.startsWith('/confirmation')) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    // Profile routes - any authenticated user
    if (path.startsWith('/profile')) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

// Specify which routes to protect
export const config = {
  matcher: [
    '/admin/:path*',
    '/organiser/:path*',
    '/dashboard/:path*',
    '/my-bookings/:path*',
    '/booking/:path*',
    '/confirmation/:path*',
    '/profile/:path*',
  ],
}
