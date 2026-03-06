'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getUserSession } from '@/lib/simple-auth'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { 
  Mic, PenTool, Gamepad2, ArrowLeft, Star, Trophy,
  FileText, Palette, Puzzle, Target, Lock, RefreshCw, Sparkles,
  Library, PencilLine, Calculator
} from 'lucide-react'
import { getCurrentChild, getChildrenSync, setCurrentChild } from '@/lib/children'
import { AgeGroup, getAgeGroupConfig } from '@/lib/age-utils'
import { AgeAdaptiveContainer, AgeGroupBadge } from '@/components/age-adaptive-ui'
import { checkModuleAccess, refreshSubscriptionStatus, clearSubscriptionCache, ModuleAccess, FREE_MODULES, PREMIUM_MODULES } from '@/lib/subscription'

export default function LearningPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [children, setChildren] = useState<any[]>([])
  const [selectedChild, setSelectedChild] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [moduleAccessMap, setModuleAccessMap] = useState<Record<string, ModuleAccess>>({})
  const [refreshingAccess, setRefreshingAccess] = useState(false)
  const [accessRefreshedMessage, setAccessRefreshedMessage] = useState(false)

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
        if (currentChild && storedChildren.length > 0) {
          // Find the matching child from storedChildren (fresh data)
          const matchingChild = storedChildren.find(c => c.id === currentChild.id)
          if (matchingChild) {
            // Use fresh data from storedChildren, not stale localStorage data
            if (mounted) {
              setSelectedChild(matchingChild)
              setCurrentChild(matchingChild) // Update localStorage with fresh data
            }
          } else {
            // Current child not found in stored children - use first child
            if (mounted) {
              setSelectedChild(storedChildren[0])
              setCurrentChild(storedChildren[0])
            }
          }
        } else if (storedChildren.length > 0) {
          // No current child set - use first child
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
    let retryTimeout: ReturnType<typeof setTimeout> | null = null

    const loadModuleAccess = async () => {
      try {
        const status = await refreshSubscriptionStatus(true)
        if (!mounted) return
        const map: Record<string, ModuleAccess> = {}
        const modules = [...FREE_MODULES, ...PREMIUM_MODULES]
        modules.forEach((moduleId) => {
          map[moduleId] = checkModuleAccess(moduleId, status)
        })
        setModuleAccessMap(map)
        // If any premium module is still locked, retry once after 5s (Firebase auth can be slow)
        const hasLockedPremium = PREMIUM_MODULES.some((id) => map[id]?.isLocked)
        if (hasLockedPremium && mounted) {
          retryTimeout = setTimeout(() => {
            loadModuleAccess()
          }, 5000)
        }
      } catch (error) {
        console.error('Error loading module access:', error)
      }
    }

    loadModuleAccess()

    return () => {
      mounted = false
      if (retryTimeout) clearTimeout(retryTimeout)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00aeef]"></div>
      </div>
    )
  }

  const moduleIsLocked = (moduleId: string): boolean => {
    return moduleAccessMap[moduleId]?.isLocked ?? false
  }

  const handleRefreshAccess = async () => {
    setRefreshingAccess(true)
    setAccessRefreshedMessage(false)
    clearSubscriptionCache()
    try {
      const status = await refreshSubscriptionStatus(true)
      const map: Record<string, ModuleAccess> = {}
      const modules = [...FREE_MODULES, ...PREMIUM_MODULES]
      modules.forEach((moduleId) => {
        map[moduleId] = checkModuleAccess(moduleId, status)
      })
      setModuleAccessMap(map)
      setAccessRefreshedMessage(true)
      setTimeout(() => setAccessRefreshedMessage(false), 4000)
    } catch (error) {
      console.error('Error refreshing access:', error)
    } finally {
      setRefreshingAccess(false)
    }
  }

  const renderLockBadge = (moduleId: string) => {
    if (!moduleIsLocked(moduleId)) return null
    return (
      <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#8c0066] to-[#00aeef] text-white text-xs font-semibold shadow-lg flex items-center gap-1.5 z-10 ring-2 ring-white/20">
        <Lock className="w-3.5 h-3.5" />
        Premium
      </div>
    )
  }

  const cardBase = 'cursor-pointer group relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-[#003366] bg-white/90 dark:bg-[#003366]/40 backdrop-blur-sm shadow-xl shadow-slate-200/50 dark:shadow-black/20 hover:shadow-2xl hover:shadow-[#00aeef]/15 dark:hover:shadow-[#00aeef]/20 hover:border-[#00aeef]/40 dark:hover:border-[#00aeef]/50 hover:-translate-y-1 transition-all duration-300'
  const iconBase = 'w-20 h-20 md:w-24 md:h-24 mx-auto mb-3 md:mb-4 rounded-2xl flex items-center justify-center shadow-xl ring-4 ring-black/5 dark:ring-white/5 relative overflow-hidden'

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
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#00aeef]/20 flex items-center justify-center">
              <span className="text-3xl">👶</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Children Added</h2>
            <p className="text-gray-600 mb-6">Please add a child first to start learning!</p>
            <Button 
              onClick={() => router.push('/add-child')}
              className="bg-[#00aeef] hover:bg-[#003366] text-white"
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00aeef]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <div className="bg-white/80 dark:bg-[#003366]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-[#003366] sticky top-0 z-50 shadow-sm relative">
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/dashboard')}
                className="text-slate-600 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 border border-transparent hover:border-slate-200 dark:hover:border-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden xs:inline">Back to Dashboard</span>
              </Button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 text-[#00aeef] dark:text-[#8eca40] hidden sm:block" />
                  <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-slate-800 to-[#8c0066] dark:from-white dark:to-[#8eca40] bg-clip-text text-transparent tracking-tight">Learning Center</h1>
                  {selectedChild?.ageGroup && (
                    <AgeGroupBadge ageGroup={selectedChild.ageGroup as AgeGroup} />
                  )}
                </div>
                <p className="text-sm md:text-base text-slate-600 dark:text-slate-300">
                  Welcome, {selectedChild?.name || 'Student'}
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
            <h2 className="text-base md:text-lg font-semibold text-slate-800 dark:text-white mb-3 tracking-tight">Select Child</h2>
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
                        ? 'bg-gradient-to-r from-[#8c0066] to-[#00aeef] text-white shadow-lg' 
                        : 'hover:bg-[#00aeef]/10 dark:hover:bg-[#00aeef]/20'
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-[#8c0066] dark:from-white dark:to-[#8eca40] bg-clip-text text-transparent tracking-tight">Choose your learning path</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshAccess}
              disabled={refreshingAccess}
              className="rounded-xl border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 shrink-0"
            >
              {refreshingAccess ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              {refreshingAccess ? 'Refreshing…' : 'Refresh access'}
            </Button>
          </div>
          {accessRefreshedMessage && (
            <p className="text-sm text-[#00aeef] dark:text-[#8eca40] mb-4 font-medium">
              Subscription updated. Your access has been refreshed.
            </p>
          )}
          {Object.keys(moduleAccessMap).some((id) => moduleAccessMap[id]?.isLocked) && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Just activated? Tap <strong>Refresh access</strong> above to unlock premium modules.
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={cardBase}
                onClick={() => handleModuleClick('reading', 'Reading')}
              >
                {renderLockBadge('reading')}
                <CardContent className="p-5 md:p-6 text-center relative z-10">
                  <motion.div 
                    className={`${iconBase} bg-gradient-to-br from-[#003366] to-[#8c0066]`}
                    whileHover={{ scale: 1.08 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <Library className="w-9 h-9 md:w-11 md:h-11 text-white" strokeWidth={2} />
                  </motion.div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-1.5 tracking-tight">Reading</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                    Stories, vocabulary, and comprehension
                  </p>
                  <div className="text-sm font-medium text-[#8c0066] dark:text-[#00aeef] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                    Start Reading
                    <span className="text-[#00aeef]">→</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Math (curriculum: Foundation 3–5, Elementary 6–8, Intermediate 9–12) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={cardBase}
                onClick={() => handleModuleClick('counting', 'Math', '/learning/math')}
              >
                {renderLockBadge('counting')}
                <CardContent className="p-5 md:p-6 text-center relative z-10">
                  <motion.div 
                    className={`${iconBase} bg-gradient-to-br from-[#8c0066] to-[#00aeef]`}
                    whileHover={{ scale: 1.08 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <Calculator className="w-9 h-9 md:w-11 md:h-11 text-white" strokeWidth={2} />
                  </motion.div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-1.5 tracking-tight">Math in English</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                    Foundation, Elementary & Intermediate — numbers, shapes, operations, fractions
                  </p>
                  <div className="text-sm font-medium text-[#00aeef] dark:text-[#8eca40] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                    Start
                    <span className="text-[#00aeef]">→</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={cardBase}
                onClick={() => handleModuleClick('writing', 'Writing')}
              >
                <CardContent className="p-5 md:p-6 text-center relative z-10">
                  <motion.div 
                    className={`${iconBase} bg-gradient-to-br from-[#00aeef] to-[#8eca40]`}
                    whileHover={{ scale: 1.08 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <PencilLine className="w-9 h-9 md:w-11 md:h-11 text-white" strokeWidth={2} />
                  </motion.div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-1.5 tracking-tight">Writing</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">Letter tracing and spelling practice</p>
                  <div className="text-sm font-medium text-[#00aeef] dark:text-[#8eca40] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                    Start Writing
                    <span className="text-[#00aeef]">→</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={cardBase}
                onClick={() => handleModuleClick('speaking', 'Speaking')}
              >
                {renderLockBadge('speaking')}
                <CardContent className="p-5 md:p-6 text-center relative z-10">
                  <motion.div 
                    className={`${iconBase} bg-gradient-to-br from-[#8c0066] to-[#00aeef]`}
                    whileHover={{ scale: 1.08 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <Mic className="w-9 h-9 md:w-11 md:h-11 text-white" strokeWidth={2} />
                  </motion.div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-1.5 tracking-tight">Speaking</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                    Pronunciation and conversation
                  </p>
                  <div className="text-sm font-medium text-[#8c0066] dark:text-[#00aeef] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                    Start Speaking
                    <span className="text-[#00aeef]">→</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={cardBase}
                onClick={() => handleModuleClick('games', 'Games')}
              >
                <CardContent className="p-5 md:p-6 text-center relative z-10">
                  <motion.div 
                    className={`${iconBase} bg-gradient-to-br from-[#00aeef] to-[#8eca40]`}
                    whileHover={{ scale: 1.08 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <Gamepad2 className="w-9 h-9 md:w-11 md:h-11 text-white" strokeWidth={2} />
                  </motion.div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-1.5 tracking-tight">Games</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">Fun interactive learning games</p>
                  <div className="text-sm font-medium text-[#00aeef] dark:text-[#8eca40] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                    Start Playing
                    <span className="text-[#00aeef]">→</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Grammar & Language */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={cardBase}
                onClick={() => handleModuleClick('grammar', 'Grammar')}
              >
                <CardContent className="p-5 md:p-6 text-center relative z-10">
                  <motion.div 
                    className={`${iconBase} bg-gradient-to-br from-[#003366] to-[#8c0066]`}
                    whileHover={{ scale: 1.08 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <FileText className="w-9 h-9 md:w-11 md:h-11 text-white" strokeWidth={2} />
                  </motion.div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-1.5 tracking-tight">Grammar</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">Master grammar rules and language</p>
                  <div className="text-sm font-medium text-[#8c0066] dark:text-[#00aeef] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                    Start Learning
                    <span className="text-[#00aeef]">→</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Word Puzzles */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={cardBase}
                onClick={() => handleModuleClick('puzzle', 'Puzzles')}
              >
                {renderLockBadge('puzzle')}
                <CardContent className="p-5 md:p-6 text-center relative z-10">
                  <motion.div 
                    className={`${iconBase} bg-gradient-to-br from-[#8eca40] to-[#00aeef]`}
                    whileHover={{ scale: 1.08 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <Puzzle className="w-9 h-9 md:w-11 md:h-11 text-white" strokeWidth={2} />
                  </motion.div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-1.5 tracking-tight">Puzzles</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                    Solve word and sentence puzzles
                  </p>
                  <div className="text-sm font-medium text-[#00aeef] dark:text-[#8eca40] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                    Start Solving
                    <span className="text-[#00aeef]">→</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Alphabet Coloring */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={cardBase}
                onClick={() => handleModuleClick('alphabet-coloring', 'Coloring')}
              >
                {renderLockBadge('alphabet-coloring')}
                <CardContent className="p-5 md:p-6 text-center relative z-10">
                  <motion.div 
                    className={`${iconBase} bg-gradient-to-br from-[#8c0066] to-[#8eca40]`}
                    whileHover={{ scale: 1.08 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <Palette className="w-9 h-9 md:w-11 md:h-11 text-white" strokeWidth={2} />
                  </motion.div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-1.5 tracking-tight">Coloring</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                    Color letters and learn alphabet
                  </p>
                  <div className="text-sm font-medium text-[#8c0066] dark:text-[#8eca40] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                    Start Coloring
                    <span className="text-[#00aeef]">→</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Daily Challenges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={cardBase}
                onClick={() => handleModuleClick('challenges', 'Challenges', '/dashboard')}
              >
                {renderLockBadge('challenges')}
                <CardContent className="p-5 md:p-6 text-center relative z-10">
                  <motion.div 
                    className={`${iconBase} bg-gradient-to-br from-[#00aeef] to-[#8c0066]`}
                    whileHover={{ scale: 1.08 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <Target className="w-9 h-9 md:w-11 md:h-11 text-white" strokeWidth={2} />
                  </motion.div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-1.5 tracking-tight">Challenges</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">Complete daily challenges</p>
                  <div className="text-sm font-medium text-[#00aeef] dark:text-[#8eca40] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                    View Challenges
                    <span className="text-[#00aeef]">→</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Progress Section */}
        <motion.div 
          className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg p-5 md:p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-4 tracking-tight">Today's Progress</h3>
          <div className="grid grid-cols-3 gap-3 md:gap-4 text-xs md:text-base">
            <motion.div 
              className="text-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600/50"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-2xl md:text-3xl font-bold text-[#8c0066] dark:text-[#00aeef]">0</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">Lessons</div>
            </motion.div>
            <motion.div 
              className="text-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600/50"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-2xl md:text-3xl font-bold text-[#00aeef] dark:text-[#8eca40]">0</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">New Words</div>
            </motion.div>
            <motion.div 
              className="text-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600/50"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-2xl md:text-3xl font-bold text-[#8c0066] dark:text-[#8eca40]">0</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">Minutes</div>
            </motion.div>
          </div>
        </motion.div>
      </AgeAdaptiveContainer>
    </div>
  )
}
