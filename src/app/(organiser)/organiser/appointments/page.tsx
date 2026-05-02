'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

interface AppointmentType {
  id: string
  name: string
  description: string | null
  duration: number
  isPublished: boolean
  maxBookingsPerSlot: number
  requiresPayment: boolean
  paymentAmount: number | null
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 30,
    maxBookingsPerSlot: 1,
    requiresPayment: false,
    paymentAmount: 0,
  })

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      // TODO: Replace with actual API call
      setTimeout(() => {
        setAppointments([
          {
            id: '1',
            name: 'General Consultation',
            description: 'General health checkup',
            duration: 30,
            isPublished: true,
            maxBookingsPerSlot: 1,
            requiresPayment: true,
            paymentAmount: 500,
          },
          {
            id: '2',
            name: 'Dental Checkup',
            description: 'Routine dental examination',
            duration: 45,
            isPublished: false,
            maxBookingsPerSlot: 1,
            requiresPayment: true,
            paymentAmount: 800,
          },
        ])
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      toast.error('Failed to load appointments')
      setIsLoading(false)
    }
  }

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    toast.success(`Appointment ${currentStatus ? 'unpublished' : 'published'}`)
    // TODO: API call to toggle publish status
  }

  const handleCreateAppointment = async () => {
    toast.success('Appointment created successfully!')
    setIsModalOpen(false)
    // TODO: API call to create appointment
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointment Types</h1>
          <p className="text-gray-600">Manage your appointment types</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} className="mr-2" />
          Create Appointment
        </Button>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <Card key={appointment.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {appointment.name}
                    </h3>
                    <Badge variant={appointment.isPublished ? 'success' : 'default'}>
                      {appointment.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  {appointment.description && (
                    <p className="text-gray-600 mb-3">{appointment.description}</p>
                  )}
                  <div className="flex gap-6 text-sm text-gray-600">
                    <span>Duration: {appointment.duration} min</span>
                    <span>Capacity: {appointment.maxBookingsPerSlot}</span>
                    {appointment.requiresPayment && (
                      <span>Price: ₹{appointment.paymentAmount}</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTogglePublish(appointment.id, appointment.isPublished)}
                  >
                    {appointment.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit size={16} />
                  </Button>
                  <Button variant="danger" size="sm">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Appointment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Appointment Type"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            placeholder="e.g., General Consultation"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              placeholder="Brief description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <Input
            label="Duration (minutes)"
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
            required
          />

          <Input
            label="Max Bookings Per Slot"
            type="number"
            value={formData.maxBookingsPerSlot}
            onChange={(e) => setFormData({ ...formData, maxBookingsPerSlot: parseInt(e.target.value) })}
            required
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="requiresPayment"
              checked={formData.requiresPayment}
              onChange={(e) => setFormData({ ...formData, requiresPayment: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="requiresPayment" className="text-sm text-gray-700">
              Requires Payment
            </label>
          </div>

          {formData.requiresPayment && (
            <Input
              label="Payment Amount (₹)"
              type="number"
              value={formData.paymentAmount}
              onChange={(e) => setFormData({ ...formData, paymentAmount: parseInt(e.target.value) })}
              required
            />
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="primary" onClick={handleCreateAppointment} className="flex-1">
              Create
            </Button>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
