'use client'

import { useEffect, useState } from 'react'
import { getAuthClient, handleGoogleRedirect } from '@/lib/firebase'

export default function GoogleTestPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [urlParams, setUrlParams] = useState<string>('')

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    addLog('Google Test Page loaded')
    addLog(`Current URL: ${window.location.href}`)
    addLog(`Search params: ${window.location.search}`)
    addLog(`Hash: ${window.location.hash}`)
    
    // Check URL parameters
    const params = new URLSearchParams(window.location.search)
    const paramEntries = Array.from(params.entries())
    if (paramEntries.length > 0) {
      addLog(`URL Parameters: ${JSON.stringify(Object.fromEntries(paramEntries))}`)
    } else {
      addLog('No URL parameters found')
    }
    
    // Test Firebase redirect handling
    const testRedirect = async () => {
      try {
        addLog('Testing Firebase redirect handling...')
        const result = await handleGoogleRedirect()
        if (result?.user) {
          addLog(`SUCCESS: User authenticated - ${result.user.email}`)
          addLog(`User UID: ${result.user.uid}`)
        } else {
          addLog('No authentication result found')
        }
      } catch (err: any) {
        addLog(`ERROR: ${err.message}`)
      }
    }
    
    testRedirect()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Google Authentication Test</h1>
        
        <div className="bg-white p-4 rounded-lg mb-4">
          <h2 className="text-lg font-semibold mb-2">Debug Information:</h2>
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div key={index} className={`text-sm font-mono p-2 rounded ${
                log.includes('SUCCESS') ? 'bg-green-50 text-green-800' :
                log.includes('ERROR') ? 'bg-red-50 text-red-800' :
                'bg-gray-50'
              }`}>
                {log}
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">Test Instructions:</h3>
          <ol className="list-decimal list-inside text-sm text-blue-700 mt-2 space-y-1">
            <li>Go to the login page</li>
            <li>Click "Sign in with Google"</li>
            <li>Select your Google account</li>
            <li>Come back to this page to see what happened</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
