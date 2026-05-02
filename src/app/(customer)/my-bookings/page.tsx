'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { format } from 'date-fns'
import { Calendar, Clock, MapPin, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

interface Booking {
  id: string
  appointmentType: {
    id: string
    name: string
    location: string | null
  }
  startTime: Date
  endTime: Date
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  confirmationCode: string
  notes: string | null
}

interface Slot {
  startTime: Date
  endTime: Date
  available: number
  capacity: number
  isAvailable: boolean
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming')
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleSlots, setRescheduleSlots] = useState<Slot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load bookings')
      }

      const parsed = (data.bookings || []).map((booking: any) => ({
        ...booking,
        startTime: new Date(booking.startTime),
        endTime: new Date(booking.endTime),
      }))

      setBookings(parsed)
    } catch (error) {
      toast.error('Failed to load bookings')
    } finally {
      setIsLoading(false)
    }
  }

  const openReschedule = (booking: Booking) => {
    setRescheduleBooking(booking)
    setSelectedSlot(null)
    const dateStr = format(booking.startTime, 'yyyy-MM-dd')
    setRescheduleDate(dateStr)
    fetchSlots(booking.appointmentType.id, dateStr)
  }

  const fetchSlots = async (appointmentTypeId: string, date: string) => {
    setIsLoadingSlots(true)
    try {
      const response = await fetch(
        `/api/slots?appointmentTypeId=${appointmentTypeId}&date=${date}`
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load slots')
      }

      setRescheduleSlots(
        (data.slots || []).map((slot: any) => ({
          ...slot,
          startTime: new Date(slot.startTime),
          endTime: new Date(slot.endTime),
        }))
      )
    } catch (error) {
      toast.error('Failed to load available slots')
      setRescheduleSlots([])
    } finally {
      setIsLoadingSlots(false)
    }
  }

  const handleCancel = async (bookingId: string) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel booking')
      }

      toast.success('Booking cancelled')
      fetchBookings()
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel booking')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleReschedule = async () => {
    if (!rescheduleBooking || !selectedSlot) {
      toast.error('Select a slot to reschedule')
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/bookings/${rescheduleBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: selectedSlot.startTime.toISOString(),
          endTime: selectedSlot.endTime.toISOString(),
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reschedule booking')
      }

      toast.success('Booking rescheduled')
      setRescheduleBooking(null)
      fetchBookings()
    } catch (error: any) {
      toast.error(error.message || 'Failed to reschedule booking')
    } finally {
      setIsUpdating(false)
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openReschedule(booking)}
                    >
                      Reschedule
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleCancel(booking.id)}
                      isLoading={isUpdating}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={Boolean(rescheduleBooking)}
        onClose={() => setRescheduleBooking(null)}
        title="Reschedule Booking"
        size="lg"
      >
        {rescheduleBooking && (
          <div className="space-y-4">
            <Input
              label="Select Date"
              type="date"
              value={rescheduleDate}
              onChange={(e) => {
                setRescheduleDate(e.target.value)
                fetchSlots(rescheduleBooking.appointmentType.id, e.target.value)
              }}
            />

            {isLoadingSlots ? (
              <div className="flex justify-center py-6">
                <Spinner />
              </div>
            ) : rescheduleSlots.length === 0 ? (
              <p className="text-sm text-gray-600">No slots available.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {rescheduleSlots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => slot.isAvailable && setSelectedSlot(slot)}
                    disabled={!slot.isAvailable}
                    className={
                      `p-2 rounded-lg text-sm border transition-colors ${
                        selectedSlot === slot
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white border-gray-200'
                      } ${!slot.isAvailable ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-500'}`
                    }
                  >
                    {format(slot.startTime, 'HH:mm')}
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setRescheduleBooking(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                onClick={handleReschedule}
                isLoading={isUpdating}
                disabled={!selectedSlot}
              >
                Confirm Reschedule
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
