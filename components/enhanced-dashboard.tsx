// Enhanced dashboard with all new features integrated
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  PenTool, 
  Mic, 
  Gamepad2, 
  Trophy, 
  Star, 
  Zap, 
  Settings,
  Bell,
  Target,
  Calendar,
  Crown
} from 'lucide-react'
// import { useSession } from 'next-auth/react'
import { getUserSession } from '@/lib/simple-auth'
import { useRouter } from 'next/navigation'
import { audioManager } from '@/lib/audio'
import { progressManager } from '@/lib/progress'
import { challengeManager } from '@/lib/challenges'
import { 
  AchievementCard, 
  FloatingActionButton, 
  ProgressBar, 
  Confetti, 
  LevelUpModal,
  StreakDisplay 
} from '@/components/ui/enhanced'

export default function EnhancedDashboard() {
  const [session, setSession] = useState<any>(null)
  
  useEffect(() => {
    const userSession = getUserSession()
    setSession({ user: userSession })
  }, [])
  const router = useRouter()
  
  const [progress, setProgress] = useState<any>(null)
  const [challenges, setChallenges] = useState<any[]>([])
  const [showConfetti, setShowConfetti] = useState(false)
  const [levelUpModal, setLevelUpModal] = useState<{isOpen: boolean, newLevel: number, rewards: any}>({
    isOpen: false,
    newLevel: 0,
    rewards: { coins: 0, xp: 0 }
  })
  const [achievements, setAchievements] = useState<any[]>([])

  useEffect(() => {
    if (session?.user?.email) {
      // Load user progress
      const userProgress = progressManager.loadProgress(session.user.email) ||
                           progressManager.initializeProgress(session.user.email)
      setProgress(userProgress)

      // Load daily challenges
      // const todaysChallenges = challengeManager.getTodaysChallenges()
      // setChallenges(todaysChallenges)
      setChallenges([])

      // Load achievements
      loadAchievements(userProgress)
    }
  }, [session])

  const loadAchievements = (userProgress: any) => {
    const allAchievements = [
      {
        id: 'first_activity',
        title: 'First Steps',
        description: 'Complete your first activity',
        icon: <Star className="w-5 h-5" />,
        unlocked: userProgress?.achievements?.includes('first_activity') || false
      },
      {
        id: 'week_streak',
        title: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: <Zap className="w-5 h-5" />,
        unlocked: userProgress?.achievements?.includes('week_streak') || false,
        progress: userProgress?.currentStreak || 0,
        maxProgress: 7
      },
      {
        id: 'score_master',
        title: 'Score Master',
        description: 'Earn 1000 total points',
        icon: <Trophy className="w-5 h-5" />,
        unlocked: userProgress?.achievements?.includes('score_master') || false,
        progress: userProgress?.totalScore || 0,
        maxProgress: 1000
      },
      {
        id: 'level_explorer',
        title: 'Level Explorer',
        description: 'Reach level 5',
        icon: <Crown className="w-5 h-5" />,
        unlocked: userProgress?.achievements?.includes('level_explorer') || false,
        progress: userProgress?.level || 1,
        maxProgress: 5
      }
    ]
    setAchievements(allAchievements)
  }

  const handleModuleClick = (moduleId: string) => {
    audioManager.playClick()
    router.push(`/learning/${moduleId}`)
  }

  const handleSettingsClick = () => {
    audioManager.playClick()
    // Open settings modal or navigate to settings page
  }

  const handleNotificationClick = () => {
    audioManager.playClick()
    // Show notifications
  }

  const learningModules = [
    {
      id: 'speaking',
      title: 'Speaking Practice',
      description: 'Improve pronunciation and conversation skills',
      icon: <Mic className="w-8 h-8" />,
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200 hover:border-green-400',
      href: '/learning/speaking'
    },
    {
      id: 'writing',
      title: 'Writing & Spelling',
      description: 'Master letters, words, and creative writing',
      icon: <PenTool className="w-8 h-8" />,
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200 hover:border-blue-400',
      href: '/learning/writing'
    },
    {
      id: 'reading',
      title: 'Reading Library',
      description: 'Explore amazing stories and books',
      icon: <BookOpen className="w-8 h-8" />,
      color: 'from-indigo-400 to-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200 hover:border-indigo-400',
      href: '/learning/reading'
    },
    {
      id: 'games',
      title: 'Educational Games',
      description: 'Learn through fun and interactive games',
      icon: <Gamepad2 className="w-8 h-8" />,
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200 hover:border-purple-400',
      href: '/learning/games'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
              <p className="text-gray-600">Ready to learn something new today?</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* User Stats */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-bold">{progress?.level || 1}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="font-bold">{progress?.coins || 0}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <button
                onClick={handleNotificationClick}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
              
              <button
                onClick={handleSettingsClick}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">Your Progress</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{progress?.totalScore || 0}</div>
                  <div className="text-sm text-gray-600">Total Points</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{progress?.completedActivities || 0}</div>
                  <div className="text-sm text-gray-600">Activities Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{progress?.xp || 0}</div>
                  <div className="text-sm text-gray-600">Experience Points</div>
                </div>
              </div>

              <ProgressBar 
                progress={(progress?.xp || 0) % 100} 
                label="Level Progress" 
                color="from-blue-500 to-purple-500"
              />
            </motion.div>

            {/* Learning Modules */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6">Learning Modules</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {learningModules.map((module, index) => (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleModuleClick(module.id)}
                    className={`p-6 rounded-xl border-2 ${module.borderColor} ${module.bgColor} cursor-pointer transition-all duration-300 hover:shadow-lg`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${module.color} text-white`}>
                        {module.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-lg">{module.title}</h3>
                        <p className="text-gray-600 text-sm">{module.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Streak Display */}
            <StreakDisplay 
              currentStreak={progress?.currentStreak || 0}
              longestStreak={progress?.longestStreak || 0}
            />

            {/* Daily Challenges */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                Daily Challenges
              </h3>
              
              <div className="space-y-3">
                {challenges.slice(0, 3).map((challenge) => (
                  <div key={challenge.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-800">{challenge.title}</div>
                      <div className="text-xs text-gray-600">{challenge.current}/{challenge.target}</div>
                    </div>
                    <div className="text-xs font-bold text-blue-600">+{challenge.reward}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Achievements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Achievements
              </h3>
              
              <div className="space-y-3">
                {achievements.slice(0, 3).map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={() => audioManager.playBackgroundMusic()}
        icon={<Star className="w-6 h-6" />}
        label="Play Music"
        color="from-pink-500 to-purple-600"
        pulse={true}
      />

      {/* Confetti Effect */}
      <Confetti 
        active={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
      />

      {/* Level Up Modal */}
      <LevelUpModal
        isOpen={levelUpModal.isOpen}
        newLevel={levelUpModal.newLevel}
        rewards={levelUpModal.rewards}
        onClose={() => setLevelUpModal({ isOpen: false, newLevel: 0, rewards: { coins: 0, xp: 0 } })}
      />
    </div>
  )
}
