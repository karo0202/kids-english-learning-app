'use client'

import { useState, useEffect } from 'react'
// import { useSession } from 'next-auth/react'
import { getUserSession } from '@/lib/simple-auth'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Mascot } from '@/components/ui/mascot'
import { ProgressRing } from '@/components/ui/progress-ring'
import Logo from '@/components/logo'
import { 
  Mic, PenTool, Gamepad2, User, Trophy, Star, 
  Settings, LogOut, BookOpen, Target, Gift, Crown, Zap, Bell
} from 'lucide-react'
// import { signOut } from 'next-auth/react'
import { clearUserSession } from '@/lib/simple-auth'
import { useRouter } from 'next/navigation'
import { audioManager } from '@/lib/audio'
import { progressManager } from '@/lib/progress'
import { challengeManager } from '@/lib/challenge-manager'

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

export default function EnhancedDashboardNew() {
  const [session, setSession] = useState<any>(null)
  
  useEffect(() => {
    const userSession = getUserSession()
    setSession({ user: userSession })
  }, [])
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

  const initializeProgress = async () => {
    if (session?.user?.email) {
      // Load user progress
      const userProgress = progressManager.loadProgress(session.user.email) ||
                           progressManager.initializeProgress(session.user.email)
      setProgress(userProgress)
    }
  }

  const loadChallenges = async (childId: string) => {
    try {
      const todaysChallenges = await challengeManager.getOrCreateDailyChallenges(childId)
      setChallenges(todaysChallenges)
    } catch (error) {
      console.error('Error loading challenges:', error)
      setChallenges([])
    }
  }

  const fetchChildren = async () => {
    try {
      const response = await fetch('/api/children')
      if (response.ok) {
        const data = await response.json()
        setChildren(data)
        if (data.length > 0) {
          const firstChild = data[0]
          setSelectedChild(firstChild)
          // Load challenges for the selected child
          await loadChallenges(firstChild.id)
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
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200 hover:border-blue-400',
      href: '/learning/speaking'
    },
    {
      id: 'writing',
      title: 'Writing & Spelling',
      description: 'Trace letters and build words',
      icon: <PenTool className="w-8 h-8" />,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200 hover:border-green-400',
      href: '/learning/writing'
    },
    {
      id: 'reading',
      title: 'Reading Library',
      description: 'Read amazing stories and books',
      icon: <BookOpen className="w-8 h-8" />,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200 hover:border-purple-400',
      href: '/learning/reading'
    },
    {
      id: 'games',
      title: 'Educational Games',
      description: 'Fun games and adventures',
      icon: <Gamepad2 className="w-8 h-8" />,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200 hover:border-orange-400',
      href: '/learning/games'
    }
  ]

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 opacity-90" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1604882737218-2c5622a3b3c5?q=80&w=1600&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="relative z-10 container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Logo size="lg" showText={false} />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-md">
                <span className="text-xs">✨</span>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Learning Dashboard
              </h1>
              <p className="text-muted-foreground flex items-center gap-1">
                Welcome back, {selectedChild?.name || 'Student'}! <span className="text-xl">👋</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-purple-100" onClick={() => router.push('/settings')}>
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-purple-100" onClick={() => router.push('/parent-dashboard')}>
              <User className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-purple-100" onClick={() => { clearUserSession(); router.push('/login'); }}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </header>

        <div className="mt-8 space-y-8">
          {/* Child Profiles */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-foreground">Select Child Profile</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={async () => {
                    setSelectedChild(child)
                    await loadChallenges(child.id)
                  }}
                  className={`relative p-6 rounded-3xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group ${
                    selectedChild?.id === child.id ? "ring-4 ring-purple-500 ring-offset-2" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-3xl shadow-md group-hover:animate-float">
                      {child.name === 'Liam' ? "🦁" : child.name === 'Sophie' ? "🦄" : child.name === 'Emma' ? "🐰" : "👦"}
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-lg text-foreground">{child.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Age {child.age} • Level {child.level}
                      </p>
                    </div>
                  </div>
                  {selectedChild?.id === child.id && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Learning Adventures */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">📚</span>
                  <h2 className="text-2xl font-bold text-foreground">Learning Adventures</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {learningModules.map((module) => (
                    <div
                      key={module.id}
                      className={`relative p-6 rounded-3xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group overflow-hidden`}
                    >
                      <div
                        className={`absolute top-0 right-0 w-32 h-32 ${module.bgColor} rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500`}
                      />

                      <div className="relative">
                        <div
                          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-4 shadow-md group-hover:animate-float`}
                        >
                          {module.icon}
                        </div>

                        <h3 className="font-bold text-lg mb-2 text-foreground">{module.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{module.description}</p>

                        <Button
                          className={`w-full rounded-full bg-gradient-to-r ${module.color} text-white hover:opacity-90 shadow-md font-semibold`}
                          onClick={() => router.push(module.href)}
                        >
                          Start Learning!
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Challenges */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-6 h-6 text-green-500" />
                  <h2 className="text-2xl font-bold text-foreground">Daily Challenges</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {challenges.map((challenge) => (
                    <div
                      key={challenge.id}
                      className="p-6 rounded-3xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-lg text-foreground">{challenge.name}</h3>
                        <div
                          className={`px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm font-bold shadow-md flex items-center gap-1`}
                        >
                          <span>🪙</span>
                          <span>+{challenge.reward}</span>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4">{challenge.description}</p>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold text-foreground">
                            {challenge.current}/{challenge.target} Complete
                          </span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-500 rounded-full`}
                            style={{ width: `${(challenge.current / challenge.target) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Progress Overview */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 text-white shadow-xl">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-2xl">🏆</span>
                  <h2 className="text-xl font-bold">Progress Overview</h2>
                </div>

                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="56" stroke="rgba(255,255,255,0.2)" strokeWidth="12" fill="none" />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="white"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - 65 / 100)}`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-4xl font-bold">{selectedChild?.level || 5}</div>
                      <div className="text-sm opacity-90">Level</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
                    <div className="text-3xl font-bold">{selectedChild?.xp || 1250}</div>
                    <div className="text-sm opacity-90">XP Points</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
                    <div className="text-3xl font-bold">{selectedChild?.coins || 100}</div>
                    <div className="text-sm opacity-90">Coins</div>
                  </div>
                </div>
              </div>

              {/* Today's Stats */}
              <div className="p-6 rounded-3xl bg-white shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">📊</span>
                  <h2 className="text-xl font-bold text-foreground">Today's Stats</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Activities Completed</span>
                    <span className="font-bold text-foreground">3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Words Learned</span>
                    <span className="font-bold text-foreground">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Time Spent</span>
                    <span className="font-bold text-foreground">25m</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Current Streak</span>
                    <span className="font-bold text-foreground">4 days</span>
                  </div>
                </div>
              </div>

              {/* Recent Badges */}
              <div className="p-6 rounded-3xl bg-white shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🏅</span>
                  <h2 className="text-xl font-bold text-foreground">Recent Badges</h2>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-yellow-50">
                    <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center">
                      <span className="text-lg">⭐</span>
                    </div>
                    <div>
                      <div className="font-bold text-sm">Word Master</div>
                      <div className="text-xs text-muted-foreground">Completed 10 words</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-green-50">
                    <div className="w-10 h-10 rounded-full bg-green-400 flex items-center justify-center">
                      <span className="text-lg">🎯</span>
                    </div>
                    <div>
                      <div className="font-bold text-sm">Perfect Score</div>
                      <div className="text-xs text-muted-foreground">100% accuracy</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
