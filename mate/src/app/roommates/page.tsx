'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import CitySearchSelect from '@/components/CitySearchSelect'

import ThemeToggle from '@/components/ThemeToggle'

interface Seeker {
  id: string
  name: string
  avatar: string | null
  bio: string | null
  emailVerified: boolean
  phoneVerified: boolean
  budget: number | null
  smokingOk: boolean | null
  petsOk: boolean | null
  workSchedule: string | null
  lifestyle: string | null
  cleanlinessLevel: string | null
  preferredCity: string | null
  preferredArea: string | null
  createdAt: string
  properties?: {
    id: string;
    photos: string;
    city: string;
    area: string;
    title: string;
    rent: number;
    bedrooms: number;
    bathrooms: number;
    furnished: boolean;
    description: string;
    address: string;
    deposit: number | null;
    smokingAllowed: boolean;
    petsAllowed: boolean;
    genderPreference: string;
  }[]
}

const CITIES = ['All Cities', 'Bhopal', 'Mumbai', 'Bangalore', 'Delhi', 'Pune', 'Hyderabad', 'Chennai']

const LIFESTYLE_OPTIONS = [
  { value: '', label: 'Any Lifestyle' },
  { value: 'student', label: '🎓 Student' },
  { value: 'working', label: '💼 Working Professional' },
  { value: 'freelancer', label: '💻 Freelancer' },
  { value: 'homebody', label: '🏡 Homebody' },
  { value: 'social', label: '🎉 Social' },
]

const SCHEDULE_OPTIONS = [
  { value: '', label: 'Any Schedule' },
  { value: 'day', label: '☀️ Day Person' },
  { value: 'night', label: '🌙 Night Owl' },
  { value: 'flexible', label: '⚡ Flexible' },
]

function SeekerCard({ s, onMessage }: { s: Seeker; onMessage: (id: string) => void }) {
  const joinYear = new Date(s.createdAt).getFullYear()
  const joinMonth = new Date(s.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })

  const lifestyleEmoji: Record<string, string> = {
    student: '🎓', working: '💼', freelancer: '💻', homebody: '🏡', social: '🎉',
  }
  const scheduleEmoji: Record<string, string> = {
    day: '☀️', night: '🌙', flexible: '⚡',
  }
  const cleanEmoji: Record<string, string> = {
    spotless: '✨', clean: '🧹', relaxed: '😌', messy: '🌀',
  }

  return (
    <div className="card card-elevated animate-fadeIn" style={{
      display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden',
      transition: 'var(--transition)',
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
      
      {/* 1. TOP SECTION: PROPERTY GALLERY (If exists) or SEEKER HEADER */}
      {s.properties && s.properties.length > 0 ? (
        <div style={{ position: 'relative' }}>
          <Link href={`/listings/${s.properties[0].id}`} style={{ display: 'block', cursor: 'pointer' }}>
            <div style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
              <img 
                src={JSON.parse(s.properties[0].photos)[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'} 
                alt="Property"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div className="absolute" style={{ top: 12, right: 12 }}>
                <div style={{
                  background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                  borderRadius: 'var(--radius-sm)', padding: '4px 12px',
                  fontSize: '0.85rem', fontWeight: 800, color: 'white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}>
                  ₹{s.properties[0].rent.toLocaleString()}/mo
                </div>
              </div>
              <div className="absolute" style={{ bottom: 12, left: 12, display: 'flex', gap: 6 }}>
                <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '3px 10px', background: 'rgba(99,102,241,0.9)', backdropFilter: 'blur(4px)' }}>
                  {s.properties[0].bedrooms} BHK
                </span>
                <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '3px 10px', background: 'rgba(99,102,241,0.9)', backdropFilter: 'blur(4px)' }}>
                  {s.properties[0].bathrooms} Bath
                </span>
                {s.properties[0].furnished && (
                  <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '3px 10px', background: 'rgba(34,197,94,0.9)', backdropFilter: 'blur(4px)' }}>
                    Furnished
                  </span>
                )}
              </div>
            </div>
          </Link>
          
          {/* Overlapping Seeker Avatar */}
          <div style={{ 
            position: 'absolute', bottom: -20, right: 20, 
            width: 56, height: 56, borderRadius: '50%',
            border: '4px solid var(--bg-surface)',
            background: `linear-gradient(135deg, hsl(${s.name.charCodeAt(0) * 7 % 360}, 70%, 45%), hsl(${(s.name.charCodeAt(0) * 13 + 60) % 360}, 60%, 35%))`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)', zIndex: 10
          }}>
            {s.avatar ? <img src={s.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : s.name[0]}
          </div>
        </div>
      ) : (
        <div style={{ padding: '1.25rem 1.25rem 0' }}>
          <div className="flex items-center gap-3">
            <div className="avatar avatar-lg" style={{
              background: `linear-gradient(135deg, hsl(${s.name.charCodeAt(0) * 7 % 360}, 70%, 45%), hsl(${(s.name.charCodeAt(0) * 13 + 60) % 360}, 60%, 35%))`,
              flexShrink: 0,
            }}>
              {s.avatar ? <img src={s.avatar} alt={s.name} className="avatar avatar-lg" /> : s.name[0].toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div className="font-semibold">{s.name}</div>
              <div className="text-xs text-muted">Member since {joinMonth}</div>
            </div>
            {s.budget && (
              <div style={{ textAlign: 'right' }}>
                <div className="gradient-text font-bold" style={{ fontSize: '1.1rem' }}>₹{s.budget.toLocaleString()}</div>
                <div className="text-[10px] text-muted">budget/mo</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. BODY SECTION */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
        {/* Seeker Info (if not already shown in header) */}
        {s.properties && s.properties.length > 0 && (
          <div style={{ marginBottom: '-0.25rem' }}>
            <div className="font-bold text-lg leading-tight text-gray-800">{s.name}</div>
            <div className="text-[10px] text-muted uppercase tracking-wider font-black mt-1">Looking for Roommate</div>
          </div>
        )}

        {/* Property Title & Address (if exists) */}
        {s.properties && s.properties.length > 0 && (
          <div style={{ marginTop: '0.25rem' }}>
             <h3 className="text-sm font-bold text-primary mb-1">{s.properties[0].title}</h3>
             <p className="text-xs text-muted flex items-center gap-1">
                <span>📍</span> {s.properties[0].address || `${s.properties[0].area}, ${s.properties[0].city}`}
             </p>
          </div>
        )}

        {/* Bio */}
        {s.bio && (
          <p className="text-sm text-secondary-color" style={{ lineHeight: 1.6 }}>{s.bio}</p>
        )}

        {/* Preferences Grid */}
        <div className="grid grid-2 gap-3">
          <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', padding: '0.625rem' }}>
            <div className="text-[10px] text-muted uppercase tracking-widest font-bold mb-1">Location</div>
            <div className="text-xs font-semibold truncate">
              {s.properties?.[0]?.area || s.preferredCity || 'N/A'}
            </div>
          </div>
          <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', padding: '0.625rem' }}>
            <div className="text-[10px] text-muted uppercase tracking-widest font-bold mb-1">Work Schedule</div>
            <div className="text-xs font-semibold">
              {scheduleEmoji[s.workSchedule || ''] || '⏰'} {s.workSchedule || 'Flexible'}
            </div>
          </div>
        </div>

        {/* Property Specifics (if exists) */}
        {s.properties && s.properties.length > 0 && (
          <div style={{ 
            padding: '0.75rem', borderRadius: 'var(--radius-md)', 
            background: 'var(--bg-surface)', border: '1px solid var(--border)'
          }}>
            <div className="flex justify-between items-center text-[11px] mb-2">
              <span className="text-muted">Security Deposit</span>
              <span className="font-bold">₹{(s.properties[0].deposit || s.properties[0].rent * 2).toLocaleString()}</span>
            </div>
            <div className="flex gap-2 flex-wrap">
               {!s.properties[0].smokingAllowed && <span className="badge badge-warning" style={{ fontSize: '0.6rem' }}>🚭 No Smoking</span>}
               {s.properties[0].genderPreference && s.properties[0].genderPreference !== 'any' && (
                 <span className="badge badge-primary" style={{ fontSize: '0.6rem' }}>
                    {s.properties[0].genderPreference === 'male' ? '♂ Male Only' : '♀ Female Only'}
                 </span>
               )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex gap-2 mt-auto pt-2">
          <button className="btn btn-primary flex-1" onClick={() => onMessage(s.id)}>
            💬 Message
          </button>
          {s.properties && s.properties.length > 0 && (
            <Link href={`/listings/${s.properties[0].id}`} className="btn btn-secondary" title="View Property Details">
              🏠
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RoommatesPage() {
  const { user, token } = useAuthStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [seekers, setSeekers] = useState<Seeker[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState({
    city: '', lifestyle: '', workSchedule: '',
    maxBudget: '', smokingOk: false, petsOk: false,
  })

  useEffect(() => { setMounted(true) }, [])

  const fetchSeekers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.city && filters.city !== 'All Cities') params.set('city', filters.city)
      if (filters.lifestyle) params.set('lifestyle', filters.lifestyle)
      if (filters.workSchedule) params.set('workSchedule', filters.workSchedule)
      if (filters.maxBudget) params.set('maxBudget', filters.maxBudget)
      if (filters.smokingOk) params.set('smokingOk', 'true')
      if (filters.petsOk) params.set('petsOk', 'true')

      const res = await fetch(`/api/users/seekers?${params}`)
      const data = await res.json()
      setSeekers(data.seekers || [])
      setTotal(data.total || 0)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [filters])

  useEffect(() => { fetchSeekers() }, [fetchSeekers])

  const handleMessage = (seekerId: string) => {
    if (!mounted) return
    if (!user) {
      router.push('/auth/login')
      return
    }
    router.push(`/dashboard/messages?userId=${seekerId}`)
  }

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
          <Link href="/rooms" className="btn btn-ghost btn-sm">🏠 Rooms</Link>
          <Link href="/roommates" className="btn btn-sm" style={{
            background: 'rgba(139,92,246,0.15)', color: '#c4b5fd',
            border: '1px solid rgba(139,92,246,0.3)',
          }}>👥 Roommates</Link>
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
        background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(99,102,241,0.1) 50%, transparent 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '3rem 0 2rem',
      }}>
        <div className="container">
          <div className="flex items-center gap-3 mb-3">
            <div style={{
              width: 48, height: 48, borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--secondary), #a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem',
            }}>👥</div>
            <div>
              <h1 className="text-3xl font-bold">Find Roommates</h1>
              <p className="text-sm text-muted">Connect with verified people looking for a room</p>
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
            <div className="form-group" style={{ minWidth: 160 }}>
              <label className="form-label">Lifestyle</label>
              <select className="form-select" value={filters.lifestyle}
                onChange={(e) => {
                  setFilters({ ...filters, lifestyle: e.target.value })
                }}>
                {LIFESTYLE_OPTIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ minWidth: 160 }}>
              <label className="form-label">Work Schedule</label>
              <select className="form-select" value={filters.workSchedule}
                onChange={(e) => {
                  setFilters({ ...filters, workSchedule: e.target.value })
                }}>
                {SCHEDULE_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ minWidth: 130 }}>
              <label className="form-label">Max Budget (₹)</label>
              <input type="number" className="form-input" placeholder="50,000"
                value={filters.maxBudget}
                onChange={(e) => {
                  setFilters({ ...filters, maxBudget: e.target.value })
                }} />
            </div>
            <div className="flex gap-2 flex-wrap" style={{ paddingBottom: '0.1rem' }}>
              {[
                { key: 'petsOk', label: '🐾 Pet Friendly' },
                { key: 'smokingOk', label: '🚬 Smoking OK' },
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
                city: '', lifestyle: '', workSchedule: '',
                maxBudget: '', smokingOk: false, petsOk: false,
              })
            }}>✕ Clear</button>
          </div>
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-secondary-color text-sm">
            <span className="font-semibold" style={{ color: '#c4b5fd' }}>{total}</span>
            {' '}{total === 1 ? 'person' : 'people'} looking for a room
            {filters.city ? ` in ${filters.city}` : ''}
          </p>
          {mounted && !user && (
            <Link href="/auth/register" className="btn btn-secondary btn-sm">
              ➕ Add Your Profile
            </Link>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card card-elevated">
                <div className="flex items-center gap-3 mb-4">
                  <div className="skeleton" style={{ width: 56, height: 56, borderRadius: '50%' }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: 14, marginBottom: 6 }} />
                    <div className="skeleton" style={{ height: 10, width: '60%' }} />
                  </div>
                </div>
                <div className="skeleton" style={{ height: 48, marginBottom: 8 }} />
                <div className="grid grid-2 gap-2">
                  {[1, 2, 3, 4].map(j => <div key={j} className="skeleton" style={{ height: 54 }} />)}
                </div>
              </div>
            ))}
          </div>
        ) : seekers.length === 0 ? (
          <div className="text-center py-20 card">
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤔</div>
            <h3 className="text-xl font-semibold mb-2">No roommates found</h3>
            <p className="text-secondary-color mb-6">Try adjusting your filters or check back later.</p>
            <div className="flex gap-3 justify-center">
              <button className="btn btn-secondary" onClick={() => setFilters({
                city: '', lifestyle: '', workSchedule: '',
                maxBudget: '', smokingOk: false, petsOk: false,
              })}>Clear Filters</button>
              {mounted && !user && (
                <Link href="/auth/login" className="btn btn-primary">Sign In to Continue</Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-3 gap-6">
            {seekers.map((s) => (
              <SeekerCard key={s.id} s={s} onMessage={handleMessage} />
            ))}
          </div>
        )}

        {/* Sign-up CTA for seekers */}
        {mounted && user?.role === 'seeker' && (
          <div className="card text-center mt-12" style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(99,102,241,0.05))',
            border: '1px solid rgba(139,92,246,0.3)',
            padding: '2.5rem',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✨</div>
            <h3 className="font-bold text-xl mb-2">Make yourself more discoverable</h3>
            <p className="text-secondary-color text-sm mb-5">
              Complete your profile with bio, preferences and budget so owners can find you.
            </p>
            <Link href="/dashboard/profile" className="btn btn-primary">Update My Profile →</Link>
          </div>
        )}
        {mounted && !user && (
          <div className="card text-center mt-12" style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(99,102,241,0.05))',
            border: '1px solid rgba(139,92,246,0.3)',
            padding: '2.5rem',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🚀</div>
            <h3 className="font-bold text-xl mb-2">Looking for a room?</h3>
            <p className="text-secondary-color text-sm mb-5">
              Create a seeker profile and get discovered by property owners.
            </p>
            <div className="flex justify-center">
              <Link href="/auth/login" className="btn btn-primary">Sign In to Post Requirement</Link>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
