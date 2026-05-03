'use client'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useEffect, useState } from 'react'

export default function PostRequirementBtn({ className }: { className?: string }) {
  const { user } = useAuthStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <button className={className || 'btn btn-primary btn-sm opacity-50'}>➕ Post Requirement</button>
  }

  const handleClick = () => {
    if (!user) {
      router.push('/auth/login')
    } else {
      router.push('/post-requirement')
    }
  }

  return (
    <button onClick={handleClick} className={className || 'btn btn-primary btn-sm'}>
      ➕ Post Requirement
    </button>
  )
}
