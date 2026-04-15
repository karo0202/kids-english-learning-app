'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Volume2, ChevronLeft, ChevronRight, Lightbulb, SkipForward, RotateCcw, Sparkles } from 'lucide-react'
import { premiumTTS } from '@/lib/premium-tts'

const NUMBER_WORDS: Record<number, string> = {
  1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten',
  11: 'eleven', 12: 'twelve', 13: 'thirteen', 14: 'fourteen', 15: 'fifteen', 16: 'sixteen', 17: 'seventeen', 18: 'eighteen', 19: 'nineteen', 20: 'twenty',
}

const OBJECTS = ['🍎', '🐶', '⭐', '🚗', '🌸', '🧸', '🎈', '🍪', '🐱', '⚽', '🐠', '🦋', '🌟', '📚', '🎵', '🍓', '🦄', '🚀', '🍰', '🧃']

const SHAPES = [
  { id: 'circle', name: 'Circle', word: 'Circle', emoji: '⭕', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', accent: 'text-red-600 dark:text-red-400' },
  { id: 'square', name: 'Square', word: 'Square', emoji: '🟦', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', accent: 'text-blue-600 dark:text-blue-400' },
  { id: 'triangle', name: 'Triangle', word: 'Triangle', emoji: '🔺', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', accent: 'text-green-600 dark:text-green-400' },
  { id: 'rectangle', name: 'Rectangle', word: 'Rectangle', emoji: '▭', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', accent: 'text-amber-600 dark:text-amber-400' },
  { id: 'star', name: 'Star', word: 'Star', emoji: '⭐', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', accent: 'text-yellow-600 dark:text-yellow-400' },
]

const COLORS = [
  { name: 'Red', word: 'Red', hex: 'bg-red-500', light: 'bg-red-50 dark:bg-red-900/20', ring: 'ring-red-400' },
  { name: 'Blue', word: 'Blue', hex: 'bg-blue-500', light: 'bg-blue-50 dark:bg-blue-900/20', ring: 'ring-blue-400' },
  { name: 'Green', word: 'Green', hex: 'bg-green-500', light: 'bg-green-50 dark:bg-green-900/20', ring: 'ring-green-400' },
  { name: 'Yellow', word: 'Yellow', hex: 'bg-yellow-400', light: 'bg-yellow-50 dark:bg-yellow-900/20', ring: 'ring-yellow-400' },
  { name: 'Orange', word: 'Orange', hex: 'bg-orange-500', light: 'bg-orange-50 dark:bg-orange-900/20', ring: 'ring-orange-400' },
  { name: 'Purple', word: 'Purple', hex: 'bg-purple-500', light: 'bg-purple-50 dark:bg-purple-900/20', ring: 'ring-purple-400' },
  { name: 'Pink', word: 'Pink', hex: 'bg-pink-400', light: 'bg-pink-50 dark:bg-pink-900/20', ring: 'ring-pink-400' },
]

type Tab = 'numbers' | 'counting' | 'moreless' | 'same' | 'order' | 'shapes' | 'colors' | 'matchshape' | 'stories'

const FOUNDATION_STORIES = [
  { q: 'You have 3 🍎 apples. Mom gives you 2 more 🍎. How many apples now?', ans: 5, hint: '3 + 2 = ?' },
  { q: 'There are 4 🐶 puppies. 1 runs away. How many puppies are left?', ans: 3, hint: '4 - 1 = ?' },
  { q: 'You see 2 🐱 cats and 3 🐱 more cats come. How many cats in all?', ans: 5, hint: '2 + 3 = ?' },
  { q: 'You have 5 🎈 balloons. 2 fly away! How many do you have now?', ans: 3, hint: '5 - 2 = ?' },
  { q: 'There are 6 ⭐ stars. You draw 1 more ⭐. How many stars altogether?', ans: 7, hint: '6 + 1 = ?' },
  { q: '4 🦋 butterflies are in the garden. 4 more join! How many now?', ans: 8, hint: '4 + 4 = ?' },
  { q: 'You have 7 🍪 cookies. You eat 3. How many are left?', ans: 4, hint: '7 - 3 = ?' },
  { q: 'There are 3 🚗 red cars and 3 🚙 blue cars. How many cars in total?', ans: 6, hint: '3 + 3 = ?' },
  { q: 'You pick 2 🌸 flowers, then 5 more 🌸. How many flowers do you have?', ans: 7, hint: '2 + 5 = ?' },
  { q: '8 🐟 fish swim in a pond. 2 swim away. How many fish are left?', ans: 6, hint: '8 - 2 = ?' },
]

const TAB_CONFIG: { id: Tab; label: string; emoji: string }[] = [
  { id: 'numbers', label: 'Numbers', emoji: '🔢' },
  { id: 'counting', label: 'Count', emoji: '🧮' },
  { id: 'moreless', label: 'More / Less', emoji: '⚖️' },
  { id: 'same', label: 'Same?', emoji: '🤔' },
  { id: 'order', label: "What's next?", emoji: '➡️' },
  { id: 'shapes', label: 'Shapes', emoji: '🔷' },
  { id: 'colors', label: 'Colors', emoji: '🎨' },
  { id: 'matchshape', label: 'Match', emoji: '🧩' },
  { id: 'stories', label: 'Stories', emoji: '📖' },
]

function FeedbackBanner({ type, children }: { type: 'correct' | 'try-again'; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-semibold ${
        type === 'correct'
          ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
          : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
      }`}
    >
      <span className="text-lg">{type === 'correct' ? '🎉' : '🤔'}</span>
      {children}
    </motion.div>
  )
}

function GroupCard({ label, count, offset = 0 }: { label: string; count: number; offset?: number }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-800 p-4 sm:p-5 border-2 border-slate-100 dark:border-slate-700 shadow-sm">
      <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: count }).map((_, i) => (
          <motion.span
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.04 }}
            className="text-2xl sm:text-3xl"
          >
            {OBJECTS[(i + offset) % OBJECTS.length]}
          </motion.span>
        ))}
      </div>
    </div>
  )
}

export default function MathFoundationModule() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('numbers')
  const [currentNumber, setCurrentNumber] = useState(1)
  const [countFeedback, setCountFeedback] = useState<'correct' | 'try-again' | null>(null)
  const [compareFeedback, setCompareFeedback] = useState<'correct' | 'try-again' | null>(null)
  const [shapeIndex, setShapeIndex] = useState(0)
  const [colorIndex, setColorIndex] = useState(0)
  const [sameFeedback, setSameFeedback] = useState<'correct' | 'try-again' | null>(null)
  const [sameRound, setSameRound] = useState(0)
  const [orderFeedback, setOrderFeedback] = useState<'correct' | 'try-again' | null>(null)
  const [matchShapeFeedback, setMatchShapeFeedback] = useState<'correct' | 'try-again' | null>(null)
  const [matchShapeIndex, setMatchShapeIndex] = useState(0)
  const [storyIndex, setStoryIndex] = useState(0)
  const [storyAnswer, setStoryAnswer] = useState('')
  const [storyFeedback, setStoryFeedback] = useState<'correct' | 'try-again' | null>(null)
  const [showStoryHint, setShowStoryHint] = useState(false)

  const level = { max: 20, color: 'from-emerald-400 to-emerald-600' }
  const shownObjects = OBJECTS.slice(0, currentNumber)

  const buildOptions = (target: number, max: number): number[] => {
    const opts = new Set<number>([target])
    while (opts.size < 3) {
      const d = Math.random() < 0.5 ? -1 : 1
      const step = 1 + Math.floor(Math.random() * 2)
      let c = target + d * step
      if (c < 1) c = 1
      if (c > max) c = max
      opts.add(c)
    }
    return Array.from(opts).sort(() => Math.random() - 0.5)
  }

  const speakCount = async () => {
    try {
      const seq = Array.from({ length: currentNumber }, (_, i) => i + 1).join(', ')
      const label = NUMBER_WORDS[currentNumber] ?? currentNumber
      await premiumTTS.speak(`Count with me: ${seq}. That is ${label}.`, { rate: 0.75, voice: 'clear' })
    } catch {}
  }

  const leftCount = currentNumber
  const rightCount = currentNumber === level.max ? Math.max(1, currentNumber - 1) : currentNumber + 1
  const correctSide = leftCount > rightCount ? 'left' : 'right'

  const sameLeft = 4 + (sameRound % 5)
  const sameIsSame = sameRound % 2 === 0
  const sameRightCount = sameIsSame ? sameLeft : sameLeft + 1

  const orderStart = 2 + (sameRound % 4)
  const orderStep = 1
  const orderNext = orderStart + orderStep * 3
  const orderSeqDisplay = [orderStart, orderStart + orderStep, orderStart + orderStep * 2]
  const orderOptions = Array.from(new Set([orderNext, orderNext + 1, orderNext - 1].filter((n) => n >= 1 && n <= 20)))
  if (orderOptions.length < 2) orderOptions.push(orderNext + 2)

  const clearFeedback = () => {
    setCountFeedback(null)
    setCompareFeedback(null)
    setSameFeedback(null)
    setOrderFeedback(null)
    setMatchShapeFeedback(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50/40 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-950/20">
      <div className="max-w-3xl mx-auto px-4 py-5 sm:py-8">

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/learning/math')}
            className="rounded-full w-10 h-10 p-0 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <span className="text-2xl">🌟</span> Foundation Math
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Ages 3–5 · Numbers, shapes & colors</p>
          </div>
        </motion.header>

        {/* Tab Navigation */}
        <nav className="mb-6">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {TAB_CONFIG.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); clearFeedback() }}
                className={`flex flex-col items-center gap-1 px-2 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                  tab === t.id
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 scale-[1.02]'
                    : 'text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-slate-200 dark:border-slate-700 shadow-sm'
                }`}
              >
                <span className="text-xl">{t.emoji}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.main
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-800/90 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-700 overflow-hidden"
          >
            <div className="p-5 sm:p-8">
              {/* Numbers Tab */}
              {tab === 'numbers' && (
                <div className="space-y-6">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Tap a number, then say it out loud in English!
                  </p>
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2">
                    {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                      <motion.button
                        key={n}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => setCurrentNumber(n)}
                        className={`rounded-xl py-2 sm:py-3 text-base sm:text-lg font-bold tabular-nums transition-all ${
                          currentNumber === n
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                            : 'bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-slate-200 dark:border-slate-600'
                        }`}
                      >
                        {n}
                      </motion.button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-stretch">
                    <motion.div
                      key={currentNumber}
                      initial={{ scale: 0.96, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 p-8 sm:p-10 text-center text-white shadow-xl flex flex-col justify-center min-h-[200px] relative overflow-hidden"
                    >
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-4 right-6 text-6xl">✨</div>
                        <div className="absolute bottom-4 left-6 text-4xl">⭐</div>
                      </div>
                      <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Number</p>
                      <p className="text-7xl sm:text-8xl font-black mt-1 tabular-nums drop-shadow-sm">{currentNumber}</p>
                      <p className="text-xl sm:text-2xl font-bold mt-2 opacity-90 capitalize">{NUMBER_WORDS[currentNumber] ?? currentNumber}</p>
                    </motion.div>

                    <div className="grid grid-cols-2 gap-2.5 content-start">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentNumber((n) => Math.max(1, n - 1))}
                        disabled={currentNumber === 1}
                        className="rounded-2xl h-14 text-base font-semibold border-2 border-slate-200 dark:border-slate-600"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" /> Smaller
                      </Button>
                      <Button
                        onClick={() => setCurrentNumber((n) => Math.min(20, n + 1))}
                        disabled={currentNumber === 20}
                        className="rounded-2xl h-14 text-base font-semibold bg-emerald-500 hover:bg-emerald-600 text-white"
                      >
                        Bigger <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={speakCount}
                        className="rounded-2xl col-span-2 h-14 text-base font-semibold border-2 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                      >
                        <Volume2 className="w-5 h-5 mr-2" /> Listen & Count
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Counting Tab */}
              {tab === 'counting' && (
                <div className="space-y-6">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Count the objects below. How many do you see?</p>
                  <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 p-5 sm:p-6 border border-blue-100 dark:border-blue-800/50">
                    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 gap-2 max-w-lg mx-auto">
                      {shownObjects.map((obj, i) => (
                        <motion.span
                          key={i}
                          initial={{ scale: 0, rotate: -10 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="text-3xl sm:text-4xl aspect-square flex items-center justify-center rounded-2xl bg-white/70 dark:bg-slate-800/50 shadow-sm"
                        >
                          {obj}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  <p className="text-base font-bold text-slate-800 dark:text-white text-center">How many objects? 🤔</p>
                  <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                    {buildOptions(currentNumber, level.max).map((opt) => (
                      <motion.button
                        key={opt}
                        whileTap={{ scale: 0.95 }}
                        className="rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xl font-bold text-slate-800 dark:text-white py-4 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all shadow-sm"
                        onClick={() => {
                          if (opt === currentNumber) {
                            setCountFeedback('correct')
                            if (currentNumber < 20) setTimeout(() => { setCurrentNumber((n) => n + 1); setCountFeedback(null) }, 800)
                          } else setCountFeedback('try-again')
                        }}
                      >
                        {opt}
                      </motion.button>
                    ))}
                  </div>

                  {countFeedback === 'correct' && <FeedbackBanner type="correct">Yes! There are {currentNumber} objects!</FeedbackBanner>}
                  {countFeedback === 'try-again' && <FeedbackBanner type="try-again">Count each object and try again.</FeedbackBanner>}

                  <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
                    <Button variant="outline" size="sm" onClick={() => setCurrentNumber((n) => Math.max(1, n - 1))} className="rounded-2xl h-10">
                      <ChevronLeft className="w-3 h-3 mr-1" /> Fewer
                    </Button>
                    <Button size="sm" onClick={() => setCurrentNumber((n) => Math.min(20, n + 1))} className="rounded-2xl h-10 bg-emerald-500 hover:bg-emerald-600">
                      More <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {/* More/Less Tab */}
              {tab === 'moreless' && (
                <div className="space-y-6">
                  <p className="text-base font-bold text-slate-800 dark:text-white text-center">Which group has <span className="text-emerald-600 dark:text-emerald-400">more</span>? 🧐</p>
                  <div className="grid grid-cols-2 gap-4">
                    <GroupCard label="Group A" count={leftCount} offset={0} />
                    <GroupCard label="Group B" count={rightCount} offset={5} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      className="rounded-2xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-bold py-4 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all shadow-sm"
                      onClick={() => setCompareFeedback(correctSide === 'left' ? 'correct' : 'try-again')}
                    >
                      👈 Group A
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      className="rounded-2xl border-2 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-bold py-4 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all shadow-sm"
                      onClick={() => setCompareFeedback(correctSide === 'right' ? 'correct' : 'try-again')}
                    >
                      Group B 👉
                    </motion.button>
                  </div>
                  {compareFeedback === 'correct' && <FeedbackBanner type="correct">Great job! You found the bigger group!</FeedbackBanner>}
                  {compareFeedback === 'try-again' && <FeedbackBanner type="try-again">Count each side. Which has more?</FeedbackBanner>}
                  <div className="text-center">
                    <Button variant="outline" size="sm" onClick={() => { setCurrentNumber((n) => (n >= 20 ? 1 : n + 1)); setCompareFeedback(null) }} className="rounded-2xl">
                      <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> New Round
                    </Button>
                  </div>
                </div>
              )}

              {/* Same Tab */}
              {tab === 'same' && (
                <div className="space-y-6">
                  <p className="text-base font-bold text-slate-800 dark:text-white text-center">
                    Do both groups have the <span className="text-violet-600 dark:text-violet-400">same</span> number? 🤔
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <GroupCard label="Group 1" count={sameLeft} offset={0} />
                    <GroupCard label="Group 2" count={sameRightCount} offset={3} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      className="rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 font-bold py-4 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all shadow-sm text-lg"
                      onClick={() => setSameFeedback(sameIsSame ? 'correct' : 'try-again')}
                    >
                      ✅ Same
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      className="rounded-2xl border-2 border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 font-bold py-4 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-all shadow-sm text-lg"
                      onClick={() => setSameFeedback(!sameIsSame ? 'correct' : 'try-again')}
                    >
                      ❌ Different
                    </motion.button>
                  </div>
                  {sameFeedback === 'correct' && <FeedbackBanner type="correct">{sameIsSame ? 'Yes! Both groups have the same number!' : 'Correct! The groups are different!'}</FeedbackBanner>}
                  {sameFeedback === 'try-again' && <FeedbackBanner type="try-again">Count each group carefully. Are they the same?</FeedbackBanner>}
                  <div className="text-center">
                    <Button variant="outline" size="sm" onClick={() => { setSameRound((r) => r + 1); setSameFeedback(null) }} className="rounded-2xl">
                      <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Next Round
                    </Button>
                  </div>
                </div>
              )}

              {/* Order Tab */}
              {tab === 'order' && (
                <div className="space-y-6">
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center">What number comes next in the pattern?</p>
                  <div className="rounded-2xl bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 p-6 sm:p-8 border border-violet-100 dark:border-violet-800/50 text-center">
                    <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                      {orderSeqDisplay.map((n, i) => (
                        <motion.span
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-violet-500 text-white flex items-center justify-center text-xl sm:text-2xl font-bold shadow-md"
                        >
                          {n}
                        </motion.span>
                      ))}
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-3 border-dashed border-violet-300 dark:border-violet-600 flex items-center justify-center text-xl sm:text-2xl font-bold text-violet-400 dark:text-violet-500"
                      >
                        ?
                      </motion.span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                    {orderOptions.map((opt) => (
                      <motion.button
                        key={opt}
                        whileTap={{ scale: 0.95 }}
                        className="rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xl font-bold text-slate-800 dark:text-white py-4 hover:border-violet-400 dark:hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all shadow-sm"
                        onClick={() => {
                          if (opt === orderNext) {
                            setOrderFeedback('correct')
                            setTimeout(() => { setSameRound((r) => r + 1); setOrderFeedback(null) }, 800)
                          } else setOrderFeedback('try-again')
                        }}
                      >
                        {opt}
                      </motion.button>
                    ))}
                  </div>

                  {orderFeedback === 'correct' && <FeedbackBanner type="correct">Yes! {orderNext} comes next — &quot;{NUMBER_WORDS[orderNext]}&quot;!</FeedbackBanner>}
                  {orderFeedback === 'try-again' && <FeedbackBanner type="try-again">Count on: {orderSeqDisplay.join(', ')}, then …?</FeedbackBanner>}
                  <div className="text-center">
                    <Button variant="outline" size="sm" onClick={() => { setSameRound((r) => r + 1); setOrderFeedback(null) }} className="rounded-2xl">
                      <SkipForward className="w-3.5 h-3.5 mr-1.5" /> Next Pattern
                    </Button>
                  </div>
                </div>
              )}

              {/* Shapes Tab */}
              {tab === 'shapes' && (
                <div className="space-y-6">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Tap a shape to learn its English name!</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {SHAPES.map((s, i) => (
                      <motion.button
                        key={s.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShapeIndex(i)}
                        className={`rounded-2xl p-4 sm:p-5 text-center transition-all ${s.bg} border-2 ${
                          shapeIndex === i
                            ? `${s.border} ring-2 ring-emerald-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-800 shadow-lg scale-[1.03]`
                            : `${s.border} hover:shadow-md`
                        }`}
                      >
                        <div className="text-4xl sm:text-5xl mb-2">{s.emoji}</div>
                        <div className={`text-sm font-bold ${s.accent}`}>{s.word}</div>
                      </motion.button>
                    ))}
                  </div>

                  <motion.div
                    key={shapeIndex}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`rounded-2xl p-6 sm:p-8 text-center ${SHAPES[shapeIndex].bg} border-2 ${SHAPES[shapeIndex].border}`}
                  >
                    <div className="text-6xl mb-3">{SHAPES[shapeIndex].emoji}</div>
                    <p className={`text-2xl sm:text-3xl font-extrabold ${SHAPES[shapeIndex].accent}`}>{SHAPES[shapeIndex].word}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Say it: &quot;{SHAPES[shapeIndex].word}&quot;</p>
                  </motion.div>

                  <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                    <Button variant="outline" onClick={() => setShapeIndex((i) => (i === 0 ? SHAPES.length - 1 : i - 1))} className="rounded-2xl h-11">
                      <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                    </Button>
                    <Button onClick={() => setShapeIndex((i) => (i === SHAPES.length - 1 ? 0 : i + 1))} className="rounded-2xl h-11 bg-emerald-500 hover:bg-emerald-600">
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Colors Tab */}
              {tab === 'colors' && (
                <div className="space-y-6">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Tap a color and say its name in English!</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {COLORS.map((c, i) => (
                      <motion.button
                        key={c.name}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setColorIndex(i)}
                        className={`rounded-2xl p-5 sm:p-6 flex items-center justify-center transition-all ${c.hex} ${
                          colorIndex === i
                            ? `ring-4 ring-offset-2 ${c.ring} ring-offset-white dark:ring-offset-slate-800 scale-[1.03] shadow-xl`
                            : 'hover:scale-[1.02] shadow-md'
                        }`}
                      >
                        <span className="text-lg sm:text-xl font-extrabold text-white drop-shadow-md">{c.word}</span>
                      </motion.button>
                    ))}
                  </div>

                  <motion.div
                    key={colorIndex}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`rounded-2xl p-8 sm:p-10 ${COLORS[colorIndex].hex} text-center shadow-lg relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-3 right-5 text-5xl">🎨</div>
                      <div className="absolute bottom-3 left-5 text-3xl">✨</div>
                    </div>
                    <p className="text-xs uppercase tracking-widest text-white/70 font-bold mb-2">This color is</p>
                    <p className="text-4xl sm:text-5xl font-black text-white drop-shadow-md">{COLORS[colorIndex].word}</p>
                  </motion.div>

                  <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                    <Button variant="outline" onClick={() => setColorIndex((i) => (i === 0 ? COLORS.length - 1 : i - 1))} className="rounded-2xl h-11">
                      <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                    </Button>
                    <Button onClick={() => setColorIndex((i) => (i === COLORS.length - 1 ? 0 : i + 1))} className="rounded-2xl h-11 bg-emerald-500 hover:bg-emerald-600">
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Match Shape Tab */}
              {tab === 'matchshape' && (
                <div className="space-y-6">
                  <p className="text-base font-bold text-slate-800 dark:text-white text-center">What shape is this? 🧩</p>
                  <motion.div
                    key={matchShapeIndex}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`rounded-3xl p-8 sm:p-10 text-center max-w-xs mx-auto ${SHAPES[matchShapeIndex].bg} border-2 ${SHAPES[matchShapeIndex].border} shadow-md`}
                  >
                    <div className="text-7xl sm:text-8xl">{SHAPES[matchShapeIndex].emoji}</div>
                  </motion.div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md mx-auto">
                    {SHAPES.map((s) => (
                      <motion.button
                        key={s.id}
                        whileTap={{ scale: 0.95 }}
                        className={`rounded-2xl border-2 ${s.border} ${s.bg} font-bold py-3.5 text-base transition-all hover:shadow-md ${s.accent}`}
                        onClick={() => {
                          const correct = s.id === SHAPES[matchShapeIndex].id
                          setMatchShapeFeedback(correct ? 'correct' : 'try-again')
                          if (correct) setTimeout(() => { setMatchShapeIndex((i) => (i === SHAPES.length - 1 ? 0 : i + 1)); setMatchShapeFeedback(null) }, 700)
                        }}
                      >
                        {s.emoji} {s.word}
                      </motion.button>
                    ))}
                  </div>

                  {matchShapeFeedback === 'correct' && <FeedbackBanner type="correct">Yes! That&apos;s a {SHAPES[matchShapeIndex].word}!</FeedbackBanner>}
                  {matchShapeFeedback === 'try-again' && <FeedbackBanner type="try-again">Look at the shape carefully. Try again!</FeedbackBanner>}
                  <div className="text-center">
                    <Button variant="outline" size="sm" onClick={() => { setMatchShapeIndex((i) => (i === SHAPES.length - 1 ? 0 : i + 1)); setMatchShapeFeedback(null) }} className="rounded-2xl">
                      <SkipForward className="w-3.5 h-3.5 mr-1.5" /> Skip
                    </Button>
                  </div>
                </div>
              )}

              {/* Stories Tab */}
              {tab === 'stories' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <span className="text-xl">📖</span> Math Story
                    </p>
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">
                      {storyIndex + 1} / {FOUNDATION_STORIES.length}
                    </span>
                  </div>

                  <motion.div
                    key={storyIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 sm:p-8 border border-amber-200 dark:border-amber-800/50 text-center"
                  >
                    <p className="text-lg sm:text-xl font-medium text-slate-800 dark:text-white leading-relaxed">
                      {FOUNDATION_STORIES[storyIndex].q}
                    </p>
                    <AnimatePresence>
                      {showStoryHint && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-3 border-t border-amber-200 dark:border-amber-700"
                        >
                          <p className="text-amber-600 dark:text-amber-400 text-lg font-bold flex items-center justify-center gap-2">
                            <Lightbulb className="w-5 h-5" /> {FOUNDATION_STORIES[storyIndex].hint}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <div className="flex items-center justify-center gap-3">
                    <input
                      type="number"
                      value={storyAnswer}
                      onChange={(e) => { setStoryAnswer(e.target.value); setStoryFeedback(null) }}
                      className="w-20 h-16 text-center text-3xl font-black rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 outline-none transition-all"
                      placeholder="?"
                    />
                    <Button
                      onClick={() => {
                        const num = parseInt(storyAnswer, 10)
                        if (num === FOUNDATION_STORIES[storyIndex].ans) {
                          setStoryFeedback('correct')
                          setTimeout(() => {
                            setStoryIndex((i) => (i + 1) % FOUNDATION_STORIES.length)
                            setStoryAnswer('')
                            setStoryFeedback(null)
                            setShowStoryHint(false)
                          }, 900)
                        } else {
                          setStoryFeedback('try-again')
                        }
                      }}
                      className="h-16 px-8 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg shadow-lg shadow-amber-200 dark:shadow-amber-900/30"
                    >
                      <Sparkles className="w-5 h-5 mr-2" /> Check
                    </Button>
                  </div>

                  {storyFeedback === 'correct' && <FeedbackBanner type="correct">Correct! Amazing work! 🌟</FeedbackBanner>}
                  {storyFeedback === 'try-again' && <FeedbackBanner type="try-again">Not quite. Try again or use a hint!</FeedbackBanner>}

                  <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" size="sm" className="rounded-2xl" onClick={() => setShowStoryHint(true)}>
                      <Lightbulb className="w-3.5 h-3.5 mr-1.5" /> Hint
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-2xl" onClick={() => { setStoryIndex((i) => (i + 1) % FOUNDATION_STORIES.length); setStoryAnswer(''); setStoryFeedback(null); setShowStoryHint(false) }}>
                      <SkipForward className="w-3.5 h-3.5 mr-1.5" /> Skip
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer tip */}
            <div className="px-5 sm:px-8 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <strong className="text-slate-600 dark:text-slate-300">💡 Tip for parents:</strong> Let your child point to the screen and say the words with you. Practice makes perfect!
              </p>
            </div>
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  )
}
