'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthErrorPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to login page after 2 seconds
    const timer = setTimeout(() => {
      router.push('/login')
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Authentication Error</h1>
        <p className="text-lg text-gray-600 mb-6">Redirecting to login page...</p>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
      </div>
    </div>
  )
}
