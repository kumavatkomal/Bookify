'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface AppointmentType {
  id: string
  name: string
  isPublished: boolean
}

interface Booking {
  id: string
  startTime: Date
  endTime: Date
  appointmentType: {
    name: string
  }
  status: string
}

export default function OrganiserDashboard() {
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [typesRes, bookingsRes] = await Promise.all([
        fetch('/api/appointment-types?mine=true'),
        fetch('/api/bookings?organiser=true'),
      ])

      const typesData = await typesRes.json()
      const bookingsData = await bookingsRes.json()

      if (!typesRes.ok) {
        throw new Error(typesData.error || 'Failed to load appointment types')
      }

      if (!bookingsRes.ok) {
        throw new Error(bookingsData.error || 'Failed to load bookings')
      }

      setAppointmentTypes(typesData.appointmentTypes || [])
      setBookings(
        (bookingsData.bookings || []).map((booking: any) => ({
          ...booking,
          startTime: new Date(booking.startTime),
          endTime: new Date(booking.endTime),
        }))
      )
    } catch (error: any) {
      toast.error(error.message || 'Failed to load dashboard data')
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

  const publishedCount = appointmentTypes.filter((type) => type.isPublished).length
  const upcomingBookings = bookings.filter((booking) => booking.startTime > new Date())

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Organiser Overview</h1>
        <p className="text-gray-600">Manage your appointment types and bookings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Appointment Types</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{appointmentTypes.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Published</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{publishedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{upcomingBookings.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="text-gray-600">No bookings yet.</p>
          ) : (
            <div className="space-y-4">
              {bookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{booking.appointmentType.name}</p>
                    <p className="text-sm text-gray-600">
                      {format(booking.startTime, 'MMM d, yyyy')} ·{' '}
                      {format(booking.startTime, 'HH:mm')}
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">{booking.status}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
