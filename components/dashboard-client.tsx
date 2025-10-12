
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Mascot } from '@/components/ui/mascot'
import { ProgressRing } from '@/components/ui/progress-ring'
import { 
  Mic, PenTool, Gamepad2, User, Trophy, Star, 
  Settings, LogOut, BookOpen, Target, Gift, Crown, Zap, Bell
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { audioManager } from '@/lib/audio'
import { progressManager } from '@/lib/progress'
import { challengeManager } from '@/lib/challenges'

interface Child {
  id: string
  name: string
  age: number
  ageGroup: string
  level: number
  xp: number
  coins: number
  avatar?: any
}

export default function DashboardClient() {
  const { data: session } = useSession() || {}
  const router = useRouter()
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState<any>(null)
  const [challenges, setChallenges] = useState<any[]>([])
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    fetchChildren()
    initializeProgress()
  }, [])

  const initializeProgress = () => {
    if (session?.user?.id) {
      // Load user progress
      const userProgress = progressManager.loadProgress(session.user.id) || 
                          progressManager.initializeProgress(session.user.id)
      setProgress(userProgress)

      // Load daily challenges
      const todaysChallenges = challengeManager.getTodaysChallenges()
      setChallenges(todaysChallenges)
    }
  }

  const fetchChildren = async () => {
    try {
      const response = await fetch('/api/children')
      if (response.ok) {
        const data = await response.json()
        setChildren(data)
        if (data.length > 0) {
          setSelectedChild(data[0])
        }
      }
    } catch (error) {
      console.error('Error fetching children:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 flex items-center justify-center">
        <div className="text-center">
          <Mascot emotion="thinking" size="large" />
          <p className="text-white text-xl mt-4">Loading your adventure...</p>
        </div>
      </div>
    )
  }

  if (children.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 flex items-center justify-center p-4">
        <Card className="card-kid max-w-md text-center">
          <CardContent className="p-8">
            <Mascot emotion="thinking" size="large" className="mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Children Found</h2>
            <p className="text-gray-600 mb-6">Let's add your first child to get started!</p>
            <Button 
              className="btn-primary-kid"
              onClick={() => router.push('/add-child')}
            >
              Add Child Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const learningModules = [
    {
      id: 'speaking',
      title: 'Speaking Practice',
      description: 'Learn pronunciation with AI buddy',
      icon: <Mic className="w-8 h-8" />,
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200 hover:border-blue-400',
      href: '/learning/speaking'
    },
    {
      id: 'writing',
      title: 'Writing & Spelling',
      description: 'Trace letters and build words',
      icon: <PenTool className="w-8 h-8" />,
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200 hover:border-green-400',
      href: '/learning/writing'
    },
    {
      id: 'reading',
      title: 'Reading Library',
      description: 'Read amazing stories and books',
      icon: <BookOpen className="w-8 h-8" />,
      color: 'from-indigo-400 to-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200 hover:border-indigo-400',
      href: '/learning/reading'
    },
    {
      id: 'games',
      title: 'Educational Games',
      description: 'Fun games and adventures',
      icon: <Gamepad2 className="w-8 h-8" />,
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200 hover:border-purple-400',
      href: '/learning/games'
    }
  ]

  const dailyStats = {
    activitiesCompleted: 3,
    wordsLearned: 12,
    timeSpent: 25, // minutes
    streak: 4 // days
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Mascot emotion="happy" size="medium" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Learning Dashboard</h1>
                <p className="text-gray-600">Welcome back, {selectedChild?.name}! 🌟</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  audioManager.playClick()
                  router.push('/settings')
                }}
                className="hidden md:flex"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  audioManager.playClick()
                  router.push('/parent-dashboard')
                }}
                className="hidden md:flex"
              >
                <Settings className="w-4 h-4 mr-2" />
                Parent Dashboard
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Exit
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Child Selection */}
        {children.length > 1 && (
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Select Child Profile</h2>
            <div className="flex flex-wrap gap-4">
              {children.map((child) => (
                <motion.button
                  key={child.id}
                  onClick={() => {
                    audioManager.playClick()
                    setSelectedChild(child)
                  }}
                  className={`card-kid p-4 flex items-center gap-3 ${
                    selectedChild?.id === child.id 
                      ? 'border-purple-400 bg-purple-50' 
                      : 'hover:border-purple-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="avatar-container">
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {child.name[0]}
                    </div>
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-800">{child.name}</h3>
                    <p className="text-sm text-gray-600">Age {child.age} • Level {child.level}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Learning Modules */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-purple-500" />
                Learning Adventures
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {learningModules.map((module, index) => (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + (index * 0.1) }}
                    whileHover={{ scale: 1.05 }}
                    className="cursor-pointer"
                    onClick={() => {
                      audioManager.playClick()
                      router.push(module.href)
                    }}
                  >
                    <Card className={`card-kid ${module.borderColor} ${module.bgColor} h-full`}>
                      <CardContent className="p-6 text-center">
                        <div className={`w-16 h-16 bg-gradient-to-r ${module.color} rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg`}>
                          {module.icon}
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{module.title}</h3>
                        <p className="text-gray-600 text-sm">{module.description}</p>
                        <Button className="btn-primary-kid mt-4 w-full">
                          Start Learning!
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Daily Challenges */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Target className="w-8 h-8 text-green-500" />
                Daily Challenges
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {challenges.slice(0, 4).map((challenge, index) => (
                  <motion.div
                    key={challenge.id}
                    whileHover={{ scale: 1.02 }}
                    className="cursor-pointer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + (index * 0.1) }}
                  >
                    <Card className={`card-kid ${challenge.completed ? 'border-green-400 bg-green-50' : ''}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-gray-800">{challenge.title}</h3>
                            <p className="text-gray-600 text-sm">{challenge.description}</p>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-600">
                            <Gift className="w-4 h-4" />
                            <span className="text-sm font-semibold">+{challenge.reward}</span>
                          </div>
                        </div>
                        <div className="progress-kid mb-2">
                          <motion.div 
                            className={`progress-fill bg-gradient-to-r ${
                              challenge.completed 
                                ? 'from-green-400 to-emerald-500' 
                                : 'from-blue-400 to-purple-500'
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${(challenge.current / challenge.target) * 100}%` }}
                            transition={{ delay: 0.8 + (index * 0.2), duration: 1 }}
                          />
                        </div>
                        <p className="text-sm text-gray-600 text-right">
                          {challenge.current}/{challenge.target} Complete
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Overview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="card-kid">
                <CardHeader>
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    Progress Overview
                  </h3>
                </CardHeader>
                <CardContent className="text-center">
                  <ProgressRing 
                    progress={75} 
                    size={100}
                    color="#8B5CF6"
                    className="mx-auto mb-4"
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{selectedChild?.level || 1}</div>
                      <div className="text-xs text-gray-500">Level</div>
                    </div>
                  </ProgressRing>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{progress?.xp || selectedChild?.xp || 0}</div>
                      <div className="text-xs text-gray-500">XP Points</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{progress?.coins || selectedChild?.coins || 100}</div>
                      <div className="text-xs text-gray-500">Coins</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Daily Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="card-kid">
                <CardHeader>
                  <h3 className="text-xl font-bold text-gray-800">Today's Stats</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Activities', value: progress?.completedActivities || dailyStats.activitiesCompleted, icon: <BookOpen className="w-4 h-4" /> },
                    { label: 'Words Learned', value: dailyStats.wordsLearned, icon: <Star className="w-4 h-4" /> },
                    { label: 'Time Spent', value: `${dailyStats.timeSpent}m`, icon: <Target className="w-4 h-4" /> },
                    { label: 'Streak', value: `${progress?.currentStreak || dailyStats.streak} days`, icon: <Zap className="w-4 h-4" /> }
                  ].map((stat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600">
                        {stat.icon}
                        <span>{stat.label}</span>
                      </div>
                      <span className="font-bold text-gray-800">{stat.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Achievements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="card-kid">
                <CardHeader>
                  <h3 className="text-xl font-bold text-gray-800">Recent Badges</h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: 'First Steps', icon: '👶', color: 'bg-blue-100' },
                      { name: 'Word Master', icon: '📚', color: 'bg-green-100' },
                      { name: 'Speaking Star', icon: '🎤', color: 'bg-purple-100' }
                    ].map((badge, index) => (
                      <motion.div
                        key={index}
                        className={`${badge.color} rounded-xl p-3 text-center`}
                        whileHover={{ scale: 1.05 }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.9 + (index * 0.1) }}
                      >
                        <div className="text-2xl mb-1">{badge.icon}</div>
                        <div className="text-xs font-semibold text-gray-700">{badge.name}</div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
