import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-2xl px-4">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Welcome to Buddify
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          AI-powered appointment booking system with real-time availability
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login" className="btn-primary">
            Login
          </Link>
          <Link href="/signup" className="btn-secondary">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}
