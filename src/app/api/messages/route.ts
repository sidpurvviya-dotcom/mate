import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getTokenFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const payload = getTokenFromRequest(req)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const withUserId = searchParams.get('userId')

    let messages
    if (withUserId) {
      messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: payload.userId, receiverId: withUserId },
            { senderId: withUserId, receiverId: payload.userId },
          ],
        },
        include: {
          sender: { select: { id: true, name: true, avatar: true } },
          receiver: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: 'asc' },
      })

      // Mark received messages as read
      await prisma.message.updateMany({
        where: { senderId: withUserId, receiverId: payload.userId, read: false },
        data: { read: true },
      })
    } else {
      // Get conversation threads
      const sent = await prisma.message.findMany({
        where: { senderId: payload.userId },
        include: { receiver: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
      })

      const received = await prisma.message.findMany({
        where: { receiverId: payload.userId },
        include: { sender: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
      })

      // Build unique conversations
      const threadMap = new Map<string, {
        userId: string; name: string; avatar: string | null;
        lastMessage: string; lastTime: Date; unread: number
      }>()

      for (const m of sent) {
        const uid = m.receiverId
        if (!threadMap.has(uid)) {
          threadMap.set(uid, {
            userId: uid, name: m.receiver.name, avatar: m.receiver.avatar,
            lastMessage: m.content, lastTime: m.createdAt, unread: 0,
          })
        }
      }

      for (const m of received) {
        const uid = m.senderId
        if (!threadMap.has(uid)) {
          threadMap.set(uid, {
            userId: uid, name: m.sender.name, avatar: m.sender.avatar,
            lastMessage: m.content, lastTime: m.createdAt,
            unread: !m.read ? 1 : 0,
          })
        } else {
          const t = threadMap.get(uid)!
          if (!m.read) t.unread++
          if (m.createdAt > t.lastTime) { t.lastMessage = m.content; t.lastTime = m.createdAt }
        }
      }

      messages = Array.from(threadMap.values()).sort((a, b) => b.lastTime.getTime() - a.lastTime.getTime())
    }

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = getTokenFromRequest(req)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { receiverId, content } = await req.json()
    if (!receiverId || !content?.trim()) {
      return NextResponse.json({ error: 'receiverId and content required' }, { status: 400 })
    }

    const message = await prisma.message.create({
      data: { senderId: payload.userId, receiverId, content: content.trim() },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
      },
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
