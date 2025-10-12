'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Mascot } from '@/components/ui/mascot'
import { Baby, Heart, ArrowLeft } from 'lucide-react'

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
      // Store child information in localStorage
      const existingChildren = JSON.parse(localStorage.getItem('children') || '[]')
      const newChild = {
        id: `child-${Date.now()}`,
        name: formData.childName,
        age: formData.childAge,
        createdAt: new Date().toISOString()
      }
      
      existingChildren.push(newChild)
      localStorage.setItem('children', JSON.stringify(existingChildren))
      
      console.log('Child added, redirecting to dashboard...')
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error adding child:', error)
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
