import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function parseBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return value.toLowerCase() === 'true'
  return undefined
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(req.url)
    const publishedParam = searchParams.get('published')
    const mine = searchParams.get('mine') === 'true'
    const organiserId = searchParams.get('organiserId')
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true'

    const where: Record<string, any> = {}

    if (mine) {
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      where.organiserId = session.user.id
    } else if (organiserId) {
      where.organiserId = organiserId
    }

    if (publishedParam === 'true') {
      where.isPublished = true
    } else if (publishedParam === 'false') {
      where.isPublished = false
    } else if (!includeUnpublished && (!session?.user || session.user.role === 'CUSTOMER')) {
      where.isPublished = true
    }

    const appointmentTypes = await prisma.appointmentType.findMany({
      where,
      include: {
        weeklySchedules: true,
        questions: true,
        providers: {
          include: { provider: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ appointmentTypes })
  } catch (error) {
    console.error('Appointment types GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
      organiserId,
      weeklySchedules,
      questions,
      providerIds,
    } = body

    if (!name || !duration) {
      return NextResponse.json(
        { error: 'name and duration are required' },
        { status: 400 }
      )
    }

    const resolvedOrganiserId =
      session.user.role === 'ADMIN' && organiserId
        ? organiserId
        : session.user.id

    const requiresPaymentBool = parseBoolean(requiresPayment)
    const isPublishedBool = parseBoolean(isPublished)
    const requiresConfirmationBool = parseBoolean(requiresConfirmation)

    const data: any = {
      name,
      description,
      duration: Number(duration),
      isPublished: isPublishedBool ?? false,
      maxBookingsPerSlot: maxBookingsPerSlot ? Number(maxBookingsPerSlot) : 1,
      requiresPayment: requiresPaymentBool ?? false,
      paymentAmount: requiresPaymentBool ? Number(paymentAmount || 0) : null,
      requiresConfirmation: requiresConfirmationBool ?? false,
      scheduleType: scheduleType || 'WEEKLY',
      assignmentType: assignmentType || 'AUTO',
      location,
      organiserId: resolvedOrganiserId,
    }

    if (Array.isArray(weeklySchedules) && weeklySchedules.length > 0) {
      data.weeklySchedules = {
        create: weeklySchedules.map((schedule: any) => ({
          dayOfWeek: Number(schedule.dayOfWeek),
          startTime: schedule.startTime,
          endTime: schedule.endTime,
        })),
      }
    }

    if (Array.isArray(questions) && questions.length > 0) {
      data.questions = {
        create: questions.map((question: any, index: number) => ({
          questionText: question.questionText,
          isRequired: Boolean(question.isRequired),
          order: Number(question.order ?? index),
        })),
      }
    }

    if (Array.isArray(providerIds) && providerIds.length > 0) {
      data.providers = {
        create: providerIds.map((providerId: string) => ({ providerId })),
      }
    }

    const appointmentType = await prisma.appointmentType.create({
      data,
      include: {
        weeklySchedules: true,
        questions: true,
        providers: { include: { provider: true } },
      },
    })

    return NextResponse.json({ appointmentType }, { status: 201 })
  } catch (error) {
    console.error('Appointment types POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
