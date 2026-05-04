'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import PostRequirementBtn from '@/components/PostRequirementBtn'
import ThemeToggle from '@/components/ThemeToggle'

const features = [
  { icon: '🏠', title: 'Smart Listings', desc: 'Browse verified properties with detailed photos, amenities, and rules.' },
  { icon: '🤝', title: 'AI Matching', desc: 'Our algorithm finds the most compatible roommates based on your lifestyle.' },
  { icon: '💬', title: 'Secure Chat', desc: 'Message property owners directly without sharing personal numbers.' },
  { icon: '🗺️', title: 'Map Search', desc: 'Explore properties in your preferred neighbourhood on an interactive map.' },
  { icon: '✅', title: 'Verified Profiles', desc: 'Email-verified profiles with trust scores for safer connections.' },
  { icon: '🔒', title: 'Privacy First', desc: 'Exact addresses revealed only after both parties agree to connect.' },
]

const stats = [
  { value: '2,400+', label: 'Active Listings' },
  { value: '18,000+', label: 'Happy Roommates' },
  { value: '98%', label: 'Match Satisfaction' },
  { value: '4.9★', label: 'App Rating' },
]

export default function HomePage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className={`navbar ${scrolled ? 'glass' : ''}`} style={{ justifyContent: 'space-between' }}>
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="Mate Logo" className="icon-mate navbar-logo" style={{ borderRadius: '0.5rem' }} />
          <span className="font-bold text-xl" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <span className="gradient-text">Mate</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hide-mobile items-center gap-3">
          <Link href="/rooms" className="btn btn-ghost btn-sm">🏠 Rooms</Link>
          <Link href="/roommates" className="btn btn-ghost btn-sm">👥 Roommates</Link>
          {mounted && user ? (
            <>
              <Link href="/dashboard" className="btn btn-secondary btn-sm">My Profile</Link>
              <Link href="/dashboard/messages" className="btn btn-primary btn-sm">Messages</Link>
            </>
          ) : (
            <Link href="/auth/login" className="btn btn-primary btn-sm">Sign In</Link>
          )}
          <ThemeToggle />
        </div>

        {/* Mobile: theme + hamburger */}
        <div className="show-mobile items-center gap-2">
          <ThemeToggle />
          <button
            className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <>
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 90,
              background: 'transparent',
            }}
            onClick={() => setMobileMenuOpen(false)}
          />
          <div style={{
            position: 'fixed', top: 64, left: 0, right: 0,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderTop: 'none',
            zIndex: 91,
            padding: '1rem',
            display: 'flex', flexDirection: 'column', gap: '0.5rem',
            animation: 'fadeIn 0.2s ease',
          }}>
            <Link href="/rooms" className="btn btn-ghost w-full" style={{ justifyContent: 'flex-start' }}
              onClick={() => setMobileMenuOpen(false)}>
              🏠 Browse Rooms
            </Link>
            <Link href="/roommates" className="btn btn-ghost w-full" style={{ justifyContent: 'flex-start' }}
              onClick={() => setMobileMenuOpen(false)}>
              👥 Find Roommates
            </Link>
            {mounted && user ? (
              <>
                <Link href="/dashboard" className="btn btn-secondary w-full"
                  onClick={() => setMobileMenuOpen(false)}>
                  My Profile
                </Link>
                <Link href="/dashboard/messages" className="btn btn-primary w-full"
                  onClick={() => setMobileMenuOpen(false)}>
                  Messages
                </Link>
              </>
            ) : (
              <Link href="/auth/login" className="btn btn-primary w-full"
                onClick={() => setMobileMenuOpen(false)}>
                Sign In
              </Link>
            )}
          </div>
        </>
      )}

      {/* Hero */}
      <section className="hero-bg py-24 hero-section" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center' }}>
        <div className="container text-center">
          <div className="badge badge-primary mx-auto mb-6" style={{ display: 'inline-flex' }}>
            🚀 India&apos;s Smartest Roommate Platform
          </div>
          <h1 className="text-center mb-6 hero-title" style={{ fontWeight: 800 }}>
            Find Your Perfect{' '}
            <span className="gradient-text">Roommate</span>
            <br />Not Just a Room
          </h1>
          <p className="text-secondary-color text-lg mx-auto mb-8" style={{ maxWidth: 560, lineHeight: 1.7 }}>
            Mate intelligently connects property seekers and owners using lifestyle matching,
            real-time messaging, and verified profiles — making house hunting stress-free.
          </p>

          <div className="flex gap-4 justify-center flex-wrap mb-12 hero-buttons">
            <Link href="/rooms" className="btn btn-secondary btn-lg">
              🏠 Browse Rooms
            </Link>
            <Link href="/roommates" className="btn btn-secondary btn-lg">
              👥 Find Roommates
            </Link>
            <PostRequirementBtn className="btn btn-primary btn-lg" />
          </div>

          {/* Stats */}
          <div className="grid grid-4 gap-4 mx-auto stats-container" style={{ maxWidth: 700 }}>
            {stats.map((s) => (
              <div key={s.label} className="card text-center stat-card">
                <h2 className="font-bold text-2xl gradient-text">{s.value}</h2>
                <p className="text-xs text-secondary-color mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16" style={{ background: 'var(--bg-surface)' }}>
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Everything You Need</h2>
            <p className="text-secondary-color">Built for the modern renting experience</p>
          </div>
          <div className="grid grid-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card card-elevated" style={{ transition: 'var(--transition)' }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}>
                <div className="feature-icon" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{f.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-secondary-color text-sm" style={{ lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container">
          <div className="card text-center" style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))',
            border: '1px solid var(--border-strong)',
            padding: 'clamp(2rem, 6vw, 4rem) clamp(1rem, 4vw, 2rem)',
            borderRadius: 'var(--radius-xl)',
          }}>
            <h2 className="text-3xl font-bold mb-4">
              Ready to Find Your Nest? 🏡
            </h2>
            <p className="text-secondary-color mb-8" style={{ maxWidth: 480, margin: '0 auto 2rem' }}>
              Join thousands of happy roommates. Create your profile in under 2 minutes.
            </p>
            <Link href="/auth/register" className="btn btn-primary btn-lg">
              Create Free Account →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border)',
        padding: '2rem 1.5rem',
        textAlign: 'center',
      }}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <img src="/logo.svg" alt="Mate Logo" className="icon-mate" style={{ borderRadius: '0.375rem' }} />
          <span className="font-bold" style={{ fontFamily: 'Outfit' }}>
            <span className="gradient-text">Mate</span>
          </span>
        </div>
        <p className="text-muted text-sm">
          © 2026 Mate. Built with ♥ for smarter house hunting.
        </p>
      </footer>
    </div>
  )
}
