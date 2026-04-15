'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getUserSession } from '@/lib/simple-auth'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ArrowLeft, Star, Trophy, Lock, RefreshCw, Sparkles } from 'lucide-react'
import { getCurrentChild, getChildrenSync, setCurrentChild } from '@/lib/children'
import { AgeGroup, getAgeGroupConfig } from '@/lib/age-utils'
import { AgeAdaptiveContainer, AgeGroupBadge } from '@/components/age-adaptive-ui'
import { checkModuleAccess, refreshSubscriptionStatus, clearSubscriptionCache, ModuleAccess, FREE_MODULES, PREMIUM_MODULES } from '@/lib/subscription'
import { progressManager } from '@/lib/progress'
import LearningModuleTiles from '@/components/learning/learning-module-tiles'
import { useTranslation } from '@/lib/i18n'

export default function LearningPage() {
  const router = useRouter()
  const { t, dir } = useTranslation()
  const [user, setUser] = useState<any>(null)
  const [children, setChildren] = useState<any[]>([])
  const [selectedChild, setSelectedChild] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [moduleAccessMap, setModuleAccessMap] = useState<Record<string, ModuleAccess>>({})
  const [refreshingAccess, setRefreshingAccess] = useState(false)
  const [accessRefreshedMessage, setAccessRefreshedMessage] = useState(false)
  const [todayLessons, setTodayLessons] = useState(0)
  const [todayNewWords, setTodayNewWords] = useState(0)
  const [todayMinutes, setTodayMinutes] = useState(0)
  const [showModuleTips, setShowModuleTips] = useState(false)

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

  // Load per-child progress stats for the dashboard tiles
  useEffect(() => {
    if (!selectedChild) {
      setTodayLessons(0)
      setTodayNewWords(0)
      setTodayMinutes(0)
      return
    }

    try {
      const progress = progressManager.getProgressForChild(selectedChild.id)
      if (!progress) {
        setTodayLessons(0)
        setTodayNewWords(0)
        setTodayMinutes(0)
        return
      }

      const ms = progress.moduleStats ?? {
        writing: 0,
        reading: 0,
        speaking: 0,
        games: 0,
        puzzle: 0,
        grammar: 0,
      }

      // Use completedActivities as "lessons" and sum of moduleStats as "new words / activities".
      setTodayLessons(progress.completedActivities || 0)
      setTodayNewWords(
        (ms.reading || 0) +
        (ms.writing || 0) +
        (ms.speaking || 0) +
        (ms.games || 0) +
        (ms.puzzle || 0) +
        (ms.grammar || 0)
      )
      // Time in minutes is not stored yet; keep it zero for now so UI is consistent.
      setTodayMinutes(0)
    } catch (e) {
      console.error('Error loading child progress:', e)
      setTodayLessons(0)
      setTodayNewWords(0)
      setTodayMinutes(0)
    }
  }, [selectedChild])

  // Simple first-time guidance about key modules (Reading & Games)
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const key = 'learning_module_tips_seen_v1'
      const seen = localStorage.getItem(key)
      if (!seen) {
        setShowModuleTips(true)
        localStorage.setItem(key, '1')
      }
    } catch {
      // Ignore storage errors
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

  const handleModuleTileClick = (moduleId: string, _displayName: string, path: string) => {
    if (moduleIsLocked(moduleId)) {
      router.push('/subscribe')
      return
    }
    router.push(path)
  }

  const accentColor = (selectedChild?.accentColor as string) || '#00aeef'

  if (children.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#00aeef]/20 flex items-center justify-center">
              <span className="text-3xl">👶</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('noChildrenAdded')}</h2>
            <p className="text-gray-600 mb-6">{t('addChildFirst')}</p>
            <Button 
              onClick={() => router.push('/add-child')}
              className="bg-[#00aeef] hover:bg-[#003366] text-white"
            >
              {t('addFirstChild')}
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
                <ArrowLeft className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2 rotate-180' : 'mr-2'}`} />
                <span className="hidden xs:inline">{t('backToDashboard')}</span>
              </Button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 hidden sm:block" style={{ color: accentColor }} />
                  <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-slate-800 to-[#8c0066] dark:from-white dark:to-[#8eca40] bg-clip-text text-transparent tracking-tight">{t('learningCenter')}</h1>
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
                <span className="text-xs md:text-sm font-medium text-yellow-800">{t('keepItUp')}</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-1 px-2 md:px-3 py-1 rounded-full shadow-md"
                style={{ backgroundImage: `linear-gradient(to right, ${accentColor}22, ${accentColor}33)` }}
                whileHover={{ scale: 1.05 }}
              >
                <Trophy className="w-4 h-4" style={{ color: accentColor }} />
                <span className="text-xs md:text-sm font-medium" style={{ color: accentColor }}>
                  {t('personalizedForAge')}
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero: kids learning background + all modules headline */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 dark:opacity-25"
          style={{ backgroundImage: "url('/images/kids-learning-background.png')" }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-white dark:from-[#003366]/95 dark:via-[#003366]/90 dark:to-[#003366]/95" aria-hidden />
        <div className="relative z-10 container mx-auto px-4 py-6 md:py-8 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-[#8c0066] dark:from-white dark:to-[#8eca40] bg-clip-text text-transparent tracking-tight mb-1"
          >
            {selectedChild?.name
              ? `${selectedChild.name}'s learning path`
              : 'Choose your learning path'}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm md:text-base text-slate-600 dark:text-slate-300"
          >
            {selectedChild?.ageGroup === AgeGroup.AGE_3_5 && (
              <>Best for Little Learners: <span className="font-semibold">Alphabet Reading, Coloring, Games</span>.</>
            )}
            {selectedChild?.ageGroup === AgeGroup.AGE_6_8 && (
              <>Great for Word Builders: <span className="font-semibold">Reading, Math in English, Writing, Games</span>.</>
            )}
            {selectedChild?.ageGroup === AgeGroup.AGE_9_12 && (
              <>Perfect for Language Masters: <span className="font-semibold">Reading, Grammar, Puzzles, Challenges</span>.</>
            )}
            {!selectedChild?.ageGroup && (
              <>Reading · Math · Writing · Speaking · Games · Grammar · Puzzles · Coloring · Challenges</>
            )}
          </motion.p>
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
            <h2 className="text-base md:text-lg font-semibold text-slate-800 dark:text-white mb-3 tracking-tight">{t('selectChild')}</h2>
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
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-[#8c0066] dark:from-white dark:to-[#8eca40] bg-clip-text text-transparent tracking-tight">{t('chooseLearningPath')}</h2>
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
              {refreshingAccess ? t('refreshing') : t('refreshAccess')}
            </Button>
          </div>
          {showModuleTips && (
            <Card className="mb-4 rounded-3xl border border-[#00aeef]/20 bg-[#e0f4ff]/80 dark:bg-[#003b66]/70 shadow-sm">
              <CardContent className="px-4 py-3 md:py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <Sparkles className="w-5 h-5 text-[#00aeef]" />
                  </div>
                  <div>
                    <p className="text-sm md:text-base font-semibold text-slate-800 dark:text-white">
                      {t('tipForParents')}
                    </p>
                    <p className="text-xs md:text-sm text-slate-700 dark:text-slate-200" dangerouslySetInnerHTML={{ __html: t('tipText') }} />
                  </div>
                </div>
                <div className="flex md:flex-col gap-2 md:gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs md:text-sm rounded-2xl"
                    onClick={() => setShowModuleTips(false)}
                  >
                    {t('hideTip')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
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
          <LearningModuleTiles
            ageGroup={(selectedChild?.ageGroup as AgeGroup) || AgeGroup.AGE_6_8}
            accentColor={accentColor}
            moduleIsLocked={moduleIsLocked}
            renderLockBadge={renderLockBadge}
            onModuleClick={handleModuleTileClick}
          />
        </div>

        {/* Progress Section */}
        <motion.div 
          className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg p-5 md:p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-4 tracking-tight">{t('todaysProgress')}</h3>
          <div className="grid grid-cols-3 gap-3 md:gap-4 text-xs md:text-base">
            <motion.div 
              className="text-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600/50"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-2xl md:text-3xl font-bold text-[#8c0066] dark:text-[#00aeef]">
                {todayLessons}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">{t('totalLessons')}</div>
            </motion.div>
            <motion.div 
              className="text-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600/50"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-2xl md:text-3xl font-bold text-[#00aeef] dark:text-[#8eca40]">
                {todayNewWords}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">{t('activitiesDone')}</div>
            </motion.div>
            <motion.div 
              className="text-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600/50"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-2xl md:text-3xl font-bold text-[#8c0066] dark:text-[#8eca40]">
                {todayMinutes}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">{t('minutesComingSoon')}</div>
            </motion.div>
          </div>
        </motion.div>
      </AgeAdaptiveContainer>
    </div>
  )
}
