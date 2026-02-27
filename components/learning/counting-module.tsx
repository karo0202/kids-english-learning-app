'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mascot } from '@/components/ui/mascot'
import { ProgressRing } from '@/components/ui/progress-ring'
import { ArrowLeft, Star, Trophy } from 'lucide-react'
import { premiumTTS } from '@/lib/premium-tts'

const COUNT_LEVELS = [
  { id: '1-5', label: '1 to 5', max: 5, color: 'from-emerald-400 to-emerald-600' },
  { id: '1-10', label: '1 to 10', max: 10, color: 'from-sky-400 to-sky-600' },
  { id: '1-20', label: '1 to 20', max: 20, color: 'from-fuchsia-400 to-fuchsia-600' },
]

const objects = ['🍎','🐶','⭐','🚗','🌸','🧸','🎈','🍪','🐱','⚽','🐠','🦋','🌟','📚','🎵','🍓','🦄','🚀','🍰','🧃']

const NUMBER_WORDS: Record<number, string> = {
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
  7: 'seven',
  8: 'eight',
  9: 'nine',
  10: 'ten',
  11: 'eleven',
  12: 'twelve',
  13: 'thirteen',
  14: 'fourteen',
  15: 'fifteen',
  16: 'sixteen',
  17: 'seventeen',
  18: 'eighteen',
  19: 'nineteen',
  20: 'twenty'
}

export default function CountingModule() {
  const router = useRouter()
  const [levelIndex, setLevelIndex] = useState(0)
  const [currentNumber, setCurrentNumber] = useState(1)
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [countFeedback, setCountFeedback] = useState<'correct' | 'try-again' | null>(null)
  const [addFeedback, setAddFeedback] = useState<'correct' | 'try-again' | null>(null)
  const [compareFeedback, setCompareFeedback] = useState<'correct' | 'try-again' | null>(null)
  const [activity, setActivity] = useState<'count' | 'add' | 'compare'>('count')

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
    setAttempts(0)
    setCorrectAnswers(0)
    setCountFeedback(null)
    setAddFeedback(null)
    setCompareFeedback(null)
    setLevelIndex(0)
  }

  const shownObjects = objects.slice(0, currentNumber)
  const accuracy = attempts > 0 ? Math.round((correctAnswers / attempts) * 100) : 0

  const buildOptions = (target: number, max: number): number[] => {
    const opts = new Set<number>([target])
    while (opts.size < 3) {
      const direction = Math.random() < 0.5 ? -1 : 1
      const step = 1 + Math.floor(Math.random() * 3)
      let candidate = target + direction * step
      if (candidate < 1) candidate = 1
      if (candidate > max) candidate = max
      opts.add(candidate)
    }
    return Array.from(opts).sort(() => Math.random() - 0.5)
  }

  const quizOptions = buildOptions(currentNumber, level.max)

  const speakCount = async () => {
    try {
      const sequence = Array.from({ length: currentNumber }, (_, i) => i + 1).join(', ')
      const label = NUMBER_WORDS[currentNumber] ?? currentNumber
      await premiumTTS.speak(`Let's count together to ${label}: ${sequence}`, {
        rate: 0.7,
        pitch: 1.0,
        voice: 'clear',
      })
    } catch {
      // fail silently if TTS is not available
    }
  }

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
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 shadow-sm">
              <span className="text-xs font-medium text-emerald-700">
                Accuracy: {attempts > 0 ? `${accuracy}%` : '—'}
              </span>
            </div>
            <ProgressRing progress={progress} size={52} strokeWidth={6} className="bg-white rounded-full shadow-sm" />
          </div>
        </div>

        <Card className="card-kid border-2 border-orange-200/70 shadow-xl">
          <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4">
            <div className="flex items-center gap-3">
              <Mascot emotion="excited" size="medium" />
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
                    {NUMBER_WORDS[currentNumber] ?? currentNumber}
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
                    variant="outline"
                    onClick={speakCount}
                    className="rounded-2xl"
                  >
                    Listen &amp; count
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

              {/* Objects grid + activity selector */}
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

                {/* Activity selector pills */}
                <div className="mt-4">
                  <div className="inline-flex flex-wrap gap-2 rounded-full bg-white/80 border border-orange-100 px-2 py-1 text-xs">
                    {[
                      { id: 'count', label: 'Counting' },
                      { id: 'add', label: 'Number sentence' },
                      { id: 'compare', label: 'More / less' },
                    ].map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => {
                          setActivity(a.id as 'count' | 'add' | 'compare')
                          setCountFeedback(null)
                          setAddFeedback(null)
                          setCompareFeedback(null)
                        }}
                        className={`px-3 py-1 rounded-full font-semibold transition ${
                          activity === a.id
                            ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-sm'
                            : 'bg-white text-gray-800 hover:bg-orange-50'
                        }`}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Activity 1: count how many */}
                {activity === 'count' && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-semibold text-gray-800">
                      How many objects do you see?
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {quizOptions.map((option) => (
                        <Button
                          key={option}
                          size="sm"
                          variant="outline"
                          className="rounded-2xl"
                          onClick={() => {
                            setAttempts(a => a + 1)
                            if (option === currentNumber) {
                              setCorrectAnswers(c => c + 1)
                              setScore(s => s + 2)
                              setCountFeedback('correct')
                              // Auto-move to the next number so more objects appear
                              setTimeout(() => {
                                setCountFeedback(null)
                                handleNext()
                              }, 700)
                            } else {
                              setCountFeedback('try-again')
                            }
                          }}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                    {countFeedback === 'correct' && (
                      <p className="text-sm text-emerald-700 font-medium">
                        Yes! There are {currentNumber} objects.
                      </p>
                    )}
                    {countFeedback === 'try-again' && (
                      <p className="text-sm text-amber-700 font-medium">
                        Not quite. Try counting each object out loud and choose again.
                      </p>
                    )}
                  </div>
                )}

                {/* Activity 2: number sentence */}
                {activity === 'add' && currentNumber > 1 && (
                  <div className="mt-6 space-y-2 border-t border-orange-100 pt-4">
                    <p className="text-sm font-semibold text-gray-800">
                      Number sentence: what is {currentNumber - 1} + 1?
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {buildOptions(currentNumber, level.max).map(option => (
                        <Button
                          key={`add-${option}`}
                          size="sm"
                          variant="outline"
                          className="rounded-2xl"
                          onClick={() => {
                            if (option === currentNumber) {
                              setScore(s => s + 3)
                              setAddFeedback('correct')
                            } else {
                              setAddFeedback('try-again')
                            }
                          }}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                    {addFeedback === 'correct' && (
                      <p className="text-sm text-emerald-700 font-medium">
                        Great! {currentNumber - 1} plus 1 makes {currentNumber}.
                      </p>
                    )}
                    {addFeedback === 'try-again' && (
                      <p className="text-sm text-amber-700 font-medium">
                        Think about counting on one more: {currentNumber - 1}, then {currentNumber}.
                      </p>
                    )}
                  </div>
                )}

                {/* Activity 3: compare groups */}
                {activity === 'compare' && (
                  <div className="mt-6 space-y-3 border-t border-orange-100 pt-4">
                    <p className="text-sm font-semibold text-gray-800">
                      Which group has more?
                    </p>
                    {(() => {
                    const leftCount = currentNumber
                    const rightCount =
                      currentNumber === level.max ? Math.max(1, currentNumber - 1) : currentNumber + 1
                    const leftArray = Array.from({ length: leftCount })
                    const rightArray = Array.from({ length: rightCount })
                    const correctSide = leftCount > rightCount ? 'left' : 'right'
                    return (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-2xl bg-orange-50/70 p-3 border border-orange-100">
                            <p className="text-xs font-medium text-gray-700 mb-1">Left</p>
                            <div className="grid grid-cols-4 gap-1">
                              {leftArray.map((_, i) => (
                                <span key={i} className="text-lg sm:text-xl">
                                  {objects[i % objects.length]}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="rounded-2xl bg-sky-50/70 p-3 border border-sky-100">
                            <p className="text-xs font-medium text-gray-700 mb-1">Right</p>
                            <div className="grid grid-cols-4 gap-1">
                              {rightArray.map((_, i) => (
                                <span key={i} className="text-lg sm:text-xl">
                                  {objects[(i + 5) % objects.length]}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-2xl flex-1"
                            onClick={() => {
                              if (correctSide === 'left') {
                                setCompareFeedback('correct')
                                setScore(s => s + 2)
                              } else {
                                setCompareFeedback('try-again')
                              }
                            }}
                          >
                            Left has more
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-2xl flex-1"
                            onClick={() => {
                              if (correctSide === 'right') {
                                setCompareFeedback('correct')
                                setScore(s => s + 2)
                              } else {
                                setCompareFeedback('try-again')
                              }
                            }}
                          >
                            Right has more
                          </Button>
                        </div>
                        {compareFeedback === 'correct' && (
                          <p className="text-sm text-emerald-700 font-medium">
                            Well done! You found the bigger group.
                          </p>
                        )}
                        {compareFeedback === 'try-again' && (
                          <p className="text-sm text-amber-700 font-medium">
                            Try pointing and counting each side, then choose again.
                          </p>
                        )}
                      </>
                    )
                  })()}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-white/70 p-4 sm:p-5 border border-orange-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Mascot emotion="happy" size="small" />
                <p className="text-sm text-gray-700">
                  Tip: Ask your child to point and say each number out loud: &quot;one, two, three…&quot;
                </p>
              </div>
              <div className="text-xs sm:text-sm text-orange-700 font-medium bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                Goal: Reach {level.max} together 🎯
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

