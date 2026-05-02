// src/app/api/bookings/[id]/confirm/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendBookingConfirmationEmail } from '@/lib/email'

// POST /api/bookings/[id]/confirm - Manually confirm a booking (Organiser/Admin only)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only organisers and admins can confirm bookings
    if (session.user.role !== 'ORGANISER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        appointmentType: true,
        customer: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check if organiser owns this appointment type
    if (
      session.user.role === 'ORGANISER' &&
      booking.appointmentType.organiserId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if booking is pending
    if (booking.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Booking is already ${booking.status.toLowerCase()}` },
        { status: 400 }
      )
    }

    // Update booking status to confirmed
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: { status: 'CONFIRMED' },
      include: {
        appointmentType: true,
        customer: true,
        provider: true,
      },
    })

    // Send confirmation email
    sendBookingConfirmationEmail(
      updatedBooking.customer.email,
      updatedBooking.customer.name,
      {
        appointmentName: updatedBooking.appointmentType.name,
        date: updatedBooking.startTime.toLocaleDateString(),
        time: `${updatedBooking.startTime.toLocaleTimeString()} - ${updatedBooking.endTime.toLocaleTimeString()}`,
        location: updatedBooking.appointmentType.location || 'TBD',
        confirmationCode: updatedBooking.confirmationCode,
      }
    ).catch((err) => console.error('Email send failed:', err))

    return NextResponse.json({
      message: 'Booking confirmed successfully',
      booking: updatedBooking,
    })
  } catch (error) {
    console.error('Confirm booking error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/bookings/[id]/reject - Reject a booking (Organiser/Admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only organisers and admins can reject bookings
    if (session.user.role !== 'ORGANISER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        appointmentType: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check if organiser owns this appointment type
    if (
      session.user.role === 'ORGANISER' &&
      booking.appointmentType.organiserId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update booking status to cancelled
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: { status: 'CANCELLED' },
    })

    return NextResponse.json({
      message: 'Booking rejected successfully',
      booking: updatedBooking,
    })
  } catch (error) {
    console.error('Reject booking error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
