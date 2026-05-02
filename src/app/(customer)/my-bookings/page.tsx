'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { format } from 'date-fns'
import { Calendar, Clock, MapPin, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

interface Booking {
  id: string
  appointmentType: {
    name: string
    location: string | null
  }
  startTime: Date
  endTime: Date
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  confirmationCode: string
  notes: string | null
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming')

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      // TODO: Replace with actual API call when backend is ready
      setTimeout(() => {
        setBookings([
          {
            id: '1',
            appointmentType: {
              name: 'General Consultation',
              location: 'Clinic Room 1',
            },
            startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
            status: 'CONFIRMED',
            confirmationCode: 'ABC123',
            notes: 'First visit',
          },
          {
            id: '2',
            appointmentType: {
              name: 'Dental Checkup',
              location: 'Dental Wing',
            },
            startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
            status: 'COMPLETED',
            confirmationCode: 'XYZ789',
            notes: null,
          },
        ])
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      toast.error('Failed to load bookings')
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: Booking['status']) => {
    const variants = {
      PENDING: 'warning' as const,
      CONFIRMED: 'success' as const,
      CANCELLED: 'danger' as const,
      COMPLETED: 'default' as const,
    }
    return <Badge variant={variants[status]}>{status}</Badge>
  }

  const filteredBookings = bookings.filter((booking) => {
    const now = new Date()
    if (filter === 'upcoming') {
      return booking.startTime > now && booking.status !== 'CANCELLED'
    }
    if (filter === 'past') {
      return booking.startTime < now || booking.status === 'COMPLETED'
    }
    return true
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
        <p className="text-gray-600">View and manage your appointments</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'upcoming'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setFilter('past')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'past'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Past
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          All
        </button>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600 mb-4">No bookings found</p>
            <Button variant="primary" onClick={() => window.location.href = '/dashboard'}>
              Browse Appointments
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {booking.appointmentType.name}
                    </h3>
                    {getStatusBadge(booking.status)}
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p className="font-mono">{booking.confirmationCode}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} />
                    <span>{format(booking.startTime, 'MMMM d, yyyy')}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} />
                    <span>
                      {format(booking.startTime, 'HH:mm')} - {format(booking.endTime, 'HH:mm')}
                    </span>
                  </div>

                  {booking.appointmentType.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={16} />
                      <span>{booking.appointmentType.location}</span>
                    </div>
                  )}

                  {booking.notes && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText size={16} />
                      <span>{booking.notes}</span>
                    </div>
                  )}
                </div>

                {booking.status === 'CONFIRMED' && booking.startTime > new Date() && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Reschedule
                    </Button>
                    <Button variant="danger" size="sm">
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
