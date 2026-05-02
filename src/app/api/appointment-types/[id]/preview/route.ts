// src/app/api/appointment-types/[id]/preview/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/appointment-types/[id]/preview - Preview appointment (public or via share token)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const shareToken = searchParams.get('token')

    // Find appointment type
    const appointmentType = await prisma.appointmentType.findUnique({
      where: { id: params.id },
      include: {
        organiser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        weeklySchedules: {
          orderBy: {
            dayOfWeek: 'asc',
          },
        },
        questions: {
          orderBy: {
            order: 'asc',
          },
        },
        providers: {
          include: {
            provider: {
              select: {
                id: true,
                name: true,
                isActive: true,
              },
            },
          },
        },
      },
    })

    if (!appointmentType) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Check access: either published or valid share token
    if (!appointmentType.isPublished) {
      if (!shareToken || shareToken !== appointmentType.shareToken) {
        return NextResponse.json(
          { error: 'This appointment is not published. Valid share token required.' },
          { status: 403 }
        )
      }
    }

    // Return preview data
    return NextResponse.json({
      preview: {
        id: appointmentType.id,
        name: appointmentType.name,
        description: appointmentType.description,
        duration: appointmentType.duration,
        location: appointmentType.location,
        isPublished: appointmentType.isPublished,
        requiresPayment: appointmentType.requiresPayment,
        paymentAmount: appointmentType.paymentAmount,
        requiresConfirmation: appointmentType.requiresConfirmation,
        maxBookingsPerSlot: appointmentType.maxBookingsPerSlot,
        scheduleType: appointmentType.scheduleType,
        assignmentType: appointmentType.assignmentType,
        organiser: {
          name: appointmentType.organiser.name,
          email: appointmentType.organiser.email,
        },
        weeklySchedules: appointmentType.weeklySchedules.map((schedule) => ({
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
        })),
        questions: appointmentType.questions.map((q) => ({
          id: q.id,
          questionText: q.questionText,
          isRequired: q.isRequired,
          order: q.order,
        })),
        providers: appointmentType.providers
          .filter((p) => p.provider.isActive)
          .map((p) => ({
            id: p.provider.id,
            name: p.provider.name,
          })),
      },
    })
  } catch (error) {
    console.error('Preview appointment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
