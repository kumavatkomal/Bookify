'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import toast from 'react-hot-toast'

export default function VerifyOTPPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!email) {
      router.push('/signup')
    }
  }, [email, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (otp.length !== 6) {
      setError('OTP must be 6 digits')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed')
      }

      toast.success('Email verified successfully!')
      router.push('/login')
    } catch (error: any) {
      setError(error.message || 'Invalid OTP')
      toast.error(error.message || 'Verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    toast.success('Resend OTP feature coming soon!')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Verify Your Email</CardTitle>
          <p className="text-center text-gray-600 text-sm mt-2">
            We sent a 6-digit code to <strong>{email}</strong>
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Enter OTP"
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                setOtp(value)
              }}
              error={error}
              maxLength={6}
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
            >
              Verify Email
            </Button>

            <button
              type="button"
              onClick={handleResendOTP}
              className="w-full text-sm text-primary-600 hover:text-primary-700"
            >
              Didn't receive code? Resend OTP
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <a href="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
              ← Back to Signup
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
