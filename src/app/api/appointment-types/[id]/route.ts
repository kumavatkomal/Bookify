import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function parseBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return value.toLowerCase() === 'true'
  return undefined
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const shareToken = searchParams.get('shareToken')
    const session = await getServerSession(authOptions)

    const appointmentType = await prisma.appointmentType.findUnique({
      where: { id: params.id },
      include: {
        weeklySchedules: true,
        questions: true,
        providers: { include: { provider: true } },
        organiser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            isVerified: true,
          },
        },
      },
    })

    if (!appointmentType) {
      return NextResponse.json(
        { error: 'Appointment type not found' },
        { status: 404 }
      )
    }

    if (!appointmentType.isPublished) {
      const isOwner =
        session?.user && session.user.id === appointmentType.organiserId
      const isAdmin = session?.user?.role === 'ADMIN'
      const tokenMatches = shareToken === appointmentType.shareToken

      if (!isOwner && !isAdmin && !tokenMatches) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    return NextResponse.json({ appointmentType })
  } catch (error) {
    console.error('Appointment type GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ORGANISER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const existing = await prisma.appointmentType.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Appointment type not found' },
        { status: 404 }
      )
    }

    if (session.user.role !== 'ADMIN' && existing.organiserId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const {
      name,
      description,
      duration,
      isPublished,
      maxBookingsPerSlot,
      requiresPayment,
      paymentAmount,
      requiresConfirmation,
      scheduleType,
      assignmentType,
      location,
      weeklySchedules,
      questions,
      providerIds,
    } = body

    const requiresPaymentBool = parseBoolean(requiresPayment)
    const isPublishedBool = parseBoolean(isPublished)
    const requiresConfirmationBool = parseBoolean(requiresConfirmation)

    const updates: any = {
      ...(name !== undefined ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(duration !== undefined ? { duration: Number(duration) } : {}),
      ...(isPublishedBool !== undefined ? { isPublished: isPublishedBool } : {}),
      ...(maxBookingsPerSlot !== undefined
        ? { maxBookingsPerSlot: Number(maxBookingsPerSlot) }
        : {}),
      ...(requiresPaymentBool !== undefined
        ? { requiresPayment: requiresPaymentBool }
        : {}),
      ...(requiresConfirmationBool !== undefined
        ? { requiresConfirmation: requiresConfirmationBool }
        : {}),
      ...(scheduleType ? { scheduleType } : {}),
      ...(assignmentType ? { assignmentType } : {}),
      ...(location !== undefined ? { location } : {}),
    }

    if (requiresPaymentBool === false) {
      updates.paymentAmount = null
    } else if (paymentAmount !== undefined) {
      updates.paymentAmount = Number(paymentAmount)
    }

    await prisma.appointmentType.update({
      where: { id: params.id },
      data: updates,
    })

    if (Array.isArray(weeklySchedules)) {
      await prisma.weeklySchedule.deleteMany({
        where: { appointmentTypeId: params.id },
      })

      if (weeklySchedules.length > 0) {
        await prisma.weeklySchedule.createMany({
          data: weeklySchedules.map((schedule: any) => ({
            appointmentTypeId: params.id,
            dayOfWeek: Number(schedule.dayOfWeek),
            startTime: schedule.startTime,
            endTime: schedule.endTime,
          })),
        })
      }
    }

    if (Array.isArray(questions)) {
      await prisma.question.deleteMany({
        where: { appointmentTypeId: params.id },
      })

      if (questions.length > 0) {
        await prisma.question.createMany({
          data: questions.map((question: any, index: number) => ({
            appointmentTypeId: params.id,
            questionText: question.questionText,
            isRequired: Boolean(question.isRequired),
            order: Number(question.order ?? index),
          })),
        })
      }
    }

    if (Array.isArray(providerIds)) {
      await prisma.appointmentTypeProvider.deleteMany({
        where: { appointmentTypeId: params.id },
      })

      if (providerIds.length > 0) {
        await prisma.appointmentTypeProvider.createMany({
          data: providerIds.map((providerId: string) => ({
            appointmentTypeId: params.id,
            providerId,
          })),
        })
      }
    }

    const updated = await prisma.appointmentType.findUnique({
      where: { id: params.id },
      include: {
        weeklySchedules: true,
        questions: true,
        providers: { include: { provider: true } },
      },
    })

    return NextResponse.json({ appointmentType: updated })
  } catch (error) {
    console.error('Appointment type PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ORGANISER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const existing = await prisma.appointmentType.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Appointment type not found' },
        { status: 404 }
      )
    }

    if (session.user.role !== 'ADMIN' && existing.organiserId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.appointmentType.delete({ where: { id: params.id } })

    return NextResponse.json({ message: 'Appointment type deleted' })
  } catch (error) {
    console.error('Appointment type DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
