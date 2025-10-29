

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAuthClient } from '@/lib/firebase'
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Mascot } from '@/components/ui/mascot'
import { User, Mail, Lock, Baby, Heart } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
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
      
        // Save child information to localStorage
      if (typeof window !== 'undefined') {
        const parentId = cred.user?.uid || `user-${Date.now()}`
        const childData = {
          id: `child-${Date.now()}`,
          name: formData.childName,
          age: parseInt(formData.childAge),
          parentId,
          createdAt: new Date().toISOString()
        }
        
        // Get existing children or create new array
        const existingChildren = JSON.parse(localStorage.getItem('children') || '[]')
        existingChildren.push(childData)
        localStorage.setItem('children', JSON.stringify(existingChildren))
        
        // Set current child
        localStorage.setItem('currentChild', JSON.stringify(childData))
        
        // Initialize progress for the child
        const progress = {
          [childData.id]: {
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
      const c = getAuthClient()
      if (!c) return
      await signInWithPopup(c.auth, c.googleProvider)
      router.push('/dashboard')
    } finally {
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
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Parent's Full Name"
                    value={formData.parentName}
                    onChange={(e) => setFormData({...formData, parentName: e.target.value})}
                    className="pl-10 py-3 text-lg rounded-xl border-2 focus:border-purple-400"
                    required
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="pl-10 py-3 text-lg rounded-xl border-2 focus:border-purple-400"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
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
                  <Baby className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Child's Name"
                    value={formData.childName}
                    onChange={(e) => setFormData({...formData, childName: e.target.value})}
                    className="pl-10 py-3 text-lg rounded-xl border-2 focus:border-pink-400"
                    required
                  />
                </div>

                <div className="relative">
                  <select
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
                <span className="mr-2">🔴</span> Continue with Google
              </Button>
              <Button onClick={signUpApple} className="bg-black text-white hover:bg-black/90 rounded-xl">
                <span className="mr-2"></span> Continue with Apple
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
