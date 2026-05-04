'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import ThemeToggle from '@/components/ThemeToggle'
import MapView from '@/components/MapView'


interface Property {
  id: string; title: string; description: string; city: string; area: string; address: string;
  rent: number; deposit: number | null; bedrooms: number; bathrooms: number;
  furnished: boolean; smokingAllowed: boolean; petsAllowed: boolean; genderPreference: string;
  photos: string[]; amenities: string[]; available: boolean;
  lat: number | null; lng: number | null;
  owner: { id: string; name: string; avatar: string | null; emailVerified: boolean; bio: string | null; createdAt: string };
  createdAt: string;
}

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user, token } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [activePhoto, setActivePhoto] = useState(0)
  const [inquiryMsg, setInquiryMsg] = useState('')
  const [sending, setSending] = useState(false)
  const [inquiryDone, setInquiryDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    fetch(`/api/properties/${id}`)
      .then((r) => r.json())
      .then((d) => { setProperty(d.property); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  const sendInquiry = async () => {
    if (!user) { router.push('/auth/login'); return }
    if (!inquiryMsg.trim()) return
    setSending(true); setError('')
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ propertyId: id, message: inquiryMsg }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setInquiryDone(true)
    } catch { setError('Failed to send inquiry') }
    finally { setSending(false) }
  }

  const startChat = () => {
    if (!user) { router.push('/auth/login'); return }
    router.push(`/dashboard/messages?userId=${property?.owner.id}`)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  )

  if (!property) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4" style={{ background: 'var(--bg-base)' }}>
      <div style={{ fontSize: '4rem' }}>🏚️</div>
      <h2 className="text-xl font-semibold">Property not found</h2>
      <Link href="/rooms" className="btn btn-primary">Browse Rooms</Link>
    </div>
  )

  const photos = property.photos.length ? property.photos : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800']

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <nav className="navbar glass" style={{ justifyContent: 'space-between' }}>
        <Link href="/rooms" className="btn btn-ghost btn-sm">← Back to Rooms</Link>
        <Link href="/" className="logo-container">
          <img src="/logo.png" alt="Mate Logo" className="mate-logo" />
        </Link>
        {mounted && user ? (
          <Link href="/dashboard" className="btn btn-secondary btn-sm">Dashboard</Link>
        ) : mounted ? (
          <Link href="/auth/login" className="btn btn-primary btn-sm">Sign In</Link>
        ) : null}
        <ThemeToggle />
      </nav>

      <div className="container py-8">
        <div className="grid" style={{ gridTemplateColumns: '1fr 360px', gap: '2rem' }}>
          {/* Main content */}
          <div>
            {/* Photo gallery */}
            <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginBottom: '1.5rem', position: 'relative' }}>
              <div style={{ position: 'relative', height: 400 }}>
                <img src={photos[activePhoto]} alt={property.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                
                {photos.length > 1 && (
                  <>
                    <button 
                      onClick={() => setActivePhoto((activePhoto - 1 + photos.length) % photos.length)}
                      style={{
                        position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                        width: 40, height: 40, borderRadius: '50%', 
                        background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.3)', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all 0.2s', fontSize: '1.2rem'
                      }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.4)'}
                      onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                    >
                      ‹
                    </button>
                    <button 
                      onClick={() => setActivePhoto((activePhoto + 1) % photos.length)}
                      style={{
                        position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                        width: 40, height: 40, borderRadius: '50%', 
                        background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.3)', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all 0.2s', fontSize: '1.2rem'
                      }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.4)'}
                      onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                    >
                      ›
                    </button>
                    <div style={{
                      position: 'absolute', bottom: 16, right: 16,
                      background: 'rgba(0,0,0,0.5)', color: 'white', padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 700
                    }}>
                      {activePhoto + 1} / {photos.length}
                    </div>
                  </>
                )}
              </div>
              {photos.length > 1 && (
                <div className="flex gap-2" style={{ marginTop: '0.75rem' }}>
                  {photos.map((p, i) => (
                    <img key={i} src={p} alt="" onClick={() => setActivePhoto(i)}
                      style={{
                        width: 72, height: 56, objectFit: 'cover', borderRadius: 8,
                        cursor: 'pointer', opacity: i === activePhoto ? 1 : 0.5,
                        border: i === activePhoto ? '2px solid var(--primary)' : '2px solid transparent',
                        transition: 'var(--transition)',
                      }} />
                  ))}
                </div>
              )}
            </div>

            {/* Title & basic info */}
            <div className="mb-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h1 className="text-3xl font-bold">{property.title}</h1>
                <div className="text-right">
                  <div className="text-3xl font-bold gradient-text">₹{property.rent.toLocaleString()}</div>
                  <div className="text-xs text-muted">per month</div>
                  {property.deposit && (
                    <div className="text-sm text-secondary-color mt-1">
                      Deposit: ₹{property.deposit.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-secondary-color flex items-center gap-2 mb-4">
                📍 {property.address}
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="badge badge-primary">{property.bedrooms} Bedroom{property.bedrooms > 1 ? 's' : ''}</span>
                <span className="badge badge-primary">{property.bathrooms} Bathroom{property.bathrooms > 1 ? 's' : ''}</span>
                {property.furnished && <span className="badge badge-success">Furnished</span>}
                {!property.smokingAllowed && <span className="badge badge-warning">🚭 No Smoking</span>}
                {property.petsAllowed && <span className="badge badge-success">🐾 Pets OK</span>}
                {property.genderPreference && property.genderPreference !== 'any' && (
                  <span className="badge badge-primary">
                    {property.genderPreference === 'male' ? '♂ Male Only' : '♀ Female Only'}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="card mb-6">
              <h2 className="font-semibold text-lg mb-3">About this property</h2>
              <p className="text-secondary-color" style={{ lineHeight: 1.8 }}>{property.description}</p>
            </div>

            {/* Amenities */}
            {property.amenities.length > 0 && (
              <div className="card mb-6">
                <h2 className="font-semibold text-lg mb-4">Amenities</h2>
                <div className="grid grid-3 gap-3">
                  {property.amenities.map((a) => (
                    <div key={a} className="flex items-center gap-2 text-sm">
                      <span style={{ color: 'var(--success)' }}>✓</span>
                      <span className="text-secondary-color">{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Map */}
            <div className="card mb-6" style={{ padding: 0, overflow: 'hidden', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', minHeight: 400 }}>
              {property.lat && property.lng ? (
                <MapView lat={property.lat} lng={property.lng} address={property.address} />
              ) : (
                <div className="p-12 text-center flex flex-col items-center gap-4">
                  <div style={{ fontSize: '3rem' }}>📍</div>
                  <div>
                    <h3 className="font-bold">Location Preview</h3>
                    <p className="text-sm text-secondary-color mt-1">{property.address || `${property.area}, ${property.city}`}</p>
                  </div>
                  <a 
                    href={`https://www.google.com/maps/search/${encodeURIComponent(`${property.address}, ${property.area}, ${property.city}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    View on Google Maps
                  </a>
                </div>
              )}
              <div style={{ padding: '1rem', background: 'var(--bg-elevated)', borderTop: '1px solid var(--border)' }}>
                <p className="font-semibold text-sm flex items-center gap-1">
                  📍 {property.address || `${property.area}, ${property.city}`}
                </p>
                <p className="text-xs text-muted mt-0.5">
                  {property.lat && property.lng 
                    ? `Precise Coordinates: ${property.lat.toFixed(6)}, ${property.lng.toFixed(6)}` 
                    : 'Estimated location from address components'}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Owner card */}
            <div className="card card-elevated mb-4" style={{ position: 'sticky', top: 80 }}>
              <h2 className="font-semibold mb-4">Listed by</h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="avatar avatar-lg">{property.owner.name[0]}</div>
                <div>
                  <div className="font-semibold">{property.owner.name}</div>
                  <div className="text-sm text-secondary-color flex items-center gap-1">
                    {property.owner.emailVerified
                      ? <><span style={{ color: 'var(--success)' }}>✓</span> Verified</>
                      : 'Unverified'}
                  </div>
                  <div className="text-xs text-muted mt-0.5">
                    Member since {new Date(property.owner.createdAt).getFullYear()}
                  </div>
                </div>
              </div>
              {property.owner.bio && (
                <p className="text-sm text-secondary-color mb-4" style={{ lineHeight: 1.6 }}>
                  {property.owner.bio}
                </p>
              )}

              <div className="divider mb-4" />

              {mounted && user?.id === property.owner.id ? (
                <div className="alert alert-info text-center" style={{ justifyContent: 'center' }}>
                  This is your listing
                </div>
              ) : inquiryDone ? (
                <div className="flex flex-col gap-3">
                  <div className="alert alert-success">
                    ✅ Inquiry sent! The owner will get back to you.
                  </div>
                  <button className="btn btn-primary w-full" onClick={startChat}>
                    💬 Open Chat
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {error && <div className="alert alert-error">{error}</div>}
                  <div className="form-group">
                    <label className="form-label">Send an Inquiry</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Hi, I'm interested in this property. I'm a working professional looking for..."
                      value={inquiryMsg}
                      onChange={(e) => setInquiryMsg(e.target.value)}
                      style={{ minHeight: 100 }}
                    />
                  </div>
                  <button className="btn btn-primary w-full" onClick={sendInquiry} disabled={sending || !inquiryMsg.trim()}>
                    {sending ? <><span className="spinner" />Sending...</> : '📩 Send Inquiry'}
                  </button>
                  <button className="btn btn-secondary w-full" onClick={startChat}>
                    💬 Chat Directly
                  </button>
                  {mounted && !user && (
                    <p className="text-xs text-muted text-center">
                      <Link href="/auth/login" className="text-primary-color">Sign in</Link> to contact owner
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
