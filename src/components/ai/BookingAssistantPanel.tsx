'use client'

import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import toast from 'react-hot-toast'

type SuggestedSlot = {
  startTime: Date
  endTime: Date
}

type AppointmentQuestion = {
  id: string
  questionText: string
  isRequired: boolean
}

type Stage = 'intro' | 'questions' | 'notes' | 'done'

interface BookingAssistantPanelProps {
  appointmentTypeId: string
  contextDate?: Date
  questions: AppointmentQuestion[]
  onSelectSlot: (slot: SuggestedSlot) => void
  onApplyAnswers: (answers: Record<string, string>) => void
  onApplyNotes: (notes: string) => void
  onSubmitBooking: (payload?: { answers?: Record<string, string>; notes?: string }) => Promise<boolean>
  isBooking?: boolean
}

export default function BookingAssistantPanel({
  appointmentTypeId,
  contextDate,
  questions,
  onSelectSlot,
  onApplyAnswers,
  onApplyNotes,
  onSubmitBooking,
  isBooking = false,
}: BookingAssistantPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [stage, setStage] = useState<Stage>('intro')
  const [slotQuery, setSlotQuery] = useState('')
  const [isFindingSlot, setIsFindingSlot] = useState(false)
  const [suggestedSlot, setSuggestedSlot] = useState<SuggestedSlot | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answerInput, setAnswerInput] = useState('')
  const [localAnswers, setLocalAnswers] = useState<Record<string, string>>({})
  const [notesInput, setNotesInput] = useState('')

  const currentQuestion = useMemo(
    () => questions[questionIndex],
    [questions, questionIndex]
  )

  const resetFlow = () => {
    setStage('intro')
    setSlotQuery('')
    setSuggestedSlot(null)
    setQuestionIndex(0)
    setAnswerInput('')
    setLocalAnswers({})
    setNotesInput('')
  }

  const handleFindSlot = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!slotQuery.trim() || isFindingSlot) return

    setIsFindingSlot(true)
    try {
      const response = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentTypeId,
          message: slotQuery.trim(),
          date: contextDate ? format(contextDate, 'yyyy-MM-dd') : undefined,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'No suggestion available')
      }

      const slot = {
        startTime: new Date(data.slot.startTime),
        endTime: new Date(data.slot.endTime),
      }

      setSuggestedSlot(slot)
      onSelectSlot(slot)
      setStage(questions.length > 0 ? 'questions' : 'notes')
      setQuestionIndex(0)
      setAnswerInput('')
    } catch (error: any) {
      toast.error(error.message || 'Could not find a slot')
    } finally {
      setIsFindingSlot(false)
    }
  }

  const handleAnswerSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!currentQuestion) return

    if (currentQuestion.isRequired && !answerInput.trim()) {
      toast.error('Please answer the required question.')
      return
    }

    const nextAnswers = {
      ...localAnswers,
      [currentQuestion.id]: answerInput.trim(),
    }

    setLocalAnswers(nextAnswers)
    onApplyAnswers(nextAnswers)
    setAnswerInput('')

    const nextIndex = questionIndex + 1
    if (nextIndex < questions.length) {
      setQuestionIndex(nextIndex)
    } else {
      setStage('notes')
    }
  }

  const handleNotesSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    void submitBooking({ notes: notesInput })
  }

  const submitBooking = async (payload: { notes?: string } = {}) => {
    if (!suggestedSlot) {
      toast.error('Pick a slot first.')
      return
    }

    const trimmedNotes = payload.notes?.trim()

    if (Object.keys(localAnswers).length > 0) {
      onApplyAnswers(localAnswers)
    }

    if (trimmedNotes) {
      onApplyNotes(trimmedNotes)
    }

    const success = await onSubmitBooking({
      answers: localAnswers,
      notes: trimmedNotes,
    })

    if (success) {
      setStage('done')
    }
  }

  const stepLabel = useMemo(() => {
    if (stage === 'intro') return 'Step 1: Pick a time'
    if (stage === 'questions') return 'Step 2: Booking details'
    if (stage === 'notes') return 'Step 3: Extra notes'
    return 'All set'
  }, [stage])

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">Booking Assistant</p>
          <p className="text-xs text-gray-500">Natural language booking helper</p>
        </div>
        <Button
          variant={isOpen ? 'outline' : 'secondary'}
          size="sm"
          onClick={() => {
            if (!isOpen) {
              resetFlow()
            }
            setIsOpen((prev) => !prev)
          }}
        >
          {isOpen ? 'Close' : 'Open'}
        </Button>
      </div>

      {isOpen && (
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600">
            {stepLabel}
          </div>

          {stage === 'intro' && (
            <form onSubmit={handleFindSlot} className="space-y-3">
              <Input
                label="When should we book it?"
                placeholder="e.g., next Tuesday afternoon"
                value={slotQuery}
                onChange={(e) => setSlotQuery(e.target.value)}
              />
              <p className="text-xs text-gray-500">Hindi or English both work.</p>
              <Button
                type="submit"
                variant="secondary"
                className="w-full"
                isLoading={isFindingSlot}
              >
                Find a slot
              </Button>
            </form>
          )}

          {suggestedSlot && (
            <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
              Suggested slot: {format(suggestedSlot.startTime, 'MMM d, yyyy')} at{' '}
              {format(suggestedSlot.startTime, 'HH:mm')} -{' '}
              {format(suggestedSlot.endTime, 'HH:mm')}
            </div>
          )}

          {stage === 'questions' && currentQuestion && (
            <form onSubmit={handleAnswerSubmit} className="space-y-3">
              <Input
                label={`${currentQuestion.questionText}${currentQuestion.isRequired ? ' *' : ''}`}
                placeholder="Type your answer"
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                required={currentQuestion.isRequired}
              />
              <Button type="submit" variant="secondary" className="w-full">
                Save answer
              </Button>
              <p className="text-xs text-gray-500">
                Question {questionIndex + 1} of {questions.length}
              </p>
            </form>
          )}

          {stage === 'notes' && (
            <form onSubmit={handleNotesSubmit} className="space-y-3">
              <Input
                label="Any extra notes? (optional)"
                placeholder="Add anything helpful"
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
              />
              <div className="grid gap-2 sm:grid-cols-2">
                <Button type="submit" variant="secondary" className="w-full" isLoading={isBooking}>
                  Save notes & book
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => void submitBooking()}
                  disabled={isBooking}
                >
                  Book without notes
                </Button>
              </div>
            </form>
          )}

          {stage === 'done' && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-700">
              Booking request sent. Check My Bookings for confirmation.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
