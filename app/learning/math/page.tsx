'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserSession } from '@/lib/simple-auth'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Shapes, Ruler, Divide } from 'lucide-react'

const PHASES = [
  {
    id: 'foundation',
    title: 'Foundation',
    ages: 'Ages 3–5',
    subtitle: 'Pre-K & Kindergarten',
    description: 'Number sense 1–20, counting, shapes, colors, more/less/same',
    href: '/learning/math/foundation',
    gradient: 'from-emerald-400 to-teal-600',
    hoverGradient: 'from-emerald-500/15 to-teal-600/15',
    accent: 'emerald',
    icon: Shapes,
  },
  {
    id: 'elementary',
    title: 'Elementary',
    ages: 'Ages 6–8',
    subtitle: 'Grades 1–3',
    description: 'Addition & subtraction, time, measurement, simple word problems',
    href: '/learning/math/elementary',
    gradient: 'from-sky-400 to-blue-600',
    hoverGradient: 'from-sky-500/15 to-blue-600/15',
    accent: 'sky',
    icon: Ruler,
  },
  {
    id: 'intermediate',
    title: 'Intermediate',
    ages: 'Ages 9–12',
    subtitle: 'Grades 4–6',
    description: 'Fractions, decimals, geometry, multi-step word problems',
    href: '/learning/math/intermediate',
    gradient: 'from-violet-400 to-purple-600',
    hoverGradient: 'from-violet-500/15 to-purple-600/15',
    accent: 'violet',
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-orange-50/30 to-sky-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-orange-500 border-t-transparent mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#f8fafc_0%,_#fef3c7_30%,_#e0f2fe_70%,_#f0f9ff_100%)] dark:bg-[linear-gradient(135deg,_#0f172a_0%,_#1e1b4b_50%,_#0f172a_100%)] px-4 py-6 md:py-8 relative overflow-hidden">
      {/* Subtle math pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} aria-hidden />
      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        <Button
          variant="ghost"
          onClick={() => router.push('/learning')}
          className="rounded-xl text-slate-700 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-slate-800/80 shadow-sm border border-slate-200/60 dark:border-slate-700/60"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to learning
        </Button>

        <div className="mb-8 md:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-sm font-medium mb-4">
            <span className="text-lg">🧮</span>
            <span>Learn math vocabulary in English</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-rose-500 dark:from-amber-400 dark:via-orange-400 dark:to-rose-400 bg-clip-text text-transparent">
              Math in English
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-base max-w-xl">
            Start with Foundation, then grow into Elementary and Intermediate. Each phase builds on the last.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {PHASES.map((phase, i) => (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12, type: 'spring', stiffness: 200 }}
              whileHover={{ scale: 1.02, y: -6 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className="card-kid cursor-pointer group relative overflow-hidden hover-lift border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm"
                onClick={() => router.push(phase.href)}
                onKeyDown={(e) => e.key === 'Enter' && router.push(phase.href)}
                role="button"
                tabIndex={0}
              >
                {/* Phase-colored left accent */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${phase.gradient} opacity-90 group-hover:opacity-100 transition-opacity`} aria-hidden />
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${phase.hoverGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  aria-hidden
                />
                <CardContent className="p-5 md:p-6 text-center relative z-10 pl-6">
                  <motion.div
                    className={`w-14 h-14 md:w-16 md:h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${phase.gradient} flex items-center justify-center shadow-lg ring-4 ring-white/50 dark:ring-slate-800/50 relative overflow-hidden`}
                    whileHover={{ rotate: [0, -5, 5, 0], scale: 1.08 }}
                    transition={{ type: 'spring', stiffness: 300, duration: 0.5 }}
                  >
                    <phase.icon className="w-7 h-7 md:w-8 md:h-8 text-white relative z-10" />
                    <span className="sparkle-dot top-1 right-1" style={{ animationDelay: `${i * 0.2}s` }} aria-hidden />
                    <span className="sparkle-dot bottom-1 left-1" style={{ animationDelay: `${i * 0.2 + 0.8}s` }} aria-hidden />
                  </motion.div>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">
                    {phase.ages}
                  </p>
                  <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-0.5">
                    {phase.title}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{phase.subtitle}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-snug">
                    {phase.description}
                  </p>
                  <div
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold ${phase.id === 'foundation' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : phase.id === 'elementary' ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300' : 'bg-violet-500/15 text-violet-700 dark:text-violet-300'} group-hover:scale-105 transition-transform`}
                  >
                    <span>Start</span>
                    <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}>→</motion.span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
