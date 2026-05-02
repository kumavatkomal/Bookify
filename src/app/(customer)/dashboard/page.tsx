'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Clock, MapPin, DollarSign } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface AppointmentType {
  id: string
  name: string
  description: string | null
  duration: number
  location: string | null
  paymentAmount: number | null
  requiresPayment: boolean
  isPublished: boolean
}

export default function CustomerDashboard() {
  const [appointments, setAppointments] = useState<AppointmentType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointment-types?published=true')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load appointments')
      }

      setAppointments(data.appointmentTypes || [])
    } catch (error) {
      toast.error('Failed to load appointments')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredAppointments = appointments.filter((apt) =>
    apt.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Browse Appointments
        </h1>
        <p className="text-gray-600">
          Find and book appointments that suit your needs
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search appointments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Appointments Grid */}
      {filteredAppointments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600">No appointments found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAppointments.map((appointment) => (
            <Card
              key={appointment.id}
              className="group flex h-full flex-col border border-slate-200/70 bg-white shadow-sm hover:bg-slate-50"
            >
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-lg leading-snug">
                    {appointment.name}
                  </CardTitle>
                  <Badge className="shrink-0">{appointment.duration} min</Badge>
                </div>
                {appointment.description && (
                  <p className="text-sm text-slate-600">
                    {appointment.description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="mt-auto">
                <div className="space-y-3">
                  {appointment.location ? (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin size={16} className="text-slate-400" />
                      <span>{appointment.location}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin size={16} className="text-slate-400" />
                      <span>Location shared after booking</span>
                    </div>
                  )}

                  {appointment.requiresPayment && appointment.paymentAmount ? (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <DollarSign size={16} className="text-slate-400" />
                      <span>₹{appointment.paymentAmount}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <DollarSign size={16} className="text-slate-400" />
                      <span>Free</span>
                    </div>
                  )}

                  <Link href={`/booking/${appointment.id}`} className="block mt-4">
                    <Button variant="primary" className="w-full">
                      Book Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
