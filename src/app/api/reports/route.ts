// src/app/api/reports/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/reports - Get reports and insights
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only organisers and admins can view reports
    if (session.user.role !== 'ORGANISER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'overview'
    const organiserId = searchParams.get('organiserId')

    // Build where clause based on role
    const bookingWhere: any = {}
    const appointmentTypeWhere: any = {}

    if (session.user.role === 'ORGANISER') {
      appointmentTypeWhere.organiserId = session.user.id
      bookingWhere.appointmentType = { organiserId: session.user.id }
    } else if (organiserId && session.user.role === 'ADMIN') {
      appointmentTypeWhere.organiserId = organiserId
      bookingWhere.appointmentType = { organiserId }
    }

    if (type === 'overview') {
      // Total appointments
      const totalAppointments = await prisma.appointmentType.count({
        where: appointmentTypeWhere,
      })

      // Total bookings
      const totalBookings = await prisma.booking.count({
        where: bookingWhere,
      })

      // Bookings by status
      const bookingsByStatus = await prisma.booking.groupBy({
        by: ['status'],
        where: bookingWhere,
        _count: {
          id: true,
        },
      })

      // Upcoming bookings
      const upcomingBookings = await prisma.booking.count({
        where: {
          ...bookingWhere,
          startTime: {
            gte: new Date(),
          },
          status: {
            in: ['CONFIRMED', 'PENDING'],
          },
        },
      })

      // Completed bookings
      const completedBookings = await prisma.booking.count({
        where: {
          ...bookingWhere,
          status: 'COMPLETED',
        },
      })

      return NextResponse.json({
        overview: {
          totalAppointments,
          totalBookings,
          upcomingBookings,
          completedBookings,
          bookingsByStatus: bookingsByStatus.map((item) => ({
            status: item.status,
            count: item._count.id,
          })),
        },
      })
    }

    if (type === 'peak-hours') {
      // Get all bookings with time
      const bookings = await prisma.booking.findMany({
        where: bookingWhere,
        select: {
          startTime: true,
        },
      })

      // Group by hour
      const hourCounts: Record<number, number> = {}
      bookings.forEach((booking) => {
        const hour = booking.startTime.getHours()
        hourCounts[hour] = (hourCounts[hour] || 0) + 1
      })

      const peakHours = Object.entries(hourCounts)
        .map(([hour, count]) => ({
          hour: parseInt(hour),
          count,
        }))
        .sort((a, b) => b.count - a.count)

      return NextResponse.json({ peakHours })
    }

    if (type === 'provider-utilization') {
      // Get provider booking counts
      const providerStats = await prisma.providerSlot.findMany({
        where: {
          isActive: true,
        },
        include: {
          bookings: {
            where: {
              status: {
                in: ['CONFIRMED', 'COMPLETED'],
              },
            },
          },
          _count: {
            select: {
              bookings: true,
            },
          },
        },
      })

      const utilization = providerStats.map((provider) => ({
        id: provider.id,
        name: provider.name,
        totalBookings: provider._count.bookings,
        confirmedBookings: provider.bookings.filter((b) => b.status === 'CONFIRMED').length,
        completedBookings: provider.bookings.filter((b) => b.status === 'COMPLETED').length,
      }))

      return NextResponse.json({ providerUtilization: utilization })
    }

    if (type === 'appointment-performance') {
      // Get appointment type booking counts
      const appointmentStats = await prisma.appointmentType.findMany({
        where: appointmentTypeWhere,
        include: {
          _count: {
            select: {
              bookings: true,
            },
          },
          bookings: {
            where: {
              status: {
                in: ['CONFIRMED', 'COMPLETED'],
              },
            },
          },
        },
      })

      const performance = appointmentStats.map((apt) => ({
        id: apt.id,
        name: apt.name,
        totalBookings: apt._count.bookings,
        confirmedBookings: apt.bookings.filter((b) => b.status === 'CONFIRMED').length,
        completedBookings: apt.bookings.filter((b) => b.status === 'COMPLETED').length,
        isPublished: apt.isPublished,
      }))

      return NextResponse.json({ appointmentPerformance: performance })
    }

    return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
  } catch (error) {
    console.error('Get reports error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
