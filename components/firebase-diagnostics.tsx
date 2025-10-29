'use client'

import { useEffect, useState } from 'react'
import { getAuthClient } from '@/lib/firebase'

export function FirebaseDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<any>({})

  useEffect(() => {
    if (typeof window === 'undefined') return

    const check: any = {
      hasWindow: typeof window !== 'undefined',
      envVars: {
        apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        appId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      },
      authClient: null,
      error: null,
    }

    try {
      const client = getAuthClient()
      check.authClient = !!client
      if (client) {
        check.authDomain = client.auth?.app?.options?.authDomain
      }
    } catch (err: any) {
      check.error = err.message
    }

    setDiagnostics(check)
  }, [])

  return (
    <div className="p-4 bg-gray-100 rounded-lg text-sm">
      <h3 className="font-bold mb-2">Firebase Diagnostics:</h3>
      <pre className="text-xs overflow-auto">{JSON.stringify(diagnostics, null, 2)}</pre>
    </div>
  )
}
