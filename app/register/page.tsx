

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAuthClient, signInWithGoogle, handleGoogleRedirect } from '@/lib/firebase'
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth'
import { setUserSession } from '@/lib/simple-auth'
import { addChild, setCurrentChild } from '@/lib/children'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Mascot } from '@/components/ui/mascot'
import { User, Mail, Lock, Baby, Heart } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Handle Google redirect result
    const handleRedirect = async () => {
      try {
        const result = await handleGoogleRedirect()
        if (result?.user) {
          // Save user session
          setUserSession({
            id: result.user.uid,
            email: result.user.email || '',
            name: result.user.displayName || result.user.email?.split('@')[0] || 'User',
            accountType: 'parent'
          })
          router.push('/dashboard')
        }
      } catch (err: any) {
        console.error('Google redirect error:', err)
      }
    }

    handleRedirect()
  }, [router])
  const [formData, setFormData] = useState({
    parentName: '',
    email: '',
    password: '',
    childName: '',
    childAge: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const c = getAuthClient()
      if (!c) throw new Error('Auth not available on server')
      const cred = await createUserWithEmailAndPassword(c.auth, formData.email, formData.password)
      if (cred.user && formData.parentName) {
        await updateProfile(cred.user, { displayName: formData.parentName })
      }
      
      // Save user session
      if (cred.user) {
        setUserSession({
          id: cred.user.uid,
          email: cred.user.email || '',
          name: cred.user.displayName || formData.parentName || cred.user.email?.split('@')[0] || 'User',
          accountType: 'parent'
        })
      }
      
        // Save child information using the children management system
      if (typeof window !== 'undefined' && cred.user) {
        const parentId = cred.user.uid
        const newChild = addChild(parentId, formData.childName, parseInt(formData.childAge))
        setCurrentChild(newChild)
        
        // Initialize progress for the child
        const progress = {
          [newChild.id]: {
            completedLessons: [],
            completedChallenges: [],
            currentLevel: 1,
            totalScore: 0,
            lastActivity: new Date().toISOString()
          }
        }
        localStorage.setItem('progress', JSON.stringify(progress))
      }
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Registration error:', error)
    } finally {
      setLoading(false)
    }
  }

  const signUpGoogle = async () => {
    setLoading(true)
    try {
      const result = await signInWithGoogle()
      if (result?.user) {
        // Popup succeeded - save user session
        setUserSession({
          id: result.user.uid,
          email: result.user.email || '',
          name: result.user.displayName || result.user.email?.split('@')[0] || 'User',
          accountType: 'parent'
        })
        router.push('/dashboard')
      }
      // If result is null, redirect is happening
    } catch (err: any) {
      console.error('Google sign-up error:', err)
      setLoading(false)
    }
  }

  const signUpApple = async () => {
    setLoading(true)
    try {
      const c = getAuthClient()
      if (!c) return
      await signInWithPopup(c.auth, c.appleProvider)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="card-kid border-none shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <Mascot emotion="excited" size="large" />
            </div>
            <motion.h1 
              className="text-3xl font-bold text-gray-800"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Join the Adventure!
            </motion.h1>
            <p className="text-gray-600">Create your family account</p>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Parent Information */}
              <div className="space-y-4">
                <div className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-500" />
                  Parent Information
                </div>

                <div className="relative">
                  <label htmlFor="parentName" className="sr-only">Parent's Full Name</label>
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="parentName"
                    name="parentName"
                    type="text"
                    placeholder="Parent's Full Name"
                    value={formData.parentName}
                    onChange={(e) => setFormData({...formData, parentName: e.target.value})}
                    className="pl-10 py-3 text-lg rounded-xl border-2 focus:border-purple-400"
                    required
                  />
                </div>

                <div className="relative">
                  <label htmlFor="email" className="sr-only">Email Address</label>
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="pl-10 py-3 text-lg rounded-xl border-2 focus:border-purple-400"
                    required
                  />
                </div>

                <div className="relative">
                  <label htmlFor="password" className="sr-only">Create Password</label>
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create Password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="pl-10 py-3 text-lg rounded-xl border-2 focus:border-purple-400"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {/* Child Information */}
              <div className="space-y-4">
                <div className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  Your Child
                </div>

                <div className="relative">
                  <label htmlFor="childName" className="sr-only">Child's Name</label>
                  <Baby className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="childName"
                    name="childName"
                    type="text"
                    placeholder="Child's Name"
                    value={formData.childName}
                    onChange={(e) => setFormData({...formData, childName: e.target.value})}
                    className="pl-10 py-3 text-lg rounded-xl border-2 focus:border-pink-400"
                    required
                  />
                </div>

                <div className="relative">
                  <label htmlFor="childAge" className="sr-only">Child's Age</label>
                  <select
                    id="childAge"
                    name="childAge"
                    value={formData.childAge}
                    onChange={(e) => setFormData({...formData, childAge: e.target.value})}
                    className="w-full pl-3 py-3 text-lg rounded-xl border-2 focus:border-pink-400 bg-white"
                    required
                  >
                    <option value="">Select Child's Age</option>
                    {[3,4,5,6,7,8,9,10,11,12].map(age => (
                      <option key={age} value={age}>{age} years old</option>
                    ))}
                  </select>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary-kid py-4 text-xl"
                >
                  {loading ? 'Creating Account...' : 'Start Our Adventure! 🚀'}
                </Button>
              </motion.div>
            </form>

            {/* Social Sign Up */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button onClick={signUpGoogle} className="bg-white text-gray-900 hover:bg-gray-100 rounded-xl">
                <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.651 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.957 3.043l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.651-.389-3.917Z"/>
                  <path fill="#FF3D00" d="M6.306 14.691l6.571 4.814C14.6 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.957 3.043l5.657-5.657C34.046 6.053 29.268 4 24 4c-7.798 0-14.426 4.437-17.694 10.691Z"/>
                  <path fill="#4CAF50" d="M24 44c5.176 0 9.86-1.977 13.409-5.197l-6.191-5.238C29.031 35.488 26.671 36.5 24 36.5c-5.201 0-9.619-3.331-11.279-7.964l-6.54 5.037C9.41 39.45 16.128 44 24 44Z"/>
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.001 2.825-2.994 5.211-5.585 6.932l.005-.004l6.191 5.238C37.52 41.218 44 36 44 24c0-1.341-.138-2.651-.389-3.917Z"/>
                </svg>
                Continue with Google
              </Button>
              <Button onClick={signUpApple} className="bg-black text-white hover:bg-black/90 rounded-xl">
                <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M16.365 1.43c.08 1.018-.375 2.01-1.048 2.73c-.74.784-1.95 1.386-3.09 1.306c-.1-1.005.42-2.04 1.076-2.71c.74-.76 2.04-1.33 3.062-1.326ZM20.76 17.41c-.58 1.35-.86 1.96-1.61 3.16c-1.04 1.69-2.51 3.79-4.33 3.81c-1.62.02-2.05-1.11-4.29-1.11c-2.25 0-2.71 1.09-4.34 1.13c-1.82.03-3.22-1.84-4.27-3.53c-2.33-3.57-4.11-10.1-1.72-14.52c1.19-2.21 3.32-3.6 5.63-3.63c2.21-.04 4.29 1.21 4.29 1.21c.92.56 2.02.96 3.1.94c1.06-.02 2.16-.42 3.08-.98c.64-.4 2.36-1.61 4.02-1.37c-.1.29-1.96 1.15-1.95 3.44c.01 2.75 2.4 3.64 2.43 3.65c-.03.07-.38 1.33-1.45 2.66c-.53.67-1.41 1.52-2.57 1.56c-.99.03-1.79-.5-2.38-.5c-.6 0-1.51.49-2.51.48c-1.59-.02-3.06-.92-3.88-2.35c-.03-.06-.06-.11-.09-.17c-.86-1.57-.7-3.43-.69-3.51c0-.04.08-3.77 3.07-5.05c1.33-.6 2.76-.4 3.66-.04c.91.36 1.53.92 1.54.93c-.02.03-1.37.81-1.36 2.39c.02 1.92 1.6 2.59 1.63 2.6c.02 0 1.16.43 2.33-.33c.17-.1 1.77-1.03 2.59-3.11c.07-.16.12-.33.18-.5c.07-.21.13-.41.18-.6c.38 0 .75.04 1.12.12c-.19.6-.42 1.2-.7 1.77c-.74 1.52-1.43 2.27-1.94 3.37c-.5 1.07-.47 2.06-.46 2.12c.01.06.04.85.53 1.88c.48 1.03 1.11 1.77 1.15 1.83Z"/>
                </svg>
                Continue with Apple
              </Button>
            </div>

            <div className="text-center pt-4">
              <p className="text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => router.push('/login')}
                  className="text-purple-600 hover:text-purple-800 font-semibold underline"
                >
                  Sign In
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
