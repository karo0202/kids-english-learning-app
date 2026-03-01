'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserSession } from '@/lib/simple-auth'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mascot } from '@/components/ui/mascot'
import { ArrowLeft, Calculator, Shapes, Ruler, Fraction } from 'lucide-react'

const PHASES = [
  {
    id: 'foundation',
    title: 'Foundation',
    ages: 'Ages 3–5',
    subtitle: 'Pre-K & Kindergarten',
    description: 'Number sense 1–20, counting, shapes, colors, more/less/same',
    href: '/learning/math/foundation',
    color: 'from-emerald-500 to-teal-600',
    icon: Shapes,
  },
  {
    id: 'elementary',
    title: 'Elementary',
    ages: 'Ages 6–8',
    subtitle: 'Grades 1–3',
    description: 'Addition & subtraction, time, measurement, simple word problems',
    href: '/learning/math/elementary',
    color: 'from-sky-500 to-blue-600',
    icon: Ruler,
  },
  {
    id: 'intermediate',
    title: 'Intermediate',
    ages: 'Ages 9–12',
    subtitle: 'Grades 4–6',
    description: 'Fractions, decimals, geometry, multi-step word problems',
    href: '/learning/math/intermediate',
    color: 'from-violet-500 to-purple-600',
    icon: Fraction,
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-sky-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto" />
          <p className="mt-4 text-gray-600">Loading Math...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-sky-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/learning')}
          className="rounded-2xl bg-white/70 hover:bg-white shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to learning
        </Button>

        <Card className="card-kid border-2 border-orange-200/70 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-400 to-amber-500 px-6 py-4 flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Math in English</h1>
              <p className="text-white/90 text-sm">Choose your phase: Foundation, Elementary, or Intermediate</p>
            </div>
            <Mascot emotion="excited" size="medium" className="ml-auto" />
          </div>
          <CardContent className="p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {PHASES.map((phase, i) => (
                <motion.div
                  key={phase.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card
                    className="cursor-pointer overflow-hidden border-2 border-transparent hover:border-orange-300 transition-all hover:shadow-lg"
                    onClick={() => router.push(phase.href)}
                  >
                    <div className={`h-2 bg-gradient-to-r ${phase.color}`} />
                    <CardContent className="p-4">
                      <div className={`inline-flex p-2 rounded-xl bg-gradient-to-r ${phase.color} mb-3`}>
                        <phase.icon className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{phase.ages}</p>
                      <h2 className="text-lg font-bold text-gray-900">{phase.title}</h2>
                      <p className="text-xs text-gray-500 mb-2">{phase.subtitle}</p>
                      <p className="text-sm text-gray-600">{phase.description}</p>
                      <p className="text-sm text-orange-600 font-medium mt-2">Start →</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
