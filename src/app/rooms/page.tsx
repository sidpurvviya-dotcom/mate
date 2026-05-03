'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import CitySearchSelect from '@/components/CitySearchSelect'

import ThemeToggle from '@/components/ThemeToggle'

interface Property {
  id: string; title: string; city: string; area: string; address: string;
  rent: number; deposit: number | null; bedrooms: number; bathrooms: number;
  furnished: boolean; smokingAllowed: boolean; petsAllowed: boolean;
  genderPreference: string; photos: string[]; amenities: string[];
  owner: { id: string; name: string; avatar: string | null; emailVerified: boolean };
  createdAt: string;
}

const CITIES = ['All Cities', 'Bhopal', 'Mumbai', 'Bangalore', 'Delhi', 'Pune', 'Hyderabad', 'Chennai']
const BEDROOMS = ['Any', '1 BHK', '2 BHK', '3 BHK', '4+ BHK']
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
]

export default function RoomsPage() {
  const router = useRouter()
  const { user, token } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [sort, setSort] = useState('newest')
  const [filters, setFilters] = useState({
    city: '', minRent: '', maxRent: '', bedrooms: '',
    furnished: false, petsAllowed: false, smokingAllowed: false,
  })

  useEffect(() => { setMounted(true) }, [])

  const fetchRooms = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.city && filters.city !== 'All Cities') params.set('city', filters.city)
      if (filters.minRent) params.set('minRent', filters.minRent)
      if (filters.maxRent) params.set('maxRent', filters.maxRent)
      if (filters.bedrooms && filters.bedrooms !== 'Any') {
        const n = filters.bedrooms.replace(/\D.*/, '')
        params.set('bedrooms', n)
      }
      if (filters.furnished) params.set('furnished', 'true')
      if (filters.petsAllowed) params.set('petsAllowed', 'true')
      if (filters.smokingAllowed) params.set('smokingAllowed', 'true')

      const res = await fetch(`/api/properties?isRoommateListing=false&${params}`)
      const data = await res.json()
      let results: Property[] = data.properties || []

      // Client-side sort
      if (sort === 'price_asc') results = [...results].sort((a, b) => a.rent - b.rent)
      else if (sort === 'price_desc') results = [...results].sort((a, b) => b.rent - a.rent)

      setProperties(results)
      setTotal(data.total || results.length)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [filters, sort])

  useEffect(() => { fetchRooms() }, [fetchRooms])

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Navbar */}
      <nav className="navbar glass" style={{ justifyContent: 'space-between' }}>
        <Link href="/" className="flex items-center gap-2">
          <span style={{ fontSize: '1.25rem' }}>🏠</span>
          <span className="font-bold" style={{ fontFamily: 'Outfit' }}>
            <span className="gradient-text">Mate</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/rooms" className="btn btn-sm" style={{
            background: 'rgba(99,102,241,0.15)', color: 'var(--primary-light)',
            border: '1px solid rgba(99,102,241,0.3)',
          }}>🏠 Rooms</Link>
          <Link href="/roommates" className="btn btn-ghost btn-sm">👥 Roommates</Link>
          {mounted && user ? (
            <Link href="/dashboard" className="btn btn-primary btn-sm">My Profile</Link>
          ) : mounted ? (
              <Link href="/auth/login" className="btn btn-primary btn-sm">Sign In</Link>
          ) : null}
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.1) 50%, transparent 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '3rem 0 2rem',
      }}>
        <div className="container">
          <div className="flex items-center gap-3 mb-3">
            <div style={{
              width: 48, height: 48, borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem',
            }}>🏠</div>
            <div>
              <h1 className="text-3xl font-bold">Browse Rooms</h1>
              <p className="text-sm text-muted">Find your perfect room from verified listings</p>
            </div>
          </div>

          {/* City quick-filter pills */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hidden" style={{ flexWrap: 'nowrap', WebkitOverflowScrolling: 'touch' }}>
            {CITIES.map((c) => (
              <button key={c}
                className={`filter-chip ${filters.city === (c === 'All Cities' ? '' : c) ? 'active' : ''}`}
                style={{ flexShrink: 0 }}
                onClick={() => {
                  setFilters({ ...filters, city: c === 'All Cities' ? '' : c })
                }}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-6">
        {/* Filters bar */}
        <div className="card mb-6" style={{ padding: '1rem 1.5rem' }}>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="form-group" style={{ minWidth: 220, zIndex: 10 }}>
              <label className="form-label">City</label>
              <CitySearchSelect
                value={filters.city}
                onChange={(city) => {
                  setFilters({ ...filters, city })
                }}
              />
            </div>
            <div className="form-group" style={{ minWidth: 120 }}>
              <label className="form-label">Min Rent (₹)</label>
              <input type="number" className="form-input" placeholder="0"
                value={filters.minRent}
                onChange={(e) => {
                  setFilters({ ...filters, minRent: e.target.value })
                }} />
            </div>
            <div className="form-group" style={{ minWidth: 120 }}>
              <label className="form-label">Max Rent (₹)</label>
              <input type="number" className="form-input" placeholder="1,00,000"
                value={filters.maxRent}
                onChange={(e) => {
                  setFilters({ ...filters, maxRent: e.target.value })
                }} />
            </div>
            <div className="form-group" style={{ minWidth: 130 }}>
              <label className="form-label">Bedrooms</label>
              <select className="form-select" value={filters.bedrooms}
                onChange={(e) => {
                  setFilters({ ...filters, bedrooms: e.target.value })
                }}>
                {BEDROOMS.map((b) => <option key={b} value={b === 'Any' ? '' : b}>{b}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ minWidth: 160 }}>
              <label className="form-label">Sort By</label>
              <select className="form-select" value={sort}
                onChange={(e) => {
                  setSort(e.target.value)
                }}>
                {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="flex gap-2 flex-wrap" style={{ paddingBottom: '0.1rem' }}>
              {[
                { key: 'furnished', label: '🛋️ Furnished' },
                { key: 'petsAllowed', label: '🐾 Pets OK' },
                { key: 'smokingAllowed', label: '🚬 Smoking OK' },
              ].map(({ key, label }) => (
                <button key={key}
                  className={`filter-chip ${(filters as any)[key] ? 'active' : ''}`}
                  onClick={() => {
                    setFilters({ ...filters, [key]: !(filters as any)[key] })
                  }}>
                  {label}
                </button>
              ))}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => {
              setFilters({
                city: '', minRent: '', maxRent: '', bedrooms: '',
                furnished: false, petsAllowed: false, smokingAllowed: false,
              })
            }}>✕ Clear</button>
          </div>
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-secondary-color text-sm">
            <span className="font-semibold text-primary" style={{ color: 'var(--primary-light)' }}>{total}</span>
            {' '}{total === 1 ? 'room' : 'rooms'} available
            {filters.city ? ` in ${filters.city}` : ''}
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="property-card">
                <div className="skeleton" style={{ height: 200 }} />
                <div style={{ padding: '1rem' }}>
                  <div className="skeleton" style={{ height: 16, marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 12, width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20 card">
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏚️</div>
            <h3 className="text-xl font-semibold mb-2">No rooms found</h3>
            <p className="text-secondary-color mb-6">Try adjusting your filters</p>
            <button className="btn btn-secondary" onClick={() => setFilters({
              city: '', minRent: '', maxRent: '', bedrooms: '',
              furnished: false, petsAllowed: false, smokingAllowed: false,
            })}>Clear Filters</button>
          </div>
        ) : (
          <div className="grid grid-3 gap-6 animate-fadeIn">
            {properties.map((p) => {
              const photo = p.photos[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
              return (
                <div key={p.id} onClick={() => {
                  router.push(`/listings/${p.id}`)
                }}
                  className="property-card animate-fadeIn"
                  style={{ display: 'block', textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
                  <div className="property-img-wrapper">
                    <img src={photo} alt={p.title} className="property-img" loading="lazy" />
                    <div className="absolute" style={{ top: 10, left: 10, display: 'flex', gap: 4 }}>
                      {p.furnished && <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>Furnished</span>}
                      {p.petsAllowed && <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>🐾</span>}
                    </div>
                    <div className="absolute" style={{ bottom: 10, right: 10 }}>
                      <div style={{
                        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
                        borderRadius: 'var(--radius-sm)', padding: '3px 10px',
                        fontSize: '0.8rem', fontWeight: 700, color: 'white',
                      }}>
                        ₹{p.rent.toLocaleString()}/mo
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '1rem' }}>
                    <h3 className="font-semibold mb-1" style={{ fontSize: '0.95rem', lineHeight: 1.3 }}>
                      {p.title}
                    </h3>
                    <p className="text-xs text-muted mb-3">📍 {p.area}, {p.city}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>{p.bedrooms} BHK</span>
                        <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>{p.bathrooms} Bath</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="avatar avatar-sm">{p.owner.name[0]}</div>
                        <span className="text-xs text-muted">{p.owner.name.split(' ')[0]}</span>
                        {p.owner.emailVerified && <span style={{ fontSize: '0.65rem', color: 'var(--success)' }}>✓</span>}
                      </div>
                    </div>
                    {p.deposit && (
                      <p className="text-xs text-muted mt-2">
                        Deposit: ₹{p.deposit.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Post CTA */}
        {mounted && user?.role === 'owner' && (
          <div className="card text-center mt-12" style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))',
            border: '1px solid var(--border-strong)',
            padding: '2.5rem',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>➕</div>
            <h3 className="font-bold text-xl mb-2">Have a room to rent?</h3>
            <p className="text-secondary-color text-sm mb-5">List your property for free and connect with verified seekers.</p>
            <Link href="/dashboard/post-property" className="btn btn-primary">Post a Room →</Link>
          </div>
        )}
        {mounted && !user && (
          <div className="card text-center mt-12" style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))',
            border: '1px solid var(--border-strong)',
            padding: '2.5rem',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔐</div>
            <h3 className="font-bold text-xl mb-2">Sign in to contact owners</h3>
            <p className="text-secondary-color text-sm mb-5">Create a free account to send inquiries and chat directly.</p>
            <div className="flex justify-center">
              <button onClick={() => router.push('/auth/login')} className="btn btn-primary">Sign In to Connect →</button>
            </div>
          </div>
        )}


      </div>
    </div>
  )
}
