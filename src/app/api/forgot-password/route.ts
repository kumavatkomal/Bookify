import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date()
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10)

    await prisma.user.update({
      where: { email },
      data: {
        otpCode,
        otpExpiry,
      },
    })

    sendPasswordResetEmail(email, user.name, otpCode).catch((err) => {
      console.error('Failed to send reset email:', err)
    })

    return NextResponse.json({
      message: 'Password reset OTP sent to your email.',
      email,
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
