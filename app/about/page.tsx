'use client'

import { motion } from 'framer-motion'
import { 
  Mic, PenTool, BookOpen, Gamepad2, Target, Trophy, 
  Users, Shield, Sparkles, Star, Zap, Heart,
  ArrowLeft, ChevronRight, CheckCircle, Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

export default function AboutPage() {
  const router = useRouter()

  const features = [
    {
      icon: <Mic className="w-8 h-8" />,
      title: "Speaking Practice",
      description: "AI-powered pronunciation training with instant feedback",
      details: [
        "Interactive pronunciation exercises",
        "Role-play dialogues with scenarios",
        "Karaoke-style sing & speak activities",
        "Speech recognition technology"
      ],
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50"
    },
    {
      icon: <PenTool className="w-8 h-8" />,
      title: "Writing & Spelling",
      description: "Master letter formation and word building",
      details: [
        "Multi-step letter tracing with visual guides",
        "Word building and spelling exercises",
        "Creative writing prompts",
        "Progress tracking for each letter"
      ],
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Reading Library",
      description: "Immersive stories and interactive books",
      details: [
        "Choose your own adventure stories",
        "PDF book reader with progress tracking",
        "Multiple choice comprehension questions",
        "Age-appropriate content selection"
      ],
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50"
    },
    {
      icon: <Gamepad2 className="w-8 h-8" />,
      title: "Educational Games",
      description: "Fun learning through interactive gameplay",
      details: [
        "Memory match games",
        "Story adventures with choices",
        "Spelling bee competitions",
        "Word hunt puzzles",
        "Quiz arena challenges"
      ],
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50"
    }
  ]

  const premiumFeatures = [
    {
      icon: <Target className="w-6 h-6" />,
      title: "Daily Challenges",
      description: "Personalized daily goals that adapt to your child's progress"
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "Achievement System",
      description: "Badges, rewards, and progress tracking to keep kids motivated"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Multi-Child Support",
      description: "Separate profiles and progress for each child in your family"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Parent Controls",
      description: "Time limits, content filters, and progress monitoring"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Adaptive Learning",
      description: "AI adjusts difficulty based on your child's performance"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Feedback",
      description: "Real-time corrections and encouragement for better learning"
    }
  ]

  const comingSoon = [
    "Advanced AI tutoring with personalized lesson plans",
    "Multi-language support for international families",
    "Collaborative learning with friends and classmates",
    "Advanced analytics and detailed progress reports",
    "Voice recognition improvements for better pronunciation",
    "Offline mode for learning anywhere, anytime",
    "Parent-teacher communication tools",
    "Customizable avatars and learning environments"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-90" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1604882737218-2c5622a3b3c5?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
        
        <div className="relative z-10 container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center text-white"
          >
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="mb-8 text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent">
              About Kids English Learning
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Empowering children ages 3-12 to master English through interactive, 
              AI-powered learning experiences that make education fun and engaging.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-16"
        >
          <Card className="bg-white/70 backdrop-blur-xl border-white/60 shadow-xl">
            <CardContent className="p-12">
              <div className="flex items-center justify-center mb-6">
                <Heart className="w-12 h-12 text-pink-500" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                We believe every child deserves access to high-quality English education that adapts to their 
                unique learning style. Our platform combines cutting-edge AI technology with proven educational 
                methods to create personalized learning experiences that inspire confidence and foster a love 
                for language learning.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Core Learning Modules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Core Learning Modules</h2>
            <p className="text-xl text-gray-600">Comprehensive English learning through interactive experiences</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card className="h-full bg-white/70 backdrop-blur-xl border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white shadow-lg`}>
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">{feature.title}</h3>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {feature.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Premium Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Premium Features</h2>
            <p className="text-xl text-gray-600">Advanced tools for enhanced learning experience</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {premiumFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <Card className="h-full bg-white/70 backdrop-blur-xl border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg flex-shrink-0">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">{feature.title}</h3>
                        <p className="text-gray-600 text-sm">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Coming Soon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-16"
        >
          <Card className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-2xl">
            <CardContent className="p-12">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <Clock className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-4xl font-bold mb-4">Coming Soon</h2>
                <p className="text-xl text-white/90">Exciting new features in development</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {comingSoon.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.05 }}
                    className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl"
                  >
                    <ChevronRight className="w-5 h-5 text-white/80 flex-shrink-0" />
                    <span className="text-white/90">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="text-center"
        >
          <Card className="bg-white/70 backdrop-blur-xl border-white/60 shadow-xl">
            <CardContent className="p-12">
              <div className="flex items-center justify-center mb-6">
                <Star className="w-12 h-12 text-yellow-500" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Ready to Start Learning?</h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Join thousands of families who are already using Kids English Learning to help their children 
                master English in a fun, engaging way.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => router.push('/register')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Start Your Journey
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push('/')}
                  className="px-8 py-4 text-lg font-semibold border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white transition-all duration-300"
                >
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}