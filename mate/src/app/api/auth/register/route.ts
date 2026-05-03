import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, role, phone } = await req.json()

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    // Basic Indian phone validation (10 digits, starts 6-9)
    const cleanPhone = phone.replace(/\s/g, '')
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return NextResponse.json({ error: 'Enter a valid 10-digit Indian mobile number' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role,
        phone: `+91${cleanPhone}`,
      },
    })

    const token = signToken({ userId: user.id, email: user.email, role: user.role })

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id, email: user.email, name: user.name,
        role: user.role, emailVerified: user.emailVerified,
        phone: user.phone, phoneVerified: user.phoneVerified,
      },
      token,
    })

    response.cookies.set('mate_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
