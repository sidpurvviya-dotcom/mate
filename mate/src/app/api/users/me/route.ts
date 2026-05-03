import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getTokenFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const payload = getTokenFromRequest(req)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true, email: true, name: true, role: true, avatar: true, bio: true,
        phone: true, emailVerified: true, phoneVerified: true,
        budget: true, smokingOk: true, petsOk: true, workSchedule: true,
        lifestyle: true, cleanlinessLevel: true, preferredCity: true, preferredState: true, preferredArea: true,
        createdAt: true,
      },
    })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const payload = getTokenFromRequest(req)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const allowed = ['name', 'bio', 'phone', 'avatar', 'budget', 'smokingOk', 'petsOk',
      'workSchedule', 'lifestyle', 'cleanlinessLevel', 'preferredCity', 'preferredState', 'preferredArea']

    const updates: Record<string, unknown> = {}
    for (const key of allowed) {
      if (key in body) updates[key] = body[key]
    }

    const user = await prisma.user.update({
      where: { id: payload.userId },
      data: updates,
      select: {
        id: true, email: true, name: true, role: true, avatar: true, bio: true,
        phone: true, emailVerified: true, phoneVerified: true,
        budget: true, smokingOk: true, petsOk: true, workSchedule: true,
        lifestyle: true, cleanlinessLevel: true, preferredCity: true, preferredState: true, preferredArea: true,
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
