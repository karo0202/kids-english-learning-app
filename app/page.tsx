'use client'

import { useEffect, useState } from 'react'
import WelcomePage from '@/components/welcome-page'

export default function HomePage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      // Show welcome page immediately - let users navigate themselves
      setLoading(false)
    } else {
      setLoading(false)
    }

    // Fallback timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timeout)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400 dark:from-slate-900 dark:via-purple-900 dark:to-violet-900">
        <div className="text-white text-2xl font-bold">Loading Learning Adventure...</div>
      </div>
    )
  }

  return <WelcomePage />
}