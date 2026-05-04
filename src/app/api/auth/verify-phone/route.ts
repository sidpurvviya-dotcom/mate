import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getTokenFromRequest } from '@/lib/auth'
import { generateOTP } from '@/lib/email'

// In production: use Twilio / MSG91 / Fast2SMS to send real SMS
// In dev mode: we return the OTP in the response for testing
async function sendSMS(phone: string, otp: string, name: string): Promise<boolean> {
  // TODO: Replace with real SMS provider
  // Example (Twilio):
  //   const twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH)
  //   await twilio.messages.create({ body: `Mate OTP: ${otp}`, from: process.env.TWILIO_PHONE, to: phone })
  
  console.log(`📱 [DEV SMS] To: ${phone} | OTP: ${otp} | Name: ${name}`)
  return false // returns false = SMS not actually sent (dev mode)
}

// POST /api/auth/verify-phone  → send OTP
export async function POST(req: NextRequest) {
  try {
    const payload = getTokenFromRequest(req)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (user.phoneVerified) return NextResponse.json({ error: 'Phone already verified' }, { status: 400 })
    if (!user.phone) return NextResponse.json({ error: 'No phone number on file. Please add one in your profile.' }, { status: 400 })

    // Invalidate existing phone OTPs
    await prisma.oTP.updateMany({
      where: { userId: user.id, type: 'phone', used: false },
      data: { used: true },
    })

    const code = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 min

    await prisma.oTP.create({
      data: { userId: user.id, code, type: 'phone', expiresAt },
    })

    const smsSent = await sendSMS(user.phone, code, user.name)

    return NextResponse.json({
      success: true,
      message: smsSent
        ? `OTP sent to ${user.phone}`
        : 'OTP generated (SMS provider not configured)',
      phone: user.phone,
      // Only expose devOtp in development
      devOtp: process.env.NODE_ENV === 'development' ? code : undefined,
    })
  } catch (error) {
    console.error('Send phone OTP error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/auth/verify-phone  → verify OTP
export async function PUT(req: NextRequest) {
  try {
    const payload = getTokenFromRequest(req)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { code } = await req.json()
    if (!code?.trim()) return NextResponse.json({ error: 'OTP code required' }, { status: 400 })

    const otp = await prisma.oTP.findFirst({
      where: {
        userId: payload.userId,
        type: 'phone',
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!otp) {
      return NextResponse.json({ error: 'OTP expired or not found. Please request a new one.' }, { status: 400 })
    }

    if (otp.attempts >= 5) {
      await prisma.oTP.update({ where: { id: otp.id }, data: { used: true } })
      return NextResponse.json({ error: 'Too many failed attempts. Request a new OTP.' }, { status: 429 })
    }

    if (otp.code !== code.trim()) {
      await prisma.oTP.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } })
      const remaining = 5 - (otp.attempts + 1)
      return NextResponse.json({
        error: `Invalid OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
      }, { status: 400 })
    }

    // Mark OTP used and phone as verified
    await prisma.oTP.update({ where: { id: otp.id }, data: { used: true } })
    await prisma.user.update({
      where: { id: payload.userId },
      data: { phoneVerified: true, updatedAt: new Date() },
    })

    return NextResponse.json({ success: true, message: '✅ Phone number verified successfully!' })
  } catch (error) {
    console.error('Verify phone OTP error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/auth/verify-phone  → update phone number
export async function PATCH(req: NextRequest) {
  try {
    const payload = getTokenFromRequest(req)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { phone } = await req.json()
    const cleanPhone = phone?.replace(/\s/g, '').replace(/^\+91/, '')

    if (!cleanPhone || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      return NextResponse.json({ error: 'Enter a valid 10-digit Indian mobile number' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: payload.userId },
      data: { phone: `+91${cleanPhone}`, phoneVerified: false, updatedAt: new Date() },
    })

    return NextResponse.json({ success: true, phone: `+91${cleanPhone}` })
  } catch (error) {
    console.error('Update phone error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
