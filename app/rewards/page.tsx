'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserSession } from '@/lib/simple-auth'
import { getChildrenSync, getCurrentChild, setCurrentChild } from '@/lib/children'
import { AgeAdaptiveContainer, AgeGroupBadge } from '@/components/age-adaptive-ui'
import { AgeGroup, getAgeGroupConfig } from '@/lib/age-utils'
import { progressManager } from '@/lib/progress'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Star, Trophy, Gift, Crown, Sparkles, Medal, Gamepad2 } from 'lucide-react'

export default function RewardsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [children, setChildren] = useState<any[]>([])
  const [selectedChild, setSelectedChild] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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

  const progress = progressManager.getProgressForChild(selectedChild.id)
  const totalScore = progress?.totalScore ?? 0
  const level = progress?.level ?? 1
  const coins = progress?.coins ?? 0
  const streak = progress?.currentStreak ?? 0
  const badges = progress?.achievements?.length ?? 0
  const xp = progress?.xp ?? 0
  const xpNeeded = level * 100
  const xpPercent = xpNeeded > 0 ? Math.min(100, Math.round((xp / xpNeeded) * 100)) : 0

  const accentColor = (selectedChild?.accentColor as string) || '#00aeef'

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <div className="bg-white/85 dark:bg-[#003366]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-[#003366] sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
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
                  <Sparkles className="w-5 h-5" style={{ color: accentColor }} />
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
            <div className="hidden sm:flex items-center gap-2">
              <motion.div
                className="flex items-center gap-1 bg-gradient-to-r from-yellow-100 to-yellow-50 px-2 md:px-3 py-1 rounded-full shadow-md"
                whileHover={{ scale: 1.05 }}
              >
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-xs md:text-sm font-medium text-yellow-800">
                  Streak: {streak} day{streak === 1 ? '' : 's'}
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <AgeAdaptiveContainer
        ageGroup={(selectedChild?.ageGroup as AgeGroup) || AgeGroup.AGE_6_8}
        className="container mx-auto px-4 py-8 relative z-10"
      >
        {/* Child selector if multiple */}
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

        {/* Level, XP, coins */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="rounded-3xl shadow-lg border-none bg-gradient-to-br from-[#00aeef] to-[#8c0066] text-white">
            <CardContent className="p-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide opacity-80">Level</p>
                <p className="text-3xl font-extrabold mt-1">Lv {level}</p>
                <p className="text-xs mt-1 opacity-90">Keep learning to reach the next level!</p>
              </div>
              <Trophy className="w-10 h-10 opacity-90" />
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700 bg-white/90 dark:bg-slate-900/80">
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">
                XP to next level
              </p>
              <div className="flex items-center justify-between mt-2 mb-1">
                <span className="text-sm font-semibold text-slate-800 dark:text-white">
                  {xpPercent}%
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-300">
                  {xp} / {xpNeeded} XP
                </span>
              </div>
              <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#00aeef] via-[#8c0066] to-[#f59e0b]"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-lg border border-amber-100 dark:border-amber-700 bg-amber-50/90 dark:bg-amber-900/30">
            <CardContent className="p-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-amber-700 dark:text-amber-200">
                  Coins
                </p>
                <p className="text-3xl font-extrabold text-amber-700 dark:text-amber-200 mt-1">
                  {coins}
                </p>
                <p className="text-xs text-amber-700/90 dark:text-amber-100 mt-1">
                  Earn coins by finishing lessons and games.
                </p>
              </div>
              <Gift className="w-10 h-10 text-amber-500 dark:text-amber-300" />
            </CardContent>
          </Card>
        </div>

        {/* Badges and streak */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700 bg-white/90 dark:bg-slate-900/80">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                  <Star className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">
                    Streak: {streak} day{streak === 1 ? '' : 's'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-300">
                    Try to practice a little bit every day to keep the flame alive!
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(streak, 7) }).map((_, i) => (
                  <div
                    key={i}
                    className="h-2 flex-1 rounded-full"
                    style={{
                      background:
                        i < streak
                          ? 'linear-gradient(to right, #22c55e, #16a34a)'
                          : 'rgba(148,163,184,0.4)',
                    }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-lg border border-indigo-100 dark:border-indigo-700 bg-indigo-50/90 dark:bg-indigo-900/30">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-100">
                    Badges earned: {badges}
                  </p>
                  <p className="text-xs text-indigo-700/90 dark:text-indigo-100">
                    Complete more lessons and challenges to unlock new badges.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                {badges === 0 && (
                  <span className="text-xs px-3 py-1 rounded-full bg-white/80 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-100">
                    No badges yet — start with Reading or Writing today!
                  </span>
                )}
                {badges > 0 && (
                  <>
                    <span className="text-xs px-3 py-1 rounded-full bg-white/80 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-100 flex items-center gap-1">
                      <Medal className="w-3 h-3" />
                      Super Starter
                    </span>
                    {badges > 2 && (
                      <span className="text-xs px-3 py-1 rounded-full bg-white/80 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-100 flex items-center gap-1">
                        <Gamepad2 className="w-3 h-3" />
                        Game Champion
                      </span>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to action */}
        <div className="text-center">
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
            Want to collect more stars and coins?
          </p>
          <Button
            className="bg-gradient-to-r from-[#00aeef] to-[#8c0066] text-white rounded-2xl px-6 py-3 text-sm font-semibold shadow-lg"
            onClick={() => router.push('/learning')}
          >
            Go back to Learning
          </Button>
        </div>
      </AgeAdaptiveContainer>
    </div>
  )
}

