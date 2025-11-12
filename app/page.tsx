'use client'

import { useEffect, useState } from 'react'
import WelcomePage from '@/components/welcome-page'
import Skeleton from '@/components/ui/skeleton'
import PageTransition from '@/components/ui/page-transition'

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
    }, 500)

    return () => clearTimeout(timeout)
  }, [])

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400 dark:from-slate-900 dark:via-purple-900 dark:to-violet-900"
        role="status"
        aria-label="Loading page"
      >
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <Skeleton variant="circular" className="w-full h-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl animate-bounce">📚</span>
            </div>
          </div>
          <Skeleton variant="text" width={200} className="mx-auto mb-2" />
          <Skeleton variant="text" width={150} className="mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <PageTransition>
      <WelcomePage />
    </PageTransition>
  )
}