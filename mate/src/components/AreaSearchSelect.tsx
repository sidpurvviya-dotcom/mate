'use client'
import { useState, useRef, useEffect, useMemo } from 'react'

const COMMON_AREAS = [
  // Mumbai
  'Powai', 'Andheri', 'Bandra', 'Worli', 'Juhu', 'Dadar', 'Thane', 'Navi Mumbai', 'Borivali', 'Goregaon', 'Malad', 'Kandivali',
  // Bangalore
  'Koramangala', 'Indiranagar', 'Whitefield', 'HSR Layout', 'Jayanagar', 'Electronic City', 'Hebbal', 'Marathahalli',
  // Delhi
  'Connaught Place', 'Dwarka', 'Saket', 'Hauz Khas', 'Rohini', 'Lajpat Nagar', 'Greater Kailash', 'Karol Bagh',
  // Hyderabad
  'Madhapur', 'Gachibowli', 'Banjara Hills', 'Jubilee Hills', 'Secunderabad', 'Kondapur', 'Hitech City',
  // Pune
  'Aundh', 'Kothrud', 'Viman Nagar', 'Baner', 'Hinjewadi', 'Wakad', 'Hadapsar', 'Kharadi',
  // Chennai
  'Anna Nagar', 'Adyar', 'T. Nagar', 'Velachery', 'Mylapore', 'Sholinganallur', 'Guindy',
  // Kolkata
  'Salt Lake', 'New Town', 'Park Street', 'Gariahat', 'Ballygunge', 'Howrah', 'Dum Dum',
  // Jaipur
  'C Scheme', 'Malviya Nagar', 'Vaishali Nagar', 'Mansarovar', 'Raja Park', 'Bani Park',
  // Bhopal (User's Target City)
  'MP Nagar', 'Arera Colony', 'Indrapuri', 'Bittan Market', 'New Market', 'Gulmohar', 'Kolar Road', 
  'Ayodhya Bypass', 'Hoshangabad Road', 'BHEL', 'Habibganj', 'Piplani', 'Govindpura', 'Saket Nagar',
  'Shakti Nagar', 'Awadhpuri', 'Misrod', 'Bairagarh', 'Chuna Bhatti', 'Shahpura', 'TT Nagar', 'Koh-e-Fiza'
].sort()

interface AreaSearchSelectProps {
  value: string
  onChange: (val: string) => void
}

export default function AreaSearchSelect({ value, onChange }: AreaSearchSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    } else {
      setSearch('')
    }
  }, [open])

  const filteredAreas = useMemo(() => {
    const q = search.toLowerCase().trim()
    const matched = COMMON_AREAS.filter(a => a.toLowerCase().includes(q))
    
    // Add custom option if search string doesn't exist in exact match
    if (q && !matched.some(a => a.toLowerCase() === q)) {
      return [search, ...matched]
    }
    return matched
  }, [search])

  return (
    <div className="relative" ref={containerRef} style={{ width: '100%' }}>
      <button
        type="button"
        className="form-input flex items-center justify-between w-full text-left"
        style={{ cursor: 'pointer', background: 'var(--bg-surface)' }}
        onClick={() => setOpen(!open)}
      >
        <span className={!value ? 'text-muted' : 'text-primary'}>
          {value || 'Select Area / Locality'}
        </span>
        <span className="text-muted text-xs">▼</span>
      </button>

      {open && (
        <div
          className="absolute z-50 mt-1 w-full rounded-md shadow-lg"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-strong)',
            top: '100%',
            left: 0,
            overflow: 'hidden',
          }}
        >
          <div className="p-2 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}>
            <input
              ref={inputRef}
              type="text"
              className="w-full form-input py-1.5 text-sm"
              placeholder="Search or type custom area..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ background: 'var(--bg-card)' }}
            />
          </div>
          <div
            className="overflow-y-auto"
            style={{ maxHeight: 175, background: 'var(--bg-elevated)' }}
          >
            {filteredAreas.map((area, index) => {
              const isCustom = index === 0 && search && !COMMON_AREAS.some(a => a.toLowerCase() === search.toLowerCase().trim())
              return (
                <button
                  key={area}
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 transition-colors flex justify-between items-center"
                  style={{
                    background: value === area ? 'rgba(99,102,241,0.1)' : 'transparent',
                    color: value === area ? 'var(--primary-light)' : 'var(--text-primary)',
                  }}
                  onClick={() => {
                    onChange(area)
                    setOpen(false)
                  }}
                >
                  <span>{area}</span>
                  {isCustom && <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary-light">Custom</span>}
                </button>
              )
            })}
            {filteredAreas.length === 0 && !search.trim() && (
              <div className="p-3 text-center text-sm text-muted">No areas found</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
