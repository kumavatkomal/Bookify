'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface Booking {
  id: string
  customer: {
    name: string
    email: string
  }
  startTime: Date
  endTime: Date
  status: string
  confirmationCode: string
}

export default function AppointmentBookingsPage() {
  const params = useParams()
  const appointmentTypeId = params.id as string

  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [reminderId, setReminderId] = useState<string | null>(null)

  useEffect(() => {
    fetchBookings()
  }, [appointmentTypeId])

  const fetchBookings = async () => {
    try {
      const response = await fetch(`/api/bookings?appointmentTypeId=${appointmentTypeId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load bookings')
      }

      setBookings(
        (data.bookings || []).map((booking: any) => ({
          ...booking,
          startTime: new Date(booking.startTime),
          endTime: new Date(booking.endTime),
        }))
      )
    } catch (error: any) {
      toast.error(error.message || 'Failed to load bookings')
    } finally {
      setIsLoading(false)
    }
  }

  const sendReminder = async (bookingId: string) => {
    setReminderId(bookingId)
    try {
      const response = await fetch('/api/ai/reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reminder')
      }

      toast.success('Reminder sent')
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reminder')
    } finally {
      setReminderId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="text-gray-600">All bookings for this appointment type.</p>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600">No bookings yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{booking.customer?.name}</h3>
                    <p className="text-sm text-gray-600">{booking.customer?.email}</p>
                    <p className="text-sm text-gray-600">
                      {format(booking.startTime, 'MMM d, yyyy')} · {format(booking.startTime, 'HH:mm')} - {format(booking.endTime, 'HH:mm')}
                    </p>
                    <p className="text-sm text-gray-500">Code: {booking.confirmationCode}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="info">{booking.status}</Badge>
                    {booking.startTime > new Date() && booking.status !== 'CANCELLED' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        isLoading={reminderId === booking.id}
                        onClick={() => sendReminder(booking.id)}
                      >
                        Send Reminder
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
