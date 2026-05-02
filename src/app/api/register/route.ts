// src/app/api/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as bcrypt from 'bcryptjs'
import { sendOTPEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password } = body

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    
    // OTP expires in 10 minutes
    const otpExpiry = new Date()
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        otpCode,
        otpExpiry,
        isVerified: false,
        role: 'CUSTOMER', // Default role
      }
    })

    // Send OTP email (async, non-blocking)
    sendOTPEmail(email, name, otpCode).catch(err => {
      console.error('Failed to send OTP email:', err)
    })

    return NextResponse.json({
      message: 'User created successfully. Please check your email for OTP.',
      userId: user.id,
      email: user.email
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
