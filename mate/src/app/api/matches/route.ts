import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getTokenFromRequest } from '@/lib/auth'

// Matching algorithm: score each property against seeker preferences
function calculateMatchScore(
  seeker: { budget?: number | null; smokingOk: boolean; petsOk: boolean; lifestyle?: string | null; workSchedule?: string | null },
  property: { rent: number; smokingAllowed: boolean; petsAllowed: boolean }
): number {
  let score = 0
  let maxScore = 0

  // Budget compatibility (40 pts)
  maxScore += 40
  if (seeker.budget) {
    if (property.rent <= seeker.budget) score += 40
    else if (property.rent <= seeker.budget * 1.1) score += 25
    else if (property.rent <= seeker.budget * 1.2) score += 10
  } else {
    score += 20 // neutral
    maxScore += 0
  }

  // Smoking preference (20 pts)
  maxScore += 20
  if (!property.smokingAllowed && !seeker.smokingOk) score += 20
  else if (property.smokingAllowed && seeker.smokingOk) score += 20
  else if (property.smokingAllowed && !seeker.smokingOk) score += 0
  else score += 15

  // Pet preference (20 pts)
  maxScore += 20
  if (!property.petsAllowed && !seeker.petsOk) score += 20
  else if (property.petsAllowed && seeker.petsOk) score += 20
  else score += 10

  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
  return Math.min(percentage, 100)
}

export async function GET(req: NextRequest) {
  try {
    const payload = getTokenFromRequest(req)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const seeker = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!seeker) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const properties = await prisma.property.findMany({
      where: { available: true },
      include: {
        owner: { select: { id: true, name: true, avatar: true, emailVerified: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const scored = properties.map((p) => ({
      ...p,
      amenities: JSON.parse(p.amenities),
      photos: JSON.parse(p.photos),
      matchScore: calculateMatchScore(seeker, p),
    }))

    scored.sort((a, b) => b.matchScore - a.matchScore)

    return NextResponse.json({ matches: scored.slice(0, 20) })
  } catch (error) {
    console.error('Match error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
