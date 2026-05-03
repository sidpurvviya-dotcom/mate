import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getTokenFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const payload = getTokenFromRequest(req)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const inquiries = await prisma.inquiry.findMany({
      where: {
        OR: [{ senderId: payload.userId }, { receiverId: payload.userId }],
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
        property: { select: { id: true, title: true, rent: true, city: true, photos: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const formatted = inquiries.map((i) => ({
      ...i,
      property: { ...i.property, photos: JSON.parse(i.property.photos) },
    }))

    return NextResponse.json({ inquiries: formatted })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = getTokenFromRequest(req)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { propertyId, message } = await req.json()
    if (!propertyId || !message) {
      return NextResponse.json({ error: 'propertyId and message required' }, { status: 400 })
    }

    const property = await prisma.property.findUnique({ where: { id: propertyId } })
    if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    if (property.ownerId === payload.userId) {
      return NextResponse.json({ error: 'Cannot inquire on your own property' }, { status: 400 })
    }

    const existing = await prisma.inquiry.findFirst({
      where: { senderId: payload.userId, propertyId },
    })
    if (existing) {
      return NextResponse.json({ error: 'Inquiry already sent for this property' }, { status: 409 })
    }

    const inquiry = await prisma.inquiry.create({
      data: { senderId: payload.userId, receiverId: property.ownerId, propertyId, message },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
        property: { select: { id: true, title: true, rent: true, city: true } },
      },
    })

    return NextResponse.json({ inquiry }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const payload = getTokenFromRequest(req)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { inquiryId, status } = await req.json()
    if (!inquiryId || !['accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const inquiry = await prisma.inquiry.findUnique({ where: { id: inquiryId } })
    if (!inquiry || inquiry.receiverId !== payload.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updated = await prisma.inquiry.update({ where: { id: inquiryId }, data: { status } })
    return NextResponse.json({ inquiry: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
