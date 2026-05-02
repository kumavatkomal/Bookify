// src/app/api/providers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/providers/[id] - Get single provider
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const provider = await prisma.providerSlot.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        appointmentTypes: {
          include: {
            appointmentType: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        bookings: {
          where: {
            status: {
              in: ['CONFIRMED', 'PENDING'],
            },
            startTime: {
              gte: new Date(),
            },
          },
          orderBy: {
            startTime: 'asc',
          },
          take: 10,
        },
      },
    })

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
    }

    return NextResponse.json({ provider })
  } catch (error) {
    console.error('Get provider error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/providers/[id] - Update provider
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only organisers and admins can update providers
    if (session.user.role !== 'ORGANISER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { name, userId, isActive } = body

    const existingProvider = await prisma.providerSlot.findUnique({
      where: { id: params.id },
    })

    if (!existingProvider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
    }

    // If userId is provided, verify the user exists
    if (userId !== undefined && userId !== null) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (userId !== undefined) updateData.userId = userId
    if (isActive !== undefined) updateData.isActive = Boolean(isActive)

    const provider = await prisma.providerSlot.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: 'Provider updated successfully',
      provider,
    })
  } catch (error) {
    console.error('Update provider error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/providers/[id] - Delete provider
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can delete providers
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const existingProvider = await prisma.providerSlot.findUnique({
      where: { id: params.id },
      include: {
        bookings: {
          where: {
            status: {
              in: ['CONFIRMED', 'PENDING'],
            },
            startTime: {
              gte: new Date(),
            },
          },
        },
      },
    })

    if (!existingProvider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
    }

    // Check if provider has upcoming bookings
    if (existingProvider.bookings.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete provider with upcoming bookings' },
        { status: 400 }
      )
    }

    await prisma.providerSlot.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: 'Provider deleted successfully',
    })
  } catch (error) {
    console.error('Delete provider error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
