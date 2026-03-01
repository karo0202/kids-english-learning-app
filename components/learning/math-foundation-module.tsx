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
    <div className="min-h-screen bg-slate-50/80 dark:bg-gray-900/95">
      <div className="max-w-3xl mx-auto px-4 py-6 md:py-8">
        <header className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.push('/learning/math')} className="rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 -ml-1">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-slate-800 dark:text-white">Foundation</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Ages 3–5 · Number sense, shapes & colors</p>
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide border-b border-slate-200/80 dark:border-slate-700/80">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setCountFeedback(null); setCompareFeedback(null); setSameFeedback(null); setOrderFeedback(null); setMatchShapeFeedback(null); }}
              className={`shrink-0 px-3 py-2 rounded-t-lg text-sm font-medium transition whitespace-nowrap ${
                tab === t.id
                  ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <main className="mt-6 rounded-2xl bg-white dark:bg-slate-800/60 shadow-sm border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
          <div className="p-6 md:p-8">
            {tab === 'numbers' && (
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <motion.div
                  key={currentNumber}
                  initial={{ scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="rounded-2xl bg-gradient-to-br from-emerald-500/90 to-teal-600/90 p-8 md:p-10 text-center text-white shadow-lg"
                >
                  <p className="text-sm font-medium opacity-90 uppercase tracking-wider">Number</p>
                  <p className="text-7xl md:text-8xl font-bold mt-1 tabular-nums">{currentNumber}</p>
                  <p className="text-xl md:text-2xl font-semibold mt-3 opacity-95">{NUMBER_WORDS[currentNumber] ?? currentNumber}</p>
                </motion.div>
                <div className="space-y-4">
                  <p className="text-slate-600 dark:text-slate-300 text-sm">Say the number in English. Tap Smaller or Bigger.</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="lg" onClick={() => setCurrentNumber((n) => Math.max(1, n - 1))} disabled={currentNumber === 1} className="rounded-xl border-slate-200 dark:border-slate-600">Smaller</Button>
                    <Button size="lg" onClick={() => setCurrentNumber((n) => Math.min(20, n + 1))} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">Bigger</Button>
                    <Button variant="outline" size="lg" onClick={speakCount} className="rounded-xl border-slate-200 dark:border-slate-600">
                      <Volume2 className="w-4 h-4 mr-2" /> Listen
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {tab === 'counting' && (
              <div className="space-y-6">
                <p className="text-slate-600 dark:text-slate-300 text-sm">Count the objects. How many? Say the number in English.</p>
                <div className="grid grid-cols-5 gap-2 max-w-sm">
                  {shownObjects.map((obj, i) => (
                    <motion.span key={i} className="text-3xl p-3 rounded-xl bg-slate-100 dark:bg-slate-700/50 text-center border border-slate-200/60 dark:border-slate-600/60" whileTap={{ scale: 0.92 }}>
                      {obj}
                    </motion.span>
                  ))}
                </div>
                <p className="text-base font-semibold text-slate-800 dark:text-white">How many objects?</p>
                <div className="flex flex-wrap gap-2">
                  {buildOptions(currentNumber, level.max).map((opt) => (
                    <Button
                      key={opt}
                      variant="outline"
                      className="rounded-xl border-slate-200 dark:border-slate-600"
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
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentNumber((n) => Math.max(1, n - 1))} className="rounded-xl">Fewer</Button>
                  <Button size="sm" onClick={() => setCurrentNumber((n) => Math.min(20, n + 1))} className="rounded-xl bg-emerald-600 hover:bg-emerald-700">More</Button>
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
                <div className="flex gap-2">
                  <Button variant="outline" className="rounded-xl flex-1 border-slate-200 dark:border-slate-600" onClick={() => setCompareFeedback(correctSide === 'left' ? 'correct' : 'try-again')}>Left has more</Button>
                  <Button variant="outline" className="rounded-xl flex-1 border-slate-200 dark:border-slate-600" onClick={() => setCompareFeedback(correctSide === 'right' ? 'correct' : 'try-again')}>Right has more</Button>
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
                <div className="flex gap-2">
                  <Button variant="outline" className="rounded-xl flex-1 border-slate-200 dark:border-slate-600" onClick={() => { setSameFeedback(sameIsSame ? 'correct' : 'try-again'); }}>Same</Button>
                  <Button variant="outline" className="rounded-xl flex-1 border-slate-200 dark:border-slate-600" onClick={() => { setSameFeedback(!sameIsSame ? 'correct' : 'try-again'); }}>Not the same</Button>
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
                <div className="flex flex-wrap gap-2">
                  {orderOptions.map((opt) => (
                    <Button
                      key={opt}
                      variant="outline"
                      className="rounded-xl border-slate-200 dark:border-slate-600"
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
                <p className="text-slate-600 dark:text-slate-300 text-sm">Learn shape names in English.</p>
                <motion.div
                  key={shapeIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl p-8 border-2 text-center ${SHAPES[shapeIndex].color} dark:border-slate-600/60`}
                >
                  <div className="text-6xl mb-3">{SHAPES[shapeIndex].emoji}</div>
                  <div className="text-2xl font-bold text-slate-800 dark:text-white">{SHAPES[shapeIndex].word}</div>
                </motion.div>
                <div className="flex justify-between gap-2">
                  <Button variant="outline" onClick={() => setShapeIndex((i) => (i === 0 ? SHAPES.length - 1 : i - 1))} className="rounded-xl border-slate-200 dark:border-slate-600">← Previous</Button>
                  <Button onClick={() => setShapeIndex((i) => (i === SHAPES.length - 1 ? 0 : i + 1))} className="rounded-xl bg-emerald-600 hover:bg-emerald-700">Next →</Button>
                </div>
              </div>
            )}

            {tab === 'colors' && (
              <div className="space-y-6">
                <p className="text-slate-600 dark:text-slate-300 text-sm">Learn color names in English.</p>
                <motion.div
                  key={colorIndex}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-2xl p-8 ${COLORS[colorIndex].hex} border-2 border-slate-200/60 dark:border-slate-600/60 text-center shadow-inner`}
                >
                  <div className="text-2xl font-bold text-white drop-shadow-md">{COLORS[colorIndex].word}</div>
                </motion.div>
                <div className="flex justify-between gap-2">
                  <Button variant="outline" onClick={() => setColorIndex((i) => (i === 0 ? COLORS.length - 1 : i - 1))} className="rounded-xl border-slate-200 dark:border-slate-600">← Previous</Button>
                  <Button onClick={() => setColorIndex((i) => (i === COLORS.length - 1 ? 0 : i + 1))} className="rounded-xl bg-emerald-600 hover:bg-emerald-700">Next →</Button>
                </div>
              </div>
            )}

            {tab === 'matchshape' && (
              <div className="space-y-6">
                <p className="text-slate-800 dark:text-white font-medium">What shape is this? Choose the name in English.</p>
                <motion.div
                  key={matchShapeIndex}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-2xl p-8 border-2 text-center ${SHAPES[matchShapeIndex].color} dark:border-slate-600/60`}
                >
                  <div className="text-6xl mb-2">{SHAPES[matchShapeIndex].emoji}</div>
                </motion.div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {SHAPES.map((s) => (
                    <Button
                      key={s.id}
                      variant="outline"
                      className="rounded-xl border-slate-200 dark:border-slate-600"
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
          </div>
        </main>
      </div>
    </div>
  )
}
