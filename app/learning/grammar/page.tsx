'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getUserSession } from '@/lib/simple-auth'
import GrammarModule from '@/components/learning/grammar-module'

export default function GrammarPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getUserSession()
    if (!user) {
      router.push('/login')
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

  return <GrammarModule />
}

