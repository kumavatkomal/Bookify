// src/lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import * as bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'

export const authOptions: NextAuthOptions = {
  // Note: PrismaAdapter removed — not compatible with CredentialsProvider + JWT strategy
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required')
        }

        try {
          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user) {
            throw new Error('Invalid email or password')
          }

          // Check if user is verified
          if (!user.isVerified) {
            throw new Error('Please verify your email first')
          }

          // Check if user is active
          if (!user.isActive) {
            throw new Error('Your account has been deactivated')
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            throw new Error('Invalid email or password')
          }

          // Return user object (will be stored in JWT)
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          }
        } catch (error: any) {
          console.error('Auth error:', error)
          // If it's a Prisma error, throw a generic message
          if (error.code || error.message?.includes('prisma')) {
            throw new Error('Database connection error. Please try again.')
          }
          throw error
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Attach user info to JWT on login
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      // Expose user info to client session
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}
