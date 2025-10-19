'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getUserSession, hasStoredData } from '@/lib/simple-auth'
import WelcomePage from '@/components/welcome-page'

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user has stored data (either logged in or has children data)
    if (hasStoredData()) {
      router.push('/dashboard')
    } else {
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

  return <WelcomePage />
}