'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserSession } from '@/lib/simple-auth'
import { getChildrenSync, getCurrentChild, setCurrentChild } from '@/lib/children'
import { AgeAdaptiveContainer, AgeGroupBadge } from '@/components/age-adaptive-ui'
import { AgeGroup, getAgeGroupConfig } from '@/lib/age-utils'
import { progressManager } from '@/lib/progress'
import type { UserProgress } from '@/lib/progress'
import {
  BADGE_DEFINITIONS,
  badgeProgressLabel,
  isBadgeUnlocked,
  type BadgeIconKey,
} from '@/lib/reward-badges'
import { motion, useReducedMotion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  ArrowLeft,
  Star,
  Trophy,
  Gift,
  Crown,
  Sparkles,
  Medal,
  Gamepad2,
  Flame,
  Map,
  Lock,
  BookOpen,
  Mic,
  PenTool,
  Puzzle,
  Calculator,
} from 'lucide-react'

const ICONS: Record<BadgeIconKey, typeof Sparkles> = {
  sparkles: Sparkles,
  flame: Flame,
  medal: Medal,
  map: Map,
}

const STREAK_DAYS = 7

const cardHover =
  'transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-xl focus-within:-translate-y-0.5 focus-within:shadow-xl'

export default function RewardsPage() {
  const router = useRouter()
  const prefersReducedMotion = useReducedMotion()
  const [user, setUser] = useState<any>(null)
  const [children, setChildren] = useState<any[]>([])
  const [selectedChild, setSelectedChild] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState<UserProgress | null>(null)

  const refreshProgress = useCallback(() => {
    if (!selectedChild?.id) return
    setProgress(progressManager.getProgressForChild(selectedChild.id))
  }, [selectedChild?.id])

  useEffect(() => {
    const currentUser = getUserSession()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)

    const storedChildren = getChildrenSync(currentUser.id, currentUser.email)
    setChildren(storedChildren)

    if (storedChildren.length === 0) {
      setLoading(false)
      return
    }

    const existing = getCurrentChild()
    if (existing) {
      const match = storedChildren.find((c) => c.id === existing.id) ?? storedChildren[0]
      setSelectedChild(match)
      setCurrentChild(match)
    } else {
      setSelectedChild(storedChildren[0])
      setCurrentChild(storedChildren[0])
    }
    setLoading(false)
  }, [router])

  useEffect(() => {
    refreshProgress()
  }, [refreshProgress])

  useEffect(() => {
    const onUpdate = (e: Event) => {
      const id = (e as CustomEvent<{ childId?: string }>).detail?.childId
      if (id && id === selectedChild?.id) refreshProgress()
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible') refreshProgress()
    }
    window.addEventListener('child-progress-updated', onUpdate)
    window.addEventListener('storage', refreshProgress)
    window.addEventListener('focus', refreshProgress)
    document.addEventListener('visibilitychange', onVisible)
    const t = window.setInterval(refreshProgress, 4000)
    return () => {
      window.removeEventListener('child-progress-updated', onUpdate)
      window.removeEventListener('storage', refreshProgress)
      window.removeEventListener('focus', refreshProgress)
      document.removeEventListener('visibilitychange', onVisible)
      window.clearInterval(t)
    }
  }, [selectedChild?.id, refreshProgress])

  const totalScore = progress?.totalScore ?? 0
  const level = progress?.level ?? 1
  const coins = progress?.coins ?? 0
  const streak = progress?.currentStreak ?? 0
  const earnedCount = progress?.achievements?.length ?? 0
  const xp = progress?.xp ?? 0
  const xpNeeded = level * 100
  const xpPercent = xpNeeded > 0 ? Math.min(100, Math.round((xp / xpNeeded) * 100)) : 0
  const completedActivities = progress?.completedActivities ?? 0
  const ms = progress?.moduleStats ?? {
    writing: 0,
    reading: 0,
    speaking: 0,
    games: 0,
    puzzle: 0,
    grammar: 0,
  }

  const accentColor = (selectedChild?.accentColor as string) || '#00aeef'

  const xpTransition = prefersReducedMotion ? { duration: 0 } : { type: 'spring' as const, stiffness: 90, damping: 22 }

  const moduleTiles = useMemo(
    () => [
      { label: 'Reading', count: ms.reading, Icon: BookOpen, href: '/learning' },
      { label: 'Writing', count: ms.writing, Icon: PenTool, href: '/learning' },
      { label: 'Speaking', count: ms.speaking, Icon: Mic, href: '/learning' },
      { label: 'Games', count: ms.games, Icon: Gamepad2, href: '/learning' },
      { label: 'Puzzle', count: ms.puzzle, Icon: Puzzle, href: '/learning' },
      { label: 'Grammar', count: ms.grammar, Icon: Calculator, href: '/learning' },
    ],
    [ms.reading, ms.writing, ms.speaking, ms.games, ms.puzzle, ms.grammar]
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-[#00aeef]" />
      </div>
    )
  }

  if (!user || children.length === 0 || !selectedChild) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#00aeef]/10 flex items-center justify-center">
              <Gift className="w-8 h-8 text-[#00aeef]" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Add a child to see rewards</h2>
            <p className="text-gray-600">
              Once you add a child and start learning, their stars and badges will appear here.
            </p>
            <Button className="bg-[#00aeef] text-white" onClick={() => router.push('/dashboard')}>
              Go to dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07] dark:opacity-[0.12]"
        aria-hidden
      >
        <div className="absolute left-[8%] top-24 text-8xl font-black text-[#00aeef] select-none">A</div>
        <div className="absolute right-[12%] top-40 text-7xl font-black text-[#8c0066] select-none">B</div>
        <div className="absolute left-[20%] bottom-32 text-6xl font-black text-amber-500 select-none">Z</div>
      </div>

      {/* Header */}
      <div className="bg-white/85 dark:bg-[#003366]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-[#003366] sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                className="text-slate-600 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 border border-transparent hover:border-slate-200 dark:hover:border-white/10 shrink-0"
              >
                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                <span className="hidden xs:inline">Back to Dashboard</span>
              </Button>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <motion.span
                    animate={prefersReducedMotion ? {} : { rotate: [0, 12, -8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, repeatDelay: 5 }}
                  >
                    <Sparkles className="w-5 h-5" style={{ color: accentColor }} />
                  </motion.span>
                  <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-slate-800 to-[#8c0066] dark:from-white dark:to-[#8eca40] bg-clip-text text-transparent tracking-tight">
                    Rewards & Stars
                  </h1>
                  {selectedChild?.ageGroup && <AgeGroupBadge ageGroup={selectedChild.ageGroup as AgeGroup} />}
                </div>
                <p className="text-sm md:text-base text-slate-600 dark:text-slate-300">
                  {selectedChild.name}&apos;s achievements and progress
                  {selectedChild?.ageGroup && (
                    <span className="ml-1">
                      ({getAgeGroupConfig(selectedChild.ageGroup as AgeGroup).name})
                    </span>
                  )}
                </p>
              </div>
            </div>
            <motion.div
              className="flex items-center gap-1 self-start sm:self-center bg-gradient-to-r from-yellow-100 to-amber-50 dark:from-amber-900/40 dark:to-yellow-900/30 px-3 py-1.5 rounded-full shadow-md border border-amber-200/60 dark:border-amber-700/50"
              whileHover={prefersReducedMotion ? {} : { scale: 1.04 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
            >
              <Star className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-xs md:text-sm font-semibold text-amber-900 dark:text-amber-100">
                Streak: {streak} day{streak === 1 ? '' : 's'}
              </span>
            </motion.div>
          </div>
        </div>
      </div>

      <AgeAdaptiveContainer
        ageGroup={(selectedChild?.ageGroup as AgeGroup) || AgeGroup.AGE_6_8}
        className="container mx-auto px-4 py-8 relative z-10"
      >
        {children.length > 1 && (
          <div className="mb-6">
            <h2 className="text-sm md:text-base font-semibold text-slate-800 dark:text-white mb-2">
              Choose child
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {children.map((child) => (
                <Button
                  key={child.id}
                  size="sm"
                  variant={selectedChild.id === child.id ? 'default' : 'outline'}
                  className={`rounded-xl whitespace-nowrap ${
                    selectedChild.id === child.id
                      ? 'bg-gradient-to-r from-[#8c0066] to-[#00aeef] text-white'
                      : 'hover:bg-[#00aeef]/10 dark:hover:bg-[#00aeef]/20'
                  }`}
                  onClick={() => {
                    setSelectedChild(child)
                    setCurrentChild(child)
                  }}
                >
                  {child.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0, ...xpTransition }}
          >
            <Card
              className={`rounded-3xl shadow-lg border-none bg-gradient-to-br from-[#00aeef] to-[#8c0066] text-white ${cardHover}`}
            >
              <CardContent className="p-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide opacity-80">Level</p>
                  <p className="text-3xl font-extrabold mt-1">Lv {level}</p>
                  <p className="text-xs mt-1 opacity-90">Keep learning to reach the next level!</p>
                  <p className="text-[11px] mt-2 opacity-80">Total score: {totalScore}</p>
                </div>
                <motion.div
                  animate={prefersReducedMotion ? {} : { y: [0, -4, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Trophy className="w-10 h-10 opacity-90" />
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, ...xpTransition }}
          >
            <Card
              className={`rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700 bg-white/90 dark:bg-slate-900/80 ${cardHover}`}
            >
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">
                  XP to next level
                </p>
                <div className="flex items-center justify-between mt-2 mb-1">
                  <span className="text-sm font-semibold text-slate-800 dark:text-white">{xpPercent}%</span>
                  <span className="text-xs text-slate-500 dark:text-slate-300">
                    {xp} / {xpNeeded} XP
                  </span>
                </div>
                <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden ring-1 ring-slate-100 dark:ring-slate-700">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#00aeef] via-[#8c0066] to-[#f59e0b]"
                    initial={false}
                    animate={{ width: `${xpPercent}%` }}
                    transition={xpTransition}
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                  {completedActivities} lesson{completedActivities === 1 ? '' : 's'} completed so far
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, ...xpTransition }}
            key={coins}
          >
            <Card
              className={`rounded-3xl shadow-lg border border-amber-100 dark:border-amber-700 bg-amber-50/90 dark:bg-amber-900/30 ${cardHover}`}
            >
              <CardContent className="p-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-amber-700 dark:text-amber-200">Coins</p>
                  <motion.p
                    className="text-3xl font-extrabold text-amber-700 dark:text-amber-200 mt-1 tabular-nums"
                    initial={prefersReducedMotion ? false : { scale: 1.15 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                  >
                    {coins}
                  </motion.p>
                  <p className="text-xs text-amber-700/90 dark:text-amber-100 mt-1">
                    Earn coins by finishing lessons and games. +50 when you level up!
                  </p>
                </div>
                <Gift className="w-10 h-10 text-amber-500 dark:text-amber-300" />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
            Activity by module
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {moduleTiles.map(({ label, count, Icon, href }) => (
              <button
                key={label}
                type="button"
                onClick={() => router.push(href)}
                className={`flex flex-col items-center gap-1 rounded-2xl border border-slate-200/80 dark:border-slate-600 bg-white/80 dark:bg-slate-900/60 px-2 py-3 text-center ${cardHover} active:scale-[0.98]`}
              >
                <Icon className="w-5 h-5 text-[#00aeef]" />
                <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300 leading-tight">{label}</span>
                <span className="text-lg font-bold text-slate-800 dark:text-white tabular-nums">{count}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Card
              className={`rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700 bg-white/90 dark:bg-slate-900/80 ${cardHover}`}
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                    <Flame className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">
                      Streak: {streak} day{streak === 1 ? '' : 's'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-300">
                      Practice a little every day to grow your streak!
                    </p>
                  </div>
                </div>
                <div className="flex gap-1.5" role="list" aria-label="Last seven streak days">
                  {Array.from({ length: STREAK_DAYS }).map((_, i) => {
                    const lit = i < Math.min(streak, STREAK_DAYS)
                    return (
                      <motion.div
                        key={i}
                        role="listitem"
                        className="h-3 flex-1 rounded-full overflow-hidden bg-slate-200/80 dark:bg-slate-700"
                        initial={false}
                        animate={lit ? { scale: [1, 1.06, 1] } : {}}
                        transition={{ delay: i * 0.04, duration: 0.35 }}
                      >
                        <div
                          className="h-full w-full rounded-full"
                          style={{
                            background: lit
                              ? 'linear-gradient(to right, #22c55e, #16a34a)'
                              : 'transparent',
                          }}
                        />
                      </motion.div>
                    )
                  })}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Longest streak: {progress?.longestStreak ?? 0} days
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card
              className={`rounded-3xl shadow-lg border border-indigo-100 dark:border-indigo-700 bg-indigo-50/90 dark:bg-indigo-900/30 ${cardHover}`}
            >
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                    <Crown className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-100">
                      Badges earned: {earnedCount} / {BADGE_DEFINITIONS.length}
                    </p>
                    <p className="text-xs text-indigo-700/90 dark:text-indigo-100">
                      Tap a locked badge to see how to unlock it—then go learn!
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {BADGE_DEFINITIONS.map((def) => {
                    const unlocked = isBadgeUnlocked(progress, def.id)
                    const Icon = ICONS[def.iconKey]
                    return (
                      <motion.div
                        key={def.id}
                        layout
                        className={`rounded-2xl border px-3 py-2.5 flex gap-2 items-start ${
                          unlocked
                            ? 'bg-white dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-600 shadow-sm'
                            : 'bg-white/50 dark:bg-indigo-950/30 border-indigo-100/80 dark:border-indigo-800 opacity-90'
                        }`}
                        whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                      >
                        <div
                          className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                            unlocked ? 'bg-indigo-100 dark:bg-indigo-800' : 'bg-slate-200/80 dark:bg-slate-700'
                          }`}
                        >
                          {unlocked ? (
                            <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-200" />
                          ) : (
                            <Lock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="text-xs font-bold text-indigo-900 dark:text-indigo-50 leading-tight">
                            {def.title}
                          </p>
                          <p className="text-[10px] text-indigo-700/85 dark:text-indigo-200/90 mt-0.5 leading-snug">
                            {unlocked ? 'Nice work!' : def.hint}
                          </p>
                          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
                            {badgeProgressLabel(progress, def.id)}
                          </p>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          className="text-center"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
            Want to collect more stars and coins?
          </p>
          <Button
            className="bg-gradient-to-r from-[#00aeef] to-[#8c0066] text-white rounded-2xl px-6 py-3 text-sm font-semibold shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => router.push('/learning')}
          >
            Go back to Learning
          </Button>
        </motion.div>
      </AgeAdaptiveContainer>
    </div>
  )
}
