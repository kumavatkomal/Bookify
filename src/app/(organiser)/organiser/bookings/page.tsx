'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { format } from 'date-fns'
import { Calendar, Clock, User, Mail } from 'lucide-react'
import toast from 'react-hot-toast'

interface Booking {
  id: string
  customer: {
    name: string
    email: string
  }
  appointmentType: {
    name: string
  }
  startTime: Date
  endTime: Date
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  confirmationCode: string
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed'>('all')

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      // TODO: Replace with actual API call
      setTimeout(() => {
        setBookings([
          {
            id: '1',
            customer: {
              name: 'John Doe',
              email: 'john@example.com',
            },
            appointmentType: {
              name: 'General Consultation',
            },
            startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
            status: 'PENDING',
            confirmationCode: 'ABC123',
          },
          {
            id: '2',
            customer: {
              name: 'Jane Smith',
              email: 'jane@example.com',
            },
            appointmentType: {
              name: 'Dental Checkup',
            },
            startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
            status: 'CONFIRMED',
            confirmationCode: 'XYZ789',
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

  const handleConfirm = (id: string) => {
    toast.success('Booking confirmed')
    // TODO: API call
  }

  const handleCancel = (id: string) => {
    toast.success('Booking cancelled')
    // TODO: API call
  }

  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'pending') return booking.status === 'PENDING'
    if (filter === 'confirmed') return booking.status === 'CONFIRMED'
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bookings</h1>
        <p className="text-gray-600">Manage customer bookings</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
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
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('confirmed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'confirmed'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Confirmed
        </button>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Appointment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                          <User size={16} />
                          {booking.customer.name}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <Mail size={14} />
                          {booking.customer.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {booking.appointmentType.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="flex items-center gap-2 text-gray-900">
                          <Calendar size={14} />
                          {format(booking.startTime, 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 mt-1">
                          <Clock size={14} />
                          {format(booking.startTime, 'HH:mm')} - {format(booking.endTime, 'HH:mm')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {booking.status === 'PENDING' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleConfirm(booking.id)}
                          >
                            Confirm
                          </Button>
                        )}
                        {booking.status !== 'CANCELLED' && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleCancel(booking.id)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
