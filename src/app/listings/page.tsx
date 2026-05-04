'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import ThemeToggle from '@/components/ThemeToggle'

interface Property {
  id: string; title: string; city: string; area: string; address: string;
  rent: number; deposit: number | null; bedrooms: number; bathrooms: number;
  furnished: boolean; smokingAllowed: boolean; petsAllowed: boolean;
  genderPreference: string; photos: string[]; amenities: string[];
  matchScore?: number;
  owner: { id: string; name: string; avatar: string | null; emailVerified: boolean };
  createdAt: string;
}

const CITIES = ['All', 'Mumbai', 'Bangalore', 'Delhi', 'Pune', 'Hyderabad', 'Chennai']
const BEDROOMS = ['Any', '1', '2', '3', '4+']

function PropertyCard({ p, token }: { p: Property; token: string | null }) {
  const photo = p.photos[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'

  const matchClass = p.matchScore !== undefined
    ? p.matchScore >= 80 ? 'match-ring-high' : p.matchScore >= 60 ? 'match-ring-mid' : 'match-ring-low'
    : ''

  return (
    <Link href={`/listings/${p.id}`} className="property-card animate-fadeIn" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
      <div className="property-img-wrapper">
        <img src={photo} alt={p.title} className="property-img" loading="lazy" />
        <div className="absolute" style={{ top: 12, left: 12 }}>
          {p.furnished && <span className="badge badge-primary">Furnished</span>}
        </div>
        {p.matchScore !== undefined && (
          <div className="absolute" style={{ top: 12, right: 12 }}>
            <div className={`match-ring ${matchClass}`} style={{ background: 'rgba(0,0,0,0.8)' }}>
              {p.matchScore}%
            </div>
          </div>
        )}
      </div>
      <div style={{ padding: '1rem' }}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold" style={{ fontSize: '0.95rem' }}>{p.title}</h3>
        </div>
        <p className="text-sm text-secondary-color mb-3">
          📍 {p.area}, {p.city}
        </p>
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="font-bold text-xl gradient-text">₹{p.rent.toLocaleString()}</span>
            <span className="text-xs text-muted">/mo</span>
          </div>
          <div className="flex gap-2">
            <span className="badge badge-primary">{p.bedrooms} BHK</span>
            {p.petsAllowed && <span className="badge badge-success">🐾</span>}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="avatar avatar-sm">
              {p.owner.avatar ? (
                <img src={p.owner.avatar} alt={p.owner.name} className="avatar avatar-sm" />
              ) : (
                p.owner.name[0]
              )}
            </div>
            <span className="text-xs text-secondary-color">{p.owner.name}</span>
            {p.owner.emailVerified && <span style={{ fontSize: '0.7rem', color: 'var(--success)' }}>✓</span>}
          </div>
          <span className="text-xs text-muted">
            {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function ListingsPage() {
  const { user, token } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [showMatches, setShowMatches] = useState(false)
  const [filters, setFilters] = useState({
    city: '', minRent: '', maxRent: '', bedrooms: '',
    furnished: false, petsAllowed: false, smokingAllowed: false,
  })
  const [total, setTotal] = useState(0)

  useEffect(() => { setMounted(true) }, [])

  const fetchProperties = useCallback(async () => {
    setLoading(true)
    try {
      if (showMatches && user?.role === 'seeker' && token) {
        const res = await fetch('/api/matches', { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        setProperties(data.matches || [])
        setTotal(data.matches?.length || 0)
      } else {
        const params = new URLSearchParams()
        if (filters.city && filters.city !== 'All') params.set('city', filters.city)
        if (filters.minRent) params.set('minRent', filters.minRent)
        if (filters.maxRent) params.set('maxRent', filters.maxRent)
        if (filters.bedrooms && filters.bedrooms !== 'Any') {
          params.set('bedrooms', filters.bedrooms === '4+' ? '4' : filters.bedrooms)
        }
        if (filters.furnished) params.set('furnished', 'true')
        if (filters.petsAllowed) params.set('petsAllowed', 'true')
        if (filters.smokingAllowed) params.set('smokingAllowed', 'true')

        const res = await fetch(`/api/properties?${params}`)
        const data = await res.json()
        setProperties(data.properties || [])
        setTotal(data.total || 0)
      }
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }, [filters, showMatches, user, token])

  useEffect(() => { fetchProperties() }, [fetchProperties])

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Navbar */}
      <nav className="navbar glass" style={{ justifyContent: 'space-between' }}>
        <Link href="/" className="logo-container">
          <img src="/logo.png" alt="Mate Logo" className="mate-logo" />
        </Link>
        <div className="flex items-center gap-3">
          {mounted && user ? (
            <Link href="/dashboard" className="btn btn-primary btn-sm">Dashboard</Link>
          ) : mounted ? (
            <>
              <Link href="/auth/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link href="/auth/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          ) : null}
          <ThemeToggle />
        </div>
      </nav>

      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">
              {showMatches ? '🎯 Your Matches' : '🏠 Browse Listings'}
            </h1>
            <p className="text-secondary-color text-sm">
              {total} {total === 1 ? 'property' : 'properties'} found
            </p>
          </div>
          {mounted && user?.role === 'seeker' && (
            <button
              className={`btn ${showMatches ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setShowMatches(!showMatches)}>
              {showMatches ? '🔍 All Listings' : '✨ Show My Matches'}
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="card mb-6" style={{ padding: '1rem 1.5rem' }}>
          <div className="flex flex-wrap gap-3 items-end">
            {/* City */}
            <div className="form-group" style={{ minWidth: 140 }}>
              <label className="form-label">City</label>
              <select className="form-select" value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}>
                {CITIES.map((c) => <option key={c} value={c === 'All' ? '' : c}>{c}</option>)}
              </select>
            </div>

            {/* Rent range */}
            <div className="form-group" style={{ minWidth: 120 }}>
              <label className="form-label">Min Rent (₹)</label>
              <input type="number" className="form-input" placeholder="5,000"
                value={filters.minRent} onChange={(e) => setFilters({ ...filters, minRent: e.target.value })} />
            </div>
            <div className="form-group" style={{ minWidth: 120 }}>
              <label className="form-label">Max Rent (₹)</label>
              <input type="number" className="form-input" placeholder="50,000"
                value={filters.maxRent} onChange={(e) => setFilters({ ...filters, maxRent: e.target.value })} />
            </div>

            {/* Bedrooms */}
            <div className="form-group" style={{ minWidth: 100 }}>
              <label className="form-label">Bedrooms</label>
              <select className="form-select" value={filters.bedrooms}
                onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}>
                {BEDROOMS.map((b) => <option key={b} value={b === 'Any' ? '' : b}>{b}</option>)}
              </select>
            </div>

            {/* Toggles */}
            <div className="flex gap-3 flex-wrap" style={{ paddingBottom: '0.1rem' }}>
              {[
                { key: 'furnished', label: 'Furnished' },
                { key: 'petsAllowed', label: '🐾 Pets OK' },
                { key: 'smokingAllowed', label: '🚬 Smoking OK' },
              ].map(({ key, label }) => (
                <button key={key}
                  className={`filter-chip ${(filters as any)[key] ? 'active' : ''}`}
                  onClick={() => setFilters({ ...filters, [key]: !(filters as any)[key] })}>
                  {label}
                </button>
              ))}
            </div>

            <button className="btn btn-secondary btn-sm" onClick={() =>
              setFilters({ city: '', minRent: '', maxRent: '', bedrooms: '', furnished: false, petsAllowed: false, smokingAllowed: false })
            }>
              Clear
            </button>
          </div>
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
          <div className="text-center py-16">
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏚️</div>
            <h3 className="text-xl font-semibold mb-2">No properties found</h3>
            <p className="text-secondary-color">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-3 gap-6">
            {properties.map((p) => <PropertyCard key={p.id} p={p} token={token} />)}
          </div>
        )}
      </div>
    </div>
  )
}
