// API route to handle role-based redirect after login
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', process.env.NEXTAUTH_URL || 'http://localhost:3000'))
    }

    const role = session.user.role

    // Redirect based on role
    if (role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', process.env.NEXTAUTH_URL || 'http://localhost:3000'))
    } else if (role === 'ORGANISER') {
      return NextResponse.redirect(new URL('/organiser/dashboard', process.env.NEXTAUTH_URL || 'http://localhost:3000'))
    } else {
      return NextResponse.redirect(new URL('/dashboard', process.env.NEXTAUTH_URL || 'http://localhost:3000'))
    }
  } catch (error) {
    console.error('Redirect error:', error)
    return NextResponse.redirect(new URL('/login', process.env.NEXTAUTH_URL || 'http://localhost:3000'))
  }
}
