'use client'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import CitySearchSelect from '@/components/CitySearchSelect'
import StateSearchSelect from '@/components/StateSearchSelect'
import AreaSearchSelect from '@/components/AreaSearchSelect'
import MapPicker from '@/components/MapPicker'
import ImageUpload from '@/components/ImageUpload'

const SCHEDULE_OPTIONS = [
  { value: 'day',      label: '☀️ Day Worker',   desc: '9–5 schedule' },
  { value: 'night',    label: '🌙 Night Worker',  desc: 'Evening / night shifts' },
  { value: 'flexible', label: '🔄 Flexible',      desc: 'Work from home / WFH' },
]

const LIFESTYLE_OPTIONS = [
  { value: 'quiet',    label: '🤫 Quiet',    desc: 'I prefer a peaceful environment' },
  { value: 'social',   label: '🎉 Social',   desc: 'I love having friends over' },
  { value: 'moderate', label: '⚖️ Moderate', desc: 'Mix of both' },
]

export default function PostRoommatePage() {
  const { user, token, updateUser } = useAuthStore()

  const [form, setForm] = useState({
    budget: '', workSchedule: '', lifestyle: '',
    cleanlinessLevel: 3, smokingOk: false, petsOk: false,
    preferredCity: '', preferredState: '', preferredArea: '',
    
    hasFlat: false,
    propTitle: '', propDescription: '', propAddress: '', propCity: '', propState: '', propArea: '',
    propRent: '', propDeposit: '', propBedrooms: '1', propBathrooms: '1',
    propFurnished: false, propSmokingAllowed: false, propPetsAllowed: false,
    propGenderPreference: 'any', propAvailableFrom: '',
    propPhotos: [] as string[],
    propAmenities: [] as string[],
    propLat: undefined as number | undefined,
    propLng: undefined as number | undefined,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // If we have a user already, we can use their ID to fetch full details
    // The layout ensures we have a user eventually.
    if (!user) return

    fetch('/api/users/me', { 
      headers: { 
        Authorization: token ? `Bearer ${token}` : '' 
      } 
    })
      .then(r => r.json())
      .then(d => {
        if (d.user) {
          setForm(f => ({
            ...f,
            budget: d.user.budget?.toString() || '', 
            workSchedule: d.user.workSchedule || '',
            lifestyle: d.user.lifestyle || '', 
            cleanlinessLevel: d.user.cleanlinessLevel || 3,
            smokingOk: d.user.smokingOk || false, 
            petsOk: d.user.petsOk || false,
            preferredCity: d.user.preferredCity || '', 
            preferredState: d.user.preferredState || '', 
            preferredArea: d.user.preferredArea || '',
          }))
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [user, token])

  // Safety fallback: stop loading after 3 seconds anyway
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const savePreferences = async () => {
    setSaving(true); setSuccess(false); setError('')
    try {
      if (form.hasFlat) {
        if (!form.propTitle.trim()) { setError('Property title is required'); setSaving(false); return }
        if (!form.propRent) { setError('Monthly rent is required'); setSaving(false); return }
        const validPhotos = form.propPhotos.filter(p => p.trim())
        if (validPhotos.length < 3) {
          setError('Please provide a minimum of 3 pictures for the property.');
          setSaving(false);
          return;
        }

        const propRes = await fetch('/api/properties', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '' 
          },
          body: JSON.stringify({
            title: form.propTitle,
            description: form.propDescription,
            address: form.propAddress,
            city: form.propCity,
            state: form.propState,
            area: form.propArea,
            rent: parseInt(form.propRent),
            deposit: form.propDeposit ? parseInt(form.propDeposit) : undefined,
            bedrooms: parseInt(form.propBedrooms),
            bathrooms: parseInt(form.propBathrooms),
            furnished: form.propFurnished,
            smokingAllowed: form.propSmokingAllowed,
            petsAllowed: form.propPetsAllowed,
            genderPreference: form.propGenderPreference,
            availableFrom: form.propAvailableFrom,
            amenities: form.propAmenities,
            photos: validPhotos,
            isRoommateListing: true,
            lat: form.propLat,
            lng: form.propLng,
          }),
        })

        if (!propRes.ok) {
          const pData = await propRes.json()
          setError(pData.error || 'Failed to save property details')
          setSaving(false)
          return
        }
      }

      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '' 
        },
        body: JSON.stringify({
          budget: form.budget ? parseInt(form.budget) : null,
          workSchedule: form.workSchedule,
          lifestyle: form.lifestyle,
          cleanlinessLevel: form.cleanlinessLevel,
          smokingOk: form.smokingOk,
          petsOk: form.petsOk,
          preferredCity: form.preferredCity,
          preferredState: form.preferredState,
          preferredArea: form.preferredArea,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to save'); return }
      
      updateUser({
        budget: data.user.budget,
        workSchedule: data.user.workSchedule,
        lifestyle: data.user.lifestyle,
        cleanlinessLevel: data.user.cleanlinessLevel,
        smokingOk: data.user.smokingOk,
        petsOk: data.user.petsOk,
        preferredCity: data.user.preferredCity,
        preferredState: data.user.preferredState,
        preferredArea: data.user.preferredArea,
      })
      
      setSuccess(true)
      if (form.hasFlat) {
        setForm(f => ({
          ...f,
          hasFlat: false,
          propTitle: '', propDescription: '', propAddress: '', propCity: '', propState: '', propArea: '',
          propRent: '', propDeposit: '', propPhotos: [], propAmenities: [],
        }))
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error(err)
      setError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="p-8">
      <div className="skeleton" style={{ height: 400, maxWidth: 680, background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)' }} />
    </div>
  )

  return (
    <div className="p-8 animate-fadeIn">
      <div style={{ maxWidth: 680 }}>
        <h1 className="text-3xl font-bold mb-2">Post Roommate Requirement</h1>
        <p className="text-secondary-color mb-8">
          Fill out your preferences so potential roommates and property owners can find you!
        </p>

        {success && <div className="alert alert-success mb-6">✅ Roommate requirement posted successfully! You are now visible in the Roommates feed.</div>}
        {error && <div className="alert alert-error mb-6">⚠️ {error}</div>}

        {/* Flat Ownership Question */}
        <div className="card card-elevated mb-6">
          <h2 className="font-semibold text-lg mb-3">Property Ownership</h2>
          <p className="text-sm text-secondary-color mb-4">Do you already have an apartment/flat secured for yourself?</p>
          <div className="flex gap-4">
            <button 
              type="button" 
              className={`btn flex-1 ${!form.hasFlat ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => setForm(f => ({ ...f, hasFlat: false }))}
            >
              🏠 No, looking for a flat
            </button>
            <button 
              type="button" 
              className={`btn flex-1 ${form.hasFlat ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => setForm(f => ({ ...f, hasFlat: true }))}
            >
              🔑 Yes, I already have a flat
            </button>
          </div>
        </div>

        {/* Property Form (visible if hasFlat is true) */}
        {form.hasFlat && (
          <div className="card card-elevated mb-6 animate-fadeIn">
            <h2 className="font-semibold text-lg mb-4">Property Details</h2>
            <div className="flex flex-col gap-4">
              <div className="form-group">
                <label className="form-label">Property Title *</label>
                <input className="form-input" placeholder="e.g., Cozy 1BHK in Powai near Hiranandani"
                  value={form.propTitle} onChange={e => setForm({ ...form, propTitle: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" placeholder="Describe your property..."
                  value={form.propDescription} onChange={e => setForm({ ...form, propDescription: e.target.value })} style={{ minHeight: 100 }} />
              </div>

              <div className="grid grid-3 gap-4">
                <div className="form-group" style={{ zIndex: 22 }}>
                  <label className="form-label">State</label>
                  <StateSearchSelect
                    value={form.propState}
                    onChange={s => setForm({ ...form, propState: s })}
                  />
                </div>
                <div className="form-group" style={{ zIndex: 21 }}>
                  <label className="form-label">City *</label>
                  <CitySearchSelect
                    value={form.propCity}
                    onChange={c => setForm({ ...form, propCity: c })}
                  />
                </div>
                <div className="form-group" style={{ zIndex: 20 }}>
                  <label className="form-label">Area / Locality *</label>
                  <AreaSearchSelect
                    value={form.propArea}
                    onChange={a => setForm({ ...form, propArea: a })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Pin on Map (Optional)</label>
                <MapPicker 
                  defaultCity={form.propCity}
                  city={form.propCity}
                  state={form.propState}
                  area={form.propArea}
                  onLocationSelect={(loc) => {
                    setForm(f => ({
                      ...f,
                      propAddress: loc.address || f.propAddress,
                      propCity: loc.city || f.propCity,
                      propState: loc.state || f.propState,
                      propArea: loc.area || f.propArea,
                      propLat: loc.lat,
                      propLng: loc.lng
                    }))
                  }} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Full Address</label>
                <input className="form-input" placeholder="Building, Street, Pincode"
                  value={form.propAddress} onChange={e => setForm({ ...form, propAddress: e.target.value })} />
              </div>

              <div className="grid grid-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Monthly Rent (₹) *</label>
                  <input type="number" className="form-input" placeholder="15000"
                    value={form.propRent} onChange={e => setForm({ ...form, propRent: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Security Deposit (₹)</label>
                  <input type="number" className="form-input" placeholder="45000"
                    value={form.propDeposit} onChange={e => setForm({ ...form, propDeposit: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-3 gap-4">
                <div className="form-group">
                  <label className="form-label">Bedrooms</label>
                  <select className="form-select" value={form.propBedrooms}
                    onChange={e => setForm({ ...form, propBedrooms: e.target.value })}>
                    <option value="1">1 BHK</option>
                    <option value="2">2 BHK</option>
                    <option value="3">3 BHK</option>
                    <option value="4">4+ BHK</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Bathrooms</label>
                  <select className="form-select" value={form.propBathrooms}
                    onChange={e => setForm({ ...form, propBathrooms: e.target.value })}>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3+</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Gender Preference</label>
                  <select className="form-select" value={form.propGenderPreference}
                    onChange={e => setForm({ ...form, propGenderPreference: e.target.value })}>
                    <option value="any">Any Gender</option>
                    <option value="male">Male Only</option>
                    <option value="female">Female Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Available From</label>
                  <input type="date" className="form-input"
                    value={form.propAvailableFrom} onChange={e => setForm({ ...form, propAvailableFrom: e.target.value })} />
                </div>
                <div className="flex gap-4 mt-8">
                  {[
                    { key: 'propFurnished', label: '🛋️ Furnished' },
                    { key: 'propSmokingAllowed', label: '🚬 Smoking OK' },
                    { key: 'propPetsAllowed', label: '🐾 Pets OK' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={(form as any)[key]}
                        onChange={e => setForm({ ...form, [key]: e.target.checked })} />
                      <span className="text-xs">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label mb-4">Property Amenities</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                      className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all cursor-pointer group
                        ${form.propAmenities.includes(item.label) 
                          ? 'border-primary bg-primary/5 shadow-sm' 
                          : 'border-gray-100 hover:border-primary/10 hover:bg-gray-50'}
                      `}
                    >
                      <input 
                        type="checkbox" 
                        className="hidden"
                        checked={form.propAmenities.includes(item.label)}
                        onChange={(e) => {
                          const newAmenities = e.target.checked 
                            ? [...form.propAmenities, item.label]
                            : form.propAmenities.filter(a => a !== item.label)
                          setForm({ ...form, propAmenities: newAmenities })
                        }}
                      />
                      <span className="text-lg group-hover:scale-110 transition-transform">{item.icon}</span>
                      <span className={`text-[11px] font-bold ${form.propAmenities.includes(item.label) ? 'text-primary' : 'text-gray-500'}`}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label mb-2 flex items-center gap-2">
                  Property Pictures (Minimum 3 Required)
                </label>
                <div className="flex flex-col gap-4">
                  <ImageUpload 
                    images={form.propPhotos}
                    onChange={(newImages) => setForm(f => ({ ...f, propPhotos: newImages }))}
                    maxImages={10}
                  />
                </div>
              </div>

            </div>
          </div>
        )}

        <div className="card card-elevated mb-6">
          <h2 className="font-semibold text-lg mb-4">Location & Budget Preferences</h2>
          <div className="flex flex-col gap-5">
            <div className="grid grid-3 gap-4">
              <div className="form-group" style={{ zIndex: 12 }}>
                <label className="form-label">Preferred State</label>
                <StateSearchSelect
                  value={form.preferredState}
                  onChange={s => setForm({ ...form, preferredState: s })}
                />
              </div>
              <div className="form-group" style={{ zIndex: 11 }}>
                <label className="form-label">Preferred City</label>
                <CitySearchSelect
                  value={form.preferredCity}
                  onChange={c => setForm({ ...form, preferredCity: c })}
                />
              </div>
              <div className="form-group" style={{ zIndex: 10 }}>
                <label className="form-label">Preferred Area</label>
                <AreaSearchSelect
                  value={form.preferredArea}
                  onChange={a => setForm({ ...form, preferredArea: a })}
                />
              </div>
            </div>
            <div className="form-group" style={{ maxWidth: 200 }}>
              <label className="form-label">Max Monthly Budget (₹)</label>
              <input type="number" className="form-input" placeholder="20000"
                value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="card card-elevated mb-6">
          <h2 className="font-semibold text-lg mb-4">Lifestyle & Habits</h2>
          <div className="flex flex-col gap-5">
            <div className="form-group">
              <label className="form-label">Work Schedule</label>
              <div className="grid grid-3 gap-3">
                {SCHEDULE_OPTIONS.map(s => (
                  <button key={s.value} type="button" className="card"
                    onClick={() => setForm({ ...form, workSchedule: s.value })}
                    style={{
                      cursor: 'pointer', textAlign: 'center', padding: '0.875rem',
                      borderColor: form.workSchedule === s.value ? 'var(--primary)' : 'var(--border)',
                      background: form.workSchedule === s.value ? 'rgba(99,102,241,0.1)' : 'var(--bg-surface)',
                    }}>
                    <div className="font-medium text-sm">{s.label}</div>
                    <div className="text-xs text-muted mt-0.5">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Lifestyle</label>
              <div className="grid grid-3 gap-3">
                {LIFESTYLE_OPTIONS.map(s => (
                  <button key={s.value} type="button" className="card"
                    onClick={() => setForm({ ...form, lifestyle: s.value })}
                    style={{
                      cursor: 'pointer', textAlign: 'center', padding: '0.875rem',
                      borderColor: form.lifestyle === s.value ? 'var(--primary)' : 'var(--border)',
                      background: form.lifestyle === s.value ? 'rgba(99,102,241,0.1)' : 'var(--bg-surface)',
                    }}>
                    <div className="font-medium text-sm">{s.label}</div>
                    <div className="text-xs text-muted mt-0.5">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Cleanliness Level ({form.cleanlinessLevel}/5)</label>
              <input type="range" min={1} max={5} value={form.cleanlinessLevel}
                onChange={e => setForm({ ...form, cleanlinessLevel: parseInt(e.target.value) })} />
              <div className="flex justify-between text-xs text-muted mt-1">
                <span>Relaxed</span><span>Very Clean</span>
              </div>
            </div>

            <div className="flex gap-8 mt-2">
              {[
                { key: 'smokingOk', label: '🚬 Smoking acceptable' },
                { key: 'petsOk', label: '🐾 Pets acceptable' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <label className="toggle">
                    <input type="checkbox" checked={(form as any)[key]}
                      onChange={e => setForm({ ...form, [key]: e.target.checked })} />
                    <span className="toggle-slider" />
                  </label>
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-lg w-full" onClick={savePreferences} disabled={saving}>
          {saving ? <><span className="spinner" />Posting...</> : '🚀 Post Roommate Requirement'}
        </button>
      </div>
    </div>
  )
}
