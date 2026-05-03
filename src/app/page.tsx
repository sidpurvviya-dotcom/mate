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
          <img src="/logo.png" alt="Mate Logo" style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', objectFit: 'cover' }} />
          <span className="font-bold text-xl" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <span className="gradient-text">Mate</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/rooms" className="btn btn-ghost btn-sm hide-mobile">🏠 Rooms</Link>
          <Link href="/roommates" className="btn btn-ghost btn-sm hide-mobile">👥 Roommates</Link>
          {mounted && user ? (
            <>
              <Link href="/dashboard" className="btn btn-secondary btn-sm">My Profile</Link>
              <Link href="/dashboard/messages" className="btn btn-primary btn-sm">Messages</Link>
            </>
          ) : mounted ? (
              <Link href="/auth/login" className="btn btn-primary btn-sm">Sign In</Link>
          ) : null}
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-bg py-24" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center' }}>
        <div className="container text-center">
          <div className="badge badge-primary mx-auto mb-6" style={{ display: 'inline-flex' }}>
            🚀 India&apos;s Smartest Roommate Platform
          </div>
          <h1 className="text-center mb-6" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 800, lineHeight: 1.1 }}>
            Find Your Perfect{' '}
            <span className="gradient-text">Roommate</span>
            <br />Not Just a Room
          </h1>
          <p className="text-secondary-color text-lg mx-auto mb-8" style={{ maxWidth: 560, lineHeight: 1.7 }}>
            Mate intelligently connects property seekers and owners using lifestyle matching,
            real-time messaging, and verified profiles — making house hunting stress-free.
          </p>

          <div className="flex gap-4 justify-center flex-wrap mb-12">
            <Link href="/rooms" className="btn btn-secondary btn-lg">
              🏠 Browse Rooms
            </Link>
            <Link href="/roommates" className="btn btn-secondary btn-lg">
              👥 Find Roommates
            </Link>
            <PostRequirementBtn className="btn btn-primary btn-lg" />
          </div>

          {/* Stats */}
          <div className="grid grid-4 gap-4 mx-auto" style={{ maxWidth: 700 }}>
            {stats.map((s) => (
              <div key={s.label} className="card text-center">
                <div className="font-bold text-2xl gradient-text">{s.value}</div>
                <div className="text-xs text-secondary-color mt-1">{s.label}</div>
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
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{f.icon}</div>
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
            padding: '4rem 2rem',
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
          <img src="/logo.png" alt="Mate Logo" style={{ width: '1.5rem', height: '1.5rem', borderRadius: '0.375rem', objectFit: 'cover' }} />
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
