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
        <Link href="/" className={`mobile-tab-btn bottom-nav-item ${pathname === '/' ? 'active' : ''}`}>
          <span className="tab-icon">🏠</span>
          <span className="bottom-nav-label">Home</span>
        </Link>
        <Link href="/rooms" className={`mobile-tab-btn bottom-nav-item ${pathname === '/rooms' ? 'active' : ''}`}>
          <span className="tab-icon">🔍</span>
          <span className="bottom-nav-label">Search</span>
        </Link>
        <Link href="/roommates" className={`mobile-tab-btn bottom-nav-item ${pathname === '/roommates' ? 'active' : ''}`}>
          <span className="tab-icon">👥</span>
          <span className="bottom-nav-label">Mates</span>
        </Link>
        {user ? (
          <Link href="/dashboard" className={`mobile-tab-btn bottom-nav-item ${pathname?.startsWith('/dashboard') ? 'active' : ''}`}>
            <span className="tab-icon">👤</span>
            <span className="bottom-nav-label">Profile</span>
          </Link>
        ) : (
          <Link href="/auth/login" className={`mobile-tab-btn bottom-nav-item ${pathname?.startsWith('/auth') ? 'active' : ''}`}>
            <span className="tab-icon">🔑</span>
            <span className="bottom-nav-label">Sign In</span>
          </Link>
        )}
      </div>
    </nav>
  )
}
