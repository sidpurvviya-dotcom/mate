'use client'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'

export default function PostRequirement() {
  const { user } = useAuthStore()
  
  const propertyLink = user ? '/dashboard/post-property' : '/auth/register?role=owner'
  const roommateLink = user ? '/dashboard/post-roommate' : '/auth/register?role=seeker'

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-base)' }}>
      <div className="card" style={{ maxWidth: 800, width: '100%', padding: '3rem' }}>
        <div className="text-center mb-10">
          <Link href="/" className="logo-container" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
            <img src="/logo.png" alt="Mate Logo" className="mate-logo" />
          </Link>
          <h1 className="text-3xl font-bold mb-2">What are you looking for?</h1>
          <p className="text-secondary-color">Choose your path to get started</p>
        </div>

        <div className="grid grid-2 gap-6">
          {/* Owner Path */}
          <Link href={propertyLink}
            className="card card-elevated text-center p-8 hover-scale"
            style={{ 
              textDecoration: 'none', 
              color: 'inherit',
              border: '2px solid transparent',
              transition: 'var(--transition)',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
          >
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏠</div>
            <h2 className="text-xl font-bold mb-2">I have a Property</h2>
            <p className="text-sm text-secondary-color mb-6">
              List your room, apartment, or flat and find verified roommates quickly.
            </p>
            <div className="btn btn-primary w-full">List Property</div>
          </Link>

          {/* Seeker Path */}
          <Link href={roommateLink} 
            className="card card-elevated text-center p-8 hover-scale"
            style={{ 
              textDecoration: 'none', 
              color: 'inherit',
              border: '2px solid transparent',
              transition: 'var(--transition)',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--secondary)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
          >
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
            <h2 className="text-xl font-bold mb-2">I need a Roommate</h2>
            <p className="text-sm text-secondary-color mb-6">
              Create a seeker profile, list your preferences (city, state, budget) and find a place.
            </p>
            <div className="btn btn-secondary w-full">List Requirement</div>
          </Link>
        </div>

        {!user && (
          <div className="text-center mt-10">
            <p className="text-sm text-muted">
              Already have an account? <Link href="/auth/login" className="text-primary hover-underline font-medium">Sign in here</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
