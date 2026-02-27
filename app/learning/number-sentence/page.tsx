'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserSession } from '@/lib/simple-auth'
import CountingModule from '@/components/learning/counting-module'

export default function NumberSentencePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = () => {
      const user = getUserSession()
      if (!user) {
        router.push('/login')
        return
      }
      setLoading(false)
    }
    init()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-sky-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600">Loading number sentence...</p>
        </div>
      </div>
    )
  }

  return <CountingModule activityOnly="add" />
}
