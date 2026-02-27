'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mascot } from '@/components/ui/mascot'
import { ProgressRing } from '@/components/ui/progress-ring'
import { ArrowLeft, Star, Trophy } from 'lucide-react'

const COUNT_LEVELS = [
  { id: '1-5', label: '1 to 5', max: 5, color: 'from-emerald-400 to-emerald-600' },
  { id: '1-10', label: '1 to 10', max: 10, color: 'from-sky-400 to-sky-600' },
  { id: '1-20', label: '1 to 20', max: 20, color: 'from-fuchsia-400 to-fuchsia-600' },
]

const objects = ['🍎','🐶','⭐','🚗','🌸','🧸','🎈','🍪','🐱','⚽','🐠','🦋','🌟','📚','🎵','🍓','🦄','🚀','🍰','🧃']

export default function CountingModule() {
  const router = useRouter()
  const [levelIndex, setLevelIndex] = useState(0)
  const [currentNumber, setCurrentNumber] = useState(1)
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState(0)

  const level = COUNT_LEVELS[levelIndex]
  const progress = (completed / COUNT_LEVELS.length) * 100

  const handleNext = () => {
    if (currentNumber < level.max) {
      setCurrentNumber(n => n + 1)
      setScore(s => s + 1)
    } else {
      // Level finished
      setCompleted(c => Math.min(COUNT_LEVELS.length, c + 1))
      if (levelIndex < COUNT_LEVELS.length - 1) {
        setLevelIndex(i => i + 1)
        setCurrentNumber(1)
      }
    }
  }

  const handlePrev = () => {
    if (currentNumber > 1) {
      setCurrentNumber(n => n - 1)
    }
  }

  const handleReset = () => {
    setCurrentNumber(1)
    setScore(0)
    setCompleted(0)
    setLevelIndex(0)
  }

  const shownObjects = objects.slice(0, currentNumber)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-sky-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={() => router.push('/learning')}
            className="rounded-2xl bg-white/70 hover:bg-white shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to learning
          </Button>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-50 border border-yellow-200 shadow-sm">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-yellow-700">Score: {score}</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 shadow-sm">
              <Trophy className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-700">
                Levels: {completed}/{COUNT_LEVELS.length}
              </span>
            </div>
            <ProgressRing progress={progress} size={52} strokeWidth={6} className="bg-white rounded-full shadow-sm" />
          </div>
        </div>

        <Card className="card-kid border-2 border-orange-200/70 shadow-xl">
          <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4">
            <div className="flex items-center gap-3">
              <Mascot mood="excited" size="md" />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Counting Fun</h2>
                <p className="text-sm text-gray-600">
                  Tap the buttons and count the objects together out loud!
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              {COUNT_LEVELS.map((lvl, idx) => (
                <button
                  key={lvl.id}
                  onClick={() => {
                    setLevelIndex(idx)
                    setCurrentNumber(1)
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                    idx === levelIndex
                      ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                      : 'bg-white text-gray-700 border-orange-200 hover:bg-orange-50'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-6">
            <div className="grid md:grid-cols-[2fr,3fr] gap-6 items-center">
              {/* Number display */}
              <div className="space-y-4">
                <div className="text-sm uppercase tracking-wide text-gray-500 font-semibold">
                  We are counting
                </div>
                <motion.div
                  key={currentNumber}
                  initial={{ scale: 0.7, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  className={`rounded-3xl px-6 py-6 sm:px-8 sm:py-8 text-center text-white shadow-lg bg-gradient-to-br ${level.color}`}
                >
                  <div className="text-sm sm:text-base opacity-90 mb-1">Number</div>
                  <div className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight drop-shadow">
                    {currentNumber}
                  </div>
                  <div className="mt-2 text-lg sm:text-xl font-semibold">
                    {currentNumber === 1 ? 'one' : `${currentNumber}`}
                  </div>
                  <div className="mt-3 text-xs sm:text-sm opacity-90">
                    Let&apos;s clap and count: {Array.from({ length: currentNumber }).map((_, i) => '👏').join(' ')}
                  </div>
                </motion.div>

                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  <Button
                    variant="outline"
                    onClick={handlePrev}
                    disabled={currentNumber === 1}
                    className="rounded-2xl"
                  >
                    Smaller
                  </Button>
                  <Button
                    className="btn-primary-kid rounded-2xl"
                    onClick={handleNext}
                  >
                    Bigger
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleReset}
                    className="rounded-2xl"
                  >
                    Reset
                  </Button>
                </div>
              </div>

              {/* Objects grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">
                    Count the objects: tap and say the number together.
                  </p>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 bg-white/70 rounded-3xl p-4 sm:p-5 shadow-inner">
                  {shownObjects.map((obj, index) => (
                    <motion.button
                      key={index}
                      whileTap={{ scale: 0.9 }}
                      className="aspect-square rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center text-2xl sm:text-3xl shadow-sm border border-orange-100"
                    >
                      <span className="sr-only">Item {index + 1}</span>
                      {obj}
                    </motion.button>
                  ))}
                  {shownObjects.length === 0 && (
                    <div className="col-span-4 sm:col-span-5 text-center text-gray-400 text-sm">
                      Tap &quot;Bigger&quot; to start counting.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white/70 p-4 sm:p-5 border border-orange-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Mascot mood="helpful" size="sm" />
                <p className="text-sm text-gray-700">
                  Tip: Ask your child to point and say each number out loud: &quot;one, two, three…&quot;
                </p>
              </div>
              <div className="text-xs sm:text-sm text-orange-700 font-medium bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                Goal: Reach {COUNT_LEVELS[COUNT_LEVELS.length - 1].max} together 🎯
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

