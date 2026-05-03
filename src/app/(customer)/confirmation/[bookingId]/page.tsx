'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import Brand from '@/components/Brand'
import { format } from 'date-fns'
import { AlertCircle, CheckCircle, Calendar, Clock, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

interface BookingDetails {
  id: string
  appointmentType: {
    name: string
    location: string | null
    requiresPayment: boolean
    paymentAmount: number | null
  }
  startTime: string
  endTime: string
  confirmationCode: string
  status: string
  isPaid: boolean
}

export default function ConfirmationPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.bookingId as string

  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const currency = (process.env.NEXT_PUBLIC_PAYMENT_CURRENCY || 'INR').toUpperCase()
  const formatAmount = (amount: number) =>
    new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).format(amount)

  useEffect(() => {
    fetchBooking()
  }, [bookingId])

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load booking')
      }

      setBooking(data.booking)
    } catch (error: any) {
      toast.error(error.message || 'Failed to load booking')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600">Booking not found.</p>
        <Button variant="primary" onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    )
  }

  const startDate = new Date(booking.startTime)
  const endDate = new Date(booking.endTime)
  const isPaymentPending =
    booking.appointmentType.requiresPayment && !booking.isPaid

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex flex-col items-center text-center">
            <Brand size={56} showText={false} href="/" />
            {isPaymentPending ? (
              <AlertCircle className="text-amber-500" size={48} />
            ) : (
              <CheckCircle className="text-green-600" size={48} />
            )}
            <CardTitle className="mt-4 text-2xl">
              {isPaymentPending ? 'Payment Pending' : 'Booking Confirmed'}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {isPaymentPending
                ? 'We are waiting for the payment to complete.'
                : 'Your appointment is scheduled successfully.'}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {booking.appointmentType.requiresPayment &&
              typeof booking.appointmentType.paymentAmount === 'number' && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                  Payment amount: {formatAmount(booking.appointmentType.paymentAmount)}
                </div>
              )}
            <div>
              <p className="text-sm text-gray-500">Confirmation Code</p>
              <p className="text-lg font-mono font-semibold">{booking.confirmationCode}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Appointment</p>
              <p className="text-lg font-semibold">{booking.appointmentType.name}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={16} />
                {format(startDate, 'MMMM d, yyyy')}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={16} />
                {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')}
              </div>
              {booking.appointmentType.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={16} />
                  {booking.appointmentType.location}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              {isPaymentPending && (
                <Button variant="outline" onClick={fetchBooking}>
                  Refresh Payment Status
                </Button>
              )}
              <Button variant="primary" onClick={() => router.push('/my-bookings')}>
                View My Bookings
              </Button>
              <Button variant="secondary" onClick={() => router.push('/dashboard')}>
                Book Another
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
