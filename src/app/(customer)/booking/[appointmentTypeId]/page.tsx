'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
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

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const appointmentTypeId = params.appointmentTypeId as string

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [notes, setNotes] = useState('')
  const [isBooking, setIsBooking] = useState(false)

  // Generate week dates
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 })
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  useEffect(() => {
    fetchSlots()
  }, [selectedDate])

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

  const handleBooking = async () => {
    if (!selectedSlot) {
      toast.error('Please select a time slot')
      return
    }

    setIsBooking(true)

    try {
      // TODO: Replace with actual booking API when backend is ready
      setTimeout(() => {
        toast.success('Booking confirmed!')
        router.push('/my-bookings')
      }, 1500)
    } catch (error) {
      toast.error('Booking failed. Please try again.')
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          ← Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Date & Time</CardTitle>
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

          {/* Booking Summary */}
          {selectedSlot && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium mb-2">Booking Summary</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Date: {format(selectedDate, 'MMMM d, yyyy')}</p>
                <p>Time: {format(selectedSlot.startTime, 'HH:mm')} - {format(selectedSlot.endTime, 'HH:mm')}</p>
              </div>
            </div>
          )}

          {/* Book Button */}
          <Button
            variant="primary"
            className="w-full"
            onClick={handleBooking}
            isLoading={isBooking}
            disabled={!selectedSlot}
          >
            Confirm Booking
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
