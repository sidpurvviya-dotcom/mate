'use client'
import { useState, useRef, useEffect, useMemo } from 'react'

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
].sort()

interface StateSearchSelectProps {
  value: string
  onChange: (val: string) => void
}

export default function StateSearchSelect({ value, onChange }: StateSearchSelectProps) {
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

  const filteredStates = useMemo(() => {
    if (!search.trim()) return INDIAN_STATES
    const q = search.toLowerCase()
    return INDIAN_STATES.filter(s => s.toLowerCase().includes(q))
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
          {value || 'Select State'}
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
              placeholder="Search state..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ background: 'var(--bg-card)' }}
            />
          </div>
          <div
            className="overflow-y-auto"
            style={{ maxHeight: 175, background: 'var(--bg-elevated)' }}
          >
            {filteredStates.length === 0 ? (
              <div className="p-3 text-center text-sm text-muted">No states found</div>
            ) : (
              filteredStates.map(state => (
                <button
                  key={state}
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 transition-colors"
                  style={{
                    background: value === state ? 'rgba(99,102,241,0.1)' : 'transparent',
                    color: value === state ? 'var(--primary-light)' : 'var(--text-primary)',
                  }}
                  onClick={() => {
                    onChange(state)
                    setOpen(false)
                  }}
                >
                  {state}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
