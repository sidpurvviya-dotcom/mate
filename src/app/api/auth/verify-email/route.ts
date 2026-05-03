import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getTokenFromRequest } from '@/lib/auth'
import { generateOTP, sendVerificationEmail, sendWelcomeEmail } from '@/lib/email'

// POST /api/auth/verify-email  →  Send OTP to real email
export async function POST(req: NextRequest) {
  try {
    const payload = getTokenFromRequest(req)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (user.emailVerified) return NextResponse.json({ error: 'Email already verified' }, { status: 400 })

    // Rate limit: check if OTP was sent in last 60 seconds
    const recentOtp = await prisma.oTP.findFirst({
      where: {
        userId: user.id, type: 'email', used: false,
        createdAt: { gt: new Date(Date.now() - 60_000) },
      },
    })
    if (recentOtp) {
      return NextResponse.json({ error: 'Please wait 60 seconds before requesting another OTP.' }, { status: 429 })
    }

    // Expire old OTPs
    await prisma.oTP.updateMany({
      where: { userId: user.id, type: 'email', used: false },
      data: { used: true },
    })

    const code = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 min

    await prisma.oTP.create({
      data: { userId: user.id, code, type: 'email', expiresAt },
    })

    // Actually send the email
    const result = await sendVerificationEmail(user.email, user.name, code)

    return NextResponse.json({
      success: true,
      sent: result.sent,
      message: result.sent
        ? `Verification code sent to ${user.email}`
        : `OTP generated (SMTP not configured)`,
      // Ethereal preview link shown in dev ONLY if using the test account
      previewUrl: (result.previewUrl && result.previewUrl.includes('ethereal.email')) ? result.previewUrl : undefined,
      // fallback dev OTP only if email wasn't actually sent
      devOtp: (!result.sent && process.env.NODE_ENV === 'development') ? code : undefined,
      email: user.email,
    })
  } catch (error) {
    console.error('Send email OTP error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/auth/verify-email  →  Verify OTP code entered by user
export async function PUT(req: NextRequest) {
  try {
    const payload = getTokenFromRequest(req)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { code } = await req.json()
    if (!code?.trim()) return NextResponse.json({ error: 'OTP code required' }, { status: 400 })

    const otp = await prisma.oTP.findFirst({
      where: {
        userId: payload.userId, type: 'email', used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!otp) {
      return NextResponse.json({
        error: 'OTP expired or not found. Please request a new code.',
      }, { status: 400 })
    }

    if (otp.attempts >= 5) {
      await prisma.oTP.update({ where: { id: otp.id }, data: { used: true } })
      return NextResponse.json({
        error: 'Too many failed attempts. Please request a new OTP.',
      }, { status: 429 })
    }

    if (otp.code !== code.trim()) {
      await prisma.oTP.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } })
      const remaining = 5 - (otp.attempts + 1)
      return NextResponse.json({
        error: `Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
      }, { status: 400 })
    }

    // Mark OTP used → verify email → send welcome email
    await prisma.oTP.update({ where: { id: otp.id }, data: { used: true } })
    const user = await prisma.user.update({
      where: { id: payload.userId },
      data: { emailVerified: true },
    })

    // Fire welcome email (don't await — non-blocking)
    sendWelcomeEmail(user.email, user.name).catch(console.error)

    return NextResponse.json({ success: true, message: '✅ Email verified successfully!' })
  } catch (error) {
    console.error('Verify email OTP error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
