'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserSession } from '@/lib/simple-auth'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Shapes, Ruler, Divide, ChevronRight, Sparkles } from 'lucide-react'

const PHASES = [
  {
    id: 'foundation',
    title: 'Foundation',
    ages: 'Ages 3–5',
    subtitle: 'Pre-K & Kindergarten',
    emoji: '🌟',
    description: 'Number sense 1–20, counting, shapes, colors, more/less/same',
    topics: ['Numbers 1–20', 'Counting', 'Shapes', 'Colors', 'More & Less'],
    href: '/learning/math/foundation',
    gradient: 'from-emerald-400 to-teal-500',
    lightBg: 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20',
    border: 'border-emerald-200 dark:border-emerald-800/50',
    accent: 'text-emerald-600 dark:text-emerald-400',
    btnBg: 'bg-emerald-500 hover:bg-emerald-600',
    icon: Shapes,
  },
  {
    id: 'elementary',
    title: 'Elementary',
    ages: 'Ages 6–8',
    subtitle: 'Grades 1–3',
    emoji: '🚀',
    description: 'Addition & subtraction, time, measurement, simple word problems',
    topics: ['Plus & Minus', 'Making 10', 'Telling Time', 'Measuring', 'Word Problems'],
    href: '/learning/math/elementary',
    gradient: 'from-sky-400 to-blue-500',
    lightBg: 'from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20',
    border: 'border-sky-200 dark:border-sky-800/50',
    accent: 'text-sky-600 dark:text-sky-400',
    btnBg: 'bg-sky-500 hover:bg-sky-600',
    icon: Ruler,
  },
  {
    id: 'intermediate',
    title: 'Intermediate',
    ages: 'Ages 9–12',
    subtitle: 'Grades 4–6',
    emoji: '🧠',
    description: 'Fractions, decimals, geometry, multi-step word problems',
    topics: ['Fractions', 'Decimals', 'Geometry', 'Perimeter', 'Multi-step Problems'],
    href: '/learning/math/intermediate',
    gradient: 'from-violet-400 to-purple-500',
    lightBg: 'from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20',
    border: 'border-violet-200 dark:border-violet-800/50',
    accent: 'text-violet-600 dark:text-violet-400',
    btnBg: 'bg-violet-500 hover:bg-violet-600',
    icon: Divide,
  },
]

export default function MathHubPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getUserSession()
    if (!user) {
      router.push('/login')
      return
    }
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-200 border-t-amber-500" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">Loading Math...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-orange-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-amber-950/10 px-4 py-6 sm:py-10">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <Button
            variant="ghost"
            onClick={() => router.push('/learning')}
            className="rounded-full w-10 h-10 p-0 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-bold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              MATH IN ENGLISH
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
              Learn <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">Math</span> in English
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-md mx-auto">
              Start with Foundation, grow into Elementary, then master Intermediate. Each level builds on the last!
            </p>
          </div>
        </motion.div>

        {/* Phase Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PHASES.map((phase, i) => (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="group"
            >
              <div
                className={`cursor-pointer rounded-3xl overflow-hidden bg-gradient-to-br ${phase.lightBg} border ${phase.border} shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col`}
                onClick={() => router.push(phase.href)}
                onKeyDown={(e) => e.key === 'Enter' && router.push(phase.href)}
                role="button"
                tabIndex={0}
              >
                {/* Top gradient bar */}
                <div className={`h-2 bg-gradient-to-r ${phase.gradient}`} />

                <div className="p-5 sm:p-6 flex-1 flex flex-col">
                  {/* Icon + Age badge */}
                  <div className="flex items-center justify-between mb-4">
                    <motion.div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${phase.gradient} flex items-center justify-center shadow-lg`}
                      whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <phase.icon className="w-7 h-7 text-white" />
                    </motion.div>
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${phase.accent}`}>
                      {phase.ages}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="text-2xl">{phase.emoji}</span> {phase.title}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{phase.subtitle}</p>

                  {/* Description */}
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                    {phase.description}
                  </p>

                  {/* Topics pills */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {phase.topics.map((topic) => (
                      <span
                        key={topic}
                        className="px-2 py-0.5 rounded-lg bg-white/70 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="mt-auto pt-5">
                    <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-white ${phase.btnBg} shadow-md group-hover:shadow-lg transition-all`}>
                      Start Learning
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Progress hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 text-center"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex -space-x-1.5">
              {['bg-emerald-400', 'bg-sky-400', 'bg-violet-400'].map((c, i) => (
                <div key={i} className={`w-5 h-5 rounded-full ${c} border-2 border-white dark:border-slate-800`} />
              ))}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Foundation → Elementary → Intermediate
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
