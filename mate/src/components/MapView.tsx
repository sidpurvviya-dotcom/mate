'use client'
import { useEffect, useRef, useState } from 'react'

interface MapViewProps {
  lat: number
  lng: number
  address?: string
}

export default function MapView({ lat, lng, address }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [leafletLoaded, setLeafletLoaded] = useState(false)
  const mapInstance = useRef<any>(null)

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

  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || !lat || !lng) return

    const L = (window as any).L
    if (!L) return
    
    if (mapInstance.current) {
      mapInstance.current.setView([lat, lng], 15)
      return
    }

    mapInstance.current = L.map(mapRef.current, {
      zoomControl: false
    }).setView([lat, lng], 15)

    L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current)

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CartoDB'
    }).addTo(mapInstance.current)

    const marker = L.marker([lat, lng]).addTo(mapInstance.current)
    if (address) {
      marker.bindPopup(`<strong>Location</strong><br/>${address}`).openPopup()
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [leafletLoaded, lat, lng, address])

  return (
    <div className="relative w-full h-full min-h-[320px]">
      <div 
        ref={mapRef} 
        className="w-full h-full" 
        style={{ zIndex: 1, minHeight: 320 }}
      />
      <a 
        href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-4 left-4 z-[1000] btn btn-white btn-sm shadow-lg flex items-center gap-2"
        style={{ background: 'white', color: 'black' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        Get Directions
      </a>
    </div>
  )
}
