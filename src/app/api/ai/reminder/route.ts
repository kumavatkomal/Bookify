import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { getGroqReminderCopy } from '@/lib/groq'
import { sendReminderEmail } from '@/lib/email'

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
    const bookingId = typeof body.bookingId === 'string' ? body.bookingId : ''
    const tone = typeof body.tone === 'string' ? body.tone : undefined

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId is required' }, { status: 400 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        appointmentType: true,
        customer: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (session.user.role === 'ORGANISER') {
      if (booking.appointmentType.organiserId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const date = format(booking.startTime, 'MMM d, yyyy')
    const time = `${format(booking.startTime, 'HH:mm')} - ${format(booking.endTime, 'HH:mm')}`

    const aiCopy = await getGroqReminderCopy({
      customerName: booking.customer.name,
      appointmentName: booking.appointmentType.name,
      date,
      time,
      location: booking.appointmentType.location || 'TBD',
      tone,
    })

    const subject = aiCopy?.subject || 'Reminder: Upcoming appointment'
    const bodyText = aiCopy?.body ||
      `Hi ${booking.customer.name}, this is a reminder for your ${booking.appointmentType.name} on ${date} at ${time}. Please arrive on time.`

    await sendReminderEmail({
      to: booking.customer.email,
      name: booking.customer.name,
      appointmentName: booking.appointmentType.name,
      date,
      time,
      location: booking.appointmentType.location || 'TBD',
      subject,
      message: bodyText,
    })

    return NextResponse.json({ message: 'Reminder sent' })
  } catch (error) {
    console.error('AI reminder error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
