'use client'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import CitySearchSelect from '@/components/CitySearchSelect'
import StateSearchSelect from '@/components/StateSearchSelect'
import AreaSearchSelect from '@/components/AreaSearchSelect'
import MapPicker from '@/components/MapPicker'
import ImageUpload from '@/components/ImageUpload'

export default function PostPropertyPage() {
  const { token } = useAuthStore()
  const [form, setForm] = useState({
    title: '', description: '', address: '', city: '', state: '', area: '',
    rent: '', deposit: '', bedrooms: '1', bathrooms: '1',
    furnished: false, smokingAllowed: false, petsAllowed: false,
    genderPreference: 'any',
    availableFrom: '',
    photos: [] as string[],
    amenities: [] as string[],
    lat: undefined as number | undefined,
    lng: undefined as number | undefined,
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); 

    const validPhotos = form.photos.filter(p => p.trim())
    if (validPhotos.length < 3) {
      setError('You must provide at least 3 photo URLs for your property.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          photos: validPhotos,
          rent: parseInt(form.rent),
          deposit: form.deposit ? parseInt(form.deposit) : undefined,
          bedrooms: parseInt(form.bedrooms),
          bathrooms: parseInt(form.bathrooms),
          isRoommateListing: false,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to post'); return }
      setSuccess(true)
      setForm({ title: '', description: '', address: '', city: '', state: '', area: '', rent: '', deposit: '',
        bedrooms: '1', bathrooms: '1', furnished: false, smokingAllowed: false, petsAllowed: false,
        genderPreference: 'any', availableFrom: '', photos: [], amenities: [], lat: undefined, lng: undefined })
    } catch { setError('Network error') }
    finally { setLoading(false) }
  }

  return (
    <div className="p-8 animate-fadeIn">
      <div style={{ maxWidth: 720 }}>
        <h1 className="text-3xl font-bold mb-2">Post a Property</h1>
        <p className="text-secondary-color mb-8">Fill in the details below to list your property on Mate.</p>

        {success && (
          <div className="alert alert-success mb-6">
            ✅ Property listed successfully! Seekers can now find and inquire about your property.
          </div>
        )}
        {error && <div className="alert alert-error mb-6">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="card card-elevated">
            <h2 className="font-semibold text-lg mb-4">Basic Information</h2>
            <div className="flex flex-col gap-4">
              <div className="form-group">
                <label className="form-label">Property Title *</label>
                <input className="form-input" placeholder="e.g., Cozy 1BHK in Powai near Hiranandani"
                  value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className="form-textarea" placeholder="Describe your property..."
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  style={{ minHeight: 120 }} required />
              </div>
              <div className="grid grid-3 gap-4">
                <div className="form-group" style={{ zIndex: 12 }}>
                  <label className="form-label">State</label>
                  <StateSearchSelect value={form.state} onChange={s => setForm({ ...form, state: s })} />
                </div>
                <div className="form-group" style={{ zIndex: 11 }}>
                  <label className="form-label">City *</label>
                  <CitySearchSelect value={form.city} onChange={c => setForm({ ...form, city: c })} />
                </div>
                <div className="form-group" style={{ zIndex: 10 }}>
                  <label className="form-label">Area / Locality *</label>
                  <AreaSearchSelect value={form.area} onChange={a => setForm({ ...form, area: a })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Pin on Map (Optional)</label>
                <MapPicker 
                  defaultCity={form.city} 
                  city={form.city}
                  state={form.state}
                  area={form.area}
                  onLocationSelect={(loc) => {
                    setForm(f => ({
                      ...f,
                      address: loc.address || f.address,
                      city: loc.city || f.city,
                      state: loc.state || f.state,
                      area: loc.area || f.area,
                      lat: loc.lat,
                      lng: loc.lng
                    }))
                  }} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Full Address *</label>
                <input className="form-input" placeholder="Building, Street, Pincode"
                  value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required />
              </div>
            </div>
          </div>

          <div className="card card-elevated">
            <h2 className="font-semibold text-lg mb-4">Pricing & Details</h2>
            <div className="grid grid-2 gap-4">
              <div className="form-group">
                <label className="form-label">Monthly Rent (₹) *</label>
                <input type="number" className="form-input" value={form.rent} onChange={e => setForm({ ...form, rent: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Security Deposit (₹)</label>
                <input type="number" className="form-input" value={form.deposit} onChange={e => setForm({ ...form, deposit: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Bedrooms</label>
                <select className="form-select" value={form.bedrooms} onChange={e => setForm({ ...form, bedrooms: e.target.value })}>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} BHK</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Bathrooms</label>
                <select className="form-select" value={form.bathrooms} onChange={e => setForm({ ...form, bathrooms: e.target.value })}>
                  {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Available From</label>
                <input type="date" className="form-input" value={form.availableFrom} onChange={e => setForm({ ...form, availableFrom: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Gender Preference</label>
                <select className="form-select" value={form.genderPreference} onChange={e => setForm({ ...form, genderPreference: e.target.value })}>
                  <option value="any">Any Gender</option>
                  <option value="male">Male Only</option>
                  <option value="female">Female Only</option>
                </select>
              </div>
            </div>

            <div className="flex gap-6 mt-4">
              {[
                { key: 'furnished', label: '🛋️ Furnished' },
                { key: 'smokingAllowed', label: '🚬 Smoking OK' },
                { key: 'petsAllowed', label: '🐾 Pets OK' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <label className="toggle">
                    <input type="checkbox" checked={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.checked })} />
                    <span className="toggle-slider" />
                  </label>
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="card card-elevated">
            <h2 className="font-semibold text-lg mb-4">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'WiFi', icon: '📶' },
                { label: 'AC', icon: '❄️' },
                { label: 'Kitchen', icon: '🍳' },
                { label: 'Parking', icon: '🅿️' },
                { label: 'Laundry', icon: '🧺' },
                { label: 'Gym', icon: '🏋️' },
                { label: 'Security', icon: '🛡️' },
                { label: 'Backup', icon: '⚡' },
                { label: 'Balcony', icon: '🌅' },
                { label: 'Lift', icon: '🛗' },
              ].map((item) => (
                <label key={item.label} 
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer group
                    ${form.amenities.includes(item.label) 
                      ? 'border-primary bg-primary/5 shadow-sm' 
                      : 'border-gray-100 hover:border-primary/20 hover:bg-gray-50'}
                  `}
                >
                  <input 
                    type="checkbox" 
                    className="hidden"
                    checked={form.amenities.includes(item.label)}
                    onChange={(e) => {
                      const newAmenities = e.target.checked 
                        ? [...form.amenities, item.label]
                        : form.amenities.filter(a => a !== item.label)
                      setForm({ ...form, amenities: newAmenities })
                    }}
                  />
                  <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                  <span className={`text-sm font-medium ${form.amenities.includes(item.label) ? 'text-primary' : 'text-gray-600'}`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="card card-elevated">
            <h2 className="font-semibold text-lg mb-2">Property Photos *</h2>
            <ImageUpload 
              images={form.photos}
              onChange={(newImages) => setForm(f => ({ ...f, photos: newImages }))}
              maxImages={10}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
            {loading ? <><span className="spinner" />Publishing...</> : '🚀 Publish Listing'}
          </button>
        </form>
      </div>
    </div>
  )
}
