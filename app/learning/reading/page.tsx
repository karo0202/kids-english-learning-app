'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getUserSession } from '@/lib/simple-auth'
import ReadingModule from '@/components/learning/reading-module'
import SubscriptionLockOverlay from '@/components/subscription-lock-overlay'
import { checkModuleAccess, refreshSubscriptionStatus } from '@/lib/subscription'

export default function ReadingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [accessChecked, setAccessChecked] = useState(false)
  const [isLocked, setIsLocked] = useState(true)

  useEffect(() => {
    let mounted = true

    const init = async () => {
      const user = getUserSession()
      if (!user) {
        router.push('/login')
        return
      }

      if (!mounted) return
      setLoading(false)

      try {
        const status = await refreshSubscriptionStatus()
        if (!mounted) return
        const access = checkModuleAccess('reading', status)
        setIsLocked(access.isLocked)
      } catch (error) {
        console.error('Error checking module access:', error)
        if (mounted) setIsLocked(true)
      } finally {
        if (mounted) setAccessChecked(true)
      }
    }

    init()

    return () => {
      mounted = false
    }
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!accessChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (isLocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <SubscriptionLockOverlay moduleId="reading" moduleName="Reading" />
      </div>
    )
  }

  return <ReadingModule />
}
