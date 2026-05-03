import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getTokenFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const city = searchParams.get('city')
    const minRent = searchParams.get('minRent')
    const maxRent = searchParams.get('maxRent')
    const bedrooms = searchParams.get('bedrooms')
    const furnished = searchParams.get('furnished')
    const petsAllowed = searchParams.get('petsAllowed')
    const smokingAllowed = searchParams.get('smokingAllowed')
    const genderPreference = searchParams.get('genderPreference')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    const where: Record<string, unknown> = { available: true }
    
    // Default: only show regular properties unless specifically asked for roommates or filtered by owner
    const ownerId = searchParams.get('ownerId')
    const roommateListings = searchParams.get('isRoommateListing')

    if (ownerId) {
      where.ownerId = ownerId
      // If filtering by owner, show everything (available or not) unless specified
      delete where.available
    } else {
      // STRICT FILTERING: 
      // Type A (Room Listing): isRoommateListing: false
      // Type B (Roommate Property): isRoommateListing: true
      where.isRoommateListing = roommateListings === 'true'
    }

    if (city) where.city = { contains: city }
    if (minRent || maxRent) {
      where.rent = {}
      if (minRent) (where.rent as Record<string, number>).gte = parseInt(minRent)
      if (maxRent) (where.rent as Record<string, number>).lte = parseInt(maxRent)
    }
    if (bedrooms) where.bedrooms = parseInt(bedrooms)
    if (furnished === 'true') where.furnished = true
    if (petsAllowed === 'true') where.petsAllowed = true
    if (smokingAllowed === 'true') where.smokingAllowed = true
    if (genderPreference) where.genderPreference = genderPreference

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          owner: { select: { id: true, name: true, avatar: true, emailVerified: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.property.count({ where }),
    ])

    const formatted = properties.map((p) => ({
      ...p,
      amenities: JSON.parse(p.amenities),
      photos: JSON.parse(p.photos),
    }))

    return NextResponse.json({ properties: formatted, total, page, pages: Math.ceil(total / limit) })
  } catch (error) {
    console.error('Get properties error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = getTokenFromRequest(req)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const {
      title, description, address, city, state, area, lat, lng, rent, deposit,
      bedrooms, bathrooms, furnished, availableFrom, smokingAllowed, petsAllowed,
      genderPreference, amenities, photos, isRoommateListing,
    } = body

    if (!title || !city || !rent) {
      return NextResponse.json({ error: 'Required fields missing: title, city, and rent are mandatory.' }, { status: 400 })
    }

    const property = await prisma.property.create({
      data: {
        ownerId: payload.userId,
        title,
        description: description || "",
        address: address || "",
        city, state: state || null, area: area || "",
        lat: lat || null, lng: lng || null,
        rent: parseInt(rent),
        deposit: deposit ? parseInt(deposit) : null,
        bedrooms: bedrooms || 1,
        bathrooms: bathrooms || 1,
        furnished: furnished || false,
        availableFrom: availableFrom ? new Date(availableFrom) : null,
        smokingAllowed: smokingAllowed || false,
        petsAllowed: petsAllowed || false,
        genderPreference: genderPreference || 'any',
        amenities: JSON.stringify(amenities || []),
        photos: JSON.stringify(photos || []),
        isRoommateListing: isRoommateListing || false,
      },
      include: {
        owner: { select: { id: true, name: true, avatar: true, emailVerified: true } },
      },
    })

    return NextResponse.json({
      property: { ...property, amenities: amenities || [], photos: photos || [] },
    }, { status: 201 })
  } catch (error) {
    console.error('Create property error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
