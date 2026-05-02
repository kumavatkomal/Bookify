// src/app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendBookingConfirmationEmail } from '@/lib/email'
import { AppointmentStatus } from '@prisma/client'

// POST /api/bookings - Create new booking
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { appointmentTypeId, providerId, startTime, endTime, answers } = body

    // Validate required fields
    if (!appointmentTypeId || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'appointmentTypeId, startTime, and endTime are required' },
        { status: 400 }
      )
    }

    const start = new Date(startTime)
    const end = new Date(endTime)

    // Check if slot is in the past
    if (end < new Date()) {
      return NextResponse.json(
        { error: 'Cannot book past slots' },
        { status: 400 }
      )
    }

    // Use transaction to prevent double booking
    const booking = await prisma.$transaction(async (tx) => {
      // Get appointment type with capacity
      const appointmentType = await tx.appointmentType.findUnique({
        where: { id: appointmentTypeId },
      })

      if (!appointmentType) {
        throw new Error('Appointment type not found')
      }

      // Check for overlapping bookings
      const overlappingBookings = await tx.booking.count({
        where: {
          appointmentTypeId,
          providerId,
          status: {
            in: ['CONFIRMED', 'PENDING'],
          },
          OR: [
            {
              AND: [
                { startTime: { lte: start } },
                { endTime: { gt: start } },
              ],
            },
            {
              AND: [
                { startTime: { lt: end } },
                { endTime: { gte: end } },
              ],
            },
            {
              AND: [
                { startTime: { gte: start } },
                { endTime: { lte: end } },
              ],
            },
          ],
        },
      })

      // Check capacity
      if (overlappingBookings >= appointmentType.maxBookingsPerSlot) {
        throw new Error('Slot is fully booked')
      }

      // Create the booking
      const newBooking = await tx.booking.create({
        data: {
          customerId: session.user.id,
          appointmentTypeId,
          providerId,
          startTime: start,
          endTime: end,
          status: 'CONFIRMED',
          answers: answers
            ? {
                create: answers.map((answer: { questionId: string; answer: string }) => ({
                  questionId: answer.questionId,
                  answer: answer.answer,
                })),
              }
            : undefined,
        },
        include: {
          customer: true,
          appointmentType: true,
          provider: true,
          answers: {
            include: {
              question: true,
            },
          },
        },
      })

      return newBooking
    })

    // Send confirmation email (async, don't wait)
    sendBookingConfirmationEmail(
      booking.customer.email,
      booking.customer.name,
      {
        appointmentName: booking.appointmentType.name,
        date: booking.startTime.toLocaleDateString(),
        time: `${booking.startTime.toLocaleTimeString()} - ${booking.endTime.toLocaleTimeString()}`,
        location: booking.appointmentType.location || 'TBD',
        confirmationCode: booking.confirmationCode,
      }
    ).catch((err) => console.error('Email send failed:', err))

    return NextResponse.json(
      {
        message: 'Booking created successfully',
        booking: {
          id: booking.id,
          appointmentType: booking.appointmentType.name,
          startTime: booking.startTime,
          endTime: booking.endTime,
          status: booking.status,
          confirmationCode: booking.confirmationCode,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Booking error:', error)
    
    if (error.message === 'Appointment type not found') {
      return NextResponse.json({ error: 'Appointment type not found' }, { status: 404 })
    }
    
    if (error.message === 'Slot is fully booked') {
      return NextResponse.json({ error: 'Slot is fully booked' }, { status: 409 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/bookings - Get user's bookings
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') as AppointmentStatus | null
    const upcoming = searchParams.get('upcoming') === 'true'

    const where: any = {
      customerId: session.user.id,
    }

    if (status) {
      where.status = status
    }

    if (upcoming) {
      where.startTime = {
        gte: new Date(),
      }
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        appointmentType: true,
        provider: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
