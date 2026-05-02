'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { LogOut } from 'lucide-react'
import Brand from '@/components/Brand'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Brand href="/admin/dashboard" />
              <nav className="hidden md:flex gap-6">
                <Link
                  href="/admin/dashboard"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/users"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Users
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/admin/profile"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                {session.user?.name}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
