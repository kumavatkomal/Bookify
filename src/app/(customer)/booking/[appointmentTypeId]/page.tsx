'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
import BookingAssistantPanel from '@/components/ai/BookingAssistantPanel'
import { format, addDays, startOfWeek } from 'date-fns'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

interface Slot {
  startTime: Date
  endTime: Date
  available: number
  capacity: number
  isAvailable: boolean
}

interface AppointmentQuestion {
  id: string
  questionText: string
  isRequired: boolean
}

interface AppointmentTypeDetails {
  id: string
  name: string
  description: string | null
  duration: number
  location: string | null
  questions: AppointmentQuestion[]
  requiresPayment: boolean
  paymentAmount: number | null
}

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const appointmentTypeId = params.appointmentTypeId as string

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [isLoadingDetails, setIsLoadingDetails] = useState(true)
  const [appointmentType, setAppointmentType] = useState<AppointmentTypeDetails | null>(null)
  const [notes, setNotes] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isBooking, setIsBooking] = useState(false)

  const currency = (process.env.NEXT_PUBLIC_PAYMENT_CURRENCY || 'INR').toUpperCase()
  const formatAmount = (amount: number) =>
    new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).format(amount)

  // Generate week dates
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 })
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  useEffect(() => {
    fetchAppointmentDetails()
  }, [appointmentTypeId])

  useEffect(() => {
    fetchSlots()
  }, [selectedDate])

  const fetchAppointmentDetails = async () => {
    setIsLoadingDetails(true)
    try {
      const response = await fetch(`/api/appointment-types/${appointmentTypeId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load appointment details')
      }

      setAppointmentType(data.appointmentType)
      const initialAnswers: Record<string, string> = {}
      data.appointmentType?.questions?.forEach((question: AppointmentQuestion) => {
        initialAnswers[question.id] = ''
      })
      setAnswers(initialAnswers)
    } catch (error: any) {
      toast.error(error.message || 'Failed to load appointment details')
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const fetchSlots = async () => {
    setIsLoadingSlots(true)
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const response = await fetch(
        `/api/slots?appointmentTypeId=${appointmentTypeId}&date=${dateStr}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch slots')
      }

      const data = await response.json()
      setSlots(
        data.slots.map((slot: any) => ({
          ...slot,
          startTime: new Date(slot.startTime),
          endTime: new Date(slot.endTime),
        }))
      )
    } catch (error) {
      toast.error('Failed to load available slots')
      setSlots([])
    } finally {
      setIsLoadingSlots(false)
    }
  }

  const handleBooking = async (overrides?: {
    notes?: string
    answers?: Record<string, string>
    slot?: Slot | null
  }): Promise<boolean> => {
    if (!appointmentType) {
      toast.error('Appointment details not loaded')
      return false
    }

    const slotToBook = overrides?.slot ?? selectedSlot

    if (!slotToBook) {
      toast.error('Please select a time slot')
      return false
    }

    const mergedAnswers = {
      ...answers,
      ...(overrides?.answers ?? {}),
    }

    const requiredQuestions = appointmentType.questions.filter((q) => q.isRequired)
    const missingAnswer = requiredQuestions.find((q) => !mergedAnswers[q.id]?.trim())
    if (missingAnswer) {
      toast.error('Please answer all required questions')
      return false
    }

    const notesToUse = overrides?.notes !== undefined ? overrides.notes : notes

    setIsBooking(true)

    try {
      const payload = {
        appointmentTypeId,
        startTime: slotToBook.startTime.toISOString(),
        endTime: slotToBook.endTime.toISOString(),
        notes:
          typeof notesToUse === 'string' && notesToUse.trim()
            ? notesToUse.trim()
            : undefined,
        answers: Object.entries(mergedAnswers)
          .filter(([, value]) => value.trim())
          .map(([questionId, answer]) => ({ questionId, answer })),
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Booking failed')
      }

      if (data.checkoutUrl) {
        toast.success('Redirecting to payment...')
        window.location.assign(data.checkoutUrl)
        return true
      }

      toast.success('Booking confirmed!')
      router.push(`/confirmation/${data.booking.id}`)
      return true
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Booking failed. Please try again.')
      return false
    } finally {
      setIsBooking(false)
    }
  }

  const goToPreviousWeek = () => {
    setSelectedDate(addDays(selectedDate, -7))
  }

  const goToNextWeek = () => {
    setSelectedDate(addDays(selectedDate, 7))
  }

  if (isLoadingDetails && !appointmentType) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          ← Back
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
        <CardHeader>
          <CardTitle>Select Date & Time</CardTitle>
          {appointmentType && (
            <div className="mt-2 text-sm text-gray-600">
              <div className="font-medium text-gray-900">
                {appointmentType.name}
              </div>
              {appointmentType.description && (
                <p className="mt-1">{appointmentType.description}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge>{appointmentType.duration} min</Badge>
                {appointmentType.location && <Badge>{appointmentType.location}</Badge>}
                {appointmentType.requiresPayment &&
                  typeof appointmentType.paymentAmount === 'number' && (
                    <Badge>Payment: {formatAmount(appointmentType.paymentAmount)}</Badge>
                  )}
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {/* Week Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={goToPreviousWeek}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="font-medium">
              {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
            </span>
            <button
              onClick={goToNextWeek}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Calendar */}
          <div className="grid grid-cols-7 gap-2 mb-8">
            {weekDates.map((date) => {
              const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
              const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
              const isPast = date < new Date() && !isToday

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => !isPast && setSelectedDate(date)}
                  disabled={isPast}
                  className={`
                    p-3 rounded-lg text-center transition-colors
                    ${isSelected ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200'}
                    ${isPast ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-500'}
                    ${isToday && !isSelected ? 'border-primary-500' : ''}
                  `}
                >
                  <div className="text-xs font-medium mb-1">
                    {format(date, 'EEE')}
                  </div>
                  <div className="text-lg font-semibold">
                    {format(date, 'd')}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Time Slots */}
          <div>
            <h3 className="font-medium mb-4">Available Time Slots</h3>
            {isLoadingSlots ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                No available slots for this date
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
                {slots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => slot.isAvailable && setSelectedSlot(slot)}
                    disabled={!slot.isAvailable}
                    className={`
                      p-3 rounded-lg text-sm font-medium transition-colors
                      ${selectedSlot === slot ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200'}
                      ${!slot.isAvailable ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-500'}
                    `}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <Clock size={14} />
                      {format(slot.startTime, 'HH:mm')}
                    </div>
                    {slot.available < slot.capacity && slot.isAvailable && (
                      <div className="text-xs mt-1">
                        {slot.available} left
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          {selectedSlot && (
            <div className="mb-6">
              <Input
                label="Additional Notes (Optional)"
                placeholder="Any special requirements or notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          )}

          {/* Questions */}
          {appointmentType && appointmentType.questions.length > 0 && (
            <div className="mb-6 space-y-4">
              <h4 className="font-medium">Booking Questions</h4>
              {appointmentType.questions.map((question) => (
                <Input
                  key={question.id}
                  label={question.questionText}
                  value={answers[question.id] || ''}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))
                  }
                  required={question.isRequired}
                />
              ))}
            </div>
          )}

          {/* Booking Summary */}
          {selectedSlot && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium mb-2">Booking Summary</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Date: {format(selectedDate, 'MMMM d, yyyy')}</p>
                <p>Time: {format(selectedSlot.startTime, 'HH:mm')} - {format(selectedSlot.endTime, 'HH:mm')}</p>
                {appointmentType?.requiresPayment &&
                  typeof appointmentType.paymentAmount === 'number' && (
                    <p>Payment: {formatAmount(appointmentType.paymentAmount)}</p>
                  )}
              </div>
            </div>
          )}

          {/* Book Button */}
          <Button
            variant="primary"
            className="w-full"
            onClick={() => handleBooking()}
            isLoading={isBooking}
            disabled={!selectedSlot}
          >
            {appointmentType?.requiresPayment ? 'Proceed to Payment' : 'Confirm Booking'}
          </Button>
        </CardContent>
        </Card>

        <div className="lg:sticky lg:top-6 h-fit">
          <BookingAssistantPanel
            appointmentTypeId={appointmentTypeId}
            contextDate={selectedDate}
            questions={appointmentType?.questions || []}
            onSelectSlot={(slot) => {
              setSelectedDate(slot.startTime)
              setSelectedSlot({
                startTime: slot.startTime,
                endTime: slot.endTime,
                available: 1,
                capacity: 1,
                isAvailable: true,
              })
            }}
            onApplyAnswers={(updates) =>
              setAnswers((prev) => ({
                ...prev,
                ...updates,
              }))
            }
            onApplyNotes={(nextNotes) => setNotes(nextNotes)}
            onSubmitBooking={(payload) => handleBooking(payload)}
            isBooking={isBooking}
          />
        </div>
      </div>
    </div>
  )
}
