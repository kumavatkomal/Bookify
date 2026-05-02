// src/app/api/slots/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { generateSlots, generateSlotsForRange, getNextAvailableSlot } from '@/lib/slots'
import { parse, addDays } from 'date-fns'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const appointmentTypeId = searchParams.get('appointmentTypeId')
    const date = searchParams.get('date')
    const providerId = searchParams.get('providerId') || undefined
    const range = searchParams.get('range') // 'week' or 'month'
    const nextAvailable = searchParams.get('nextAvailable') === 'true'

    // Validation
    if (!appointmentTypeId) {
      return NextResponse.json(
        { error: 'appointmentTypeId is required' },
        { status: 400 }
      )
    }

    // Get next available slot
    if (nextAvailable) {
      const fromDate = date
        ? parse(date, 'yyyy-MM-dd', new Date())
        : new Date()

      const slot = await getNextAvailableSlot({
        appointmentTypeId,
        fromDate,
        providerId,
      })

      if (!slot) {
        return NextResponse.json(
          { message: 'No available slots found in the next 30 days' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        slot,
        message: 'Next available slot found',
      })
    }

    // Get slots for a range
    if (range) {
      if (!date) {
        return NextResponse.json(
          { error: 'date is required for range queries' },
          { status: 400 }
        )
      }

      const startDate = parse(date, 'yyyy-MM-dd', new Date())
      const days = range === 'week' ? 7 : 30
      const endDate = addDays(startDate, days)

      const slots = await generateSlotsForRange({
        appointmentTypeId,
        startDate,
        endDate,
        providerId,
      })

      return NextResponse.json({
        slots,
        range,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      })
    }

    // Get slots for a single date
    if (!date) {
      return NextResponse.json(
        { error: 'date is required' },
        { status: 400 }
      )
    }

    const targetDate = parse(date, 'yyyy-MM-dd', new Date())

    const slots = await generateSlots({
      appointmentTypeId,
      date: targetDate,
      providerId,
    })

    return NextResponse.json({
      slots,
      date: targetDate.toISOString(),
      count: slots.length,
      availableCount: slots.filter((s) => s.isAvailable).length,
    })
  } catch (error) {
    console.error('Slots API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
