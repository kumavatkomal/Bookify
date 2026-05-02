'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { MessageSquare, Send, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import toast from 'react-hot-toast'

interface SuggestedSlot {
  startTime: Date
  endTime: Date
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface AppointmentQuestion {
  id: string
  questionText: string
  isRequired: boolean
}

interface AIChatWidgetProps {
  appointmentTypeId: string
  contextDate?: Date
  onSelectSlot: (slot: SuggestedSlot) => void
  questions?: AppointmentQuestion[]
}

export default function AIChatWidget({
  appointmentTypeId,
  contextDate,
  onSelectSlot,
  questions = [],
}: AIChatWidgetProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isSending, setIsSending] = useState(false)
  const [suggestedSlot, setSuggestedSlot] = useState<SuggestedSlot | null>(null)
  const [stage, setStage] = useState<'idle' | 'collecting' | 'booking' | 'done'>('idle')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const askQuestion = (question: AppointmentQuestion) => {
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: `${question.questionText}${question.isRequired ? ' *' : ''}`,
      },
    ])
  }

  const bookFromChat = async (slot: SuggestedSlot, answerMap: Record<string, string>) => {
    setIsSending(true)
    setStage('booking')

    try {
      const payload = {
        appointmentTypeId,
        startTime: slot.startTime.toISOString(),
        endTime: slot.endTime.toISOString(),
        answers: Object.entries(answerMap)
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

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Booked successfully! Taking you to confirmation now.',
        },
      ])
      setStage('done')
      router.push(`/confirmation/${data.booking.id}`)
    } catch (error: any) {
      toast.error(error.message || 'Booking failed')
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I could not complete the booking. Please try again.',
        },
      ])
      setStage('idle')
    } finally {
      setIsSending(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isSending) return

    if (stage === 'collecting') {
      const activeQuestion = questions[questionIndex]
      if (!activeQuestion) {
        setStage('idle')
      } else {
        if (activeQuestion.isRequired && !input.trim()) {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: 'This question is required. Please share a quick answer.',
            },
          ])
          return
        }
        const nextAnswers = { ...answers, [activeQuestion.id]: input.trim() }
        const nextMessages: ChatMessage[] = [
          ...messages,
          { role: 'user', content: input },
        ]

        setMessages(nextMessages)
        setInput('')
        setAnswers(nextAnswers)

        const nextIndex = questionIndex + 1
        if (nextIndex < questions.length) {
          setQuestionIndex(nextIndex)
          askQuestion(questions[nextIndex])
        } else if (suggestedSlot) {
          await bookFromChat(suggestedSlot, nextAnswers)
        }

        return
      }
    }

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', content: input },
    ]
    setMessages(nextMessages)
    setInput('')
    setIsSending(true)
    setSuggestedSlot(null)
    setStage('idle')
    setQuestionIndex(0)
    setAnswers({})

    try {
      const response = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentTypeId,
          message: input,
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
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            data.response ||
            `I found a slot on ${format(slot.startTime, 'MMM d')} at ${format(
              slot.startTime,
              'HH:mm'
            )}. I will ask a few questions to book it.`,
        },
      ])

      if (questions.length > 0) {
        setStage('collecting')
        setQuestionIndex(0)
        askQuestion(questions[0])
      } else {
        await bookFromChat(slot, {})
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to get AI suggestion')
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I could not find a slot. Please try a different request.',
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {isOpen ? (
        <div className="w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-2 text-gray-900 font-medium">
              <Sparkles size={18} className="text-primary-600" />
              AI Slot Helper
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-sm text-gray-600">
                Ask for a time, like "Book me Tuesday morning".
              </p>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={
                    message.role === 'user'
                      ? 'text-right'
                      : 'text-left'
                  }
                >
                  <div
                    className={
                      message.role === 'user'
                        ? 'inline-block bg-primary-600 text-white px-3 py-2 rounded-lg text-sm'
                        : 'inline-block bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm'
                    }
                  >
                    {message.content}
                  </div>
                </div>
              ))
            )}

            {suggestedSlot && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-900">
                <div>
                  Suggested: {format(suggestedSlot.startTime, 'MMM d, yyyy')} at{' '}
                  {format(suggestedSlot.startTime, 'HH:mm')}
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    onSelectSlot(suggestedSlot)
                    setIsOpen(false)
                  }}
                >
                  Use this slot
                </Button>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-gray-200 flex gap-2">
            <Input
              placeholder="Type your request"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSend()
                }
              }}
            />
            <Button
              variant="primary"
              onClick={handleSend}
              isLoading={isSending}
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700"
        >
          <MessageSquare size={18} />
          AI Help
        </button>
      )}
    </div>
  )
}
