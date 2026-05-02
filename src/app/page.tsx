export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to AppointEase
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          AI-powered appointment booking system
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/login" className="btn-primary">
            Login
          </a>
          <a href="/signup" className="btn-secondary">
            Sign Up
          </a>
        </div>
      </div>
    </div>
  )
}
