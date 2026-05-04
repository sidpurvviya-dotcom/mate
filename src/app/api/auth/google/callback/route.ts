import { NextRequest, NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'
import { prisma } from '@/lib/db'
import { signToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(error)}`, req.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/auth/login?error=No+code+provided', req.url))
  }

  try {
    // Derive redirect URI from the incoming request URL (always matches what login page sends)
    const redirectUri = `${req.nextUrl.origin}/api/auth/google/callback`

    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    )

    // 1. Exchange code for tokens
    const { tokens } = await client.getToken(code)
    client.setCredentials(tokens)

    // 2. Get user info from ID token
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()

    if (!payload || !payload.email) {
      throw new Error('Invalid Google payload')
    }

    const { email, name, picture } = payload

    // 3. Find or create user
    let user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || 'Google User',
          avatar: picture,
          passwordHash: 'GOOGLE_AUTH',
          role: 'seeker',
          emailVerified: true,
          updatedAt: new Date(),
        },
      })
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          avatar: user.avatar || picture,
          emailVerified: true,
          updatedAt: new Date(),
        },
      })
    }

    // 4. Create JWT token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // 5. Redirect to My Profile
    const response = NextResponse.redirect(new URL('/dashboard/profile', req.url))

    response.cookies.set('mate_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (err) {
    console.error('Google OAuth Error:', err)
    return NextResponse.redirect(new URL('/auth/login?error=Google+authentication+failed', req.url))
  }
}

