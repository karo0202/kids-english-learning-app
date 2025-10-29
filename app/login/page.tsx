
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getAuthClient, signInWithGoogleRedirect, handleGoogleRedirect } from '@/lib/firebase'
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Mascot } from '@/components/ui/mascot'
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
        const result = await handleGoogleRedirect()
        if (result) {
          router.push('/dashboard')
        }
      } catch (err: any) {
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
      await signInWithEmailAndPassword(c.auth, formData.email, formData.password)
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
      await signInWithGoogleRedirect()
      // Note: redirect will happen, so we don't need to navigate here
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed.')
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
                <span className="mr-2">🔴</span> Sign in with Google
              </Button>
              <Button onClick={signInApple} className="bg-black text-white hover:bg-black/90 rounded-xl">
                <span className="mr-2"></span> Sign in with Apple
              </Button>
            </div>

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
