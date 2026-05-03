'use client'
import { useState, useRef, useEffect, useMemo } from 'react'

const INDIAN_CITIES = [
  'All Cities', 'Mumbai', 'Bangalore', 'Delhi', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad', 'Surat', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivli', 'Vasai-Virar', 'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad', 'Howrah', 'Ranchi', 'Gwalior', 'Jabalpur', 'Coimbatore', 'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Chandigarh', 'Guwahati', 'Solapur', 'Hubli-Dharwad', 'Bareilly', 'Moradabad', 'Mysore', 'Gurgaon', 'Aligarh', 'Jalandhar', 'Tiruchirappalli', 'Bhubaneswar', 'Salem', 'Warangal', 'Thiruvananthapuram', 'Guntur', 'Bhiwandi', 'Saharanpur', 'Gorakhpur', 'Bikaner', 'Amravati', 'Noida', 'Jamshedpur', 'Bhilai', 'Cuttack', 'Firozabad', 'Kochi', 'Bhavnagar', 'Dehradun', 'Durgapur', 'Asansol', 'Nanded', 'Kolhapur', 'Ajmer', 'Gulbarga', 'Jamnagar', 'Ujjain', 'Loni', 'Siliguri', 'Jhansi', 'Ulhasnagar', 'Jammu', 'Mangalore', 'Erode', 'Belgaum', 'Ambattur', 'Tirunelveli', 'Malegaon', 'Gaya', 'Jalgaon', 'Udaipur'
].sort((a, b) => {
  if (a === 'All Cities') return -1
  if (b === 'All Cities') return 1
  return a.localeCompare(b)
})

interface CitySearchSelectProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
}

export default function CitySearchSelect({ value, onChange, placeholder = 'Select City' }: CitySearchSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close dropdown when clicking outside
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

  // Focus search input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    } else {
      setSearch('') // reset search when closed
    }
  }, [open])

  const filteredCities = useMemo(() => {
    if (!search.trim()) return INDIAN_CITIES
    const q = search.toLowerCase()
    return INDIAN_CITIES.filter(c => c.toLowerCase().includes(q))
  }, [search])

  const displayValue = value || 'All Cities'

  return (
    <div className="relative" ref={containerRef} style={{ width: '100%', minWidth: 200 }}>
      {/* Trigger Button */}
      <button
        type="button"
        className="form-input flex items-center justify-between w-full text-left"
        style={{ cursor: 'pointer', background: 'var(--bg-surface)' }}
        onClick={() => setOpen(!open)}
      >
        <span className={displayValue === 'All Cities' && !value ? 'text-muted' : 'text-primary'}>
          {displayValue}
        </span>
        <span className="text-muted text-xs">▼</span>
      </button>

      {/* Dropdown Menu */}
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
              placeholder="Search city..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ background: 'var(--bg-card)' }}
            />
          </div>
          <div
            className="overflow-y-auto"
            style={{ maxHeight: 175, background: 'var(--bg-elevated)' }}
          >
            {filteredCities.length === 0 ? (
              <div className="p-3 text-center text-sm text-muted">No cities found</div>
            ) : (
              filteredCities.map(city => (
                <button
                  key={city}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 transition-colors"
                  style={{
                    background: displayValue === city ? 'rgba(99,102,241,0.1)' : 'transparent',
                    color: displayValue === city ? 'var(--primary-light)' : 'var(--text-primary)',
                  }}
                  onClick={() => {
                    onChange(city === 'All Cities' ? '' : city)
                    setOpen(false)
                  }}
                >
                  {city}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
