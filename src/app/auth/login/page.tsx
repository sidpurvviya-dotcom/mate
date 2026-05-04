'use client'
import { useState, useRef, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

type Step = 'credentials' | 'verify-email'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isNewUser = searchParams.get('newuser') === '1'
  const { setAuth, updateUser, user, token } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  // ── Step 1 state ──────────────────────────────────────────
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // ── Step 2 state ──────────────────────────────────────────
  const [step, setStep] = useState<Step>('credentials')
  const [tempToken, setTempToken] = useState('')      // JWT from login (before verified)
  const [tempUser, setTempUser] = useState<any>(null)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [verifying, setVerifying] = useState(false)
  const [sending, setSending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [previewUrl, setPreviewUrl] = useState('')
  const [devOtp, setDevOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Mount guard — prevents Zustand hydration from breaking React
  useEffect(() => { setMounted(true) }, [])

  // Redirect if already logged in
  useEffect(() => {
    if (mounted && user && user.emailVerified) router.push('/dashboard')
  }, [mounted, user, router])

  // Auto-trigger OTP step when coming from registration (?newuser=1)
  useEffect(() => {
    if (!mounted) return
    if (isNewUser && token && user && !user.emailVerified) {
      setTempToken(token)
      setTempUser(user)
      sendOtp(token)
      setStep('verify-email')
    }
  }, [mounted, isNewUser, token])

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  // ── Step 1: Login ──────────────────────────────────────────
  const handleGoogleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com'
    const redirectUri = encodeURIComponent(window.location.origin + '/api/auth/google/callback')
    const scope = encodeURIComponent('openid email profile')
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`
    window.location.href = url
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Login failed'); return }

      // If email not verified → show OTP step instead of dashboard
      if (!data.user.emailVerified) {
        setTempToken(data.token)
        setTempUser(data.user)
        setAuth(data.user, data.token)   // store auth so API calls work
        await sendOtp(data.token)        // auto-send OTP
        setStep('verify-email')
        return
      }

      setAuth(data.user, data.token)
      router.push('/dashboard')
    } catch {
      setError('Network error. Please try again.')
    } finally { setLoading(false) }
  }

  // ── Send OTP ───────────────────────────────────────────────
  const sendOtp = async (tok?: string) => {
    setSending(true); setOtpError(''); setPreviewUrl(''); setDevOtp('')
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tok || tempToken}` },
      })
      const data = await res.json()
      if (!res.ok) {
        setOtpError(data.error || 'Failed to send OTP')
        return
      }
      setCountdown(60)
      if (data.previewUrl) setPreviewUrl(data.previewUrl)
      if (data.devOtp)    setDevOtp(data.devOtp)
    } finally { setSending(false) }
  }

  // ── OTP input handlers ─────────────────────────────────────
  const handleOtpChange = (i: number, value: string) => {
    if (value.length === 6 && /^\d{6}$/.test(value)) {
      setOtp(value.split(''))
      inputRefs.current[5]?.focus()
      return
    }
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...otp]; next[i] = digit; setOtp(next)
    if (digit && i < 5) inputRefs.current[i + 1]?.focus()
  }
  const handleOtpKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus()
  }
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) { setOtp(pasted.split('')); inputRefs.current[5]?.focus() }
  }

  // ── Step 2: Verify OTP ─────────────────────────────────────
  const handleVerify = async () => {
    const code = otp.join('')
    if (code.length !== 6) { setOtpError('Please enter the complete 6-digit code'); return }
    setVerifying(true); setOtpError('')
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tempToken}` },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (!res.ok) { setOtpError(data.error); return }
      updateUser({ emailVerified: true })
      router.push('/dashboard')
    } finally { setVerifying(false) }
  }

  // ── Demo fill + auto-submit ────────────────────────────────
  const fillDemo = async (role: 'owner' | 'seeker') => {
    const email = role === 'owner' ? 'riya.sharma@example.com' : 'demo.seeker@example.com'
    const password = 'password123'
    setForm({ email, password })
    // Auto-login immediately
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Login failed'); setLoading(false); return }
      if (!data.user.emailVerified) {
        setTempToken(data.token)
        setTempUser(data.user)
        setAuth(data.user, data.token)
        await sendOtp(data.token)
        setStep('verify-email')
        setLoading(false)
        return
      }
      setAuth(data.user, data.token)
      router.push('/dashboard')
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  // ══════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--bg-base)', padding: '2rem 1rem' }}>

      {/* Background glow */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <Link href="/" className="logo-container" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
          <img src="/logo.svg" alt="Mate Logo" className="mate-logo" />
        </Link>

        <div className="card card-elevated">

          {/* ── STEP 1: Credentials ─────────────────────── */}
          {step === 'credentials' && (
            <>
              <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
              <p className="text-secondary-color text-sm mb-6">Sign in to continue to Mate</p>

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

              <div className="flex items-center gap-3 mb-5">
                <div className="divider" style={{ flex: 1 }} />
                <span className="text-xs text-muted">or sign in manually</span>
                <div className="divider" style={{ flex: 1 }} />
              </div>

              {error && (
                <div className="alert alert-error mb-4">
                  <span>⚠️</span> {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email Address</label>
                  <input id="email" type="email" className="form-input"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="password">Password</label>
                  <div className="relative">
                    <input id="password" type={showPassword ? 'text' : 'password'} className="form-input"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
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
                <button type="submit" className="btn btn-primary w-full"
                  style={{ marginTop: '0.25rem', padding: '0.875rem' }}
                  disabled={loading}>
                  {loading ? <><span className="spinner" />Signing in...</> : 'Sign In →'}
                </button>
              </form>

              <p className="text-center text-sm text-secondary-color mt-6">
                Don&apos;t have an account?{' '}
                <Link href="/auth/register" className="text-primary-color font-medium">Create one →</Link>
              </p>
            </>
          )}

          {/* ── STEP 2: Email Verification ───────────────── */}
          {step === 'verify-email' && (
            <>
              {/* Back button */}
              <button className="btn btn-ghost btn-sm mb-4"
                style={{ padding: '4px 8px', fontSize: '0.8125rem' }}
                onClick={() => { setStep('credentials'); setOtp(['','','','','','']); setOtpError('') }}>
                ← Back
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <div style={{ fontSize: '2.5rem', marginBottom: '0.625rem' }}>📧</div>
                <h1 className="text-xl font-bold mb-1">Verify your email</h1>
                <p className="text-secondary-color text-sm" style={{ lineHeight: 1.7 }}>
                  We sent a 6-digit code to
                </p>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-full)', padding: '0.3rem 0.875rem',
                  marginTop: '0.375rem', fontSize: '0.875rem', fontWeight: 600,
                }}>
                  📬 {tempUser?.email || form.email}
                </div>
              </div>

              {/* Ethereal preview link */}
              {previewUrl && (
                <div className="alert alert-info mb-4" style={{ padding: '0.75rem 1rem' }}>
                  <div>
                    <div className="text-sm font-medium mb-1">📬 Email sent! Click to open it:</div>
                    <a href={previewUrl} target="_blank" rel="noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                        background: 'rgba(99,102,241,0.2)', borderRadius: 'var(--radius-sm)',
                        padding: '0.3rem 0.75rem', fontSize: '0.8125rem', fontWeight: 600,
                        color: 'var(--primary-light)',
                      }}>
                      🔗 Open Test Inbox →
                    </a>
                    <div className="text-xs text-muted mt-1">Ethereal test inbox — opens in new tab</div>
                  </div>
                </div>
              )}

              {/* Dev OTP fallback */}
              {devOtp && !previewUrl && (
                <div className="alert alert-warning mb-4" style={{ padding: '0.75rem 1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div className="text-sm font-medium">⚠️ SMTP not set up — dev mode</div>
                    <div className="flex items-center gap-3 mt-2">
                      <span style={{ fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.2em', color: '#fbbf24' }}>
                        {devOtp}
                      </span>
                      <button className="btn btn-sm"
                        style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }}
                        onClick={() => { setOtp(devOtp.split('')); inputRefs.current[5]?.focus() }}>
                        Auto-fill ↑
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {otpError && (
                <div className="alert alert-error mb-4">
                  <span>⚠️</span> {otpError}
                </div>
              )}

              {/* 6-digit OTP boxes */}
              <div className="mb-5">
                <label className="form-label mb-3" style={{ display: 'block', textAlign: 'center' }}>
                  Enter verification code
                </label>
                <div className="flex justify-center gap-2" onPaste={handlePaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { inputRefs.current[i] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      autoFocus={i === 0}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKey(i, e)}
                      style={{
                        width: 48, height: 56,
                        textAlign: 'center',
                        fontSize: '1.375rem',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        background: 'var(--bg-surface)',
                        border: `2px solid ${digit ? 'var(--primary)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        transition: 'border-color 0.15s, box-shadow 0.15s',
                        boxShadow: digit ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Verify button */}
              <button className="btn btn-primary w-full" style={{ padding: '0.875rem' }}
                onClick={handleVerify}
                disabled={verifying || otp.join('').length !== 6}>
                {verifying
                  ? <><span className="spinner" />Verifying...</>
                  : '✓ Verify & Continue to Dashboard'}
              </button>

              {/* Resend row */}
              <div className="flex items-center justify-between text-sm mt-4">
                <span className="text-secondary-color">Didn&apos;t receive it?</span>
                {countdown > 0 ? (
                  <span className="text-muted">Resend in {countdown}s</span>
                ) : (
                  <button className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--primary-light)', padding: '4px 10px' }}
                    onClick={() => sendOtp()}
                    disabled={sending}>
                    {sending ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Resend Code →'}
                  </button>
                )}
              </div>

              {/* Hint */}
              <div style={{
                marginTop: '1.25rem', padding: '0.75rem 0.875rem',
                background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)',
                borderLeft: '3px solid var(--primary)',
              }}>
                <p className="text-xs text-secondary-color" style={{ lineHeight: 1.6 }}>
                  💡 Check your spam or junk folder if you don't see the email in your inbox.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <span className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
