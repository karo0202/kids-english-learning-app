
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getAuthClient, signInWithGoogle, handleGoogleRedirect } from '@/lib/firebase'
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { setUserSession } from '@/lib/simple-auth'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Mascot } from '@/components/ui/mascot'
import { FirebaseDiagnostics } from '@/components/firebase-diagnostics'
import { Mail, Lock, ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError('Authentication failed. Please try again.')
    }

    // Handle Google redirect result
    const handleRedirect = async () => {
      try {
        console.log('Checking for Google redirect result...')
        const result = await handleGoogleRedirect()
        if (result?.user) {
          console.log('Google sign-in successful:', result.user.email)
          // Save user session
          setUserSession({
            id: result.user.uid,
            email: result.user.email || '',
            name: result.user.displayName || result.user.email?.split('@')[0] || 'User',
            accountType: 'parent'
          })
          router.push('/dashboard')
        } else {
          console.log('No Google redirect result found')
        }
      } catch (err: any) {
        console.error('Google redirect error:', err)
        setError(err?.message || 'Google sign-in failed.')
      }
    }

    handleRedirect()
  }, [searchParams, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('') // Clear previous errors

    try {
      const c = getAuthClient()
      if (!c) throw new Error('Auth not available on server')
      const result = await signInWithEmailAndPassword(c.auth, formData.email, formData.password)
      
      // Save user session
      if (result.user) {
        setUserSession({
          id: result.user.uid,
          email: result.user.email || '',
          name: result.user.displayName || result.user.email?.split('@')[0] || 'User',
          accountType: 'parent'
        })
      }
      
      router.push('/dashboard')
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password. Please try again.')
    }
    setLoading(false)
  }

  const signInGoogle = async () => {
    setLoading(true)
    setError('')
    try {
      console.log('Attempting Google sign-in...')
      const result = await signInWithGoogle()
      if (result?.user) {
        // Popup succeeded - save user session
        console.log('Google sign-in successful, saving session...')
        setUserSession({
          id: result.user.uid,
          email: result.user.email || '',
          name: result.user.displayName || result.user.email?.split('@')[0] || 'User',
          accountType: 'parent'
        })
        console.log('User session saved, redirecting to dashboard...')
        router.push('/dashboard')
      }
      // If result is null, redirect is happening
    } catch (err: any) {
      console.error('Google sign-in error details:', err)
      const errorMessage = err?.message || 'Google sign-in failed.'
      
      // Check for specific error types
      if (errorMessage.includes('not initialized') || errorMessage.includes('environment variables')) {
        setError('Firebase configuration error. Please contact support or check your browser console.')
      } else if (errorMessage.includes('unauthorized-domain')) {
        setError('This domain is not authorized. Please contact support.')
      } else if (errorMessage.includes('popup-blocked')) {
        setError('Popup was blocked. Please allow popups for this site and try again.')
      } else {
        setError(errorMessage)
      }
      setLoading(false)
    }
  }

  const signInApple = async () => {
    setLoading(true)
    setError('')
    try {
      const c = getAuthClient()
      if (!c) throw new Error('Auth not available on server')
      await signInWithPopup(c.auth, c.appleProvider)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err?.message || 'Apple sign-in failed.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-violet-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-3xl">🎓</span>
              </div>
            </div>
            <motion.h1 
              className="text-3xl font-bold text-white"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Welcome Back!
            </motion.h1>
            <p className="text-white/80">Continue your learning adventure</p>
          </CardHeader>

          <CardContent className="space-y-6 p-8">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-center">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <label htmlFor="email" className="sr-only">Email Address</label>
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="pl-12 py-4 text-lg rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur text-white placeholder-white/60 focus:border-violet-400 focus:bg-white/20 transition-all duration-300"
                  required
                />
              </div>

              <div className="relative">
                <label htmlFor="password" className="sr-only">Password</label>
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="pl-12 py-4 text-lg rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur text-white placeholder-white/60 focus:border-violet-400 focus:bg-white/20 transition-all duration-300"
                  required
                />
              </div>

              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white py-4 text-xl rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                >
                  {loading ? 'Signing In...' : 'Continue Learning! 🎓'}
                </Button>
              </motion.div>
            </form>

            {/* Social Logins */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button onClick={signInGoogle} className="bg-white text-gray-900 hover:bg-gray-100 rounded-xl">
                <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.651 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.957 3.043l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.651-.389-3.917Z"/>
                  <path fill="#FF3D00" d="M6.306 14.691l6.571 4.814C14.6 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.957 3.043l5.657-5.657C34.046 6.053 29.268 4 24 4c-7.798 0-14.426 4.437-17.694 10.691Z"/>
                  <path fill="#4CAF50" d="M24 44c5.176 0 9.86-1.977 13.409-5.197l-6.191-5.238C29.031 35.488 26.671 36.5 24 36.5c-5.201 0-9.619-3.331-11.279-7.964l-6.54 5.037C9.41 39.45 16.128 44 24 44Z"/>
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.001 2.825-2.994 5.211-5.585 6.932l.005-.004l6.191 5.238C37.52 41.218 44 36 44 24c0-1.341-.138-2.651-.389-3.917Z"/>
                </svg>
                Sign in with Google
              </Button>
              <Button onClick={signInApple} className="bg-black text-white hover:bg-black/90 rounded-xl">
                <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M16.365 1.43c.08 1.018-.375 2.01-1.048 2.73c-.74.784-1.95 1.386-3.09 1.306c-.1-1.005.42-2.04 1.076-2.71c.74-.76 2.04-1.33 3.062-1.326ZM20.76 17.41c-.58 1.35-.86 1.96-1.61 3.16c-1.04 1.69-2.51 3.79-4.33 3.81c-1.62.02-2.05-1.11-4.29-1.11c-2.25 0-2.71 1.09-4.34 1.13c-1.82.03-3.22-1.84-4.27-3.53c-2.33-3.57-4.11-10.1-1.72-14.52c1.19-2.21 3.32-3.6 5.63-3.63c2.21-.04 4.29 1.21 4.29 1.21c.92.56 2.02.96 3.1.94c1.06-.02 2.16-.42 3.08-.98c.64-.4 2.36-1.61 4.02-1.37c-.1.29-1.96 1.15-1.95 3.44c.01 2.75 2.4 3.64 2.43 3.65c-.03.07-.38 1.33-1.45 2.66c-.53.67-1.41 1.52-2.57 1.56c-.99.03-1.79-.5-2.38-.5c-.6 0-1.51.49-2.51.48c-1.59-.02-3.06-.92-3.88-2.35c-.03-.06-.06-.11-.09-.17c-.86-1.57-.7-3.43-.69-3.51c0-.04.08-3.77 3.07-5.05c1.33-.6 2.76-.4 3.66-.04c.91.36 1.53.92 1.54.93c-.02.03-1.37.81-1.36 2.39c.02 1.92 1.6 2.59 1.63 2.6c.02 0 1.16.43 2.33-.33c.17-.1 1.77-1.03 2.59-3.11c.07-.16.12-.33.18-.5c.07-.21.13-.41.18-.6c.38 0 .75.04 1.12.12c-.19.6-.42 1.2-.7 1.77c-.74 1.52-1.43 2.27-1.94 3.37c-.5 1.07-.47 2.06-.46 2.12c.01.06.04.85.53 1.88c.48 1.03 1.11 1.77 1.15 1.83Z"/>
                </svg>
                Sign in with Apple
              </Button>
            </div>

            {/* Debug mode - remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4">
                <FirebaseDiagnostics />
              </div>
            )}

            <div className="text-center pt-4">
              <p className="text-white/80">
                Don't have an account?{' '}
                <button
                  onClick={() => router.push('/register')}
                  className="text-violet-300 hover:text-violet-200 font-semibold underline hover:no-underline transition-all duration-300"
                >
                  Create Account
                </button>
              </p>
            </div>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-xl"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
