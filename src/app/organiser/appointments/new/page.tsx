'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface WeeklySchedule {
  dayOfWeek: number
  startTime: string
  endTime: string
}

interface Question {
  questionText: string
  isRequired: boolean
}

export default function NewAppointmentPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState(30)
  const [location, setLocation] = useState('')
  const [maxBookingsPerSlot, setMaxBookingsPerSlot] = useState(1)
  const [isPublished, setIsPublished] = useState(false)
  const [requiresPayment, setRequiresPayment] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [weeklySchedules, setWeeklySchedules] = useState<WeeklySchedule[]>([
    { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
  ])
  const [questions, setQuestions] = useState<Question[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [isDrafting, setIsDrafting] = useState(false)

  const addSchedule = () => {
    setWeeklySchedules((prev) => [
      ...prev,
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
    ])
  }

  const updateSchedule = (index: number, updates: Partial<WeeklySchedule>) => {
    setWeeklySchedules((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updates } : item))
    )
  }

  const removeSchedule = (index: number) => {
    setWeeklySchedules((prev) => prev.filter((_, i) => i !== index))
  }

  const addQuestion = () => {
    setQuestions((prev) => [...prev, { questionText: '', isRequired: false }])
  }

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updates } : item))
    )
  }

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Name is required')
      return
    }

    if (weeklySchedules.length === 0) {
      toast.error('At least one schedule is required')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/appointment-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description.trim() || null,
          duration,
          location: location.trim() || null,
          maxBookingsPerSlot,
          isPublished,
          requiresPayment,
          paymentAmount: requiresPayment ? paymentAmount : 0,
          weeklySchedules,
          questions: questions.filter((q) => q.questionText.trim()),
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create appointment')
      }

      toast.success('Appointment type created')
      router.push(`/organiser/appointments/${data.appointmentType.id}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to create appointment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDraft = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Describe the appointment to draft')
      return
    }

    setIsDrafting(true)

    try {
      const response = await fetch('/api/ai/appointment-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt.trim(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate draft')
      }

      const draft = data.draft || {}
      if (draft.name) setName(draft.name)
      if (draft.description !== undefined) setDescription(draft.description || '')
      if (draft.duration) setDuration(Number(draft.duration) || 30)
      if (draft.location !== undefined) setLocation(draft.location || '')
      if (typeof draft.requiresPayment === 'boolean') {
        setRequiresPayment(draft.requiresPayment)
      }
      if (draft.paymentAmount !== undefined) {
        setPaymentAmount(Number(draft.paymentAmount) || 0)
      }
      if (Array.isArray(draft.questions)) {
        setQuestions(
          draft.questions
            .filter((question: Question) => question.questionText)
            .map((question: Question) => ({
              questionText: question.questionText,
              isRequired: Boolean(question.isRequired),
            }))
        )
      }
      if (Array.isArray(draft.weeklySchedules) && draft.weeklySchedules.length > 0) {
        setWeeklySchedules(
          draft.weeklySchedules.map((schedule: WeeklySchedule) => ({
            dayOfWeek: Number(schedule.dayOfWeek ?? 1),
            startTime: schedule.startTime || '09:00',
            endTime: schedule.endTime || '17:00',
          }))
        )
      }

      toast.success('AI draft applied')
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate draft')
    } finally {
      setIsDrafting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create Appointment Type</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-gray-900">AI Draft</h3>
              <p className="text-xs text-gray-600 mt-1">
                Describe the appointment and let AI fill the details.
              </p>
              <textarea
                className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                rows={3}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Example: 45-min product onboarding for SaaS teams, includes prep checklist and follow-up tips."
              />
              <div className="mt-3 flex justify-end">
                <Button type="button" variant="secondary" size="sm" onClick={handleDraft} isLoading={isDrafting}>
                  Generate Draft
                </Button>
              </div>
            </div>
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Duration (minutes)"
                type="number"
                min={10}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                required
              />
              <Input
                label="Max bookings per slot"
                type="number"
                min={1}
                value={maxBookingsPerSlot}
                onChange={(e) => setMaxBookingsPerSlot(Number(e.target.value))}
                required
              />
            </div>

            <Input
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                />
                Publish immediately
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={requiresPayment}
                  onChange={(e) => setRequiresPayment(e.target.checked)}
                />
                Requires payment
              </label>
            </div>

            {requiresPayment && (
              <Input
                label="Payment amount"
                type="number"
                min={0}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
              />
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Weekly Schedules</h3>
                <Button type="button" variant="secondary" size="sm" onClick={addSchedule}>
                  Add
                </Button>
              </div>
              {weeklySchedules.map((schedule, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={schedule.dayOfWeek}
                    onChange={(e) => updateSchedule(index, { dayOfWeek: Number(e.target.value) })}
                  >
                    <option value={0}>Sunday</option>
                    <option value={1}>Monday</option>
                    <option value={2}>Tuesday</option>
                    <option value={3}>Wednesday</option>
                    <option value={4}>Thursday</option>
                    <option value={5}>Friday</option>
                    <option value={6}>Saturday</option>
                  </select>
                  <Input
                    type="time"
                    value={schedule.startTime}
                    onChange={(e) => updateSchedule(index, { startTime: e.target.value })}
                  />
                  <Input
                    type="time"
                    value={schedule.endTime}
                    onChange={(e) => updateSchedule(index, { endTime: e.target.value })}
                  />
                  <Button type="button" variant="danger" size="sm" onClick={() => removeSchedule(index)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Questions</h3>
                <Button type="button" variant="secondary" size="sm" onClick={addQuestion}>
                  Add
                </Button>
              </div>
              {questions.map((question, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Input
                    className="md:col-span-2"
                    placeholder="Question text"
                    value={question.questionText}
                    onChange={(e) => updateQuestion(index, { questionText: e.target.value })}
                  />
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={question.isRequired}
                      onChange={(e) => updateQuestion(index, { isRequired: e.target.checked })}
                    />
                    Required
                  </label>
                  <Button type="button" variant="danger" size="sm" onClick={() => removeQuestion(index)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => router.push('/organiser/appointments')}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Create
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
