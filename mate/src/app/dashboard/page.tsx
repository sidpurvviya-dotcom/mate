'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'

export default function DashboardPage() {
  const { user, token } = useAuthStore()
  const [stats, setStats] = useState({ listings: 0, inquiries: 0, messages: 0, matches: 0 })
  const [recentInquiries, setRecentInquiries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    const headers = { Authorization: `Bearer ${token}` }
    Promise.all([
      fetch('/api/inquiries', { headers }).then(r => r.json()),
      fetch('/api/messages', { headers }).then(r => r.json()),
    ]).then(([inqData, msgData]) => {
      const inquiries = inqData.inquiries || []
      const messages = msgData.messages || []
      setRecentInquiries(inquiries.slice(0, 3))
      setStats(s => ({
        ...s,
        inquiries: inquiries.length,
        messages: messages.length,
      }))
    }).finally(() => setLoading(false))

    if (user?.role === 'owner') {
      fetch(`/api/properties?ownerId=${user.id}`, { headers })
        .then(r => r.json())
        .then(d => setStats(s => ({ ...s, listings: d.total || 0 })))
    } else {
      fetch('/api/matches', { headers })
        .then(r => r.json())
        .then(d => setStats(s => ({ ...s, matches: d.matches?.length || 0 })))
    }
  }, [token, user])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const statCards = user?.role === 'owner' ? [
    { label: 'My Listings', value: stats.listings, emoji: '🏠', href: '/dashboard/my-listings', color: 'var(--primary)' },
    { label: 'Inquiries Received', value: stats.inquiries, emoji: '📨', href: '/dashboard/inquiries', color: 'var(--accent)' },
    { label: 'Conversations', value: stats.messages, emoji: '💬', href: '/dashboard/messages', color: 'var(--secondary)' },
  ] : [
    { label: 'Best Matches', value: stats.matches, emoji: '🎯', href: '/rooms', color: 'var(--primary)' },
    { label: 'My Inquiries', value: stats.inquiries, emoji: '📨', href: '/dashboard/inquiries', color: 'var(--accent)' },
    { label: 'Conversations', value: stats.messages, emoji: '💬', href: '/dashboard/messages', color: 'var(--secondary)' },
  ]

  return (
    <div className="p-8 animate-fadeIn">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">
          {greeting}, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-secondary-color">
          {user?.role === 'owner'
            ? 'Manage your properties and connect with potential roommates.'
            : 'Find your perfect room and connect with property owners.'}
        </p>
      </div>

      {/* Verification banner */}
      {!user?.emailVerified && (
        <div className="alert alert-info mb-6" style={{ padding: '1rem 1.25rem' }}>
          <span>📧</span>
          <div>
            <span className="font-medium">Verify your email</span> to build trust and access all features.
            <Link href="/dashboard/profile" className="text-primary-color font-medium ml-2">Verify now →</Link>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-3 gap-4 mb-8">
        {statCards.map((s) => (
          <Link key={s.label} href={s.href} className="card card-elevated" style={{ cursor: 'pointer', textDecoration: 'none' }}>
            <div className="flex items-center justify-between mb-4">
              <span style={{ fontSize: '2rem' }}>{s.emoji}</span>
              <span className="font-bold text-3xl" style={{ color: s.color }}>
                {loading ? '—' : s.value}
              </span>
            </div>
            <div className="text-secondary-color text-sm font-medium">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-2 gap-6 mb-8">
        <div className="card card-elevated">
          <h2 className="font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-col gap-2">
            {user?.role === 'owner' ? (
              <>
                <Link href="/dashboard/post-property" className="btn btn-primary">
                  ➕ Post New Property
                </Link>
                <Link href="/dashboard/inquiries" className="btn btn-secondary">
                  📨 View Inquiries
                </Link>
              </>
            ) : (
              <>
                <Link href="/rooms" className="btn btn-primary">
                  🔍 Browse Rooms
                </Link>
                <Link href="/dashboard/profile" className="btn btn-secondary">
                  ✨ Update Preferences
                </Link>
              </>
            )}
            <Link href="/dashboard/messages" className="btn btn-secondary">
              💬 Open Messages
            </Link>
          </div>
        </div>

        {/* Recent inquiries */}
        <div className="card card-elevated">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Inquiries</h2>
            <Link href="/dashboard/inquiries" className="text-sm text-primary-color">View all →</Link>
          </div>
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 52 }} />)}
            </div>
          ) : recentInquiries.length === 0 ? (
            <div className="text-center py-6 text-muted text-sm">No inquiries yet</div>
          ) : (
            <div className="flex flex-col gap-3">
              {recentInquiries.map((inq: any) => (
                <div key={inq.id} className="flex items-center gap-3 p-3 rounded"
                  style={{ background: 'var(--bg-surface)' }}>
                  <div className="avatar avatar-sm">{inq.sender.name[0]}</div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div className="text-sm font-medium truncate">{inq.property.title}</div>
                    <div className="text-xs text-muted">{inq.sender.name}</div>
                  </div>
                  <span className={`badge ${inq.status === 'accepted' ? 'badge-success' : inq.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                    {inq.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Profile completeness */}
      <div className="card card-elevated">
        <h2 className="font-semibold mb-4">Profile Completeness</h2>
        <div className="flex flex-col gap-3">
          {[
            { label: 'Name added', done: !!user?.name },
            { label: 'Email verified', done: !!user?.emailVerified },
            { label: 'Bio written', done: !!user?.bio },
            ...(user?.role === 'seeker' ? [
              { label: 'Budget set', done: true },
              { label: 'Preferences configured', done: true },
            ] : []),
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span style={{ color: item.done ? 'var(--success)' : 'var(--text-muted)', fontSize: '1.1rem' }}>
                {item.done ? '✅' : '⭕'}
              </span>
              <span className={`text-sm ${item.done ? '' : 'text-muted'}`}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
