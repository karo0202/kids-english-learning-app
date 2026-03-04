'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserSession } from '@/lib/simple-auth'
import MathElementaryModule from '@/components/learning/math-elementary-module'

export default function MathElementaryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getUserSession()
    if (!user) {
      router.push('/login')
      return
    }
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-sky-500 border-t-transparent" />
      </div>
    )
  }

  return <MathElementaryModule />
}
