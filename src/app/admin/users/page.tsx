'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import toast from 'react-hot-toast'

interface User {
  id: string
  name: string
  email: string
  role: 'CUSTOMER' | 'ORGANISER' | 'ADMIN'
  isActive: boolean
  isVerified: boolean
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load users')
      }

      setUsers(data.users || [])
    } catch (error: any) {
      toast.error(error.message || 'Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  const updateUser = async (id: string, updates: Partial<User>) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user')
      }

      setUsers((prev) => prev.map((user) => (user.id === id ? data.user : user)))
      toast.success('User updated')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user')
    } finally {
      setIsUpdating(false)
    }
  }

  const filteredUsers = users.filter((user) =>
    `${user.name} ${user.email}`.toLowerCase().includes(search.toLowerCase())
  )

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
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600">Manage roles and access for users.</p>
      </div>

      <Input
        placeholder="Search by name or email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600">No users found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={user.isActive ? 'success' : 'warning'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant={user.isVerified ? 'success' : 'danger'}>
                        {user.isVerified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    <select
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={user.role}
                      onChange={(e) => updateUser(user.id, { role: e.target.value as User['role'] })}
                      disabled={isUpdating}
                    >
                      <option value="CUSTOMER">Customer</option>
                      <option value="ORGANISER">Organiser</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <Button
                      variant={user.isActive ? 'danger' : 'secondary'}
                      size="sm"
                      onClick={() => updateUser(user.id, { isActive: !user.isActive })}
                      isLoading={isUpdating}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
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
