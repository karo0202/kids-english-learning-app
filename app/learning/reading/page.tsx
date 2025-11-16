'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getUserSession } from '@/lib/simple-auth'
import { checkModuleAccess } from '@/lib/subscription'
import ReadingModule from '@/components/learning/reading-module'
import SubscriptionLockOverlay from '@/components/subscription-lock-overlay'

export default function ReadingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [showLock, setShowLock] = useState(false)

  useEffect(() => {
    const user = getUserSession()
    if (!user) {
      router.push('/login')
    } else {
      const access = checkModuleAccess('reading')
      if (!access.hasAccess) {
        setShowLock(true)
      }
      setLoading(false)
    }
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (showLock) {
    return <SubscriptionLockOverlay moduleId="reading" moduleName="Reading" />
  }

  return <ReadingModule />
}
