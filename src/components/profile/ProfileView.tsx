'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import toast from 'react-hot-toast'

type ProfileData = {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

export default function ProfileView() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [formData, setFormData] = useState({ name: '' })
  const [errors, setErrors] = useState<{ name?: string }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load profile')
      }

      setProfile(data.user)
      setFormData({ name: data.user.name || '' })
    } catch (error: any) {
      toast.error(error.message || 'Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const validate = () => {
    const nextErrors: { name?: string } = {}

    if (!formData.name.trim()) {
      nextErrors.name = 'Name is required'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!validate()) return

    setIsSaving(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      setProfile(data.user)
      setFormData({ name: data.user.name || '' })
      toast.success('Profile updated')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if (!profile) return
    setFormData({ name: profile.name || '' })
    setErrors({})
  }

  const hasChanges = !!profile && formData.name.trim() !== (profile.name || '')

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">View and update your personal details.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <Input
                label="Full Name"
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                error={errors.name}
                required
              />
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-gray-600">
                Email updates are locked. Contact support if you need to change it.
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" variant="primary" isLoading={isSaving} disabled={!hasChanges}>
                  Save Changes
                </Button>
                <Button type="button" variant="secondary" onClick={handleReset} disabled={!hasChanges}>
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Role</span>
              <span className="font-semibold text-gray-900">{profile?.role || 'User'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Status</span>
              <span className="font-semibold text-gray-900">
                {profile?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Email verified</span>
              <span className="font-semibold text-gray-900">
                {profile?.isVerified ? 'Verified' : 'Unverified'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Email</span>
              <span className="font-semibold text-gray-900">
                {profile?.email || '--'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Member since</span>
              <span className="font-semibold text-gray-900">
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString()
                  : '--'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Last updated</span>
              <span className="font-semibold text-gray-900">
                {profile?.updatedAt
                  ? new Date(profile.updatedAt).toLocaleDateString()
                  : '--'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
