import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getGroqAppointmentDraft } from '@/lib/groq'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ORGANISER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const draft = await getGroqAppointmentDraft({
      prompt,
      timezone: body.timezone,
    })

    if (!draft) {
      return NextResponse.json({
        draft: {
          name: prompt.slice(0, 60),
          description: 'AI draft unavailable. Please refine manually.',
          duration: 30,
          location: '',
          requiresPayment: false,
          paymentAmount: 0,
          requiresConfirmation: false,
          questions: [],
        },
      })
    }

    const duration = Number(draft.duration)
    const paymentAmount = Number(draft.paymentAmount ?? 0)

    return NextResponse.json({
      draft: {
        ...draft,
        duration: Number.isFinite(duration) && duration > 0 ? duration : 30,
        paymentAmount: Number.isFinite(paymentAmount) ? paymentAmount : 0,
      },
    })
  } catch (error) {
    console.error('AI appointment builder error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
