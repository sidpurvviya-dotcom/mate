'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export default function RegisterPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'seeker' as 'owner' | 'seeker',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState<'details' | 'done'>('details')

  const validatePhone = (ph: string) => /^[6-9]\d{9}$/.test(ph.replace(/\s/g, ''))

  const handleGoogleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com'
    const redirectUri = encodeURIComponent(window.location.origin + '/api/auth/google/callback')
    const scope = encodeURIComponent('openid email profile')
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`
    window.location.href = url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (!validatePhone(form.phone)) {
      setError('Enter a valid 10-digit Indian mobile number (starts with 6–9)')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, phone: form.phone.replace(/\s/g, '') }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Registration failed'); return }
      setAuth(data.user, data.token)
      // Go to login with ?newuser=1 — login page detects this and jumps to OTP step
      router.push('/auth/login?newuser=1')
    } catch {
      setError('Network error. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--bg-base)', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>

        {/* Logo */}
        <Link href="/" className="logo-container" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
          <img src="/logo.svg" alt="Mate Logo" className="mate-logo" />
        </Link>

        <div className="card card-elevated">
          <h1 className="text-2xl font-bold mb-1">Create your account</h1>
          <p className="text-secondary-color text-sm mb-6">Join thousands finding their perfect space and roommate</p>


          <button type="button" className="btn btn-secondary w-full flex items-center justify-center gap-2 mb-4"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '0.875rem' }}
            onClick={handleGoogleLogin} disabled={loading}>
            {loading ? <span className="spinner" /> : (
              <>
                <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <div style={{ padding: '0 1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>or sign up manually</div>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {error && (
            <div className="alert alert-error mb-4">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name</label>
              <input id="reg-name" type="text" className="form-input"
                placeholder="Your full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required />
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address</label>
              <div className="relative">
                <span style={{
                  position: 'absolute', left: '0.875rem', top: '50%',
                  transform: 'translateY(-50%)', fontSize: '1rem',
                }}>📧</span>
                <input id="reg-email" type="email" className="form-input form-input-icon"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required />
              </div>
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-phone">
                Mobile Number
                <span className="text-xs text-muted ml-2">(for OTP verification)</span>
              </label>
              <div className="flex gap-2">
                <div className="flex items-center gap-1 px-3"
                  style={{
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)', whiteSpace: 'nowrap',
                    fontSize: '0.875rem', color: 'var(--text-secondary)',
                  }}>
                  🇮🇳 +91
                </div>
                <input id="reg-phone" type="tel" className="form-input"
                  placeholder="98765 43210"
                  value={form.phone}
                  maxLength={10}
                  onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  required />
              </div>
              <p className="text-xs text-muted mt-1">10-digit Indian mobile number, starting with 6, 7, 8, or 9</p>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div className="relative">
                <span style={{
                  position: 'absolute', left: '0.875rem', top: '50%',
                  transform: 'translateY(-50%)', fontSize: '1rem',
                }}>🔒</span>
                <input id="reg-password" type={showPassword ? 'text' : 'password'} className="form-input form-input-icon"
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  style={{ paddingRight: '2.5rem' }} />
                <button type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted hover:text-primary transition"
                  style={{
                    position: 'absolute', right: '0.875rem', top: '50%',
                    transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer',
                    padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  title={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Terms */}
            <p className="text-xs text-muted" style={{ lineHeight: 1.6 }}>
              By creating an account you agree to our{' '}
              <span className="text-primary-color" style={{ cursor: 'pointer' }}>Terms of Service</span>
              {' '}and{' '}
              <span className="text-primary-color" style={{ cursor: 'pointer' }}>Privacy Policy</span>.
              Your phone number will be used for OTP verification only.
            </p>

            <button type="submit" className="btn btn-primary w-full" disabled={loading}
              style={{ padding: '0.875rem' }}>
              {loading
                ? <><span className="spinner" />Creating account...</>
                : 'Create Account & Verify →'}
            </button>
          </form>

          <p className="text-center text-sm text-secondary-color mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary-color font-medium">Sign in →</Link>
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-3 mt-6">
          {[
            { n: 1, label: 'Details' },
            { n: 2, label: 'Verify Email' },
            { n: 3, label: 'Verify Phone' },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: s.n === 1 ? 'var(--primary)' : 'var(--bg-elevated)',
                border: `2px solid ${s.n === 1 ? 'var(--primary)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 700,
                color: s.n === 1 ? 'white' : 'var(--text-muted)',
              }}>
                {s.n}
              </div>
              <span className="text-xs" style={{ color: s.n === 1 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {s.label}
              </span>
              {i < 2 && <div style={{ width: 24, height: 1, background: 'var(--border)' }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
