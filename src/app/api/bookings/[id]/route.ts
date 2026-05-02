// src/app/api/bookings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/bookings/[id] - Get single booking
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        appointmentType: true,
        provider: true,
        answers: {
          include: {
            question: true,
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check if user owns this booking or is admin/organiser
    if (
      booking.customerId !== session.user.id &&
      session.user.role !== 'ADMIN' &&
      session.user.role !== 'ORGANISER'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Get booking error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/bookings/[id] - Update booking (cancel/reschedule)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { status, startTime, endTime } = body

    // Get existing booking
    const existingBooking = await prisma.booking.findUnique({
      where: { id: params.id },
    })

    if (!existingBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check ownership
    if (
      existingBooking.customerId !== session.user.id &&
      session.user.role !== 'ADMIN' &&
      session.user.role !== 'ORGANISER'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Handle cancellation
    if (status === 'CANCELLED') {
      const updatedBooking = await prisma.booking.update({
        where: { id: params.id },
        data: { status: 'CANCELLED' },
        include: {
          appointmentType: true,
        },
      })

      return NextResponse.json({
        message: 'Booking cancelled successfully',
        booking: updatedBooking,
      })
    }

    // Handle rescheduling
    if (startTime && endTime) {
      const newStart = new Date(startTime)
      const newEnd = new Date(endTime)

      // Check if new slot is in the past
      if (newEnd < new Date()) {
        return NextResponse.json(
          { error: 'Cannot reschedule to past slot' },
          { status: 400 }
        )
      }

      const booking = await prisma.$transaction(async (tx) => {
        // Get appointment type
        const appointmentType = await tx.appointmentType.findUnique({
          where: { id: existingBooking.appointmentTypeId },
        })

        if (!appointmentType) {
          throw new Error('Appointment type not found')
        }

        // Check for overlapping bookings in new slot
        const overlappingBookings = await tx.booking.count({
          where: {
            id: { not: params.id }, // Exclude current booking
            appointmentTypeId: existingBooking.appointmentTypeId,
            providerId: existingBooking.providerId,
            status: {
              in: ['CONFIRMED', 'PENDING'],
            },
            OR: [
              {
                AND: [
                  { startTime: { lte: newStart } },
                  { endTime: { gt: newStart } },
                ],
              },
              {
                AND: [
                  { startTime: { lt: newEnd } },
                  { endTime: { gte: newEnd } },
                ],
              },
              {
                AND: [
                  { startTime: { gte: newStart } },
                  { endTime: { lte: newEnd } },
                ],
              },
            ],
          },
        })

        if (overlappingBookings >= appointmentType.maxBookingsPerSlot) {
          throw new Error('New slot is fully booked')
        }

        // Update booking
        return await tx.booking.update({
          where: { id: params.id },
          data: {
            startTime: newStart,
            endTime: newEnd,
            status: 'CONFIRMED',
          },
          include: {
            appointmentType: true,
          },
        })
      })

      return NextResponse.json({
        message: 'Booking rescheduled successfully',
        booking,
      })
    }

    return NextResponse.json({ error: 'Invalid update operation' }, { status: 400 })
  } catch (error: any) {
    console.error('Update booking error:', error)

    if (error.message === 'Appointment type not found') {
      return NextResponse.json({ error: 'Appointment type not found' }, { status: 404 })
    }

    if (error.message === 'New slot is fully booked') {
      return NextResponse.json({ error: 'New slot is fully booked' }, { status: 409 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
