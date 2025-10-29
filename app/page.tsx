'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getUserSession, hasStoredData } from '@/lib/simple-auth'
import WelcomePage from '@/components/welcome-page'

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      // Check if user has stored data (either logged in or has children data)
      if (hasStoredData()) {
        router.push('/dashboard')
      } else {
        setLoading(false)
      }
    } else {
      setLoading(false)
    }

    // Fallback timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setLoading(false)
    }, 3000)

    return () => clearTimeout(timeout)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400 dark:from-slate-900 dark:via-purple-900 dark:to-violet-900">
        <div className="text-white text-2xl font-bold">Loading Learning Adventure...</div>
      </div>
    )
  }

  return <WelcomePage />
}