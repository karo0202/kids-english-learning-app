

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAuthClient, signInWithGoogle, handleGoogleRedirect } from '@/lib/firebase'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { setUserSession } from '@/lib/simple-auth'
import { addChild, setCurrentChild } from '@/lib/children'
import { setUserRegistrationDate } from '@/lib/subscription'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Mascot } from '@/components/ui/mascot'
import { User, Mail, Lock, Baby, Heart } from 'lucide-react'
import LanguageSwitcher from '@/components/language-switcher'
import { useTranslation } from '@/lib/i18n'

export default function RegisterPage() {
  const router = useRouter()
  const { t, dir } = useTranslation()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const result = await handleGoogleRedirect()
        if (result?.user) {
          setUserSession({
            id: result.user.uid,
            email: result.user.email || '',
            name: result.user.displayName || result.user.email?.split('@')[0] || 'User',
            accountType: 'parent'
          })
          setUserRegistrationDate()
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
      
      if (!cred.user) {
        throw new Error('User creation failed')
      }

      setUserSession({
        id: cred.user.uid,
        email: cred.user.email || '',
        name: cred.user.displayName || formData.parentName || cred.user.email?.split('@')[0] || 'User',
        accountType: 'parent'
      })
      
      setUserRegistrationDate()
      
      if (!formData.childName || !formData.childAge) {
        throw new Error('Child information is required')
      }

      if (typeof window === 'undefined') {
        throw new Error('Registration must be completed in browser environment')
      }

      const parentId = cred.user.uid
      const childAge = parseInt(formData.childAge)
      
      if (isNaN(childAge) || childAge < 3 || childAge > 12) {
        throw new Error('Child age must be between 3 and 12 years')
      }

      const newChild = await addChild(parentId, formData.childName, childAge, cred.user.email || formData.email)
      
      if (!newChild || !newChild.id) {
        throw new Error('Failed to save child information')
      }

      setCurrentChild(newChild)
      
      try {
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
      } catch (progressError) {
        console.warn('Failed to initialize progress:', progressError)
      }
      
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Registration error:', error)
      alert(error?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const signUpGoogle = async () => {
    setLoading(true)
    try {
      const result = await signInWithGoogle()
      if (result?.user) {
        setUserSession({
          id: result.user.uid,
          email: result.user.email || '',
          name: result.user.displayName || result.user.email?.split('@')[0] || 'User',
          accountType: 'parent'
        })
        setUserRegistrationDate()
        router.push('/dashboard')
      }
    } catch (err: any) {
      console.error('Google sign-up error:', err)
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Language switcher floating */}
      <div className={`absolute top-4 ${dir === 'rtl' ? 'left-4' : 'right-4'} z-20`}>
        <LanguageSwitcher variant="compact" />
      </div>

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
              {t('joinAdventure')}
            </motion.h1>
            <p className="text-gray-600">{t('createFamilyAccount')}</p>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Parent Information */}
              <div className="space-y-4">
                <div className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-500" />
                  {t('parentInfo')}
                </div>

                <div className="relative">
                  <label htmlFor="parentName" className="sr-only">{t('parentName')}</label>
                  <User className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
                  <Input
                    id="parentName"
                    name="parentName"
                    type="text"
                    placeholder={t('parentName')}
                    value={formData.parentName}
                    onChange={(e) => setFormData({...formData, parentName: e.target.value})}
                    className={`${dir === 'rtl' ? 'pr-10' : 'pl-10'} py-3 text-lg rounded-xl border-2 focus:border-purple-400`}
                    required
                  />
                </div>

                <div className="relative">
                  <label htmlFor="email" className="sr-only">{t('emailAddress')}</label>
                  <Mail className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t('emailAddress')}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={`${dir === 'rtl' ? 'pr-10' : 'pl-10'} py-3 text-lg rounded-xl border-2 focus:border-purple-400`}
                    required
                  />
                </div>

                <div className="relative">
                  <label htmlFor="password" className="sr-only">{t('createPassword')}</label>
                  <Lock className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder={t('createPassword')}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className={`${dir === 'rtl' ? 'pr-10' : 'pl-10'} py-3 text-lg rounded-xl border-2 focus:border-purple-400`}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {/* Child Information */}
              <div className="space-y-4">
                <div className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  {t('yourChild')}
                </div>

                <div className="relative">
                  <label htmlFor="childName" className="sr-only">{t('childName')}</label>
                  <Baby className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
                  <Input
                    id="childName"
                    name="childName"
                    type="text"
                    placeholder={t('childName')}
                    value={formData.childName}
                    onChange={(e) => setFormData({...formData, childName: e.target.value})}
                    className={`${dir === 'rtl' ? 'pr-10' : 'pl-10'} py-3 text-lg rounded-xl border-2 focus:border-pink-400`}
                    required
                  />
                </div>

                <div className="relative">
                  <label htmlFor="childAge" className="sr-only">{t('selectChildAge')}</label>
                  <select
                    id="childAge"
                    name="childAge"
                    value={formData.childAge}
                    onChange={(e) => setFormData({...formData, childAge: e.target.value})}
                    className={`w-full ${dir === 'rtl' ? 'pr-3' : 'pl-3'} py-3 text-lg rounded-xl border-2 focus:border-pink-400 bg-white`}
                    required
                  >
                    <option value="">{t('selectChildAge')}</option>
                    {[3,4,5,6,7,8,9,10,11,12].map(age => (
                      <option key={age} value={age}>{age} {t('yearsOld')}</option>
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
                  {loading ? t('creatingAccount') : t('startAdventure')}
                </Button>
              </motion.div>
            </form>

            {/* Social Sign Up */}
            <div className="flex justify-center pt-2">
              <Button onClick={signUpGoogle} className="bg-white text-gray-900 hover:bg-gray-100 rounded-xl w-full sm:w-auto">
                <svg className={dir === 'rtl' ? 'ml-2' : 'mr-2'} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.651 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.957 3.043l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.651-.389-3.917Z"/>
                  <path fill="#FF3D00" d="M6.306 14.691l6.571 4.814C14.6 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.957 3.043l5.657-5.657C34.046 6.053 29.268 4 24 4c-7.798 0-14.426 4.437-17.694 10.691Z"/>
                  <path fill="#4CAF50" d="M24 44c5.176 0 9.86-1.977 13.409-5.197l-6.191-5.238C29.031 35.488 26.671 36.5 24 36.5c-5.201 0-9.619-3.331-11.279-7.964l-6.54 5.037C9.41 39.45 16.128 44 24 44Z"/>
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.001 2.825-2.994 5.211-5.585 6.932l.005-.004l6.191 5.238C37.52 41.218 44 36 44 24c0-1.341-.138-2.651-.389-3.917Z"/>
                </svg>
                {t('continueGoogle')}
              </Button>
            </div>

            <div className="text-center pt-4">
              <p className="text-gray-600">
                {t('alreadyHaveAccount')}{' '}
                <button
                  onClick={() => router.push('/login')}
                  className="text-purple-600 hover:text-purple-800 font-semibold underline"
                >
                  {t('signIn')}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
