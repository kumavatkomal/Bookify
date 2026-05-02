import { NextRequest, NextResponse } from 'next/server'
import { addDays, parse } from 'date-fns'
import { prisma } from '@/lib/prisma'
import { generateSlotsForRange } from '@/lib/slots'
import { getGroqSlotSuggestion } from '@/lib/groq'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      appointmentTypeId,
      message,
      date,
      providerId,
      rangeDays,
      timezone,
    } = body

    if (!appointmentTypeId || !message) {
      return NextResponse.json(
        { error: 'appointmentTypeId and message are required' },
        { status: 400 }
      )
    }

    const appointmentType = await prisma.appointmentType.findUnique({
      where: { id: appointmentTypeId },
    })

    if (!appointmentType) {
      return NextResponse.json(
        { error: 'Appointment type not found' },
        { status: 404 }
      )
    }

    const startDate = date
      ? parse(date, 'yyyy-MM-dd', new Date())
      : new Date()
    const endDate = addDays(startDate, Number(rangeDays) || 7)

    const slotsByDate = await generateSlotsForRange({
      appointmentTypeId,
      startDate,
      endDate,
      providerId,
    })

    const availableSlots = Object.values(slotsByDate)
      .flat()
      .filter((slot) => slot.isAvailable)

    if (availableSlots.length === 0) {
      return NextResponse.json(
        { error: 'No available slots found' },
        { status: 404 }
      )
    }

    const slotSummaries = availableSlots.map((slot) => ({
      startTime: slot.startTime.toISOString(),
      endTime: slot.endTime.toISOString(),
      providerId: slot.providerId,
    }))

    const suggestion = await getGroqSlotSuggestion({
      message,
      slots: slotSummaries,
      timezone,
    })

    const index =
      suggestion.index !== null && suggestion.index < slotSummaries.length
        ? suggestion.index
        : 0

    const slot = slotSummaries[index]

    return NextResponse.json({
      slot,
      response: suggestion.response || 'Suggested available slot',
      availableCount: slotSummaries.length,
    })
  } catch (error) {
    console.error('AI suggest error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
