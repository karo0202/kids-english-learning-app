'use client'

import { useEffect, useState } from 'react'
import { getAuthClient, handleGoogleRedirect } from '@/lib/firebase'

export default function AuthTestPage() {
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    addLog('Page loaded')
    addLog(`Current URL: ${window.location.href}`)
    addLog(`Search params: ${window.location.search}`)
    
    // Check for redirect result
    const checkRedirect = async () => {
      try {
        addLog('Checking for Google redirect result...')
        const result = await handleGoogleRedirect()
        if (result?.user) {
          addLog(`SUCCESS: Google sign-in successful for ${result.user.email}`)
        } else {
          addLog('No redirect result found')
        }
      } catch (err: any) {
        addLog(`ERROR: ${err.message}`)
      }
    }
    
    checkRedirect()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
        <div className="bg-white p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Debug Logs:</h2>
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div key={index} className="text-sm font-mono bg-gray-50 p-2 rounded">
                {log}
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-4 bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800">Instructions:</h3>
          <ol className="list-decimal list-inside text-sm text-yellow-700 mt-2 space-y-1">
            <li>Go to the login page</li>
            <li>Click "Sign in with Google"</li>
            <li>Complete Google sign-in</li>
            <li>Come back to this page to see the logs</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
