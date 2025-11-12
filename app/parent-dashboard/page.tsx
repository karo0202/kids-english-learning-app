
'use client'

import { getUserSession } from '@/lib/simple-auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import EnhancedParentDashboard from '@/components/enhanced-parent-dashboard'

export default function ParentDashboardPage() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const currentUser = getUserSession()
    if (currentUser) {
      setSession({ user: currentUser })
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!session) {
    router.push('/login')
    return null
  }

  return <EnhancedParentDashboard />
}
