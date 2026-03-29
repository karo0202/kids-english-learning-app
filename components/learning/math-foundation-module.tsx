'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Volume2 } from 'lucide-react'
import { premiumTTS } from '@/lib/premium-tts'

const NUMBER_WORDS: Record<number, string> = {
  1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten',
  11: 'eleven', 12: 'twelve', 13: 'thirteen', 14: 'fourteen', 15: 'fifteen', 16: 'sixteen', 17: 'seventeen', 18: 'eighteen', 19: 'nineteen', 20: 'twenty',
}

const OBJECTS = ['🍎', '🐶', '⭐', '🚗', '🌸', '🧸', '🎈', '🍪', '🐱', '⚽', '🐠', '🦋', '🌟', '📚', '🎵', '🍓', '🦄', '🚀', '🍰', '🧃']

const SHAPES = [
  { id: 'circle', name: 'Circle', word: 'Circle', emoji: '⭕', color: 'bg-red-100 border-red-300' },
  { id: 'square', name: 'Square', word: 'Square', emoji: '🟦', color: 'bg-blue-100 border-blue-300' },
  { id: 'triangle', name: 'Triangle', word: 'Triangle', emoji: '🔺', color: 'bg-green-100 border-green-300' },
  { id: 'rectangle', name: 'Rectangle', word: 'Rectangle', emoji: '▭', color: 'bg-amber-100 border-amber-300' },
  { id: 'star', name: 'Star', word: 'Star', emoji: '⭐', color: 'bg-yellow-100 border-yellow-300' },
]

const COLORS = [
  { name: 'Red', word: 'Red', hex: 'bg-red-500' },
  { name: 'Blue', word: 'Blue', hex: 'bg-blue-500' },
  { name: 'Green', word: 'Green', hex: 'bg-green-500' },
  { name: 'Yellow', word: 'Yellow', hex: 'bg-yellow-400' },
  { name: 'Orange', word: 'Orange', hex: 'bg-orange-500' },
  { name: 'Purple', word: 'Purple', hex: 'bg-purple-500' },
  { name: 'Pink', word: 'Pink', hex: 'bg-pink-400' },
]

type Tab = 'numbers' | 'counting' | 'moreless' | 'same' | 'order' | 'shapes' | 'colors' | 'matchshape'

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
  const [orderAnswer, setOrderAnswer] = useState('')
  const [orderFeedback, setOrderFeedback] = useState<'correct' | 'try-again' | null>(null)
  const [matchShapeFeedback, setMatchShapeFeedback] = useState<'correct' | 'try-again' | null>(null)
  const [matchShapeIndex, setMatchShapeIndex] = useState(0)

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

  // Same: "Do they have the same number? Yes or No."
  const sameLeft = 4 + (sameRound % 5)
  const sameIsSame = sameRound % 2 === 0
  const sameRightCount = sameIsSame ? sameLeft : sameLeft + 1

  // Order: what number comes next? e.g. 2, 3, 4, ?
  const orderStart = 2 + (sameRound % 4)
  const orderStep = 1
  const orderNext = orderStart + orderStep * 3
  const orderSeqDisplay = [orderStart, orderStart + orderStep, orderStart + orderStep * 2]
  const orderOptions = Array.from(new Set([orderNext, orderNext + 1, orderNext - 1].filter((n) => n >= 1 && n <= 20)))
  if (orderOptions.length < 2) orderOptions.push(orderNext + 2)

  const tabs: { id: Tab; label: string }[] = [
    { id: 'numbers', label: 'Numbers' },
    { id: 'counting', label: 'Count' },
    { id: 'moreless', label: 'More / Less' },
    { id: 'same', label: 'Same' },
    { id: 'order', label: 'What\'s next?' },
    { id: 'shapes', label: 'Shapes' },
    { id: 'colors', label: 'Colors' },
    { id: 'matchshape', label: 'Match shape' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 via-white to-teal-50/30 dark:from-emerald-950/20 dark:via-gray-900 dark:to-teal-950/20">
      <div className="max-w-3xl mx-auto px-4 py-6 md:py-8">
        <header className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.push('/learning/math')} className="rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-block w-1.5 h-8 rounded-full bg-gradient-to-b from-emerald-500 to-teal-600" />
              <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-white">Foundation</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Ages 3–5 · Number sense, shapes & colors</p>
              </div>
            </div>
          </div>
        </header>

        <nav className="flex gap-1.5 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setCountFeedback(null); setCompareFeedback(null); setSameFeedback(null); setOrderFeedback(null); setMatchShapeFeedback(null); }}
              className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                tab === t.id
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25 dark:bg-emerald-500 dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 bg-white/80 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-slate-200/60 dark:border-slate-700/60'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <main className="mt-6 rounded-2xl bg-white dark:bg-slate-800/80 shadow-xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden border-l-4 border-l-emerald-500">
          <div className="p-6 md:p-8">
            {tab === 'numbers' && (
              <div className="space-y-6">
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  Tap a number in the grid, then say it in English. Use Smaller, Bigger, or Listen to practice.
                </p>
                <div
                  className="grid grid-cols-5 sm:grid-cols-10 gap-2"
                  role="group"
                  aria-label="Choose a number from 1 to 20"
                >
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCurrentNumber(n)}
                      className={`rounded-xl py-2.5 sm:py-3 text-base sm:text-lg font-bold tabular-nums border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
                        currentNumber === n
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-md shadow-emerald-500/20 dark:bg-emerald-950/50 dark:text-emerald-100 dark:border-emerald-400'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:border-emerald-600'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                  <motion.div
                    key={currentNumber}
                    initial={{ scale: 0.98, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-8 md:p-10 text-center text-white shadow-xl ring-4 ring-emerald-400/20 dark:ring-emerald-500/30 flex flex-col justify-center min-h-[200px]"
                  >
                    <p className="text-sm font-medium opacity-90 uppercase tracking-wider">Number</p>
                    <p className="text-7xl md:text-8xl font-bold mt-1 tabular-nums drop-shadow-sm">{currentNumber}</p>
                    <p className="text-xl md:text-2xl font-semibold mt-3 opacity-95">{NUMBER_WORDS[currentNumber] ?? currentNumber}</p>
                  </motion.div>
                  <div className="grid grid-cols-2 gap-3 content-start">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setCurrentNumber((n) => Math.max(1, n - 1))}
                      disabled={currentNumber === 1}
                      className="rounded-xl border-slate-200 dark:border-slate-600 h-auto min-h-[52px]"
                    >
                      Smaller
                    </Button>
                    <Button
                      size="lg"
                      onClick={() => setCurrentNumber((n) => Math.min(20, n + 1))}
                      disabled={currentNumber === 20}
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white h-auto min-h-[52px]"
                    >
                      Bigger
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={speakCount}
                      className="rounded-xl border-slate-200 dark:border-slate-600 col-span-2 h-auto min-h-[52px]"
                    >
                      <Volume2 className="w-4 h-4 mr-2 shrink-0" /> Listen
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {tab === 'counting' && (
              <div className="space-y-6">
                <p className="text-slate-600 dark:text-slate-300 text-sm">Count the objects. How many? Say the number in English.</p>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 max-w-xl mx-auto">
                  {shownObjects.map((obj, i) => (
                    <motion.span
                      key={i}
                      className="text-2xl sm:text-3xl aspect-square flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700/50 border border-slate-200/60 dark:border-slate-600/60"
                      whileTap={{ scale: 0.92 }}
                    >
                      {obj}
                    </motion.span>
                  ))}
                </div>
                <p className="text-base font-semibold text-slate-800 dark:text-white">How many objects?</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-w-md">
                  {buildOptions(currentNumber, level.max).map((opt) => (
                    <Button
                      key={opt}
                      variant="outline"
                      className="rounded-xl border-slate-200 dark:border-slate-600 text-lg font-semibold tabular-nums min-h-[48px]"
                      onClick={() => {
                        if (opt === currentNumber) {
                          setCountFeedback('correct')
                          if (currentNumber < 20) setTimeout(() => { setCurrentNumber((n) => n + 1); setCountFeedback(null); }, 600)
                        } else setCountFeedback('try-again')
                      }}
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
                {countFeedback === 'correct' && <p className="text-emerald-600 dark:text-emerald-400 font-medium">Yes! There are {currentNumber} objects.</p>}
                {countFeedback === 'try-again' && <p className="text-amber-600 dark:text-amber-400 font-medium">Count each object and try again.</p>}
                <div className="grid grid-cols-2 gap-2 max-w-xs">
                  <Button variant="outline" size="sm" onClick={() => setCurrentNumber((n) => Math.max(1, n - 1))} className="rounded-xl">
                    Fewer
                  </Button>
                  <Button size="sm" onClick={() => setCurrentNumber((n) => Math.min(20, n + 1))} className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                    More
                  </Button>
                </div>
              </div>
            )}

            {tab === 'moreless' && (
              <div className="space-y-6">
                <p className="text-slate-800 dark:text-white font-medium">Which group has more?</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-slate-100 dark:bg-slate-700/50 p-4 border border-slate-200/60 dark:border-slate-600/60">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Left</p>
                    <div className="flex flex-wrap gap-1">
                      {Array.from({ length: leftCount }).map((_, i) => (
                        <span key={i} className="text-2xl">{OBJECTS[i % OBJECTS.length]}</span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-100 dark:bg-slate-700/50 p-4 border border-slate-200/60 dark:border-slate-600/60">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Right</p>
                    <div className="flex flex-wrap gap-1">
                      {Array.from({ length: rightCount }).map((_, i) => (
                        <span key={i} className="text-2xl">{OBJECTS[(i + 5) % OBJECTS.length]}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button variant="outline" className="rounded-xl border-slate-200 dark:border-slate-600 min-h-[48px]" onClick={() => setCompareFeedback(correctSide === 'left' ? 'correct' : 'try-again')}>Left has more</Button>
                  <Button variant="outline" className="rounded-xl border-slate-200 dark:border-slate-600 min-h-[48px]" onClick={() => setCompareFeedback(correctSide === 'right' ? 'correct' : 'try-again')}>Right has more</Button>
                </div>
                {compareFeedback === 'correct' && <p className="text-emerald-600 dark:text-emerald-400 font-medium">Well done! You found the group with more.</p>}
                {compareFeedback === 'try-again' && <p className="text-amber-600 dark:text-amber-400 font-medium">Count each side. Which has more?</p>}
                <Button variant="outline" size="sm" onClick={() => { setCurrentNumber((n) => (n >= 20 ? 1 : n + 1)); setCompareFeedback(null); }} className="rounded-xl mt-2">Next</Button>
              </div>
            )}

            {tab === 'same' && (
              <div className="space-y-6">
                <p className="text-slate-800 dark:text-white font-medium">Do the two groups have the <strong>same</strong> number?</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-slate-100 dark:bg-slate-700/50 p-4 border border-slate-200/60 dark:border-slate-600/60">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Group 1</p>
                    <div className="flex flex-wrap gap-1">
                      {Array.from({ length: sameLeft }).map((_, i) => (
                        <span key={i} className="text-2xl">{OBJECTS[i % OBJECTS.length]}</span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-100 dark:bg-slate-700/50 p-4 border border-slate-200/60 dark:border-slate-600/60">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Group 2</p>
                    <div className="flex flex-wrap gap-1">
                      {Array.from({ length: sameRightCount }).map((_, i) => (
                        <span key={i} className="text-2xl">{OBJECTS[(i + 3) % OBJECTS.length]}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button variant="outline" className="rounded-xl border-slate-200 dark:border-slate-600 min-h-[48px]" onClick={() => { setSameFeedback(sameIsSame ? 'correct' : 'try-again'); }}>Same</Button>
                  <Button variant="outline" className="rounded-xl border-slate-200 dark:border-slate-600 min-h-[48px]" onClick={() => { setSameFeedback(!sameIsSame ? 'correct' : 'try-again'); }}>Not the same</Button>
                </div>
                {sameFeedback === 'correct' && <p className="text-emerald-600 dark:text-emerald-400 font-medium">Yes! {sameIsSame ? 'They have the same number.' : 'They do not have the same number.'}</p>}
                {sameFeedback === 'try-again' && <p className="text-amber-600 dark:text-amber-400 font-medium">Count each group. Are they the same?</p>}
                <Button variant="outline" size="sm" onClick={() => { setSameRound((r) => r + 1); setSameFeedback(null); }} className="rounded-xl mt-2">Next</Button>
              </div>
            )}

            {tab === 'order' && (
              <div className="space-y-6">
                <p className="text-slate-600 dark:text-slate-300 text-sm">What number comes next? Say it in English.</p>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-700/50 p-6 border border-slate-200/60 dark:border-slate-600/60 text-center">
                  <p className="text-2xl font-bold text-slate-800 dark:text-white tabular-nums">{orderSeqDisplay.join(', ')} , ?</p>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-w-lg">
                  {orderOptions.map((opt) => (
                    <Button
                      key={opt}
                      variant="outline"
                      className="rounded-xl border-slate-200 dark:border-slate-600 text-lg font-semibold tabular-nums min-h-[48px]"
                      onClick={() => {
                        if (opt === orderNext) {
                          setOrderFeedback('correct')
                          setTimeout(() => { setSameRound((r) => r + 1); setOrderFeedback(null); }, 700)
                        } else setOrderFeedback('try-again')
                      }}
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
                {orderFeedback === 'correct' && <p className="text-emerald-600 dark:text-emerald-400 font-medium">Yes! {orderNext} comes next. {NUMBER_WORDS[orderNext]}.</p>}
                {orderFeedback === 'try-again' && <p className="text-amber-600 dark:text-amber-400 font-medium">Count on: {orderSeqDisplay.join(', ')}, then …?</p>}
                <Button variant="outline" size="sm" onClick={() => { setSameRound((r) => r + 1); setOrderFeedback(null); }} className="rounded-xl mt-2">Next question</Button>
              </div>
            )}

            {tab === 'shapes' && (
              <div className="space-y-6">
                <p className="text-slate-600 dark:text-slate-300 text-sm">Tap a shape in the grid to learn its name in English.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {SHAPES.map((s, i) => (
                    <motion.button
                      key={s.id}
                      type="button"
                      initial={false}
                      animate={{ scale: shapeIndex === i ? 1.02 : 1 }}
                      onClick={() => setShapeIndex(i)}
                      className={`rounded-2xl p-4 border-2 text-center transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${s.color} dark:border-slate-600/60 ${
                        shapeIndex === i
                          ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 shadow-lg'
                          : 'hover:shadow-md border-slate-200/80'
                      }`}
                    >
                      <div className="text-4xl sm:text-5xl mb-2">{s.emoji}</div>
                      <div className="text-sm sm:text-base font-bold text-slate-800 dark:text-white">{s.word}</div>
                    </motion.button>
                  ))}
                </div>
                <motion.div
                  key={shapeIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl p-6 border-2 text-center ${SHAPES[shapeIndex].color} dark:border-slate-600/60`}
                >
                  <p className="text-xs uppercase tracking-wide text-slate-600 dark:text-slate-300 mb-1">Selected</p>
                  <div className="text-5xl mb-2">{SHAPES[shapeIndex].emoji}</div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-white">{SHAPES[shapeIndex].word}</div>
                </motion.div>
                <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                  <Button variant="outline" onClick={() => setShapeIndex((i) => (i === 0 ? SHAPES.length - 1 : i - 1))} className="rounded-xl border-slate-200 dark:border-slate-600">
                    ← Previous
                  </Button>
                  <Button onClick={() => setShapeIndex((i) => (i === SHAPES.length - 1 ? 0 : i + 1))} className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                    Next →
                  </Button>
                </div>
              </div>
            )}

            {tab === 'colors' && (
              <div className="space-y-6">
                <p className="text-slate-600 dark:text-slate-300 text-sm">Tap a color in the grid to focus it and practice saying its name in English.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {COLORS.map((c, i) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setColorIndex(i)}
                      className={`rounded-2xl p-5 sm:p-6 min-h-[88px] flex items-center justify-center border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${c.hex} ${
                        colorIndex === i
                          ? 'ring-4 ring-offset-2 ring-emerald-500 ring-offset-white dark:ring-offset-slate-900 scale-[1.02] shadow-lg'
                          : 'border-white/30 hover:border-white/60 hover:scale-[1.01]'
                      }`}
                    >
                      <span className="text-lg sm:text-xl font-bold text-white drop-shadow-md">{c.word}</span>
                    </button>
                  ))}
                </div>
                <motion.div
                  key={colorIndex}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-2xl p-8 ${COLORS[colorIndex].hex} border-2 border-white/40 dark:border-slate-600/60 text-center shadow-inner`}
                >
                  <p className="text-xs uppercase tracking-wide text-white/90 mb-2">Selected</p>
                  <div className="text-3xl font-bold text-white drop-shadow-md">{COLORS[colorIndex].word}</div>
                </motion.div>
                <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                  <Button variant="outline" onClick={() => setColorIndex((i) => (i === 0 ? COLORS.length - 1 : i - 1))} className="rounded-xl border-slate-200 dark:border-slate-600">
                    ← Previous
                  </Button>
                  <Button onClick={() => setColorIndex((i) => (i === COLORS.length - 1 ? 0 : i + 1))} className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                    Next →
                  </Button>
                </div>
              </div>
            )}

            {tab === 'matchshape' && (
              <div className="space-y-6">
                <p className="text-slate-800 dark:text-white font-medium">What shape is this? Tap the correct name in the grid.</p>
                <motion.div
                  key={matchShapeIndex}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-2xl p-8 border-2 text-center max-w-sm mx-auto ${SHAPES[matchShapeIndex].color} dark:border-slate-600/60`}
                >
                  <div className="text-6xl mb-2">{SHAPES[matchShapeIndex].emoji}</div>
                </motion.div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 max-w-lg mx-auto">
                  {SHAPES.map((s) => (
                    <Button
                      key={s.id}
                      variant="outline"
                      className="rounded-xl border-slate-200 dark:border-slate-600 min-h-[48px] font-semibold"
                      onClick={() => {
                        const correct = s.id === SHAPES[matchShapeIndex].id
                        setMatchShapeFeedback(correct ? 'correct' : 'try-again')
                        if (correct) setTimeout(() => { setMatchShapeIndex((i) => (i === SHAPES.length - 1 ? 0 : i + 1)); setMatchShapeFeedback(null); }, 600)
                      }}
                    >
                      {s.word}
                    </Button>
                  ))}
                </div>
                {matchShapeFeedback === 'correct' && <p className="text-emerald-600 dark:text-emerald-400 font-medium">Yes! It is a {SHAPES[matchShapeIndex].word}.</p>}
                {matchShapeFeedback === 'try-again' && <p className="text-amber-600 dark:text-amber-400 font-medium">Look at the shape. How many sides? Try again.</p>}
                <Button variant="outline" size="sm" onClick={() => { setMatchShapeIndex((i) => (i === SHAPES.length - 1 ? 0 : i + 1)); setMatchShapeFeedback(null); }} className="rounded-xl mt-2">Next shape</Button>
              </div>
            )}
            <p className="mt-8 pt-4 border-t border-slate-200/60 dark:border-slate-600/60 text-xs text-slate-500 dark:text-slate-400">
              <strong className="text-slate-600 dark:text-slate-300">Tip for grown-ups:</strong> Let your child point to the screen and say the words with you. Repeat the number or shape name in English together.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
