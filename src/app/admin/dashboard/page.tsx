'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import toast from 'react-hot-toast'

interface UserSummary {
  role: string
}

interface AppointmentTypeSummary {
  isPublished: boolean
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserSummary[]>([])
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentTypeSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [usersRes, typesRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/appointment-types?includeUnpublished=true'),
      ])

      const usersData = await usersRes.json()
      const typesData = await typesRes.json()

      if (!usersRes.ok) {
        throw new Error(usersData.error || 'Failed to load users')
      }

      if (!typesRes.ok) {
        throw new Error(typesData.error || 'Failed to load appointment types')
      }

      setUsers(usersData.users || [])
      setAppointmentTypes(typesData.appointmentTypes || [])
    } catch (error: any) {
      toast.error(error.message || 'Failed to load stats')
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

  const totalUsers = users.length
  const admins = users.filter((user) => user.role === 'ADMIN').length
  const organisers = users.filter((user) => user.role === 'ORGANISER').length
  const published = appointmentTypes.filter((type) => type.isPublished).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">System overview and key stats.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totalUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{admins}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Organisers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{organisers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Published Types</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{published}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
