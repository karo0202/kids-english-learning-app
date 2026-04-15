'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getUserSession, clearUserSession } from '@/lib/simple-auth'
import { getChildrenSync, addChild, deleteChild, Child, subscribeToChildren, forceMigrateChildrenByEmail } from '@/lib/children'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Mic, PenTool, Gamepad2, BookOpen, Settings, LogOut, User, Plus, Trash2, Crown, Sparkles, GraduationCap, Palette, Puzzle, BarChart3, Shield, RefreshCw, Calculator, Target, Gift
} from 'lucide-react'
import { getUserSubscription } from '@/lib/crypto-payment'
import { progressManager } from '@/lib/progress'
import { useTranslation } from '@/lib/i18n'

export default function DashboardPage() {
  const router = useRouter()
  const { t, dir } = useTranslation()
  const [user, setUser] = useState<any>(null)
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddingChild, setIsAddingChild] = useState(false)
  const [newChildName, setNewChildName] = useState('')
  const [newChildAge, setNewChildAge] = useState<number | ''>('')
  const [subscription, setSubscription] = useState<any>(null)
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [rewardStats, setRewardStats] = useState<{
    childName: string
    streak: number
    level: number
    xpPercent: number
    coins: number
    badges: number
  } | null>(null)

  // Debug: Log whenever children state changes
  useEffect(() => {
    console.log('Children state updated:', {
      count: children.length,
      children: children.map(c => ({ id: c.id, name: c.name, parentId: c.parentId })),
      user: user ? { id: user.id, email: user.email } : null
    })
  }, [children, user])

  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false)
      return
    }

    // Load immediately - no delays, no timeouts
    let mounted = true
    let unsubscribe: (() => void) | undefined

    // Load synchronously from localStorage for instant display
    const currentUser = getUserSession()
    if (!currentUser) {
      // No user - redirect to login
      router.push('/login')
      setLoading(false)
      return
    }

    // Set user immediately
    setUser(currentUser)

    // Load children synchronously from localStorage (and recover by email if needed after re-login)
    const userChildren = getChildrenSync(currentUser.id, currentUser.email)
    console.log(`Loaded ${userChildren.length} children instantly for parentId: ${currentUser.id}, email: ${currentUser.email}`)
    
    if (!mounted) return
    setChildren(userChildren)
    setLoading(false)

    // Subscribe to real-time updates (Firestore sync happens in background)
    unsubscribe = subscribeToChildren(currentUser.id, updatedChildren => {
      if (!mounted) return
      console.log(`Children updated via subscription: ${updatedChildren.length} children`)
      setChildren(updatedChildren)
    }, currentUser.email)
    
    // Run migration immediately when 0 children (so re-login restores from Firestore/email quickly)
    if (userChildren.length === 0 && currentUser.email) {
      void (async () => {
        const { forceMigrateChildrenByEmail } = await import('@/lib/children')
        try {
          const migrated = await forceMigrateChildrenByEmail(currentUser.id, currentUser.email)
          if (mounted && migrated.length > 0) {
            console.log(`✅ Migration found ${migrated.length} children after re-login`)
            setChildren(migrated)
          }
        } catch (error) {
          console.error('❌ Migration error:', error)
        }
      })()
    }
    
    // Force migration after a short delay to consolidate (Firestore may take a moment)
    setTimeout(async () => {
      if (mounted && currentUser.email) {
        const { forceMigrateChildrenByEmail } = await import('@/lib/children')
        try {
          const migrated = await forceMigrateChildrenByEmail(currentUser.id, currentUser.email)
          if (mounted && migrated.length > 0) {
            setChildren(migrated)
          }
        } catch (error) {
          console.error('❌ Migration error:', error)
        }
      }
    }, 2000)
    
    // Second migration pass in case Firestore takes longer
    setTimeout(async () => {
      if (mounted && currentUser.email) {
        const { forceMigrateChildrenByEmail } = await import('@/lib/children')
        try {
          const migrated = await forceMigrateChildrenByEmail(currentUser.id, currentUser.email)
          if (mounted && migrated.length > 0) {
            setChildren(migrated)
          }
        } catch (error) {
          console.error('❌ Second migration error:', error)
        }
      }
    }, 5000)

    // Load subscription data
    const userSubscription = getUserSubscription(currentUser.id)
    setSubscription(userSubscription)

    return () => {
      mounted = false
      unsubscribe?.()
    }
  }, [router])

  // Load basic reward stats (streak, level, XP, coins, badges) for the first child
  useEffect(() => {
    if (!children || children.length === 0) {
      setRewardStats(null)
      return
    }

    const primaryChild = children[0]
    try {
      const progress = progressManager.getProgressForChild(primaryChild.id)
      if (!progress) {
        setRewardStats(null)
        return
      }

      const level = progress.level || 1
      const xp = progress.xp || 0
      const xpNeeded = level * 100
      const xpPercent = xpNeeded > 0 ? Math.min(100, Math.round((xp / xpNeeded) * 100)) : 0

      setRewardStats({
        childName: primaryChild.name,
        streak: progress.currentStreak || 0,
        level,
        xpPercent,
        coins: progress.coins || 0,
        badges: progress.achievements?.length ?? 0,
      })
    } catch (error) {
      console.error('Error loading reward stats:', error)
      setRewardStats(null)
    }
  }, [children])

  // Simple first-time onboarding: explain flow and highlight "Start Learning" path
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!user) return
    try {
      const flagKey = 'dashboard_onboarding_seen_v1'
      const seen = localStorage.getItem(flagKey)
      if (!seen) {
        localStorage.setItem(flagKey, '1')
        setShowOnboarding(true)
      }
    } catch {
      // Ignore storage errors
    }
  }, [user])

  const handleLogout = async () => {
    // Use the centralized logout function that preserves children data
    await clearUserSession()
    router.push('/')
  }

const handleAddChild = async () => {
  if (user && newChildName && newChildAge) {
    await addChild(user.id, newChildName, newChildAge as number, user.email)
    setNewChildName('')
    setNewChildAge('')
    setIsAddingChild(false)
  }
}

const handleDeleteChild = async (childId: string) => {
  if (!user) {
    console.error('Cannot delete: No user logged in')
    return
  }
  
  console.log('Delete button clicked for child:', childId)
  
  // Use a more mobile-friendly confirmation
  const confirmed = window.confirm('Are you sure you want to delete this child profile? This action cannot be undone.')
  console.log('Delete confirmed:', confirmed)
  
  if (confirmed) {
    try {
      console.log('Deleting child:', childId, 'for parent:', user.id)
      
      // Optimistically update UI - remove child immediately
      setChildren(prev => {
        const filtered = prev.filter(child => child.id !== childId)
        console.log(`UI updated: ${filtered.length} children (was ${prev.length})`)
        return filtered
      })
      
      // Then delete from backend
      const result = await deleteChild(user.id, childId)
      console.log('Delete result:', result)
      
      // Force multiple refreshes to ensure UI updates
      const refreshChildren = () => {
        const updated = getChildrenSync(user.id, user.email)
        console.log('Refreshed children count:', updated.length)
        setChildren(updated)
        return updated.length
      }
      
      // Immediate refresh
      const count1 = refreshChildren()
      
      // Refresh after short delay
      setTimeout(() => {
        const count2 = refreshChildren()
        if (count2 !== count1) {
          console.log('Children count changed, updating again')
        }
      }, 200)
      
      // Final refresh after longer delay
      setTimeout(() => {
        refreshChildren()
      }, 500)
      
    } catch (error) {
      console.error('Failed to delete child:', error)
      // Revert optimistic update on error
      const refreshed = getChildrenSync(user.id, user.email)
      setChildren(refreshed)
      alert('Failed to delete child. Please try again.')
    }
  }
}

  const handleSyncChildren = async () => {
    if (!user?.email) {
      setSyncMessage('Please log in first')
      return
    }
    setSyncing(true)
    setSyncMessage(`Syncing for ${user.email}...`)
    try {
      const migrated = await forceMigrateChildrenByEmail(user.id, user.email)
      setChildren(migrated)
      if (migrated.length === 0) {
        setSyncMessage(`No children found for ${user.email}. Add a child first!`)
      } else {
        setSyncMessage(`Synced ${migrated.length} child${migrated.length !== 1 ? 'ren' : ''} for ${user.email}`)
      }
      setTimeout(() => setSyncMessage(null), 5000)
    } catch (error) {
      console.error('Sync error:', error)
      setSyncMessage('Sync failed. Please try again.')
      setTimeout(() => setSyncMessage(null), 4000)
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-purple-200 dark:border-purple-800 mx-auto mb-4"></div>
            <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-purple-500 dark:border-purple-400 absolute top-0 left-1/2 -translate-x-1/2"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">{t('loadingDashboard')}</p>
        </div>
      </div>
    )
  }

  // If no user after loading, show login prompt
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('pleaseLogin')}</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to access the dashboard.</p>
          <Button 
            onClick={() => router.push('/login')}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background is app-wide in layout (kids-learning-background) */}

      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/10 sticky top-0 z-50 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 relative z-10">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Left side - Logo and Title */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <motion.div 
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 flex-shrink-0"
                whileHover={{ scale: 1.08 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <span className="text-lg sm:text-xl">🎓</span>
              </motion.div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-xl md:text-2xl font-bold text-slate-800 dark:text-white tracking-tight truncate">
                  Kids English
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">
                  {t('welcomeDashboard')}, {user?.name || 'Parent'}!
                </p>
              </div>
              {subscription?.isPremium && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="hidden sm:flex items-center gap-1 px-2 sm:px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-white text-xs sm:text-sm font-semibold shadow-lg flex-shrink-0"
                >
                  <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Premium</span>
                </motion.div>
              )}
            </div>
            
            {/* Right side - Buttons and Icons */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* Desktop buttons - hidden on mobile */}
              {user?.email === 'karolatef143@gmail.com' && (
                <Button 
                  onClick={() => router.push('/admin/payments')}
                  className="hidden md:flex bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 font-semibold px-3 sm:px-4 text-sm"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin payments
                </Button>
              )}
              <Button 
                onClick={() => router.push('/parent-dashboard')}
                className="hidden md:flex bg-slate-800 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-medium px-4 text-sm rounded-xl shadow-sm"
              >
                <BarChart3 className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                {t('progress')}
              </Button>
              <Button 
                onClick={() => router.push('/rewards')}
                variant="outline"
                className="hidden md:flex font-medium px-4 text-sm rounded-xl border-slate-200 dark:border-slate-700"
              >
                <Gift className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                {t('rewards')}
              </Button>
              {!subscription?.isPremium && (
                <Button 
                  onClick={() => router.push('/payment')}
                  className="hidden md:flex bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-medium px-4 text-sm rounded-xl shadow-sm"
                >
                  <Sparkles className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                  {t('upgrade')}
                </Button>
              )}
              
              {/* Mobile icon buttons - show icons only on mobile */}
              {user?.email === 'karolatef143@gmail.com' && (
                <Button 
                  onClick={() => router.push('/admin/payments')}
                  variant="ghost"
                  size="icon"
                  className="md:hidden hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-xl"
                  title="Admin payments"
                >
                  <Shield className="w-5 h-5" />
                </Button>
              )}
              <Button 
                onClick={() => router.push('/parent-dashboard')}
                variant="ghost"
                size="icon"
                className="md:hidden hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl"
                title="Parent Dashboard"
              >
                <BarChart3 className="w-5 h-5" />
              </Button>
              <Button 
                onClick={() => router.push('/rewards')}
                variant="ghost"
                size="icon"
                className="md:hidden hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-xl"
                title="Rewards"
              >
                <Gift className="w-5 h-5" />
              </Button>
              {!subscription?.isPremium && (
                <Button 
                  onClick={() => router.push('/payment')}
                  variant="ghost"
                  size="icon"
                  className="md:hidden hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-xl"
                  title="Upgrade"
                >
                  <Sparkles className="w-5 h-5" />
                </Button>
              )}
              
              {/* Settings and Logout - always visible */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => router.push('/settings')}
                className="hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-xl"
                title={t('settings')}
              >
                <Settings className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                className="hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl"
                title={t('logout')}
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {/* Mobile Premium Badge - shown below on mobile */}
          {subscription?.isPremium && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="sm:hidden flex items-center justify-center gap-1 mt-2 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-white text-xs font-semibold shadow-lg w-fit mx-auto"
            >
              <Crown className="w-3 h-3" />
              <span>Premium</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* First-time onboarding overlay */}
      {showOnboarding && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center px-4">
          <Card className="max-w-lg w-full rounded-3xl shadow-2xl">
            <CardHeader>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Welcome to Kids English
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Three quick steps to get started:
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="space-y-2 text-sm text-gray-700">
                <li>
                  <span className="font-semibold">1.</span> Add your child (name + age) on this dashboard.
                </li>
                <li>
                  <span className="font-semibold">2.</span> Tap <span className="font-semibold">“Start Learning”</span> to open the Learning Center.
                </li>
                <li>
                  <span className="font-semibold">3.</span> Let your child pick a module: Reading, Math in English, Writing, Games, and more.
                </li>
              </ol>
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowOnboarding(false)}
                  className="sm:min-w-[120px]"
                >
                  Maybe later
                </Button>
                <Button
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white sm:min-w-[160px]"
                  onClick={() => {
                    setShowOnboarding(false)
                    router.push('/learning')
                  }}
                >
                  Start Learning
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Premium Upgrade Banner */}
        {!subscription?.isPremium && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border border-violet-200/80 dark:border-violet-800/60 bg-gradient-to-r from-violet-50 via-indigo-50 to-violet-50 dark:from-violet-950/60 dark:via-indigo-950/50 dark:to-violet-950/60 shadow-lg shadow-violet-100/50 dark:shadow-black/20 rounded-2xl">
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-500/25">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">Unlock all modules</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        Reading library, puzzles, speaking, coloring, and more.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => router.push('/payment')}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold px-6 rounded-xl shadow-md shadow-violet-500/20"
                    size="lg"
                  >
                    Upgrade
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Mobile Quick Access to Parent Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:hidden"
        >
          <Card className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 text-white border-0 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">View Progress</h3>
                    <p className="text-white/90 text-sm">Track your child's learning</p>
                  </div>
                </div>
                <Button
                  onClick={() => router.push('/parent-dashboard')}
                  className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-4 py-2"
                  size="sm"
                >
                  Open
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick “Start Learning” call-to-action */}
        {children.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border border-purple-100/70 dark:border-purple-900/40 shadow-md bg-white/80 dark:bg-purple-950/40">
              <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-3 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-semibold text-gray-800 dark:text-white">
                      Ready to learn?
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                      Open the Learning Center and let your child choose today&apos;s activity.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => router.push('/learning')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 text-sm font-semibold rounded-2xl shadow"
                >
                  Start Learning
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Motivation & rewards for the first child */}
        {rewardStats && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-white/90 dark:bg-slate-900/70 border border-purple-100/70 dark:border-purple-900/40 shadow-md rounded-3xl">
              <CardContent className="py-4 px-4 sm:px-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-purple-500 dark:text-purple-300 font-semibold mb-1">
                    Learning streak & rewards
                  </p>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white">
                    {rewardStats.childName}&apos;s progress
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs sm:text-sm text-gray-700 dark:text-gray-200">
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      <span>
                        Streak:{' '}
                        <span className="font-semibold">
                          {rewardStats.streak} day{rewardStats.streak === 1 ? '' : 's'}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GraduationCap className="w-4 h-4 text-blue-500" />
                      <span>
                        Level{' '}
                        <span className="font-semibold">
                          {rewardStats.level}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4 text-emerald-500" />
                      <span>
                        Badges:{' '}
                        <span className="font-semibold">
                          {rewardStats.badges}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calculator className="w-4 h-4 text-orange-500" />
                      <span>
                        Coins:{' '}
                        <span className="font-semibold">
                          {rewardStats.coins}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-56">
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-1 flex items-center justify-between">
                    <span>XP to next level</span>
                    <span className="font-semibold">
                      {rewardStats.xpPercent}%
                    </span>
                  </p>
                  <div className="h-3 rounded-full bg-purple-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400"
                      style={{ width: `${rewardStats.xpPercent}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Children Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Your Children</h2>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSyncChildren}
                disabled={syncing}
                variant="outline"
                size="sm"
                className="text-sm"
                title="Sync children across all your devices"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync devices'}
              </Button>
              <Button 
                onClick={() => setIsAddingChild(true)}
                className="btn-primary-kid"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Child
              </Button>
            </div>
          </div>
          {syncMessage && (
            <p className={`text-sm mb-4 ${syncMessage.includes('failed') ? 'text-red-600' : 'text-green-600'}`}>
              {syncMessage}
            </p>
          )}

          {isAddingChild && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="card-kid mb-6 p-6 relative z-10">
                <CardContent className="relative z-10">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Add New Child</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Child's Name"
                      value={newChildName}
                      onChange={(e) => setNewChildName(e.target.value)}
                      className="text-lg w-full"
                      autoFocus
                      style={{ pointerEvents: 'auto', zIndex: 10 }}
                    />
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="Child's Age (3-12)"
                      value={newChildAge === '' ? '' : newChildAge}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value === '') {
                          setNewChildAge('')
                        } else {
                          const num = parseInt(value)
                          if (!isNaN(num) && num >= 3 && num <= 12) {
                            setNewChildAge(num)
                          }
                        }
                      }}
                      className="text-lg w-full"
                      min="3"
                      max="12"
                      style={{ pointerEvents: 'auto', zIndex: 10 }}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button 
                    onClick={handleAddChild}
                    disabled={!newChildName || !newChildAge}
                    className="btn-primary-kid"
                  >
                    Add Child
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setIsAddingChild(false)
                      setNewChildName('')
                      setNewChildAge('')
                    }}
                    className="border-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          )}

          {children.length === 0 && !isAddingChild ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="card-kid text-center py-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-violet-500/5"></div>
                <CardContent className="relative z-10">
                  <motion.div 
                    className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-violet-500 flex items-center justify-center shadow-2xl relative"
                    animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <User className="w-12 h-12 text-white" />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400/50 to-pink-400/50 animate-pulse"></div>
                  </motion.div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-pink-400 mb-3">No children added yet</h3>
                  <p className="text-gray-600 dark:text-white/70 mb-8 text-lg">Add your first child to start their amazing learning journey! 🚀</p>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      onClick={() => setIsAddingChild(true)}
                      className="btn-primary-kid text-lg px-8 py-6 shadow-xl"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add Your First Child
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ) : children.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {children.map((child, index) => (
                <motion.div
                  key={child.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="card-kid relative overflow-hidden group border border-slate-200/80 dark:border-slate-700/50 hover:border-violet-300/60 dark:hover:border-violet-600/40 transition-all duration-300 rounded-2xl">
                    <CardContent className="p-6 relative z-10">
                      <div className="text-center">
                        <motion.div 
                          className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20"
                          whileHover={{ scale: 1.08 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <span className="text-2xl">{child.name?.[0]?.toUpperCase() || '👶'}</span>
                        </motion.div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-0.5">{child.name}</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-2 text-sm font-medium">{child.age} years old</p>
                        {(() => {
                          const prog = progressManager.getProgressForChild(child.id)
                          const ms = prog?.moduleStats ?? { writing: 0, reading: 0, speaking: 0, games: 0, puzzle: 0, grammar: 0 }
                          const total = ms.writing + ms.reading + ms.speaking + ms.games + ms.puzzle + ms.grammar
                          return (
                            <div className="mb-4 p-3 rounded-xl bg-gray-100/80 dark:bg-slate-800/80 border border-gray-200/80 dark:border-slate-600/80 text-left">
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Progress</span>
                                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">Level {prog?.level ?? 1}</span>
                              </div>
                              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600 dark:text-gray-300">
                                <span title="Writing"><PenTool className="w-3.5 h-3.5 inline mr-0.5" />{ms.writing}</span>
                                <span title="Reading"><BookOpen className="w-3.5 h-3.5 inline mr-0.5" />{ms.reading}</span>
                                <span title="Speaking"><Mic className="w-3.5 h-3.5 inline mr-0.5" />{ms.speaking}</span>
                                <span title="Games"><Gamepad2 className="w-3.5 h-3.5 inline mr-0.5" />{ms.games}</span>
                                <span title="Puzzles"><Puzzle className="w-3.5 h-3.5 inline mr-0.5" />{ms.puzzle}</span>
                              </div>
                              <div className="mt-1.5 flex items-center justify-between gap-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400">{total} activities · {prog?.totalScore ?? 0} pts</span>
                                <Button variant="ghost" size="sm" className="text-xs h-7 px-2 text-purple-600 dark:text-purple-400" onClick={(e) => { e.stopPropagation(); router.push(`/parent-dashboard?child=${child.id}`); }}>
                                  View progress →
                                </Button>
                              </div>
                            </div>
                          )
                        })()}
                        <div className="flex gap-2">
                          <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button 
                              className="w-full btn-primary-kid shadow-lg hover:shadow-xl"
                              onClick={() => router.push('/learning')}
                            >
                              <GraduationCap className="w-4 h-4 mr-2" />
                              Start Learning
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button 
                              variant="outline"
                              size="icon"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 border-red-200 dark:border-red-500/30 rounded-xl min-w-[44px] min-h-[44px] touch-manipulation relative z-10 shadow-sm hover:shadow-md transition-all"
                              style={{ touchAction: 'manipulation' }}
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                console.log('Delete onClick triggered for:', child.id)
                                handleDeleteChild(child.id)
                              }}
                              onTouchStart={(e) => {
                                e.stopPropagation()
                              }}
                              onTouchEnd={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                console.log('Delete onTouchEnd triggered for:', child.id)
                                handleDeleteChild(child.id)
                              }}
                              onMouseDown={(e) => {
                                e.stopPropagation()
                              }}
                              title="Delete child profile"
                              aria-label="Delete child profile"
                            >
                              <Trash2 className="w-5 h-5 pointer-events-none" />
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Learning Modules */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight mb-6">Learning Modules</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {[
              { label: 'Reading', desc: 'Stories & vocabulary', icon: BookOpen, route: '/learning/reading', from: 'from-blue-500', to: 'to-indigo-600' },
              { label: 'Writing', desc: 'Tracing & spelling', icon: PenTool, route: '/learning/writing', from: 'from-emerald-500', to: 'to-teal-600' },
              { label: 'Speaking', desc: 'Pronunciation', icon: Mic, route: '/learning/speaking', from: 'from-violet-500', to: 'to-fuchsia-600' },
              { label: 'Games', desc: 'Interactive games', icon: Gamepad2, route: '/learning/games', from: 'from-rose-500', to: 'to-pink-600' },
            ].map((mod, i) => (
              <motion.div
                key={mod.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.97 }}
              >
                <Card
                  className="card-kid cursor-pointer group border border-slate-200/80 dark:border-slate-700/50 hover:border-violet-300/60 dark:hover:border-violet-600/40 rounded-2xl"
                  onClick={() => router.push(mod.route)}
                >
                  <CardContent className="p-5 text-center relative z-10">
                    <div className={`w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br ${mod.from} ${mod.to} flex items-center justify-center shadow-md`}>
                      <mod.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-white mb-0.5">{mod.label}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{mod.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card className="card-kid cursor-pointer group relative overflow-hidden" onClick={() => router.push('/learning/grammar')}>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-violet-600/0 group-hover:from-indigo-500/10 group-hover:to-violet-600/10 transition-all duration-500"></div>
                <CardContent className="p-6 text-center relative">
                  <motion.div 
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center justify-center shadow-lg"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <GraduationCap className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Grammar</h3>
                  <p className="text-gray-600 dark:text-white/70 text-sm">Learn grammar from A to Z</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card className="card-kid cursor-pointer group relative overflow-hidden" onClick={() => router.push('/learning/alphabet-coloring')}>
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-rose-600/0 group-hover:from-pink-500/10 group-hover:to-rose-600/10 transition-all duration-500"></div>
                <CardContent className="p-6 text-center relative">
                  <motion.div 
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center shadow-lg"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Palette className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Alphabet Coloring</h3>
                  <p className="text-gray-600 dark:text-white/70 text-sm">Color letters and words</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card className="card-kid cursor-pointer group relative overflow-hidden" onClick={() => router.push('/learning/puzzle')}>
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-amber-600/0 group-hover:from-orange-500/10 group-hover:to-amber-600/10 transition-all duration-500"></div>
                <CardContent className="p-6 text-center relative">
                  <motion.div 
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center shadow-lg"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Puzzle className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Puzzle Games</h3>
                  <p className="text-gray-600 dark:text-white/70 text-sm">Solve word and sentence puzzles</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card className="card-kid cursor-pointer group relative overflow-hidden" onClick={() => router.push('/learning/math')}>
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-orange-600/0 group-hover:from-amber-500/10 group-hover:to-orange-600/10 transition-all duration-500"></div>
                <CardContent className="p-6 text-center relative">
                  <motion.div 
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Calculator className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Math in English</h3>
                  <p className="text-gray-600 dark:text-white/70 text-sm">Numbers, shapes, and problem solving</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card className="card-kid cursor-pointer group relative overflow-hidden" onClick={() => router.push('/learning')}>
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/0 to-indigo-600/0 group-hover:from-sky-500/10 group-hover:to-indigo-600/10 transition-all duration-500"></div>
                <CardContent className="p-6 text-center relative">
                  <motion.div 
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center shadow-lg"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Target className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Daily Challenges</h3>
                  <p className="text-gray-600 dark:text-white/70 text-sm">Complete fun daily learning goals</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Card className="card-kid text-center py-6 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-600/0 group-hover:from-blue-500/10 group-hover:to-cyan-600/10 transition-all duration-500"></div>
                <CardContent className="relative">
                  <motion.div 
                    className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                  >
                    <span className="text-2xl">📚</span>
                  </motion.div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">12</h3>
                  <p className="text-gray-600 dark:text-white/70 font-medium">Lessons Completed</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Card className="card-kid text-center py-6 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-emerald-600/0 group-hover:from-green-500/10 group-hover:to-emerald-600/10 transition-all duration-500"></div>
                <CardContent className="relative">
                  <motion.div 
                    className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  >
                    <span className="text-2xl">🏆</span>
                  </motion.div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">5</h3>
                  <p className="text-gray-600 dark:text-white/70 font-medium">Achievements</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Card className="card-kid text-center py-6 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-600/0 group-hover:from-purple-500/10 group-hover:to-pink-600/10 transition-all duration-500"></div>
                <CardContent className="relative">
                  <motion.div 
                    className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  >
                    <span className="text-2xl">🔥</span>
                  </motion.div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">7</h3>
                  <p className="text-gray-600 dark:text-white/70 font-medium">Day Streak</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}