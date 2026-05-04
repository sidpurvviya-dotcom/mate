'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useEffect, useState } from 'react'

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  return (
    <nav className="mobile-bottom-nav">
      <div className="mobile-bottom-nav-inner container">
        <Link href="/" className={`mobile-tab-btn ${pathname === '/' ? 'active' : ''}`}>
          <span className="tab-icon">🏠</span>
          Home
        </Link>
        <Link href="/rooms" className={`mobile-tab-btn ${pathname === '/rooms' ? 'active' : ''}`}>
          <span className="tab-icon">🔍</span>
          Search
        </Link>
        <Link href="/roommates" className={`mobile-tab-btn ${pathname === '/roommates' ? 'active' : ''}`}>
          <span className="tab-icon">👥</span>
          Mates
        </Link>
        {user ? (
          <Link href="/dashboard" className={`mobile-tab-btn ${pathname?.startsWith('/dashboard') ? 'active' : ''}`}>
            <span className="tab-icon">👤</span>
            Profile
          </Link>
        ) : (
          <Link href="/auth/login" className={`mobile-tab-btn ${pathname?.startsWith('/auth') ? 'active' : ''}`}>
            <span className="tab-icon">🔑</span>
            Sign In
          </Link>
        )}
      </div>
    </nav>
  )
}
