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
    'You are a scheduling assistant. Pick the best matching slot index for the user request. ' +
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
