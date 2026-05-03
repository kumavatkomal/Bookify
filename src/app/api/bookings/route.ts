// src/app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendBookingConfirmationEmail } from '@/lib/email'
import { getPaymentCurrency, getStripeClient } from '@/lib/stripe'
import { AppointmentStatus, Prisma } from '@prisma/client'

// POST /api/bookings - Create new booking
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { appointmentTypeId, providerId, startTime, endTime, answers, notes } = body

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
    const { booking, appointmentType } = await prisma.$transaction(
      async (tx) => {
        // Get appointment type with capacity (minimal fields to keep transaction fast)
        const appointmentType = await tx.appointmentType.findUnique({
          where: { id: appointmentTypeId },
          select: {
            id: true,
            name: true,
            location: true,
            maxBookingsPerSlot: true,
            requiresConfirmation: true,
            requiresPayment: true,
            paymentAmount: true,
          },
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

        const hasValidPaymentAmount =
          typeof appointmentType.paymentAmount === 'number' &&
          appointmentType.paymentAmount > 0

        if (appointmentType.requiresPayment && !hasValidPaymentAmount) {
          throw new Error('Invalid payment amount')
        }

        const needsPayment = appointmentType.requiresPayment && hasValidPaymentAmount

        // Determine initial status based on payment + confirmation
        const initialStatus =
          appointmentType.requiresConfirmation || needsPayment ? 'PENDING' : 'CONFIRMED'

        // Create the booking
        const newBooking = await tx.booking.create({
          data: {
            customerId: session.user.id,
            appointmentTypeId,
            providerId,
            startTime: start,
            endTime: end,
            notes: notes || null,
            status: initialStatus,
            answers: answers
              ? {
                  create: answers.map((answer: { questionId: string; answer: string }) => ({
                    questionId: answer.questionId,
                    answer: answer.answer,
                  })),
                }
              : undefined,
          },
          select: {
            id: true,
            appointmentTypeId: true,
            startTime: true,
            endTime: true,
            status: true,
            confirmationCode: true,
            customerId: true,
          },
        })

        return { booking: newBooking, appointmentType }
      },
      { maxWait: 5000, timeout: 10000 }
    )

    const customer = await prisma.user.findUnique({
      where: { id: booking.customerId },
      select: { name: true, email: true },
    })

    const needsPayment =
      appointmentType.requiresPayment &&
      typeof appointmentType.paymentAmount === 'number' &&
      appointmentType.paymentAmount > 0

    if (needsPayment) {
      const stripe = getStripeClient()
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        req.headers.get('origin') ||
        'http://localhost:3000'
      const currency = getPaymentCurrency()
      const unitAmount = Math.round(appointmentType.paymentAmount * 100)

      const checkoutSession = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: session.user.email || undefined,
        client_reference_id: booking.id,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency,
              unit_amount: unitAmount,
              product_data: {
                name: appointmentType.name,
                description: appointmentType.location || undefined,
              },
            },
          },
        ],
        metadata: {
          bookingId: booking.id,
          appointmentTypeId: appointmentType.id,
          customerId: booking.customerId,
        },
        success_url: `${appUrl}/confirmation/${booking.id}?payment=success`,
        cancel_url: `${appUrl}/booking/${appointmentType.id}?payment=cancelled`,
      })

      if (!checkoutSession.url) {
        throw new Error('Payment session creation failed')
      }

      return NextResponse.json(
        {
          message: 'Payment required to confirm booking',
          paymentRequired: true,
          checkoutUrl: checkoutSession.url,
          booking: {
            id: booking.id,
            appointmentType: appointmentType.name,
            startTime: booking.startTime,
            endTime: booking.endTime,
            status: booking.status,
            confirmationCode: booking.confirmationCode,
          },
        },
        { status: 201 }
      )
    }

    // Send confirmation email only if booking is confirmed
    if (booking.status === 'CONFIRMED' && customer?.email && customer?.name) {
      sendBookingConfirmationEmail(
        customer.email,
        customer.name,
        {
          appointmentName: appointmentType.name,
          date: booking.startTime.toLocaleDateString(),
          time: `${booking.startTime.toLocaleTimeString()} - ${booking.endTime.toLocaleTimeString()}`,
          location: appointmentType.location || 'TBD',
          confirmationCode: booking.confirmationCode,
        }
      ).catch((err) => console.error('Email send failed:', err))
    }

    return NextResponse.json(
      {
        message:
          booking.status === 'CONFIRMED'
            ? 'Booking created successfully'
            : 'Booking created and pending confirmation',
        booking: {
          id: booking.id,
          appointmentType: appointmentType.name,
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

    if (error.message === 'Invalid payment amount') {
      return NextResponse.json(
        { error: 'Payment amount is missing or invalid' },
        { status: 400 }
      )
    }

    if (error.message === 'Missing STRIPE_SECRET_KEY') {
      return NextResponse.json(
        { error: 'Payments are not configured on the server' },
        { status: 500 }
      )
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json({ error: 'Booking conflict. Please try again.' }, { status: 409 })
      }
      if (error.code === 'P2003') {
        return NextResponse.json({ error: 'Invalid booking data. Please refresh and try again.' }, { status: 400 })
      }
    }

    if (
      error?.name === 'PrismaClientInitializationError' ||
      error?.name === 'PrismaClientRustPanicError'
    ) {
      return NextResponse.json(
        { error: 'Database connection error. Please retry.' },
        { status: 500 }
      )
    }

    const message =
      process.env.NODE_ENV !== 'production' && error?.message
        ? error.message
        : 'Internal server error'

    return NextResponse.json({ error: message }, { status: 500 })
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
    const appointmentTypeId = searchParams.get('appointmentTypeId')
    const organiserId = searchParams.get('organiserId')
    const organiserScope = searchParams.get('organiser') === 'true'
    const includeAll = searchParams.get('all') === 'true'

    const where: any = {}

    const isPrivileged = session.user.role === 'ADMIN' || session.user.role === 'ORGANISER'

    if (isPrivileged && includeAll && session.user.role === 'ADMIN') {
      // No additional filter
    } else if (isPrivileged && appointmentTypeId) {
      where.appointmentTypeId = appointmentTypeId
      if (session.user.role === 'ORGANISER') {
        where.appointmentType = { organiserId: session.user.id }
      }
    } else if (isPrivileged && organiserScope) {
      where.appointmentType = { organiserId: session.user.id }
    } else if (isPrivileged && organiserId && session.user.role === 'ADMIN') {
      where.appointmentType = { organiserId }
    } else {
      where.customerId = session.user.id
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
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
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
