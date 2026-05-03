'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import ThemeToggle from '@/components/ThemeToggle'


const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', emoji: '📊' },
  { href: '/dashboard/profile', label: 'My Profile', emoji: '👤' },
  { href: '/dashboard/post-property', label: 'Post Property', emoji: '🏠' },
  { href: '/dashboard/post-roommate', label: 'Post Roommate Need', emoji: '🔍' },
  { href: '/dashboard/my-listings', label: 'My Listings', emoji: '📋' },
  { href: '/dashboard/messages', label: 'Messages', emoji: '💬' },
  { href: '/dashboard/inquiries', label: 'Inquiries', emoji: '📨' },
  { href: '/rooms', label: 'Browse Rooms', emoji: '🏠' },
  { href: '/roommates', label: 'Find Roommates', emoji: '👥' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, token, setAuth, clearAuth, updateUser } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  const [showEditModal, setShowEditModal] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [bio, setBio] = useState('')
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState('')
  const [syncing, setSyncing] = useState(true)

  useEffect(() => {
    async function syncAuth() {
      if (user) {
        setSyncing(false)
        return
      }

      try {
        const res = await fetch('/api/users/me')
        if (res.ok) {
          const data = await res.json()
          // Use an empty string for token since it's already in the cookie
          setAuth(data.user, '') 
        } else {
          router.push('/auth/login')
        }
      } catch (err) {
        console.error('Auth sync failed:', err)
        router.push('/auth/login')
      } finally {
        setSyncing(false)
      }
    }

    syncAuth()
  }, [user, router, setAuth])

  if (syncing) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <span className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    )
  }

  if (!user) return null

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    clearAuth()
    router.push('/')
  }

  const handleUpdateProfile = async () => {
    setUpdating(true); setUpdateError('')
    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ avatar: avatarUrl, bio }),
      })
      const data = await res.json()
      if (!res.ok) { setUpdateError(data.error || 'Failed to update'); return }
      updateUser({ avatar: data.user.avatar, bio: data.user.bio })
      setShowEditModal(false)
    } catch {
      setUpdateError('Network error')
    } finally {
      setUpdating(false)
    }
  }

  const allItems = NAV_ITEMS

  return (
    <div className="flex" style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Logo */}
        <div style={{ padding: '1.5rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" className="flex items-center gap-2">
            <span style={{ fontSize: '1.25rem' }}>🏠</span>
            <span className="font-bold text-xl" style={{ fontFamily: 'Outfit' }}>
              <span className="gradient-text">Mate</span>
            </span>
          </Link>
          <ThemeToggle />
        </div>

        {/* User info */}
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="avatar avatar-md">
              {user.avatar ? <img src={user.avatar} alt={user.name} className="avatar avatar-md" style={{ borderRadius: '50%', objectFit: 'cover' }} /> : user.name[0]}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div className="font-medium text-sm truncate flex items-center justify-between gap-1">
                <span className="truncate">{user.name}</span>
                <button 
                  className="btn btn-ghost btn-icon" 
                  style={{ padding: '2px', minHeight: 'auto', borderRadius: '4px' }} 
                  onClick={() => {
                    setAvatarUrl(user.avatar || '')
                    setBio(user.bio || '')
                    setShowEditModal(true)
                  }}
                  title="Edit Profile Summary"
                >
                  ✏️
                </button>
              </div>
              <div className="text-xs text-muted truncate">{user.email}</div>
              {user.bio && <div className="text-xs text-muted truncate mt-1" style={{ fontStyle: 'italic' }}>"{user.bio}"</div>}
              <div className="badge badge-primary" style={{ marginTop: 6, fontSize: '0.65rem', padding: '2px 6px' }}>
                ⭐ Member
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.75rem 0' }}>
          {allItems.map((item) => (
            <Link key={item.href} href={item.href}
              className={`sidebar-item ${pathname === item.href ? 'active' : ''}`}>
              <span>{item.emoji}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
          <button className="sidebar-item w-full" onClick={handleLogout}
            style={{ color: 'var(--danger)', width: '100%', textAlign: 'left' }}>
            <span>🚪</span> <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {/* Mobile nav */}
        <div className="navbar glass" style={{ justifyContent: 'space-between', display: 'none' }}
          id="mobile-nav">
          <Link href="/" className="font-bold" style={{ fontFamily: 'Outfit' }}>
            <span className="gradient-text">Nest</span>Match
          </Link>
        </div>
        {children}

        {/* Quick Edit Modal */}
        {showEditModal && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h2 className="font-bold text-xl mb-4">Update Profile Summary</h2>
              
              {updateError && <div className="alert alert-error mb-4">{updateError}</div>}
              
              <div className="form-group mb-4">
                <label className="form-label">Profile Picture</label>
                <div className="flex flex-col gap-3">
                  {avatarUrl && (
                    <div className="flex justify-center mb-1">
                      <img 
                        src={avatarUrl} 
                        alt="Avatar Preview" 
                        style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} 
                      />
                    </div>
                  )}
                  
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      id="avatar-upload"
                      style={{ display: 'none' }} 
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            setAvatarUrl(reader.result as string)
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                    />
                    <label 
                      htmlFor="avatar-upload" 
                      className="btn btn-secondary w-full flex items-center justify-center gap-2"
                      style={{ cursor: 'pointer' }}
                    >
                      📷 Upload Image File
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <div style={{ height: '1px', background: 'var(--border)', flex: 1 }} />
                    <span className="text-xs text-muted">OR</span>
                    <div style={{ height: '1px', background: 'var(--border)', flex: 1 }} />
                  </div>

                  <input 
                    className="form-input" 
                    placeholder="Paste direct image link (e.g. https://...)" 
                    value={avatarUrl.startsWith('data:') ? 'Uploaded local image file' : avatarUrl} 
                    onChange={e => {
                      if (e.target.value !== 'Uploaded local image file') {
                        setAvatarUrl(e.target.value)
                      }
                    }} 
                  />
                </div>
              </div>
              
              <div className="form-group mb-6">
                <label className="form-label">Bio</label>
                <textarea 
                  className="form-textarea" 
                  placeholder="Short bio displayed in sidebar..." 
                  value={bio} 
                  onChange={e => setBio(e.target.value)}
                  style={{ minHeight: 80 }}
                />
              </div>
              
              <div className="flex gap-3">
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleUpdateProfile} disabled={updating}>
                  {updating ? <span className="spinner" /> : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
