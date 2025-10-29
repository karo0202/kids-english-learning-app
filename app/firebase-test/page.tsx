'use client'

import { useEffect, useState } from 'react'
import { getAuthClient, signInWithGoogle } from '@/lib/firebase'

export default function FirebaseTestPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    addLog('Firebase Test Page loaded')
    
    // Check environment variables
    addLog(`API Key: ${process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Missing'}`)
    addLog(`Auth Domain: ${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'Missing'}`)
    addLog(`Project ID: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Missing'}`)
    addLog(`App ID: ${process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'Missing'}`)
    
    // Test Firebase initialization
    try {
      const client = getAuthClient()
      if (client) {
        addLog('✅ Firebase client initialized successfully')
        addLog(`Auth domain: ${client.auth?.app?.options?.authDomain}`)
      } else {
        addLog('❌ Firebase client failed to initialize')
      }
    } catch (err: any) {
      addLog(`❌ Firebase error: ${err.message}`)
    }
  }, [])

  const testGoogleSignIn = async () => {
    setLoading(true)
    addLog('🔄 Testing Google sign-in...')
    
    try {
      await signInWithGoogle()
      addLog('✅ Google sign-in redirect initiated')
    } catch (err: any) {
      addLog(`❌ Google sign-in error: ${err.message}`)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Firebase Configuration Test</h1>
        
        <div className="bg-white p-4 rounded-lg mb-4">
          <h2 className="text-lg font-semibold mb-2">Configuration Status:</h2>
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div key={index} className={`text-sm font-mono p-2 rounded ${
                log.includes('✅') ? 'bg-green-50 text-green-800' :
                log.includes('❌') ? 'bg-red-50 text-red-800' :
                log.includes('🔄') ? 'bg-blue-50 text-blue-800' :
                'bg-gray-50'
              }`}>
                {log}
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg mb-4">
          <button
            onClick={testGoogleSignIn}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Google Sign-In'}
          </button>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800">What to look for:</h3>
          <ul className="list-disc list-inside text-sm text-yellow-700 mt-2 space-y-1">
            <li>All environment variables should show "Set"</li>
            <li>Firebase client should initialize successfully</li>
            <li>When you click "Test Google Sign-In", it should redirect to Google</li>
            <li>If it redirects back to login page, there's a configuration issue</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
