'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getUserSession } from '@/lib/simple-auth'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { 
  Mic, PenTool, Gamepad2, BookOpen, ArrowLeft, Star, Trophy,
  FileText, Palette, Puzzle, Target, Lock
} from 'lucide-react'
import { getCurrentChild, getChildrenSync, setCurrentChild } from '@/lib/children'
import { AgeGroup, getAgeGroupConfig } from '@/lib/age-utils'
import { AgeAdaptiveContainer, AgeGroupBadge } from '@/components/age-adaptive-ui'
import { checkModuleAccess, refreshSubscriptionStatus, ModuleAccess, FREE_MODULES, PREMIUM_MODULES } from '@/lib/subscription'

export default function LearningPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [children, setChildren] = useState<any[]>([])
  const [selectedChild, setSelectedChild] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [moduleAccessMap, setModuleAccessMap] = useState<Record<string, ModuleAccess>>({})

  // Ensure dark mode CSS class is present when user selected dark theme
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const prefsStr = localStorage.getItem('user_preferences')
        if (prefsStr) {
          const prefs = JSON.parse(prefsStr)
          if (prefs?.theme === 'dark') {
            document.documentElement.classList.add('dark')
          } else if (prefs?.theme === 'light') {
            document.documentElement.classList.remove('dark')
          }
        }
      } catch {}
    }
  }, [])

  useEffect(() => {
    let mounted = true
    
    const initialize = () => {
      const currentUser = getUserSession()
      if (!currentUser) {
        router.push('/login')
        return
      }
      
      if (!mounted) return
      setUser(currentUser)
      
      // Load children synchronously (instant)
      const storedChildren = getChildrenSync(currentUser.id, currentUser.email)
      
      if (!mounted) return
      setChildren(storedChildren)
      
      // Try to get current child first, otherwise use first child
      try {
        const currentChild = getCurrentChild()
        if (currentChild && storedChildren.some(c => c.id === currentChild.id)) {
          // Current child exists in the stored children list
          if (mounted) {
            setSelectedChild(currentChild)
          }
        } else if (storedChildren.length > 0) {
          // Use first child and set as current
          if (mounted) {
            setSelectedChild(storedChildren[0])
            setCurrentChild(storedChildren[0])
          }
        }
      } catch (error) {
        console.error('Error setting current child:', error)
        // Fallback: use first child if available
        if (storedChildren.length > 0 && mounted) {
          setSelectedChild(storedChildren[0])
          try {
            setCurrentChild(storedChildren[0])
          } catch (e) {
            console.error('Error setting current child in fallback:', e)
          }
        }
      }
      
      if (mounted) {
        setLoading(false)
      }
    }
    
    initialize()
    
    return () => {
      mounted = false
    }
  }, []) // Empty dependency array - only run once on mount

  useEffect(() => {
    let mounted = true

    const loadModuleAccess = async () => {
      try {
        const status = await refreshSubscriptionStatus()
        if (!mounted) return
        const map: Record<string, ModuleAccess> = {}
        const modules = [...FREE_MODULES, ...PREMIUM_MODULES]
        modules.forEach((moduleId) => {
          map[moduleId] = checkModuleAccess(moduleId, status)
        })
        setModuleAccessMap(map)
      } catch (error) {
        console.error('Error loading module access:', error)
      }
    }

    loadModuleAccess()

    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  const moduleIsLocked = (moduleId: string): boolean => {
    return moduleAccessMap[moduleId]?.isLocked ?? false
  }

  const renderLockBadge = (moduleId: string) => {
    if (!moduleIsLocked(moduleId)) return null
    return (
      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-semibold shadow-lg flex items-center gap-1 z-10">
        <Lock className="w-3 h-3" />
        Premium
      </div>
    )
  }

  // Helper function to handle module click
  const handleModuleClick = (moduleId: string, moduleName: string, overrideRoute?: string) => {
    if (moduleIsLocked(moduleId)) {
      router.push('/subscribe')
      return
    }
    router.push(overrideRoute || `/learning/${moduleId}`)
  }

  if (children.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-3xl">👶</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Children Added</h2>
            <p className="text-gray-600 mb-6">Please add a child first to start learning!</p>
            <Button 
              onClick={() => router.push('/add-child')}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Add Your First Child
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show loading if no child is selected yet
  if (!selectedChild) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900 relative overflow-hidden">
      {/* Creative animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-yellow-300/15 rounded-full blur-2xl animate-bounce-pop" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-40 left-20 w-56 h-56 bg-cyan-300/15 rounded-full blur-2xl animate-float" style={{ animationDelay: '1.5s' }}></div>
        {/* Fun decorative shapes */}
        <div className="fun-shape fun-shape-circle top-1/4 left-1/4" style={{ animationDelay: '0s' }}></div>
        <div className="fun-shape fun-shape-circle bottom-1/4 right-1/3" style={{ animationDelay: '2s', width: '80px', height: '80px', background: 'linear-gradient(135deg, #3b82f6, #10b981)' }}></div>
      </div>

      {/* Header */}
      <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md border-b border-purple-100/50 dark:border-white/10 sticky top-0 z-50 shadow-sm relative">
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-800 dark:text-white dark:hover:text-white/80 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden xs:inline">Back to Dashboard</span>
              </Button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl md:text-2xl font-bold text-fun-gradient">Learning Center ✨</h1>
                  {selectedChild?.ageGroup && (
                    <AgeGroupBadge ageGroup={selectedChild.ageGroup as AgeGroup} />
                  )}
                </div>
                <p className="text-sm md:text-base text-gray-600 dark:text-white/70">
                  Welcome, {selectedChild?.name || 'Student'}! ✨
                  {selectedChild?.ageGroup && (
                    <span className="ml-2">
                      ({getAgeGroupConfig(selectedChild.ageGroup as AgeGroup).name})
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.div 
                className="flex items-center gap-1 bg-gradient-to-r from-yellow-100 to-yellow-50 px-2 md:px-3 py-1 rounded-full shadow-md"
                whileHover={{ scale: 1.05 }}
              >
                <Star className="w-4 h-4 text-yellow-600" />
                <span className="text-xs md:text-sm font-medium text-yellow-800">100 XP</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-1 bg-gradient-to-r from-blue-100 to-cyan-50 px-2 md:px-3 py-1 rounded-full shadow-md"
                whileHover={{ scale: 1.05 }}
              >
                <Trophy className="w-4 h-4 text-blue-600" />
                <span className="text-xs md:text-sm font-medium text-blue-800">Level 1</span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <AgeAdaptiveContainer 
        ageGroup={(selectedChild?.ageGroup as AgeGroup) || AgeGroup.AGE_6_8}
        className="container mx-auto px-4 py-8 relative z-10"
      >
        {/* Child Selector */}
        {children.length > 1 && (
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-base md:text-lg font-semibold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">Select Child</h2>
                <div className="flex gap-2 md:gap-4 overflow-x-auto pb-2">
              {children.map((child) => (
                <motion.div
                  key={child.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant={selectedChild?.id === child.id ? "default" : "outline"}
                    onClick={() => {
                      setSelectedChild(child)
                      setCurrentChild(child)
                    }}
                    className={`whitespace-nowrap text-sm md:text-base rounded-xl ${
                      selectedChild?.id === child.id 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                        : 'hover:bg-purple-50 dark:hover:bg-purple-900/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{child.name} ({child.age} years old)</span>
                      {child.ageGroup && (
                        <AgeGroupBadge ageGroup={child.ageGroup as AgeGroup} className="text-xs" />
                      )}
                    </div>
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Learning Modules */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-fun-gradient mb-4 md:mb-6 animate-scale-in-bounce">Choose Your Learning Adventure! ✨</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card 
                className="card-kid cursor-pointer group relative overflow-hidden hover-lift border-2 border-transparent hover:border-blue-300/50 dark:hover:border-blue-500/30 transition-all duration-300"
                onClick={() => handleModuleClick('reading', 'Reading')}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-600/0 group-hover:from-blue-500/15 group-hover:to-cyan-600/15 transition-all duration-500"></div>
                {renderLockBadge('reading')}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/25 to-cyan-400/25 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardContent className="p-4 md:p-6 text-center relative z-10">
                  <motion.div 
                    className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-xl relative overflow-hidden"
                    whileHover={{ rotate: [0, -5, 5, 0], scale: 1.15 }}
                    transition={{ type: "spring", stiffness: 300, duration: 0.6 }}
                  >
                    <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-white relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent animate-shimmer"></div>
                    <span className="sparkle-dot top-2 right-2" style={{ animationDelay: '0s' }}></span>
                    <span className="sparkle-dot bottom-2 left-2" style={{ animationDelay: '1s' }}></span>
                  </motion.div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-1 md:mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors flex items-center justify-center gap-2">
                    📚 Reading
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 dark:text-white/80 mb-3 md:mb-4">
                    Stories, vocabulary, and comprehension
                  </p>
                  <div className="text-sm text-blue-600 dark:text-blue-300 font-medium group-hover:translate-x-2 transition-transform flex items-center justify-center gap-1">
                    <span>Start Reading</span>
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >→</motion.span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card 
                className="card-kid cursor-pointer group relative overflow-hidden hover-lift"
                onClick={() => handleModuleClick('writing', 'Writing')}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-emerald-600/0 group-hover:from-green-500/15 group-hover:to-emerald-600/15 transition-all duration-500"></div>
                <CardContent className="p-4 md:p-6 text-center relative z-10">
                  <motion.div 
                    className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg relative"
                    whileHover={{ rotate: [0, -5, 5, 0], scale: 1.15 }}
                    transition={{ type: "spring", stiffness: 300, duration: 0.6 }}
                  >
                    <PenTool className="w-8 h-8 md:w-10 md:h-10 text-white relative z-10" />
                    <span className="sparkle-dot top-2 right-2" style={{ animationDelay: '0.3s' }}></span>
                    <span className="sparkle-dot bottom-2 left-2" style={{ animationDelay: '1.3s' }}></span>
                  </motion.div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-1 md:mb-2 group-hover:text-green-600 dark:group-hover:text-green-300 transition-colors">✏️ Writing</h3>
                  <p className="text-sm md:text-base text-gray-600 dark:text-white/80 mb-3 md:mb-4">Letter tracing and spelling practice</p>
                  <div className="text-sm text-green-600 dark:text-green-300 font-medium group-hover:translate-x-2 transition-transform flex items-center justify-center gap-1">
                    <span>Start Writing</span>
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    >→</motion.span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card 
                className="card-kid cursor-pointer group relative overflow-hidden hover-lift"
                onClick={() => handleModuleClick('speaking', 'Speaking')}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-600/0 group-hover:from-purple-500/15 group-hover:to-pink-600/15 transition-all duration-500"></div>
                {renderLockBadge('speaking')}
                <CardContent className="p-4 md:p-6 text-center relative z-10">
                  <motion.div 
                    className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center shadow-lg relative"
                    whileHover={{ rotate: [0, -5, 5, 0], scale: 1.15 }}
                    transition={{ type: "spring", stiffness: 300, duration: 0.6 }}
                  >
                    <Mic className="w-8 h-8 md:w-10 md:h-10 text-white relative z-10" />
                    <span className="sparkle-dot top-2 right-2" style={{ animationDelay: '0.6s' }}></span>
                    <span className="sparkle-dot bottom-2 left-2" style={{ animationDelay: '1.6s' }}></span>
                  </motion.div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-1 md:mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors flex items-center justify-center gap-2">
                    🎤 Speaking
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 dark:text-white/80 mb-3 md:mb-4">
                    Pronunciation and conversation
                  </p>
                  <div className="text-sm text-purple-600 dark:text-purple-300 font-medium group-hover:translate-x-2 transition-transform flex items-center justify-center gap-1">
                    <span>Start Speaking</span>
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    >→</motion.span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card 
                className="card-kid cursor-pointer group relative overflow-hidden hover-lift"
                onClick={() => handleModuleClick('games', 'Games')}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-rose-600/0 group-hover:from-pink-500/15 group-hover:to-rose-600/15 transition-all duration-500"></div>
                <CardContent className="p-4 md:p-6 text-center relative z-10">
                  <motion.div 
                    className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center shadow-lg relative"
                    whileHover={{ rotate: [0, -5, 5, 0], scale: 1.15 }}
                    transition={{ type: "spring", stiffness: 300, duration: 0.6 }}
                  >
                    <Gamepad2 className="w-8 h-8 md:w-10 md:h-10 text-white relative z-10" />
                    <span className="sparkle-dot top-2 right-2" style={{ animationDelay: '0.9s' }}></span>
                    <span className="sparkle-dot bottom-2 left-2" style={{ animationDelay: '1.9s' }}></span>
                  </motion.div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-1 md:mb-2 group-hover:text-pink-600 dark:group-hover:text-pink-300 transition-colors">🎮 Games</h3>
                  <p className="text-sm md:text-base text-gray-600 dark:text-white/80 mb-3 md:mb-4">Fun interactive learning games</p>
                  <div className="text-sm text-pink-600 dark:text-pink-300 font-medium group-hover:translate-x-2 transition-transform flex items-center justify-center gap-1">
                    <span>Start Playing</span>
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                    >→</motion.span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Grammar & Language */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card 
                className="card-kid cursor-pointer group relative overflow-hidden hover-lift"
                onClick={() => handleModuleClick('grammar', 'Grammar')}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-indigo-600/0 group-hover:from-indigo-500/15 group-hover:to-indigo-600/15 transition-all duration-500"></div>
                <CardContent className="p-4 md:p-6 text-center relative z-10">
                  <motion.div 
                    className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4 rounded-2xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-lg relative"
                    whileHover={{ rotate: [0, -5, 5, 0], scale: 1.15 }}
                    transition={{ type: "spring", stiffness: 300, duration: 0.6 }}
                  >
                    <FileText className="w-8 h-8 md:w-10 md:h-10 text-white relative z-10" />
                    <span className="sparkle-dot top-2 right-2" style={{ animationDelay: '1.2s' }}></span>
                    <span className="sparkle-dot bottom-2 left-2" style={{ animationDelay: '2.2s' }}></span>
                  </motion.div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-1 md:mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">📝 Grammar</h3>
                  <p className="text-sm md:text-base text-gray-600 dark:text-white/80 mb-3 md:mb-4">Master grammar rules and language</p>
                  <div className="text-sm text-indigo-600 dark:text-indigo-300 font-medium group-hover:translate-x-2 transition-transform flex items-center justify-center gap-1">
                    <span>Start Learning</span>
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 }}
                    >→</motion.span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Word Puzzles */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card 
                className="card-kid cursor-pointer group relative overflow-hidden hover-lift"
                onClick={() => handleModuleClick('puzzle', 'Puzzles')}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-600/0 group-hover:from-orange-500/15 group-hover:to-orange-600/15 transition-all duration-500"></div>
                {renderLockBadge('puzzle')}
                <CardContent className="p-4 md:p-6 text-center relative z-10">
                  <motion.div 
                    className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg relative"
                    whileHover={{ rotate: [0, -5, 5, 0], scale: 1.15 }}
                    transition={{ type: "spring", stiffness: 300, duration: 0.6 }}
                  >
                    <Puzzle className="w-8 h-8 md:w-10 md:h-10 text-white relative z-10" />
                    <span className="sparkle-dot top-2 right-2" style={{ animationDelay: '1.5s' }}></span>
                    <span className="sparkle-dot bottom-2 left-2" style={{ animationDelay: '2.5s' }}></span>
                  </motion.div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-1 md:mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-300 transition-colors flex items-center justify-center gap-2">
                    🧩 Puzzles
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 dark:text-white/80 mb-3 md:mb-4">
                    Solve word and sentence puzzles
                  </p>
                  <div className="text-sm text-orange-600 dark:text-orange-300 font-medium group-hover:translate-x-2 transition-transform flex items-center justify-center gap-1">
                    <span>Start Solving</span>
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 1.0 }}
                    >→</motion.span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Alphabet Coloring */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card 
                className="card-kid cursor-pointer group relative overflow-hidden hover-lift"
                onClick={() => handleModuleClick('alphabet-coloring', 'Coloring')}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-cyan-600/0 group-hover:from-cyan-500/15 group-hover:to-cyan-600/15 transition-all duration-500"></div>
                {renderLockBadge('alphabet-coloring')}
                <CardContent className="p-4 md:p-6 text-center relative z-10">
                  <motion.div 
                    className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg relative"
                    whileHover={{ rotate: [0, -5, 5, 0], scale: 1.15 }}
                    transition={{ type: "spring", stiffness: 300, duration: 0.6 }}
                  >
                    <Palette className="w-8 h-8 md:w-10 md:h-10 text-white relative z-10" />
                    <span className="sparkle-dot top-2 right-2" style={{ animationDelay: '1.8s' }}></span>
                    <span className="sparkle-dot bottom-2 left-2" style={{ animationDelay: '2.8s' }}></span>
                  </motion.div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-1 md:mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors flex items-center justify-center gap-2">
                    🎨 Coloring
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 dark:text-white/80 mb-3 md:mb-4">
                    Color letters and learn alphabet
                  </p>
                  <div className="text-sm text-cyan-600 dark:text-cyan-300 font-medium group-hover:translate-x-2 transition-transform flex items-center justify-center gap-1">
                    <span>Start Coloring</span>
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 1.2 }}
                    >→</motion.span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Daily Challenges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card 
                className="card-kid cursor-pointer group relative overflow-hidden hover-lift"
                onClick={() => handleModuleClick('challenges', 'Challenges', '/dashboard')}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/0 to-rose-600/0 group-hover:from-rose-500/15 group-hover:to-rose-600/15 transition-all duration-500"></div>
                {renderLockBadge('challenges')}
                <CardContent className="p-4 md:p-6 text-center relative z-10">
                  <motion.div 
                    className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4 rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center shadow-lg relative"
                    whileHover={{ rotate: [0, -5, 5, 0], scale: 1.15 }}
                    transition={{ type: "spring", stiffness: 300, duration: 0.6 }}
                  >
                    <Target className="w-8 h-8 md:w-10 md:h-10 text-white relative z-10" />
                    <span className="sparkle-dot top-2 right-2" style={{ animationDelay: '2.1s' }}></span>
                    <span className="sparkle-dot bottom-2 left-2" style={{ animationDelay: '3.1s' }}></span>
                  </motion.div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-1 md:mb-2 group-hover:text-rose-600 dark:group-hover:text-rose-300 transition-colors">🎯 Challenges</h3>
                  <p className="text-sm md:text-base text-gray-600 dark:text-white/80 mb-3 md:mb-4">Complete daily challenges</p>
                  <div className="text-sm text-rose-600 dark:text-rose-300 font-medium group-hover:translate-x-2 transition-transform flex items-center justify-center gap-1">
                    <span>View Challenges</span>
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 1.4 }}
                    >→</motion.span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Progress Section */}
        <motion.div 
          className="card-kid rounded-2xl p-4 md:p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-lg md:text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3 md:mb-4">Today's Progress</h3>
          <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-4 text-xs md:text-base">
            <motion.div 
              className="text-center p-3 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">0</div>
              <div className="text-sm text-gray-600 dark:text-white/70 font-medium">Lessons</div>
            </motion.div>
            <motion.div 
              className="text-center p-3 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">0</div>
              <div className="text-sm text-gray-600 dark:text-white/70 font-medium">New Words</div>
            </motion.div>
            <motion.div 
              className="text-center p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">0</div>
              <div className="text-sm text-gray-600 dark:text-white/70 font-medium">Minutes</div>
            </motion.div>
          </div>
        </motion.div>
      </AgeAdaptiveContainer>
    </div>
  )
}
