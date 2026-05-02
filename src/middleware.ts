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

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

// Only protect admin and organiser routes in middleware
// Customer routes are protected by their layout component
export const config = {
  matcher: [
    '/admin/:path*',
    '/organiser/:path*',
  ],
}
