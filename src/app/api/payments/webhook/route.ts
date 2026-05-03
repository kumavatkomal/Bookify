import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { getStripeClient } from '@/lib/stripe'
import { sendBookingConfirmationEmail } from '@/lib/email'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Missing STRIPE_WEBHOOK_SECRET' }, { status: 500 })
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Missing STRIPE_SECRET_KEY' }, { status: 500 })
  }

  const body = await req.text()

  let event: Stripe.Event
  try {
    const stripe = getStripeClient()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error('Stripe webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const bookingId = session.metadata?.bookingId || session.client_reference_id

    if (bookingId && session.payment_status === 'paid') {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          appointmentType: true,
          customer: true,
        },
      })

      if (booking && !booking.isPaid) {
        const shouldConfirm = !booking.appointmentType.requiresConfirmation

        const updatedBooking = await prisma.booking.update({
          where: { id: bookingId },
          data: {
            isPaid: true,
            status: shouldConfirm ? 'CONFIRMED' : booking.status,
          },
          include: {
            appointmentType: true,
            customer: true,
          },
        })

        if (shouldConfirm && updatedBooking.customer.email) {
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
        }
      }
    }
  }

  return NextResponse.json({ received: true })
}
