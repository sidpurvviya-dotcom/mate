import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const city = searchParams.get('city')
    const lifestyle = searchParams.get('lifestyle')
    const workSchedule = searchParams.get('workSchedule')
    const smokingOk = searchParams.get('smokingOk')
    const petsOk = searchParams.get('petsOk')
    const maxBudget = searchParams.get('maxBudget')

    const where: Record<string, unknown> = { 
      role: 'seeker',
      OR: [
        { budget: { not: null } },
        { preferredCity: { not: "" } },
        { properties: { some: { isRoommateListing: true } } }
      ]
    }

    if (city) where.preferredCity = { contains: city }
    if (lifestyle) where.lifestyle = lifestyle
    if (workSchedule) where.workSchedule = workSchedule
    if (smokingOk === 'true') where.smokingOk = true
    if (petsOk === 'true') where.petsOk = true
    if (maxBudget) where.budget = { lte: parseInt(maxBudget) }

    const seekers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        avatar: true,
        bio: true,
        emailVerified: true,
        phoneVerified: true,
        budget: true,
        smokingOk: true,
        petsOk: true,
        workSchedule: true,
        lifestyle: true,
        cleanlinessLevel: true,
        preferredCity: true,
        preferredArea: true,
        createdAt: true,
        properties: {
          where: { isRoommateListing: true },
          select: {
            id: true,
            photos: true,
            city: true,
            area: true,
            title: true,
            rent: true,
            bedrooms: true,
            bathrooms: true,
            furnished: true,
            address: true,
            description: true,
            deposit: true,
            smokingAllowed: true,
            petsAllowed: true,
            genderPreference: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ seekers, total: seekers.length })
  } catch (error) {
    console.error('Seekers fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
