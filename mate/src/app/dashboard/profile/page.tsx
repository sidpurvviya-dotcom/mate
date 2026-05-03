'use client'
import { useState, useEffect, Suspense } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useSearchParams } from 'next/navigation'
import CitySearchSelect from '@/components/CitySearchSelect'

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

const AMENITY_OPTIONS = [
  'WiFi', 'AC', 'Washing Machine', 'Refrigerator', 'Microwave', 'TV',
  'Parking', 'Gym', 'Swimming Pool', 'Power Backup', 'CCTV', 'Security',
  'Balcony', 'Garden', 'Hot Water', 'Gas Pipeline', 'Meals Included', 'Laundry',
]

// ─── OTP Box (reusable) ─────────────────────────────────────────────────────
interface OTPBoxProps {
  title: string
  subtitle: string
  icon: string
  verified: boolean
  onSend: () => Promise<{ devOtp?: string; error?: string }>
  onVerify: (code: string) => Promise<{ error?: string }>
  onChangeContact?: () => void
  extraAction?: React.ReactNode
  accent?: string
}

function OTPBox({ title, subtitle, icon, verified, onSend, onVerify, onChangeContact, accent = 'var(--primary)' }: OTPBoxProps) {
  const [sent, setSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [devOtp, setDevOtp] = useState('')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const handleSend = async () => {
    setSending(true); setError('')
    const res = await onSend()
    setSending(false)
    if (res.error) { setError(res.error); return }
    setSent(true)
    setCountdown(60)
    if (res.devOtp) setDevOtp(res.devOtp)
  }

  const handleVerify = async () => {
    if (otp.length !== 6) { setError('Enter the 6-digit OTP'); return }
    setVerifying(true); setError('')
    const res = await onVerify(otp)
    setVerifying(false)
    if (res.error) { setError(res.error); return }
    setSuccess(true)
  }

  if (verified || success) {
    return (
      <div className="card" style={{
        borderColor: 'var(--success)',
        background: 'rgba(16,185,129,0.05)',
        padding: '1.25rem',
      }}>
        <div className="flex items-center gap-3">
          <div style={{ fontSize: '2rem' }}>{icon}</div>
          <div style={{ flex: 1 }}>
            <div className="font-semibold flex items-center gap-2">
              {title}
              <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>✅ Verified</span>
            </div>
            <div className="text-sm text-muted">{subtitle}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card" style={{
      borderColor: sent ? accent : 'var(--warning)',
      background: 'rgba(245,158,11,0.04)',
      padding: '1.25rem',
    }}>
      <div className="flex items-center gap-3 mb-3">
        <div style={{ fontSize: '2rem' }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <div className="font-semibold flex items-center gap-2">
            {title}
            <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>⚠ Not Verified</span>
          </div>
          <div className="text-sm text-muted">{subtitle}</div>
        </div>
        {onChangeContact && (
          <button className="btn btn-ghost btn-sm" onClick={onChangeContact}
            style={{ fontSize: '0.75rem' }}>
            Change
          </button>
        )}
      </div>

      {error && <div className="alert alert-error mb-3" style={{ padding: '0.625rem 0.875rem', fontSize: '0.8125rem' }}>{error}</div>}

      {devOtp && (
        <div className="alert alert-info mb-3" style={{ padding: '0.625rem 0.875rem', fontSize: '0.8125rem' }}>
          📱 <strong>Dev OTP:</strong> {devOtp} &nbsp;
          <button className="btn btn-ghost btn-sm" style={{ padding: '0 4px', fontSize: '0.75rem' }}
            onClick={() => setOtp(devOtp)}>
            Auto-fill ↑
          </button>
        </div>
      )}

      {!sent ? (
        <button className="btn btn-primary btn-sm w-full" onClick={handleSend} disabled={sending}>
          {sending ? <><span className="spinner" />Sending OTP...</> : `📨 Send OTP to ${title.includes('Phone') ? 'Phone' : 'Email'}`}
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <div>
            <label className="form-label" style={{ fontSize: '0.8125rem' }}>Enter 6-digit OTP</label>
            <div className="flex gap-2 mt-1">
              {/* OTP digit boxes */}
              <div className="flex gap-1" style={{ flex: 1 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <input
                    key={i}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    id={`otp-${i}`}
                    value={otp[i] || ''}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '')
                      const arr = otp.split('')
                      arr[i] = v
                      const next = arr.join('').slice(0, 6)
                      setOtp(next)
                      if (v && i < 5) document.getElementById(`otp-${i + 1}`)?.focus()
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !otp[i] && i > 0)
                        document.getElementById(`otp-${i - 1}`)?.focus()
                    }}
                    onPaste={(e) => {
                      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
                      setOtp(pasted)
                      e.preventDefault()
                    }}
                    style={{
                      width: 40, height: 48, textAlign: 'center', fontSize: '1.25rem',
                      fontWeight: 700, background: 'var(--bg-surface)',
                      border: `2px solid ${otp[i] ? accent : 'var(--border)'}`,
                      borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
                      transition: 'var(--transition)', outline: 'none',
                    }}
                  />
                ))}
              </div>
              <button className="btn btn-primary" onClick={handleVerify}
                disabled={verifying || otp.length !== 6}
                style={{ minWidth: 80 }}>
                {verifying ? <span className="spinner" /> : 'Verify'}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">OTP expires in 10 minutes</span>
            {countdown > 0 ? (
              <span className="text-xs text-muted">Resend in {countdown}s</span>
            ) : (
              <button className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                onClick={handleSend} disabled={sending}>
                Resend OTP
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Change Phone Modal ─────────────────────────────────────────────────────
function ChangePhoneModal({ current, onSave, onClose, token }: {
  current: string; onSave: (p: string) => void; onClose: () => void; token: string | null
}) {
  const [phone, setPhone] = useState(current.replace('+91', ''))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    const clean = phone.replace(/\D/g, '')
    if (!/^[6-9]\d{9}$/.test(clean)) { setError('Enter a valid 10-digit Indian mobile number'); return }
    setSaving(true)
    const res = await fetch('/api/auth/verify-phone', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ phone: clean }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error); return }
    onSave(data.phone)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="font-bold text-xl mb-4">Change Phone Number</h2>
        {error && <div className="alert alert-error mb-4">{error}</div>}
        <div className="form-group mb-4">
          <label className="form-label">New Mobile Number</label>
          <div className="flex gap-2">
            <div className="flex items-center gap-1 px-3"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', whiteSpace: 'nowrap', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              🇮🇳 +91
            </div>
            <input type="tel" className="form-input"
              placeholder="98765 43210" value={phone}
              maxLength={10}
              onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} />
          </div>
          <p className="text-xs text-muted mt-1">Changing will reset your phone verification status.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>
            {saving ? <span className="spinner" /> : 'Save & Re-verify'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Profile Page ──────────────────────────────────────────────────────
function ProfileContent() {
  const { user, token, updateUser } = useAuthStore()
  const searchParams = useSearchParams()
  const autoVerify = searchParams.get('verify') === '1'

  const [form, setForm] = useState({
    name: user?.name || '', bio: '', phone: '',
    budget: '', workSchedule: '', lifestyle: '',
    cleanlinessLevel: 3, smokingOk: false, petsOk: false,
    preferredCity: '', preferredState: '', preferredArea: '',
  })
  const [profileData, setProfileData] = useState<{
    emailVerified: boolean; phoneVerified: boolean; email: string; phone: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showChangePhone, setShowChangePhone] = useState(false)

  useEffect(() => {
    if (!token) {
      // If we're on the dashboard but have no token, we should redirect or at least stop loading
      setLoading(false)
      return
    }
    fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.user) {
          setForm({
            name: d.user.name || '', bio: d.user.bio || '', phone: d.user.phone || '',
            budget: d.user.budget?.toString() || '', workSchedule: d.user.workSchedule || '',
            lifestyle: d.user.lifestyle || '', cleanlinessLevel: d.user.cleanlinessLevel || 3,
            smokingOk: d.user.smokingOk || false, petsOk: d.user.petsOk || false,
            preferredCity: d.user.preferredCity || '', preferredState: d.user.preferredState || '', preferredArea: d.user.preferredArea || '',
          })
          setProfileData({
            emailVerified: d.user.emailVerified,
            phoneVerified: d.user.phoneVerified,
            email: d.user.email,
            phone: d.user.phone || '',
          })
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [token])

  const saveProfile = async () => {
    setSaving(true); setSuccess(false)
    const res = await fetch('/api/users/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, budget: form.budget ? parseInt(form.budget) : null }),
    })
    const data = await res.json()
    setSaving(false)
    if (res.ok) {
      updateUser({ name: data.user.name })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  // Email OTP handlers
  const sendEmailOtp = async () => {
    const res = await fetch('/api/auth/verify-email', {
      method: 'POST', headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    return res.ok ? { devOtp: data.devOtp } : { error: data.error }
  }
  const verifyEmailOtp = async (code: string) => {
    const res = await fetch('/api/auth/verify-email', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ code }),
    })
    const data = await res.json()
    if (res.ok) {
      updateUser({ emailVerified: true })
      setProfileData(p => p ? { ...p, emailVerified: true } : p)
    }
    return res.ok ? {} : { error: data.error }
  }

  // Phone OTP handlers
  const sendPhoneOtp = async () => {
    const res = await fetch('/api/auth/verify-phone', {
      method: 'POST', headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    return res.ok ? { devOtp: data.devOtp } : { error: data.error }
  }
  const verifyPhoneOtp = async (code: string) => {
    const res = await fetch('/api/auth/verify-phone', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ code }),
    })
    const data = await res.json()
    if (res.ok) {
      setProfileData(p => p ? { ...p, phoneVerified: true } : p)
    }
    return res.ok ? {} : { error: data.error }
  }

  if (loading) return (
    <div className="p-8">
      <div className="flex flex-col gap-4" style={{ maxWidth: 680 }}>
        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 90 }} />)}
      </div>
    </div>
  )

  return (
    <div className="p-8 animate-fadeIn">
      {showChangePhone && profileData && (
        <ChangePhoneModal
          current={profileData.phone}
          token={token}
          onSave={(p) => {
            setForm(f => ({ ...f, phone: p }))
            setProfileData(d => d ? { ...d, phone: p, phoneVerified: false } : d)
          }}
          onClose={() => setShowChangePhone(false)}
        />
      )}

      <div style={{ maxWidth: 680 }}>
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-secondary-color mb-8">Manage your account details and verification.</p>

        {success && <div className="alert alert-success mb-6">✅ Profile saved successfully!</div>}


        {/* ── Basic Info ─────────────────────────────────────── */}
        <div className="card card-elevated mb-6">
          <h2 className="font-semibold text-lg mb-4">Basic Information</h2>
          <div className="flex items-center gap-4 mb-5">
            <div className="avatar avatar-xl" style={{ overflow: 'hidden' }}>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.name?.[0]
              )}
            </div>
            <div>
              <div className="font-semibold">{user?.name}</div>
              <div className="text-sm text-muted">{user?.email}</div>
              <div className="badge badge-primary mt-1">
                {user?.role === 'owner' ? '🏠 Property Owner' : '🔍 Roommate Seeker'}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea className="form-textarea"
                placeholder="Tell potential roommates/owners a bit about yourself..."
                value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">
                Phone Number
                {profileData?.phoneVerified
                  ? <span className="text-success ml-2 text-xs">✓ Verified</span>
                  : <span className="text-warning ml-2 text-xs">⚠ Not verified</span>}
              </label>
              <div className="flex gap-2">
                <div className="flex items-center gap-1 px-3" style={{
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)', whiteSpace: 'nowrap',
                  fontSize: '0.875rem', color: 'var(--text-secondary)',
                }}>
                  🇮🇳 +91
                </div>
                <input className="form-input"
                  placeholder="Enter 10-digit mobile number"
                  value={form.phone?.replace('+91', '') || ''}
                  maxLength={10}
                  onChange={e => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 10)
                    setForm({ ...form, phone: v })
                  }} />
                {form.phone && (
                  <button className="btn btn-secondary btn-sm"
                    onClick={() => setShowChangePhone(true)}
                    style={{ whiteSpace: 'nowrap' }}>
                    Change
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <button className="btn btn-primary btn-lg w-full" onClick={saveProfile} disabled={saving}>
          {saving ? <><span className="spinner" />Saving...</> : '💾 Save Profile'}
        </button>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted">Loading profile...</div>}>
      <ProfileContent />
    </Suspense>
  )
}
