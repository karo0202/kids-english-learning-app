'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mascot } from '@/components/ui/mascot'
import { ArrowLeft } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-sky-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl space-y-4">
        <Button variant="ghost" onClick={() => router.push('/learning/math')} className="rounded-2xl bg-white/70">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Math
        </Button>

        <Card className="card-kid border-2 border-orange-200/70 shadow-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <Mascot emotion="excited" size="medium" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Foundation (Ages 3–5)</h2>
                <p className="text-sm text-gray-600">Number sense, counting, shapes & colors in English</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTab(t.id); setCountFeedback(null); setCompareFeedback(null); setSameFeedback(null); setOrderFeedback(null); setMatchShapeFeedback(null); }}
                  className={`px-3 py-1 rounded-full text-sm font-semibold border transition ${
                    tab === t.id ? 'bg-orange-500 text-white border-orange-500' : 'bg-white border-orange-200 hover:bg-orange-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {tab === 'numbers' && (
              <div className="grid md:grid-cols-2 gap-6">
                <motion.div
                  key={currentNumber}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`rounded-3xl p-8 text-center text-white shadow-lg bg-gradient-to-br ${level.color}`}
                >
                  <div className="text-sm opacity-90">Number</div>
                  <div className="text-6xl font-black">{currentNumber}</div>
                  <div className="text-xl font-semibold mt-2">{NUMBER_WORDS[currentNumber] ?? currentNumber}</div>
                </motion.div>
                <div className="flex flex-col justify-center gap-3">
                  <p className="text-sm text-gray-700">Say the number in English. Tap Smaller or Bigger.</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => setCurrentNumber((n) => Math.max(1, n - 1))} disabled={currentNumber === 1} className="rounded-2xl">Smaller</Button>
                    <Button onClick={() => setCurrentNumber((n) => Math.min(20, n + 1))} className="rounded-2xl bg-orange-500 hover:bg-orange-600">Bigger</Button>
                    <Button variant="outline" onClick={speakCount} className="rounded-2xl">Listen</Button>
                  </div>
                </div>
              </div>
            )}

            {tab === 'counting' && (
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-700">Count the objects. How many? Say the number in English.</p>
                <div className="grid grid-cols-5 gap-2 max-w-md">
                  {shownObjects.map((obj, i) => (
                    <motion.span key={i} className="text-3xl p-2 rounded-xl bg-orange-100 border border-orange-200 text-center" whileTap={{ scale: 0.9 }}>
                      {obj}
                    </motion.span>
                  ))}
                </div>
                <p className="text-lg font-semibold text-gray-800">How many objects?</p>
                <div className="flex flex-wrap gap-2">
                  {buildOptions(currentNumber, level.max).map((opt) => (
                    <Button
                      key={opt}
                      variant="outline"
                      className="rounded-2xl"
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
                {countFeedback === 'correct' && <p className="text-emerald-700 font-medium">Yes! There are {currentNumber} objects.</p>}
                {countFeedback === 'try-again' && <p className="text-amber-700 font-medium">Count each object and try again.</p>}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentNumber((n) => Math.max(1, n - 1))} className="rounded-2xl">Fewer</Button>
                  <Button size="sm" onClick={() => setCurrentNumber((n) => Math.min(20, n + 1))} className="rounded-2xl bg-orange-500">More</Button>
                </div>
              </div>
            )}

            {tab === 'moreless' && (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-gray-800">Which group has more?</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-orange-50 p-4 border border-orange-200">
                    <p className="text-xs font-medium text-gray-600 mb-2">Left</p>
                    <div className="flex flex-wrap gap-1">
                      {Array.from({ length: leftCount }).map((_, i) => (
                        <span key={i} className="text-2xl">{OBJECTS[i % OBJECTS.length]}</span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-sky-50 p-4 border border-sky-200">
                    <p className="text-xs font-medium text-gray-600 mb-2">Right</p>
                    <div className="flex flex-wrap gap-1">
                      {Array.from({ length: rightCount }).map((_, i) => (
                        <span key={i} className="text-2xl">{OBJECTS[(i + 5) % OBJECTS.length]}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="rounded-2xl flex-1" onClick={() => setCompareFeedback(correctSide === 'left' ? 'correct' : 'try-again')}>Left has more</Button>
                  <Button variant="outline" className="rounded-2xl flex-1" onClick={() => setCompareFeedback(correctSide === 'right' ? 'correct' : 'try-again')}>Right has more</Button>
                </div>
                {compareFeedback === 'correct' && <p className="text-emerald-700 font-medium">Well done! You found the group with more.</p>}
                {compareFeedback === 'try-again' && <p className="text-amber-700 font-medium">Count each side. Which has more?</p>}
                <Button variant="outline" size="sm" onClick={() => { setCurrentNumber((n) => (n >= 20 ? 1 : n + 1)); setCompareFeedback(null); }} className="rounded-2xl">Next</Button>
              </div>
            )}

            {tab === 'same' && (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-gray-800">Do the two groups have the <strong>same</strong> number? Say &quot;Same&quot; or &quot;Not the same&quot; in English.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-orange-50 p-4 border border-orange-200">
                    <p className="text-xs font-medium text-gray-600 mb-2">Group 1</p>
                    <div className="flex flex-wrap gap-1">
                      {Array.from({ length: sameLeft }).map((_, i) => (
                        <span key={i} className="text-2xl">{OBJECTS[i % OBJECTS.length]}</span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-sky-50 p-4 border border-sky-200">
                    <p className="text-xs font-medium text-gray-600 mb-2">Group 2</p>
                    <div className="flex flex-wrap gap-1">
                      {Array.from({ length: sameRightCount }).map((_, i) => (
                        <span key={i} className="text-2xl">{OBJECTS[(i + 3) % OBJECTS.length]}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="rounded-2xl flex-1" onClick={() => { setSameFeedback(sameIsSame ? 'correct' : 'try-again'); }}>Same</Button>
                  <Button variant="outline" className="rounded-2xl flex-1" onClick={() => { setSameFeedback(!sameIsSame ? 'correct' : 'try-again'); }}>Not the same</Button>
                </div>
                {sameFeedback === 'correct' && <p className="text-emerald-700 font-medium">Yes! {sameIsSame ? 'They have the same number.' : 'They do not have the same number.'}</p>}
                {sameFeedback === 'try-again' && <p className="text-amber-700 font-medium">Count each group. Are they the same?</p>}
                <Button variant="outline" size="sm" onClick={() => { setSameRound((r) => r + 1); setSameFeedback(null); }} className="rounded-2xl">Next</Button>
              </div>
            )}

            {tab === 'order' && (
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-700">What number comes next? Say it in English.</p>
                <div className="rounded-2xl bg-amber-50 p-6 border border-amber-200 text-center">
                  <p className="text-2xl font-bold text-gray-900">{orderSeqDisplay.join(', ')} , ?</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {orderOptions.map((opt) => (
                    <Button
                      key={opt}
                      variant="outline"
                      className="rounded-2xl"
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
                {orderFeedback === 'correct' && <p className="text-emerald-700 font-medium">Yes! {orderNext} comes next. {NUMBER_WORDS[orderNext]}.</p>}
                {orderFeedback === 'try-again' && <p className="text-amber-700 font-medium">Count on: {orderSeqDisplay.join(', ')}, then …?</p>}
                <Button variant="outline" size="sm" onClick={() => { setSameRound((r) => r + 1); setOrderFeedback(null); }} className="rounded-2xl">Next question</Button>
              </div>
            )}

            {tab === 'shapes' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-700">Learn shape names in English.</p>
                <motion.div
                  key={shapeIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-3xl p-8 border-4 text-center ${SHAPES[shapeIndex].color}`}
                >
                  <div className="text-6xl mb-2">{SHAPES[shapeIndex].emoji}</div>
                  <div className="text-2xl font-bold text-gray-900">{SHAPES[shapeIndex].word}</div>
                </motion.div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setShapeIndex((i) => (i === 0 ? SHAPES.length - 1 : i - 1))} className="rounded-2xl">← Previous</Button>
                  <Button onClick={() => setShapeIndex((i) => (i === SHAPES.length - 1 ? 0 : i + 1))} className="rounded-2xl bg-orange-500">Next →</Button>
                </div>
              </div>
            )}

            {tab === 'colors' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-700">Learn color names in English.</p>
                <motion.div
                  key={colorIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-3xl p-8 ${COLORS[colorIndex].hex} border-4 border-gray-200 text-center`}
                >
                  <div className="text-2xl font-bold text-white drop-shadow">{COLORS[colorIndex].word}</div>
                </motion.div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setColorIndex((i) => (i === 0 ? COLORS.length - 1 : i - 1))} className="rounded-2xl">← Previous</Button>
                  <Button onClick={() => setColorIndex((i) => (i === COLORS.length - 1 ? 0 : i + 1))} className="rounded-2xl bg-orange-500">Next →</Button>
                </div>
              </div>
            )}

            {tab === 'matchshape' && (
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-700">What shape is this? Choose the name in English.</p>
                <motion.div
                  key={matchShapeIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-3xl p-8 border-4 text-center ${SHAPES[matchShapeIndex].color}`}
                >
                  <div className="text-6xl mb-2">{SHAPES[matchShapeIndex].emoji}</div>
                </motion.div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {SHAPES.map((s) => (
                    <Button
                      key={s.id}
                      variant="outline"
                      className="rounded-2xl"
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
                {matchShapeFeedback === 'correct' && <p className="text-emerald-700 font-medium">Yes! It is a {SHAPES[matchShapeIndex].word}.</p>}
                {matchShapeFeedback === 'try-again' && <p className="text-amber-700 font-medium">Look at the shape. How many sides? Try again.</p>}
                <Button variant="outline" size="sm" onClick={() => { setMatchShapeIndex((i) => (i === SHAPES.length - 1 ? 0 : i + 1)); setMatchShapeFeedback(null); }} className="rounded-2xl">Next shape</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
