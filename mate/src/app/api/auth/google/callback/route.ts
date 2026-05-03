import { NextRequest, NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'
import { prisma } from '@/lib/db'
import { signToken } from '@/lib/auth'

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
)

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL(`/auth/login?error=${error}`, req.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/auth/login?error=No code provided', req.url))
  }

  try {
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

    const { email, name, picture, sub: googleId } = payload

    // 3. Find or create user
    let user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      // Create new user (default to seeker if not specified)
      user = await prisma.user.create({
        data: {
          email,
          name: name || 'Google User',
          avatar: picture,
          passwordHash: 'GOOGLE_AUTH', // Placeholder
          role: 'seeker', // Default role
          emailVerified: true, // Google emails are pre-verified
        },
      })
    } else {
      // Update existing user's avatar and verification status if needed
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          avatar: user.avatar || picture,
          emailVerified: true,
        },
      })
    }

    // 4. Create Mate Token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // 5. Build response and redirect
    const response = NextResponse.redirect(new URL('/dashboard', req.url))
    
    // Set cookie for server-side auth
    response.cookies.set('mate_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (err) {
    console.error('Google OAuth Error:', err)
    return NextResponse.redirect(new URL('/auth/login?error=Google authentication failed', req.url))
  }
}
