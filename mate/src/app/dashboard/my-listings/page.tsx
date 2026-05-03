'use client'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Property {
  id: string; title: string; city: string; area: string; rent: number;
  available: boolean; photos: string[]; bedrooms: number;
  inquiries?: { id: string }[];
  isRoommateListing: boolean;
  createdAt: string;
}

export default function MyListingsPage() {
  const { user, token, updateUser } = useAuthStore()
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token || !user) return
    fetch(`/api/properties?ownerId=${user.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        setProperties(d.properties || [])
        setLoading(false)
      })
  }, [token, user])

  const toggleAvailability = async (id: string, available: boolean) => {
    const res = await fetch(`/api/properties/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ available }),
    })
    if (res.ok) {
      setProperties(prev => prev.map(p => p.id === id ? { ...p, available } : p))
    }
  }

  const deleteProperty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return
    const res = await fetch(`/api/properties/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      setProperties(prev => prev.filter(p => p.id !== id))
    }
  }

  const [confirmDeleteRoommate, setConfirmDeleteRoommate] = useState(false)

  const deleteRoommateProfile = async () => {
    if (!confirm('FINAL CONFIRMATION: Are you sure you want to permanently delete your roommate requirement?')) return
    const res = await fetch('/api/users/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ 
        budget: null, preferredCity: null, preferredState: null, preferredArea: null,
        workSchedule: null, lifestyle: null, cleanlinessLevel: null,
        smokingOk: false, petsOk: false
      })
    })
    if (res.ok) {
      const data = await res.json()
      updateUser(data.user)
      window.location.reload()
    }
  }

  // Detect if user has a roommate listing (Type B)
  const roommateListing = properties.find(p => p.isRoommateListing)

  return (
    <div className="p-8 animate-fadeIn">
      {/* Roommate Profile Listing */}
      {(user && (user.budget || user.preferredCity || roommateListing)) && (
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>👥</span> My Roommate Requirement
          </h2>
          <div className="card card-elevated p-0 animate-fadeIn overflow-hidden" style={{ maxWidth: 600, border: '1px solid var(--primary-light)', background: 'var(--bg-surface)' }}>
            <div className="flex flex-col md:flex-row">
              {roommateListing && (
                <div className="md:w-[200px] w-full" style={{ height: 200, flexShrink: 0 }}>
                  <img 
                    src={roommateListing.photos[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'} 
                    alt="Property" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}
              <div style={{ padding: '1.5rem', flex: 1 }}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="avatar avatar-lg" style={{ overflow: 'hidden' }}>
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      user.name[0]
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{user.name}</h3>
                    <p className="text-sm text-secondary-color">
                      {roommateListing ? 'Has a flat & looking for roommate' : 'Looking for a room'}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <span className="badge badge-success">Live</span>
                  </div>
                </div>
                
                <div className="grid grid-2 gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="text-[10px] uppercase tracking-wider text-muted font-bold mb-1">
                      {roommateListing ? 'Rent Share' : 'Budget'}
                    </div>
                    <div className="font-bold text-primary">
                      ₹{(roommateListing?.rent || user.budget || 0).toLocaleString()}/mo
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="text-[10px] uppercase tracking-wider text-muted font-bold mb-1">City</div>
                    <div className="font-bold text-gray-800">
                      {roommateListing?.city || user.preferredCity || 'Not set'}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href="/roommates" className="btn btn-secondary btn-sm flex-1">
                    View in Feed
                  </Link>
                  <Link href="/dashboard/post-roommate" className="btn btn-primary btn-sm flex-1">
                    Edit Requirement
                  </Link>
                  {!confirmDeleteRoommate ? (
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => setConfirmDeleteRoommate(true)}
                      title="Delete Requirement"
                    >
                      🗑️
                    </button>
                  ) : (
                    <button 
                      className="btn btn-danger btn-sm flex-1 animate-pulse"
                      onClick={deleteRoommateProfile}
                      onMouseLeave={() => setConfirmDeleteRoommate(false)}
                    >
                      Confirm Delete?
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">My Property Listings</h1>
          <p className="text-secondary-color text-sm">{properties.length} active {properties.length === 1 ? 'listing' : 'listings'}</p>
        </div>
        <Link href="/dashboard/post-property" className="btn btn-primary">
          ➕ Post New Property
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 240 }} />)}
        </div>
      ) : properties.length === 0 ? (
        <div className="card card-elevated text-center py-20 animate-fadeIn" style={{ borderStyle: 'dashed', borderWidth: 2, background: 'var(--bg-surface)' }}>
          <div style={{ fontSize: '5rem', marginBottom: '1.5rem', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}>🏠</div>
          <h2 className="text-2xl font-bold mb-3">You don't have any listings yet</h2>
          <p className="text-secondary-color mb-8 max-w-sm mx-auto">
            Ready to find the perfect roommate? Post your property details and photos to get started!
          </p>
          <Link href="/dashboard/post-property" className="btn btn-primary btn-lg px-10 shadow-lg">
            🚀 Post Your First Property
          </Link>
        </div>
      ) : (
        <div className="grid grid-3 gap-6">
          {properties.map((p) => {
            const photo = p.photos[0]
            return (
              <div key={p.id} className="card card-elevated animate-fadeIn">
                {/* Photo */}
                <div style={{ height: 160, borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1rem', background: 'var(--bg-elevated)' }}>
                  {photo ? (
                    <img src={photo} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div className="flex items-center justify-center h-full" style={{ fontSize: '3rem' }}>🏠</div>
                  )}
                </div>

                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold" style={{ fontSize: '0.95rem', lineHeight: 1.3 }}>{p.title}</h3>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`badge ${p.available ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.65rem' }}>
                      {p.available ? 'Active' : 'Inactive'}
                    </span>
                    {p.isRoommateListing && (
                      <span className="badge badge-primary" style={{ fontSize: '0.6rem' }}>👥 Roommate Ad</span>
                    )}
                  </div>
                </div>

                <p className="text-sm text-secondary-color mb-3">📍 {p.area}, {p.city}</p>

                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold gradient-text">₹{p.rent.toLocaleString()}/mo</span>
                  <span className="badge badge-primary">{p.bedrooms} BHK</span>
                </div>

                <div className="divider mb-4" />

                <div className="flex gap-2">
                  <Link href={`/listings/${p.id}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                    View
                  </Link>
                  <button
                    className={`btn btn-sm ${p.available ? 'btn-danger' : 'btn-secondary'}`}
                    onClick={() => toggleAvailability(p.id, !p.available)}>
                    {p.available ? 'Deactivate' : 'Activate'}
                  </button>
                  <button className="btn btn-danger btn-icon btn-sm"
                    onClick={() => deleteProperty(p.id)} title="Delete">
                    🗑️
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
