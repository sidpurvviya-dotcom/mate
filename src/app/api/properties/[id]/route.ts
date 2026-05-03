import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getTokenFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, avatar: true, emailVerified: true, bio: true, createdAt: true } },
      },
    })

    if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 })

    return NextResponse.json({
      property: { ...property, amenities: JSON.parse(property.amenities), photos: JSON.parse(property.photos) },
    })
  } catch (error) {
    console.error('Get property error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = getTokenFromRequest(req)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const property = await prisma.property.findUnique({ where: { id } })
    if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    if (property.ownerId !== payload.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const updated = await prisma.property.update({
      where: { id },
      data: {
        ...body,
        amenities: body.amenities ? JSON.stringify(body.amenities) : undefined,
        photos: body.photos ? JSON.stringify(body.photos) : undefined,
      },
    })

    return NextResponse.json({
      property: { ...updated, amenities: JSON.parse(updated.amenities), photos: JSON.parse(updated.photos) },
    })
  } catch (error) {
    console.error('Update property error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = getTokenFromRequest(req)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const property = await prisma.property.findUnique({ where: { id } })
    if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    if (property.ownerId !== payload.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.property.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete property error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
