'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import toast from 'react-hot-toast'

interface AppointmentType {
  id: string
  name: string
  duration: number
  isPublished: boolean
}

export default function OrganiserAppointmentsPage() {
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAppointmentTypes()
  }, [])

  const fetchAppointmentTypes = async () => {
    try {
      const response = await fetch('/api/appointment-types?mine=true&includeUnpublished=true')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load appointment types')
      }

      setAppointmentTypes(data.appointmentTypes || [])
    } catch (error: any) {
      toast.error(error.message || 'Failed to load appointment types')
    } finally {
      setIsLoading(false)
    }
  }

  const togglePublish = async (appointment: AppointmentType) => {
    try {
      const response = await fetch(`/api/appointment-types/${appointment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !appointment.isPublished }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update status')
      }

      setAppointmentTypes((prev) =>
        prev.map((item) =>
          item.id === appointment.id ? data.appointmentType : item
        )
      )
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status')
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointment Types</h1>
          <p className="text-gray-600">Create and manage your appointment offerings.</p>
        </div>
        <Link href="/organiser/appointments/new">
          <Button variant="primary">New Appointment Type</Button>
        </Link>
      </div>

      {appointmentTypes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600">No appointment types yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {appointmentTypes.map((appointment) => (
            <Card key={appointment.id}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {appointment.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Duration: {appointment.duration} minutes
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {appointment.isPublished ? (
                      <Badge variant="success">Published</Badge>
                    ) : (
                      <Badge variant="warning">Draft</Badge>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePublish(appointment)}
                    >
                      {appointment.isPublished ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Link href={`/organiser/appointments/${appointment.id}`}>
                      <Button variant="secondary" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/organiser/appointments/${appointment.id}/bookings`}>
                      <Button variant="secondary" size="sm">
                        View Bookings
                      </Button>
                    </Link>
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
