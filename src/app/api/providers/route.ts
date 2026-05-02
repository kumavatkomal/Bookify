// src/app/api/providers/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/providers - Get all providers/resources
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const active = searchParams.get('active')
    const mine = searchParams.get('mine') === 'true'

    const where: any = {}

    // Filter by active status
    if (active === 'true') {
      where.isActive = true
    } else if (active === 'false') {
      where.isActive = false
    }

    // Filter by user's providers (for organisers)
    if (mine && session.user.role === 'ORGANISER') {
      where.userId = session.user.id
    }

    const providers = await prisma.providerSlot.findMany({
      where,
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
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ providers })
  } catch (error) {
    console.error('Get providers error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/providers - Create new provider/resource
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only organisers and admins can create providers
    if (session.user.role !== 'ORGANISER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { name, userId, isActive } = body

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    // If userId is provided, verify the user exists
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
    }

    const provider = await prisma.providerSlot.create({
      data: {
        name,
        userId: userId || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
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

    return NextResponse.json(
      {
        message: 'Provider created successfully',
        provider,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create provider error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
