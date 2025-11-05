'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Mascot } from '@/components/ui/mascot'
import { Baby, Heart, ArrowLeft } from 'lucide-react'
import { addChild } from '@/lib/children'
import { getUserSession } from '@/lib/simple-auth'
import { getAgeGroupConfigByAge, AgeGroup } from '@/lib/age-utils'

export default function AddChildPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    childName: '',
    childAge: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    console.log('Form submitted with data:', formData)

    try {
      const user = getUserSession()
      if (!user) {
        console.error('No user session found')
        router.push('/login')
        return
      }

      const age = parseInt(formData.childAge)
      if (isNaN(age) || age < 3 || age > 12) {
        alert('Please enter a valid age between 3 and 12')
        setLoading(false)
        return
      }

      // Automatically determine age group and add child
      const newChild = addChild(user.id, formData.childName, age)
      
      // Get age group info for feedback
      const ageGroupConfig = getAgeGroupConfigByAge(age)
      console.log(`Child added to ${ageGroupConfig.name} (${ageGroupConfig.group})`)
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error adding child:', error)
      alert('Failed to add child. Please try again.')
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
              Add Your Child!
            </motion.h1>
            <p className="text-gray-600">Let's get to know your little learner</p>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Child Information */}
              <div className="space-y-4">
                <div className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  Your Child
                </div>

                <div className="relative z-10">
                  <Baby className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-20" />
                  <Input
                    type="text"
                    placeholder="Child's Name"
                    value={formData.childName}
                    onChange={(e) => setFormData({...formData, childName: e.target.value})}
                    className="pl-10 py-3 text-lg rounded-xl border-2 focus:border-pink-400 w-full"
                    required
                    style={{ pointerEvents: 'auto', zIndex: 10 }}
                    autoFocus
                  />
                </div>

                <div className="relative z-10">
                  <select
                    value={formData.childAge}
                    onChange={(e) => {
                      const age = parseInt(e.target.value)
                      setFormData({...formData, childAge: e.target.value})
                      
                      // Show age group preview
                      if (!isNaN(age) && age >= 3 && age <= 12) {
                        const ageGroupConfig = getAgeGroupConfigByAge(age)
                        console.log(`Age group: ${ageGroupConfig.name}`)
                      }
                    }}
                    className="w-full pl-3 py-3 text-lg rounded-xl border-2 focus:border-pink-400 bg-white"
                    required
                    style={{ pointerEvents: 'auto', zIndex: 10 }}
                  >
                    <option value="">Select Child's Age</option>
                    {[3,4,5,6,7,8,9,10,11,12].map(age => {
                      const ageGroupConfig = getAgeGroupConfigByAge(age)
                      return (
                        <option key={age} value={age}>
                          {age} years old ({ageGroupConfig.name})
                        </option>
                      )
                    })}
                  </select>
                  {formData.childAge && (
                    <p className="text-sm text-gray-600 mt-2">
                      {(() => {
                        const age = parseInt(formData.childAge)
                        if (!isNaN(age) && age >= 3 && age <= 12) {
                          const config = getAgeGroupConfigByAge(age)
                          return `✨ Your child will join ${config.name}!`
                        }
                        return ''
                      })()}
                    </p>
                  )}
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
                  {loading ? 'Adding Child...' : 'Continue Learning! 🎓'}
                </Button>
              </motion.div>

              {/* Fallback button */}
              <Button
                onClick={() => {
                  console.log('Fallback button clicked')
                  router.push('/dashboard')
                }}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 text-lg rounded-xl"
              >
                Go to Dashboard (Fallback)
              </Button>
            </form>

            <div className="text-center pt-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Skip for now
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
