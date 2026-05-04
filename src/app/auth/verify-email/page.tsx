'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import Link from 'next/link'

function VerifyEmailContent() {
  const { user, token, updateUser } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [devOtp, setDevOtp] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [emailAddr, setEmailAddr] = useState(user?.email || '')

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Auto-send OTP on mount
  useEffect(() => {
    if (token && !user?.emailVerified) {
      handleSendOtp()
    } else if (user?.emailVerified) {
      router.push('/dashboard')
    }
  }, [token])

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const handleSendOtp = async () => {
    setSending(true); setError(''); setPreviewUrl(''); setDevOtp('')
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
        if (data.error?.includes('60 seconds')) setCountdown(60)
        return
      }
      setEmailSent(true)
      setCountdown(60)
      if (data.email) setEmailAddr(data.email)
      if (data.previewUrl) setPreviewUrl(data.previewUrl)
      if (data.devOtp) setDevOtp(data.devOtp)
    } finally { setSending(false) }
  }

  const handleChange = (index: number, value: string) => {
    // Handle paste of full code
    if (value.length === 6 && /^\d{6}$/.test(value)) {
      const digits = value.split('')
      setOtp(digits)
      inputRefs.current[5]?.focus()
      return
    }
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[index] = digit
    setOtp(next)
    if (digit && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      inputRefs.current[5]?.focus()
    }
  }

  const autoFillDevOtp = () => {
    if (devOtp) {
      setOtp(devOtp.split(''))
      inputRefs.current[5]?.focus()
    }
  }

  const handleVerify = async () => {
    const code = otp.join('')
    if (code.length !== 6) { setError('Please enter the complete 6-digit code'); return }
    setVerifying(true); setError('')
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      updateUser({ emailVerified: true })
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 2000)
    } finally { setVerifying(false) }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="text-center">
          <p className="text-muted mb-4">Please log in to verify your email.</p>
          <Link href="/auth/login" className="btn btn-primary">Go to Login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--bg-base)', padding: '2rem 1rem' }}>

      {/* Animated background circles */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <Link href="/" className="logo-container" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
          <img src="/logo.svg" alt="Mate Logo" className="mate-logo" />
        </Link>

        {success ? (
          /* ── Success State ── */
          <div className="card card-elevated text-center animate-fadeIn" style={{ padding: '3rem 2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }} className="animate-float">✅</div>
            <h1 className="text-2xl font-bold mb-2">Email Verified!</h1>
            <p className="text-secondary-color mb-6">
              Your email has been successfully verified. Redirecting to your dashboard…
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <span className="spinner" style={{ width: 28, height: 28 }} />
            </div>
          </div>
        ) : (
          /* ── OTP Entry ── */
          <div className="card card-elevated animate-fadeIn">

            {/* Header */}
            <div className="text-center mb-6">
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📧</div>
              <h1 className="text-2xl font-bold mb-2">Check your email</h1>
              <p className="text-secondary-color text-sm" style={{ lineHeight: 1.7 }}>
                We sent a 6-digit verification code to
              </p>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-full)', padding: '0.375rem 1rem',
                margin: '0.5rem 0 0', fontSize: '0.9rem', fontWeight: 600,
              }}>
                <span>📬</span> {emailAddr || user?.email}
              </div>
            </div>

            {/* Preview URL banner (Ethereal) */}
            {previewUrl && (
              <div className="alert alert-info mb-5" style={{ padding: '0.875rem 1rem' }}>
                <div>
                  <div className="font-medium text-sm mb-1">📬 Email sent! Open it to see your code:</div>
                  <a href={previewUrl} target="_blank" rel="noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                      background: 'rgba(99,102,241,0.2)', borderRadius: 'var(--radius-sm)',
                      padding: '0.375rem 0.875rem', fontSize: '0.8125rem', fontWeight: 600,
                      color: 'var(--primary-light)', textDecoration: 'none',
                    }}>
                    🔗 View Email Inbox →
                  </a>
                  <div className="text-xs text-muted mt-1">Opens Ethereal (test inbox) in a new tab</div>
                </div>
              </div>
            )}

            {/* Dev OTP autofill */}
            {devOtp && !previewUrl && (
              <div className="alert alert-warning mb-5" style={{ padding: '0.875rem 1rem' }}>
                <div style={{ flex: 1 }}>
                  <div className="text-sm font-medium">⚠️ SMTP not configured — dev fallback</div>
                  <div className="flex items-center gap-3 mt-2">
                    <div style={{
                      fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 700,
                      letterSpacing: '0.25em', color: '#fbbf24',
                    }}>{devOtp}</div>
                    <button className="btn btn-sm"
                      style={{ background: 'rgba(245,158,11,0.2)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }}
                      onClick={autoFillDevOtp}>
                      Auto-fill ↑
                    </button>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="alert alert-error mb-5">
                <span>⚠️</span> <span>{error}</span>
              </div>
            )}

            {/* OTP digit inputs */}
            <div className="mb-6">
              <label className="form-label mb-3 text-center w-full" style={{ display: 'block', textAlign: 'center' }}>
                Enter 6-digit code
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
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    autoFocus={i === 0}
                    style={{
                      width: 52, height: 60,
                      textAlign: 'center',
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      fontFamily: 'monospace',
                      background: 'var(--bg-surface)',
                      border: `2px solid ${digit ? 'var(--primary)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                      boxShadow: digit ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none',
                      outline: 'none',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Verify button */}
            <button
              className="btn btn-primary w-full"
              style={{ padding: '0.875rem', fontSize: '1rem', marginBottom: '1rem' }}
              onClick={handleVerify}
              disabled={verifying || otp.join('').length !== 6}>
              {verifying
                ? <><span className="spinner" /> Verifying...</>
                : '✓ Verify Email'}
            </button>

            {/* Resend row */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-secondary-color">Didn't receive it?</span>
              {countdown > 0 ? (
                <span className="text-muted">Resend in {countdown}s</span>
              ) : (
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--primary-light)', padding: '4px 10px' }}
                  onClick={handleSendOtp}
                  disabled={sending}>
                  {sending ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Resend Code →'}
                </button>
              )}
            </div>

            {/* Check spam hint */}
            <div style={{
              marginTop: '1.25rem', padding: '0.875rem', borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface)', borderLeft: '3px solid var(--primary)',
            }}>
              <p className="text-xs text-secondary-color" style={{ lineHeight: 1.6 }}>
                💡 <strong>Don't see the email?</strong> Check your spam/junk folder.
                The email comes from <em>noreply@mate.com</em>.
                If using the dev Ethereal link above, click it to open the test inbox.
              </p>
            </div>

            {/* Skip for now */}
            <div className="text-center mt-5">
              <Link href="/dashboard" className="text-xs text-muted" style={{ textDecoration: 'underline' }}>
                Skip for now (verify later in profile)
              </Link>
            </div>
          </div>
        )}

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mt-6">
          {[
            { n: 1, label: 'Details', done: true },
            { n: 2, label: 'Verify Email', done: false },
            { n: 3, label: 'Verify Phone', done: false },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: s.done ? 'var(--success)' : s.n === 2 ? 'var(--primary)' : 'var(--bg-elevated)',
                border: `2px solid ${s.done ? 'var(--success)' : s.n === 2 ? 'var(--primary)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 700,
                color: s.done || s.n === 2 ? 'white' : 'var(--text-muted)',
              }}>
                {s.done ? '✓' : s.n}
              </div>
              <span className="text-xs" style={{ color: s.n <= 2 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
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

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <span className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
