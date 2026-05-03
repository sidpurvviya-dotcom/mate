'use client'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import Link from 'next/link'

interface Inquiry {
  id: string; message: string; status: string; createdAt: string;
  sender: { id: string; name: string; avatar: string | null };
  receiver: { id: string; name: string; avatar: string | null };
  property: { id: string; title: string; rent: number; city: string; photos: string[] };
}

export default function InquiriesPage() {
  const { user, token } = useAuthStore()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received')

  useEffect(() => {
    if (!token) return
    fetch('/api/inquiries', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setInquiries(d.inquiries || []); setLoading(false) })
  }, [token])

  const updateStatus = async (inquiryId: string, status: string) => {
    const res = await fetch('/api/inquiries', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ inquiryId, status }),
    })
    if (res.ok) {
      setInquiries(prev => prev.map(i => i.id === inquiryId ? { ...i, status } : i))
    }
  }

  const received = inquiries.filter(i => i.receiver.id === user?.id)
  const sent = inquiries.filter(i => i.sender.id === user?.id)
  const displayed = activeTab === 'received' ? received : sent

  return (
    <div className="p-8 animate-fadeIn">
      <h1 className="text-3xl font-bold mb-6">Inquiries</h1>

      <div className="tabs mb-6" style={{ maxWidth: 300 }}>
        <button className={`tab-btn ${activeTab === 'received' ? 'active' : ''}`}
          onClick={() => setActiveTab('received')}>
          Received ({received.length})
        </button>
        <button className={`tab-btn ${activeTab === 'sent' ? 'active' : ''}`}
          onClick={() => setActiveTab('sent')}>
          Sent ({sent.length})
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 120 }} />)}
        </div>
      ) : displayed.length === 0 ? (
        <div className="card card-elevated text-center py-20 animate-fadeIn" style={{ borderStyle: 'dashed', borderWidth: 2, background: 'var(--bg-surface)' }}>
          <div style={{ fontSize: '5rem', marginBottom: '1.5rem', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}>
            {activeTab === 'received' ? '📥' : '📤'}
          </div>
          <h2 className="text-2xl font-bold mb-3">You don't have any {activeTab} inquiries</h2>
          <p className="text-secondary-color mb-8 max-w-sm mx-auto font-medium">
            {activeTab === 'received' 
              ? "Your inbox is empty. As soon as someone is interested in your listing, you'll see it here!" 
              : "You haven't sent any inquiries yet. Find a place you like and reach out!"}
          </p>
          <Link href={activeTab === 'received' ? "/dashboard/post-property" : "/rooms"} className="btn btn-primary btn-lg px-10 shadow-lg">
            {activeTab === 'received' ? '🏠 Post a Property' : '🔍 Browse Rooms'}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {displayed.map((inq) => {
            const photo = inq.property.photos[0]
            const other = activeTab === 'received' ? inq.sender : inq.receiver
            return (
              <div key={inq.id} className="card card-elevated animate-fadeIn">
                <div className="flex gap-4">
                  {/* Property thumbnail */}
                  <Link href={`/listings/${inq.property.id}`}>
                    <div style={{ width: 100, height: 80, borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0 }}>
                      {photo ? (
                        <img src={photo} alt={inq.property.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                          🏠
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <Link href={`/listings/${inq.property.id}`} className="font-semibold hover:underline">
                          {inq.property.title}
                        </Link>
                        <div className="text-sm text-secondary-color">
                          ₹{inq.property.rent.toLocaleString()}/mo · {inq.property.city}
                        </div>
                      </div>
                      <span className={`badge ${
                        inq.status === 'accepted' ? 'badge-success' :
                        inq.status === 'rejected' ? 'badge-danger' : 'badge-warning'
                      }`}>
                        {inq.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <div className="avatar avatar-sm">{other.name[0]}</div>
                      <span className="text-sm text-secondary-color">{other.name}</span>
                      <span className="text-xs text-muted">·</span>
                      <span className="text-xs text-muted">
                        {new Date(inq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <p className="text-sm text-secondary-color" style={{ lineHeight: 1.5 }}>
                      &ldquo;{inq.message}&rdquo;
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2 mt-3">
                      {activeTab === 'received' && inq.status === 'pending' && (
                        <>
                          <button className="btn btn-sm"
                            style={{ background: 'var(--success)', color: 'white' }}
                            onClick={() => updateStatus(inq.id, 'accepted')}>
                            ✓ Accept
                          </button>
                          <button className="btn btn-danger btn-sm"
                            onClick={() => updateStatus(inq.id, 'rejected')}>
                            ✗ Decline
                          </button>
                        </>
                      )}
                      <Link href={`/dashboard/messages?userId=${other.id}`}
                        className="btn btn-secondary btn-sm">
                        💬 Message
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
