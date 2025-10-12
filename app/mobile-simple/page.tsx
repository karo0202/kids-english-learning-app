'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mascot } from '@/components/ui/mascot'
import { 
  BookOpen, Star, Trophy, Volume2, Smartphone, Play
} from 'lucide-react'

export default function MobileSimpleApp() {
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if running in Capacitor
    if (typeof window !== 'undefined' && (window as any).Capacitor) {
      setIsInstalled(true)
    }
  }, [])

  const features = [
    {
      icon: <BookOpen className="w-8 h-8 text-blue-500" />,
      title: "Interactive Learning",
      description: "Engaging lessons with voice recognition"
    },
    {
      icon: <Volume2 className="w-8 h-8 text-green-500" />,
      title: "Voice Practice",
      description: "Practice pronunciation with feedback"
    },
    {
      icon: <Trophy className="w-8 h-8 text-yellow-500" />,
      title: "Gamified Learning",
      description: "Earn points and badges"
    },
    {
      icon: <Star className="w-8 h-8 text-purple-500" />,
      title: "Personalized Content",
      description: "Adaptive learning experience"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-md border-b border-white/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Mascot emotion="happy" size="medium" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Kids English Mobile</h1>
                  <p className="text-gray-600">Native mobile app 📱</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-3">Mobile App Ready!</h2>
          <p className="text-lg text-gray-600">Your Kids English Learning App is optimized for mobile devices.</p>
        </motion.div>

        {/* Status Card */}
        <Card className="bg-white/70 backdrop-blur-xl border-white/60 shadow-xl mb-8">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {isInstalled ? 'Running as Mobile App!' : 'Ready for Mobile Installation'}
              </h3>
              <p className="text-gray-600 mb-6">
                {isInstalled 
                  ? 'Your app is running as a native mobile application with Capacitor.'
                  : 'Your app is ready to be packaged as a mobile application.'
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card className="bg-white/70 backdrop-blur-xl border-white/60 shadow-xl h-full">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="btn-primary-kid text-lg px-8 py-4"
              onClick={() => window.location.href = '/mobile'}
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Start Learning
            </Button>
            <Button 
              variant="outline"
              className="text-lg px-8 py-4"
              onClick={() => window.location.href = '/about'}
            >
              <Play className="w-5 h-5 mr-2" />
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
