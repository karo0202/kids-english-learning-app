
'use client'

import { SessionProvider } from 'next-auth/react'
import { useState, useEffect } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="min-h-screen bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
      <div className="text-white text-2xl font-bold">Loading Learning Adventure...</div>
    </div>
  }

  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}
