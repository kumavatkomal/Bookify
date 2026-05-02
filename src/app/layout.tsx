import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import AuthSessionProvider from '@/components/SessionProvider'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Bookify - Smart Appointment Booking',
  description: 'AI-powered appointment booking system with real-time availability',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={poppins.variable}>
        <AuthSessionProvider>
          {children}
          <Toaster position="top-right" />
        </AuthSessionProvider>
      </body>
    </html>
  )
}
