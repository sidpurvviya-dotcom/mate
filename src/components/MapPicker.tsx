'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

interface MapPickerProps {
  onLocationSelect: (loc: { address: string; city: string; state: string; area: string; lat: number; lng: number }) => void
  defaultCity?: string
  city?: string
  state?: string
  area?: string
}

export default function MapPicker({ onLocationSelect, defaultCity, city, state, area }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [leafletLoaded, setLeafletLoaded] = useState(false)
  const mapInstance = useRef<any>(null)
  const markerInstance = useRef<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [locating, setLocating] = useState(false)
  const [geoError, setGeoError] = useState('')

  // Load Leaflet dynamically
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script')
      script.id = 'leaflet-js'
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.async = true
      script.onload = () => setLeafletLoaded(true)
      document.head.appendChild(script)
    } else if ((window as any).L) {
      setLeafletLoaded(true)
    }
  }, [])

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
      const data = await res.json()
      
      if (data && data.address) {
        const addr = data.address
        const city = addr.city || addr.town || addr.village || addr.suburb || ''
        const state = addr.state || ''
        const area = addr.suburb || addr.neighbourhood || addr.residential || ''
        const displayAddress = data.display_name || ''

        onLocationSelect({
          address: displayAddress,
          city,
          state,
          area,
          lat,
          lng
        })
        setSearchQuery(displayAddress)
      }
    } catch (error) {
      console.error('Geocode error:', error)
    }
  }, [onLocationSelect])

  // Initialize Map
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || mapInstance.current) return

    const L = (window as any).L
    const defaultLat = 19.0760
    const defaultLng = 72.8777

    mapInstance.current = L.map(mapRef.current, {
      zoomControl: false,
      dragging: true,
      touchZoom: true,
      tap: true,
      scrollWheelZoom: false,
    }).setView([defaultLat, defaultLng], 12)

    // Force enable interactions
    mapInstance.current.dragging.enable()
    if (mapInstance.current.touchZoom) mapInstance.current.touchZoom.enable()
    if (mapInstance.current.doubleClickZoom) mapInstance.current.doubleClickZoom.enable()
    
    // Ensure map handles size correctly
    setTimeout(() => {
      if (mapInstance.current) mapInstance.current.invalidateSize()
    }, 100)

    L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current)

    // Modern light-themed tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CartoDB'
    }).addTo(mapInstance.current)

    // Click to place/move marker
    mapInstance.current.on('click', (e: any) => {
      const { lat, lng } = e.latlng
      updateMarker(lat, lng, true)
    })

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
        markerInstance.current = null
      }
    }
  }, [leafletLoaded])

  const updateMarker = (lat: number, lng: number, shouldGeocode = true) => {
    const L = (window as any).L
    if (!L || !mapInstance.current) return

    if (markerInstance.current) {
      markerInstance.current.setLatLng([lat, lng])
    } else {
      markerInstance.current = L.marker([lat, lng], { draggable: true }).addTo(mapInstance.current)
      
      // Update on drag end
      markerInstance.current.on('dragend', (e: any) => {
        const newPos = e.target.getLatLng()
        updateMarker(newPos.lat, newPos.lng, true)
      })
    }

    if (shouldGeocode) {
      reverseGeocode(lat, lng)
    }
  }

  // Handle locating user
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser')
      return
    }

    setLocating(true)
    setGeoError('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        if (mapInstance.current) {
          mapInstance.current.setView([latitude, longitude], 16)
          updateMarker(latitude, longitude, true)
        }
        setLocating(false)
      },
      (error) => {
        setLocating(false)
        setGeoError('Could not get your location. Please check permissions.')
        console.error('Geo error:', error)
      },
      { enableHighAccuracy: true }
    )
  }

  // Sync with address fields (one-way for initialization)
  useEffect(() => {
    if (!leafletLoaded || !mapInstance.current) return
    const query = [area, city, state].filter(Boolean).join(', ')
    if (!query.trim() || searchQuery) return // Don't overwrite if user is already searching

    const delayDebounce = setTimeout(() => {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`)
        .then(r => r.json())
        .then(data => {
          if (data && data.length > 0 && mapInstance.current) {
            const lat = parseFloat(data[0].lat)
            const lng = parseFloat(data[0].lon)
            mapInstance.current.setView([lat, lng], 14)
            updateMarker(lat, lng, false) // Don't geocode again, it came from the fields
          }
        })
    }, 1500)

    return () => clearTimeout(delayDebounce)
  }, [area, city, state, leafletLoaded])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim() || !(window as any).L || !mapInstance.current) return
    setSearching(true)

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`)
      const data = await res.json()
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat)
        const lng = parseFloat(data[0].lon)
        mapInstance.current.setView([lat, lng], 16)
        updateMarker(lat, lng, true)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative group">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input 
              className="form-input pr-10" 
              placeholder="🔍 Search building, landmark, or street..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch(e)}
            />
            {searchQuery && (
              <button 
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>
          <button 
            type="button" 
            className="btn btn-primary px-6" 
            onClick={handleSearch}
            disabled={searching}
          >
            {searching ? '...' : 'Search'}
          </button>
        </div>
      </div>
      
      <div className="relative overflow-hidden rounded-2xl border border-border shadow-sm">
        <div 
          ref={mapRef} 
          className="map-container"
          style={{ height: 320, width: '100%', zIndex: 1, touchAction: 'none' }} 
        />
        
        {/* Float Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2" style={{ zIndex: 1000 }}>
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-primary hover:bg-gray-50 transition-all border border-gray-100"
            title="My Location"
            onClick={handleLocateMe}
            disabled={locating}
          >
            {locating ? (
              <span className="spinner" style={{ width: 16, height: 16 }} />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg>
            )}
          </button>
        </div>

        {/* Overlay Info */}
        <div className="absolute bottom-4 left-4 right-16 pointer-events-none" style={{ zIndex: 1000 }}>
          <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg text-[10px] text-secondary-color shadow-sm inline-block border border-gray-100">
            💡 <strong>Pro Tip:</strong> Drag the marker to pin your exact location
          </div>
        </div>
      </div>

      {geoError && (
        <div className="text-xs text-danger flex items-center gap-1">
          <span>⚠️</span> {geoError}
        </div>
      )}

    </div>
  )
}
