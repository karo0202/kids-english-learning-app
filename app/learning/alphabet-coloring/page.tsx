'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getUserSession } from '@/lib/simple-auth'
import { checkModuleAccess } from '@/lib/subscription'
import AlphabetColoringSection from '@/components/learning/alphabet-coloring-section'
import SubscriptionLockOverlay from '@/components/subscription-lock-overlay'

export default function AlphabetColoringPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [showLock, setShowLock] = useState(false)

  useEffect(() => {
    async function checkAccess() {
      const user = getUserSession()
      if (!user) {
        router.push('/login')
      } else {
        const access = await checkModuleAccess('alphabet-coloring')
        if (!access.hasAccess) {
          setShowLock(true)
        }
        setLoading(false)
      }
    }
    checkAccess()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
          <p className="mt-4 text-gray-600">Loading coloring activity...</p>
        </div>
      </div>
    )
  }

  if (showLock) {
    return <SubscriptionLockOverlay moduleId="alphabet-coloring" moduleName="Coloring" />
  }

  return <AlphabetColoringSection />
}

