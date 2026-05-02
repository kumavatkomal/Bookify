import Groq from 'groq-sdk'

type SlotSummary = {
  startTime: string
  endTime: string
  providerId?: string
}

type GroqSuggestion = {
  index: number | null
  response?: string
}

type AppointmentDraft = {
  name: string
  description?: string
  duration: number
  location?: string
  requiresPayment?: boolean
  paymentAmount?: number
  requiresConfirmation?: boolean
  questions?: Array<{ questionText: string; isRequired: boolean }>
  weeklySchedules?: Array<{ dayOfWeek: number; startTime: string; endTime: string }>
}

type ReminderCopy = {
  subject: string
  body: string
}

const apiKey = process.env.GROQ_API_KEY
const groq = apiKey ? new Groq({ apiKey }) : null

export async function getGroqSlotSuggestion(params: {
  message: string
  slots: SlotSummary[]
  timezone?: string
}): Promise<GroqSuggestion> {
  if (!groq || params.slots.length === 0) {
    return { index: null }
  }

  const slotLines = params.slots
    .map((slot, index) => `${index}: ${slot.startTime} - ${slot.endTime}`)
    .join('\n')

  const systemPrompt =
    'You are a scheduling assistant. User requests can be in any language (including Hindi or English). ' +
    'Pick the best matching slot index for the user request. ' +
    'Return JSON only: {"index": number | null, "response": string}. ' +
    'If no good match, use null.'

  const userPrompt =
    `User request: ${params.message}\n` +
    `Timezone: ${params.timezone || 'UTC'}\n` +
    `Available slots:\n${slotLines}`

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.2,
  })

  const content = completion.choices[0]?.message?.content || ''
  const match = content.match(/\{[\s\S]*\}/)
  if (!match) {
    return { index: null }
  }

  try {
    const parsed = JSON.parse(match[0]) as GroqSuggestion
    if (typeof parsed.index !== 'number' && parsed.index !== null) {
      return { index: null, response: parsed.response }
    }
    return parsed
  } catch (error) {
    return { index: null }
  }
}

export async function getGroqAppointmentDraft(params: {
  prompt: string
  timezone?: string
}): Promise<AppointmentDraft | null> {
  if (!groq) {
    return null
  }

  const systemPrompt =
    'You are an expert scheduling assistant. Create a concise appointment type draft. ' +
    'Return JSON only with keys: name, description, duration, location, requiresPayment, paymentAmount, ' +
    'requiresConfirmation, questions (array of {questionText,isRequired}), weeklySchedules (array of {dayOfWeek,startTime,endTime}).'

  const userPrompt =
    `User prompt: ${params.prompt}\n` +
    `Timezone: ${params.timezone || 'UTC'}\n` +
    'Keep duration in minutes. Use 1-4 questions max.'

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.4,
  })

  const content = completion.choices[0]?.message?.content || ''
  const match = content.match(/\{[\s\S]*\}/)
  if (!match) {
    return null
  }

  try {
    return JSON.parse(match[0]) as AppointmentDraft
  } catch (error) {
    return null
  }
}

export async function getGroqReminderCopy(params: {
  customerName: string
  appointmentName: string
  date: string
  time: string
  location: string
  tone?: string
}): Promise<ReminderCopy | null> {
  if (!groq) {
    return null
  }

  const systemPrompt =
    'You write short, friendly appointment reminder emails. ' +
    'Return JSON only with keys: subject, body.'

  const userPrompt =
    `Customer: ${params.customerName}\n` +
    `Appointment: ${params.appointmentName}\n` +
    `Date: ${params.date}\n` +
    `Time: ${params.time}\n` +
    `Location: ${params.location}\n` +
    `Tone: ${params.tone || 'friendly and professional'}\n` +
    'Keep it under 120 words. Include a gentle reminder to arrive on time.'

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
  })

  const content = completion.choices[0]?.message?.content || ''
  const match = content.match(/\{[\s\S]*\}/)
  if (!match) {
    return null
  }

  try {
    return JSON.parse(match[0]) as ReminderCopy
  } catch (error) {
    return null
  }
}
