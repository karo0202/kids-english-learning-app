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

const accentColors: Record<string, { text: string; dark: string }> = {
  emerald: { text: 'text-emerald-600', dark: 'dark:text-emerald-300' },
  sky: { text: 'text-sky-600', dark: 'dark:text-sky-300' },
  violet: { text: 'text-violet-600', dark: 'dark:text-violet-300' },
}

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-sky-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 px-4 py-6 md:py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/learning')}
          className="rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to learning
        </Button>

        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent">
            Math in English
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Choose your phase: Foundation, Elementary, or Intermediate
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {PHASES.map((phase, i) => (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className="card-kid cursor-pointer group relative overflow-hidden hover-lift border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-300"
                onClick={() => router.push(phase.href)}
                onKeyDown={(e) => e.key === 'Enter' && router.push(phase.href)}
                role="button"
                tabIndex={0}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${phase.hoverGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  aria-hidden
                />
                <CardContent className="p-4 md:p-6 text-center relative z-10">
                  <motion.div
                    className={`w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4 rounded-2xl bg-gradient-to-br ${phase.gradient} flex items-center justify-center shadow-lg relative overflow-hidden`}
                    whileHover={{ rotate: [0, -4, 4, 0], scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 300, duration: 0.5 }}
                  >
                    <phase.icon className="w-8 h-8 md:w-10 md:h-10 text-white relative z-10" />
                    <span className="sparkle-dot top-2 right-2" style={{ animationDelay: `${i * 0.2}s` }} aria-hidden />
                    <span className="sparkle-dot bottom-2 left-2" style={{ animationDelay: `${i * 0.2 + 0.8}s` }} aria-hidden />
                  </motion.div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">
                    {phase.ages}
                  </p>
                  <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {phase.title}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{phase.subtitle}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    {phase.description}
                  </p>
                  <div
                    className={`text-sm font-medium ${accentColors[phase.accent].text} ${accentColors[phase.accent].dark} group-hover:translate-x-1 transition-transform flex items-center justify-center gap-1`}
                  >
                    <span>Start</span>
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
                    >
                      →
                    </motion.span>
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
