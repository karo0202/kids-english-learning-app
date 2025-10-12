'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mascot } from '@/components/ui/mascot'
import { 
  BookOpen, Star, Trophy, Volume2, Smartphone, Play, Download
} from 'lucide-react'

export default function MobileApp() {
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
      description: "Engaging lessons with voice recognition and touch interactions"
    },
    {
      icon: <Volume2 className="w-8 h-8 text-green-500" />,
      title: "Voice Practice",
      description: "Practice pronunciation with real-time feedback"
    },
    {
      icon: <Trophy className="w-8 h-8 text-yellow-500" />,
      title: "Gamified Learning",
      description: "Earn points and badges as you progress"
    },
    {
      icon: <Star className="w-8 h-8 text-purple-500" />,
      title: "Personalized Content",
      description: "Adaptive learning based on your child's progress"
    }
  ]

  const mobileFeatures = [
    {
      icon: <Smartphone className="w-6 h-6 text-blue-500" />,
      title: "Mobile Optimized",
      description: "Perfect for phones and tablets"
    },
    {
      icon: <Play className="w-6 h-6 text-green-500" />,
      title: "Offline Learning",
      description: "Learn anywhere, anytime"
    },
    {
      icon: <Volume2 className="w-6 h-6 text-purple-500" />,
      title: "Native Performance",
      description: "Smooth animations and fast loading"
    }
  ]

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[#f5f3ff] via-[#eef2ff] to-[#e0f2fe]" />
      <div className="absolute inset-0 opacity-[0.35] pointer-events-none" style={{backgroundImage:'radial-gradient(circle at 10% 10%, rgba(99,102,241,0.08) 0 12%, transparent 12%), radial-gradient(circle at 90% 20%, rgba(236,72,153,0.08) 0 12%, transparent 12%), radial-gradient(circle at 30% 80%, rgba(16,185,129,0.08) 0 12%, transparent 12%)'}} />
      
      <div className="relative">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-md border-b border-white/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <Mascot emotion="happy" size="medium" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">Kids English Mobile</h1>
                    <p className="text-gray-600">Native mobile app experience 📱</p>
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
            <p className="text-lg text-gray-600">Your Kids English Learning App is now optimized for mobile devices.</p>
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
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    className="btn-primary-kid text-lg px-8 py-4"
                    onClick={() => window.location.href = '/about'}
                  >
                    <BookOpen className="w-5 h-5 mr-2" />
                    Learn More
                  </Button>
                  <Button 
                    variant="outline"
                    className="text-lg px-8 py-4"
                    onClick={() => window.location.href = '/contact'}
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Get Started
                  </Button>
                </div>
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

          {/* Mobile Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {mobileFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/70 backdrop-blur-xl border-white/60 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{feature.title}</h3>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Instructions */}
          <Card className="bg-white/70 backdrop-blur-xl border-white/60 shadow-xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">How to Install Mobile App</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-4">For Android:</h4>
                  <ol className="list-decimal pl-6 space-y-2 text-gray-600">
                    <li>Install Android Studio</li>
                    <li>Run: <code className="bg-gray-100 px-2 py-1 rounded">npx cap build android</code></li>
                    <li>Open Android Studio and run the app</li>
                    <li>Install on your device</li>
                  </ol>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-4">For iOS:</h4>
                  <ol className="list-decimal pl-6 space-y-2 text-gray-600">
                    <li>Install Xcode (Mac only)</li>
                    <li>Run: <code className="bg-gray-100 px-2 py-1 rounded">npx cap build ios</code></li>
                    <li>Open Xcode and run the app</li>
                    <li>Install on your device</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
