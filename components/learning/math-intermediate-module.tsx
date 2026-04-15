'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, RotateCcw, SkipForward, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'

type Tab = 'fractions' | 'decimals' | 'geometry' | 'perimeter' | 'wordproblem'

const TAB_CONFIG: { id: Tab; label: string; emoji: string }[] = [
  { id: 'fractions', label: 'Fractions', emoji: '🍕' },
  { id: 'decimals', label: 'Decimals', emoji: '🔢' },
  { id: 'geometry', label: 'Geometry', emoji: '📐' },
  { id: 'perimeter', label: 'Perimeter', emoji: '📏' },
  { id: 'wordproblem', label: 'Word Problems', emoji: '🧠' },
]

const GEOMETRY = [
  { name: 'Area', word: 'Area', desc: 'The space inside a shape. We measure it in square units.', emoji: '🟩', bg: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20', border: 'border-green-200 dark:border-green-800/50', accent: 'text-green-600 dark:text-green-400' },
  { name: 'Perimeter', word: 'Perimeter', desc: 'The distance around a shape.', emoji: '🔲', bg: 'from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20', border: 'border-blue-200 dark:border-blue-800/50', accent: 'text-blue-600 dark:text-blue-400' },
  { name: 'Volume', word: 'Volume', desc: 'The space inside a 3D shape.', emoji: '📦', bg: 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20', border: 'border-amber-200 dark:border-amber-800/50', accent: 'text-amber-600 dark:text-amber-400' },
  { name: 'Angle', word: 'Angle', desc: 'The turn between two lines. We measure in degrees.', emoji: '📐', bg: 'from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20', border: 'border-rose-200 dark:border-rose-800/50', accent: 'text-rose-600 dark:text-rose-400' },
  { name: 'Cube', word: 'Cube', desc: 'A 3D shape with 6 square faces.', emoji: '🧊', bg: 'from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20', border: 'border-cyan-200 dark:border-cyan-800/50', accent: 'text-cyan-600 dark:text-cyan-400' },
  { name: 'Sphere', word: 'Sphere', desc: 'A round 3D shape like a ball.', emoji: '⚽', bg: 'from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20', border: 'border-purple-200 dark:border-purple-800/50', accent: 'text-purple-600 dark:text-purple-400' },
  { name: 'Cylinder', word: 'Cylinder', desc: 'A 3D shape like a can or tube.', emoji: '🥫', bg: 'from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20', border: 'border-red-200 dark:border-red-800/50', accent: 'text-red-600 dark:text-red-400' },
]

const FRACTION_QUESTIONS = [
  { q: 'What is one half of 8?', ans: 4, hint: '½ of 8 = 8 ÷ 2' },
  { q: 'What is one half of 20?', ans: 10, hint: '½ of 20 = 20 ÷ 2' },
  { q: 'What is one quarter of 12? (¼ of 12)', ans: 3, hint: '¼ of 12 = 12 ÷ 4' },
  { q: 'What is one quarter of 8?', ans: 2, hint: '¼ of 8 = 8 ÷ 4' },
  { q: 'What is one third of 9? (⅓ of 9)', ans: 3, hint: '⅓ of 9 = 9 ÷ 3' },
  { q: 'What is one half of 14?', ans: 7, hint: '½ of 14 = 14 ÷ 2' },
]

const DECIMAL_QUESTIONS = [
  { q: 'Write 1/2 as a decimal:', ans: '0.5' },
  { q: 'Write 1/4 as a decimal:', ans: '0.25' },
  { q: 'Write 3/4 as a decimal:', ans: '0.75' },
  { q: 'What is 0.5 + 0.5?', ans: '1' },
  { q: 'What is 0.25 + 0.75?', ans: '1' },
  { q: 'What is 0.1 + 0.2?', ans: '0.3' },
  { q: 'What is 50% as a decimal?', ans: '0.5' },
  { q: 'What is 25% as a decimal?', ans: '0.25' },
  { q: 'What is 0.5 × 2?', ans: '1' },
  { q: 'What is 1.5 + 0.5?', ans: '2' },
]

const WORD_PROBLEMS = [
  { q: 'A rectangle has length 5 and width 3. What is the area? (Area = length × width)', ans: 15 },
  { q: 'A rectangle has length 8 and width 4. What is the area?', ans: 32 },
  { q: 'Maria has 24 stickers ⭐. She shares them equally among 4 friends. How many does each friend get?', ans: 6 },
  { q: 'A box has 5 rows of 6 apples 🍎. How many apples in total?', ans: 30 },
  { q: 'A train 🚂 travels 60 km per hour. How far does it travel in 3 hours?', ans: 180 },
  { q: 'A book 📖 has 120 pages. Sam reads 15 pages each day. How many days will it take to finish?', ans: 8 },
  { q: 'There are 45 students. The teacher puts them in groups of 9. How many groups are there?', ans: 5 },
  { q: 'A square garden 🌿 has sides of 7 meters. What is the perimeter? (4 × side)', ans: 28 },
  { q: 'A store sells pencils for $3 each. How much do 12 pencils cost?', ans: 36 },
  { q: 'Sara scores 85, 90, and 95 on three tests 📝. What is her total score?', ans: 270 },
  { q: 'A pizza 🍕 is cut into 8 equal slices. 3 people each eat 2 slices. How many slices are left?', ans: 2 },
  { q: 'A factory makes 250 toys 🧸 per day. How many toys in 4 days?', ans: 1000 },
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

export default function MathIntermediateModule() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('fractions')
  const [fracAnswer, setFracAnswer] = useState('')
  const [fracFeedback, setFracFeedback] = useState<'correct' | 'try-again' | null>(null)
  const [fracIndex, setFracIndex] = useState(0)
  const [shapeIndex, setShapeIndex] = useState(0)
  const [wpAnswer, setWpAnswer] = useState('')
  const [wpFeedback, setWpFeedback] = useState<'correct' | 'try-again' | null>(null)
  const [wpIndex, setWpIndex] = useState(0)
  const [perimAnswer, setPerimAnswer] = useState('')
  const [perimFeedback, setPerimFeedback] = useState<'correct' | 'try-again' | null>(null)
  const [perimLen, setPerimLen] = useState(6)
  const [perimWid, setPerimWid] = useState(4)
  const [decimalIndex, setDecimalIndex] = useState(0)
  const [decimalAnswer, setDecimalAnswer] = useState('')
  const [decimalFeedback, setDecimalFeedback] = useState<'correct' | 'try-again' | null>(null)
  const [showHint, setShowHint] = useState(false)

  const fractionQ = FRACTION_QUESTIONS[fracIndex % FRACTION_QUESTIONS.length]
  const wordProblem = WORD_PROBLEMS[wpIndex % WORD_PROBLEMS.length]
  const perimeterCorrect = 2 * perimLen + 2 * perimWid

  const checkFraction = () => {
    const num = parseInt(fracAnswer, 10)
    if (num === fractionQ.ans) {
      setFracFeedback('correct')
      setTimeout(() => { setFracIndex((i) => i + 1); setFracAnswer(''); setFracFeedback(null); setShowHint(false) }, 1000)
    } else setFracFeedback('try-again')
  }

  const checkWp = () => {
    const num = parseInt(wpAnswer, 10)
    if (num === wordProblem.ans) {
      setWpFeedback('correct')
      setTimeout(() => { setWpIndex((i) => i + 1); setWpAnswer(''); setWpFeedback(null) }, 1000)
    } else setWpFeedback('try-again')
  }

  const checkPerim = () => {
    const num = parseInt(perimAnswer, 10)
    if (num === perimeterCorrect) {
      setPerimFeedback('correct')
      setTimeout(() => { setPerimLen(4 + Math.floor(Math.random() * 5)); setPerimWid(2 + Math.floor(Math.random() * 4)); setPerimAnswer(''); setPerimFeedback(null) }, 1000)
    } else setPerimFeedback('try-again')
  }

  const clearFeedback = () => {
    setFracFeedback(null); setWpFeedback(null); setPerimFeedback(null); setDecimalFeedback(null); setShowHint(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-purple-50/40 dark:from-gray-900 dark:via-gray-900 dark:to-violet-950/20">
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
              <span className="text-2xl">🧠</span> Intermediate Math
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Ages 9–12 · Fractions, geometry & word problems</p>
          </div>
        </motion.header>

        {/* Tab Grid */}
        <nav className="mb-6">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {TAB_CONFIG.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); clearFeedback() }}
                className={`flex flex-col items-center gap-1 px-2 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                  tab === t.id
                    ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/25 scale-[1.02]'
                    : 'text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-900/20 border border-slate-200 dark:border-slate-700 shadow-sm'
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

              {/* Fractions */}
              {tab === 'fractions' && (
                <div className="space-y-6">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Vocabulary: <em>fraction, numerator, denominator, half, quarter, third</em>.</p>

                  {/* Visual fraction pie */}
                  <div className="flex items-center justify-center gap-2">
                    {Array.from({ length: fractionQ.q.includes('half') ? 2 : fractionQ.q.includes('quarter') ? 4 : 3 }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.08 }}
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
                          i === 0
                            ? 'bg-violet-500 text-white shadow-md'
                            : 'bg-slate-200 dark:bg-slate-600 text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {i === 0 ? '✓' : ''}
                      </motion.div>
                    ))}
                  </div>

                  <motion.div
                    key={fracIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 p-6 sm:p-8 border border-violet-200 dark:border-violet-800/50 text-center"
                  >
                    <p className="text-lg sm:text-xl font-medium text-slate-800 dark:text-white">{fractionQ.q}</p>
                    <AnimatePresence>
                      {showHint && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 text-violet-600 dark:text-violet-400 font-semibold"
                        >
                          💡 {fractionQ.hint}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <div className="flex items-center justify-center gap-3">
                    <input
                      type="number"
                      value={fracAnswer}
                      onChange={(e) => setFracAnswer(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && checkFraction()}
                      className="w-20 h-14 text-center text-2xl font-black rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-violet-400 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-800 outline-none transition-all"
                      placeholder="?"
                    />
                    <Button onClick={checkFraction} className="h-14 px-6 rounded-2xl bg-violet-500 hover:bg-violet-600 text-white font-bold shadow-lg shadow-violet-200 dark:shadow-violet-900/30">
                      <Sparkles className="w-4 h-4 mr-2" /> Check
                    </Button>
                  </div>

                  {fracFeedback === 'correct' && <FeedbackBanner type="correct">Correct! Great fraction work!</FeedbackBanner>}
                  {fracFeedback === 'try-again' && <FeedbackBanner type="try-again">Think: half = ÷2, quarter = ÷4, third = ÷3.</FeedbackBanner>}

                  <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" size="sm" className="rounded-2xl" onClick={() => setShowHint(true)}>
                      💡 Hint
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-2xl" onClick={() => { setFracIndex((i) => i + 1); setFracAnswer(''); setFracFeedback(null); setShowHint(false) }}>
                      <SkipForward className="w-3.5 h-3.5 mr-1.5" /> Skip
                    </Button>
                  </div>
                  <p className="text-xs text-slate-400 text-center">Question {(fracIndex % FRACTION_QUESTIONS.length) + 1} of {FRACTION_QUESTIONS.length}</p>
                </div>
              )}

              {/* Decimals */}
              {tab === 'decimals' && (
                <div className="space-y-6">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Vocabulary: <em>decimal point, percent, fraction</em>.</p>

                  {/* Reference card */}
                  <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-5 border border-blue-200 dark:border-blue-800/50">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400 mb-3">Quick Reference</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { frac: '½', dec: '0.5', pct: '50%' },
                        { frac: '¼', dec: '0.25', pct: '25%' },
                        { frac: '¾', dec: '0.75', pct: '75%' },
                      ].map((r) => (
                        <div key={r.frac} className="text-center p-2 rounded-xl bg-white/70 dark:bg-slate-800/50">
                          <p className="text-lg font-bold text-slate-800 dark:text-white">{r.frac}</p>
                          <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">{r.dec}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{r.pct}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Practice */}
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Practice</p>
                    <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">
                      {decimalIndex + 1} / {DECIMAL_QUESTIONS.length}
                    </span>
                  </div>
                  <motion.div
                    key={decimalIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-6 border border-indigo-200 dark:border-indigo-800/50 text-center"
                  >
                    <p className="text-lg sm:text-xl font-medium text-slate-800 dark:text-white">{DECIMAL_QUESTIONS[decimalIndex].q}</p>
                  </motion.div>

                  <div className="flex items-center justify-center gap-3">
                    <input
                      type="text"
                      value={decimalAnswer}
                      onChange={(e) => { setDecimalAnswer(e.target.value); setDecimalFeedback(null) }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const clean = decimalAnswer.trim()
                          const expected = DECIMAL_QUESTIONS[decimalIndex].ans
                          if (clean === expected || parseFloat(clean) === parseFloat(expected)) {
                            setDecimalFeedback('correct')
                            setTimeout(() => { setDecimalIndex((i) => (i + 1) % DECIMAL_QUESTIONS.length); setDecimalAnswer(''); setDecimalFeedback(null) }, 700)
                          } else setDecimalFeedback('try-again')
                        }
                      }}
                      className="w-24 h-14 text-center text-2xl font-black rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 outline-none transition-all"
                      placeholder="?"
                    />
                    <Button
                      onClick={() => {
                        const clean = decimalAnswer.trim()
                        const expected = DECIMAL_QUESTIONS[decimalIndex].ans
                        if (clean === expected || parseFloat(clean) === parseFloat(expected)) {
                          setDecimalFeedback('correct')
                          setTimeout(() => { setDecimalIndex((i) => (i + 1) % DECIMAL_QUESTIONS.length); setDecimalAnswer(''); setDecimalFeedback(null) }, 700)
                        } else setDecimalFeedback('try-again')
                      }}
                      className="h-14 px-6 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30"
                    >
                      <Sparkles className="w-4 h-4 mr-2" /> Check
                    </Button>
                  </div>

                  {decimalFeedback === 'correct' && <FeedbackBanner type="correct">Correct!</FeedbackBanner>}
                  {decimalFeedback === 'try-again' && <FeedbackBanner type="try-again">Not quite. Check the reference card above!</FeedbackBanner>}

                  <div className="text-center">
                    <Button variant="outline" size="sm" className="rounded-2xl" onClick={() => { setDecimalIndex((i) => (i + 1) % DECIMAL_QUESTIONS.length); setDecimalAnswer(''); setDecimalFeedback(null) }}>
                      <SkipForward className="w-3.5 h-3.5 mr-1.5" /> Skip
                    </Button>
                  </div>
                </div>
              )}

              {/* Geometry */}
              {tab === 'geometry' && (
                <div className="space-y-6">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Vocabulary: <em>area, perimeter, volume, angle, cube, sphere, cylinder</em>.</p>

                  {/* Shape cards grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {GEOMETRY.map((g, i) => (
                      <motion.button
                        key={g.name}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShapeIndex(i)}
                        className={`rounded-2xl p-3 text-center transition-all bg-gradient-to-br ${g.bg} border ${
                          shapeIndex === i
                            ? `${g.border} ring-2 ring-violet-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-800 shadow-lg`
                            : `${g.border} hover:shadow-md`
                        }`}
                      >
                        <div className="text-2xl mb-1">{g.emoji}</div>
                        <div className={`text-xs font-bold ${g.accent}`}>{g.word}</div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Selected shape detail */}
                  <motion.div
                    key={shapeIndex}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`rounded-2xl p-6 sm:p-8 bg-gradient-to-br ${GEOMETRY[shapeIndex].bg} border-2 ${GEOMETRY[shapeIndex].border}`}
                  >
                    <div className="text-center">
                      <span className="text-5xl">{GEOMETRY[shapeIndex].emoji}</span>
                      <p className={`text-2xl sm:text-3xl font-extrabold mt-3 ${GEOMETRY[shapeIndex].accent}`}>{GEOMETRY[shapeIndex].word}</p>
                      <p className="text-slate-600 dark:text-slate-300 mt-2 max-w-sm mx-auto">{GEOMETRY[shapeIndex].desc}</p>
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                    <Button variant="outline" onClick={() => setShapeIndex((i) => (i === 0 ? GEOMETRY.length - 1 : i - 1))} className="rounded-2xl h-11">
                      <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                    </Button>
                    <Button onClick={() => setShapeIndex((i) => (i === GEOMETRY.length - 1 ? 0 : i + 1))} className="rounded-2xl h-11 bg-violet-500 hover:bg-violet-600">
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Perimeter */}
              {tab === 'perimeter' && (
                <div className="space-y-6">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Perimeter = distance around. For a rectangle: <strong>2 × length + 2 × width</strong>.</p>

                  <motion.div
                    key={`${perimLen}-${perimWid}`}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-6 sm:p-8 border border-teal-200 dark:border-teal-800/50"
                  >
                    <div className="flex items-center justify-center mb-4">
                      <div className="relative border-4 border-dashed border-teal-400 dark:border-teal-500 rounded-lg" style={{ width: `${perimLen * 20}px`, height: `${perimWid * 20}px`, minWidth: 80, minHeight: 50 }}>
                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-teal-700 dark:text-teal-300">{perimLen}</span>
                        <span className="absolute top-1/2 -right-8 -translate-y-1/2 text-xs font-bold text-teal-700 dark:text-teal-300">{perimWid}</span>
                      </div>
                    </div>
                    <p className="text-center text-lg font-medium text-slate-800 dark:text-white mt-8">
                      Rectangle: length = <strong className="text-teal-600 dark:text-teal-400">{perimLen}</strong>, width = <strong className="text-teal-600 dark:text-teal-400">{perimWid}</strong>. What is the perimeter?
                    </p>
                  </motion.div>

                  <div className="flex items-center justify-center gap-3">
                    <input
                      type="number"
                      value={perimAnswer}
                      onChange={(e) => setPerimAnswer(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && checkPerim()}
                      className="w-20 h-14 text-center text-2xl font-black rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-teal-400 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-800 outline-none transition-all"
                      placeholder="?"
                    />
                    <Button onClick={checkPerim} className="h-14 px-6 rounded-2xl bg-teal-500 hover:bg-teal-600 text-white font-bold shadow-lg shadow-teal-200 dark:shadow-teal-900/30">
                      <Sparkles className="w-4 h-4 mr-2" /> Check
                    </Button>
                    <Button variant="outline" onClick={() => { setPerimLen(4 + Math.floor(Math.random() * 5)); setPerimWid(2 + Math.floor(Math.random() * 4)); setPerimAnswer(''); setPerimFeedback(null) }} className="h-14 px-4 rounded-2xl border-slate-200 dark:border-slate-600">
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>

                  {perimFeedback === 'correct' && <FeedbackBanner type="correct">Correct! 2×{perimLen} + 2×{perimWid} = {perimeterCorrect}!</FeedbackBanner>}
                  {perimFeedback === 'try-again' && <FeedbackBanner type="try-again">Add all four sides: {perimLen} + {perimLen} + {perimWid} + {perimWid}.</FeedbackBanner>}
                </div>
              )}

              {/* Word Problems */}
              {tab === 'wordproblem' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Multi-step problems. Find the key numbers!</p>
                    <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">
                      {(wpIndex % WORD_PROBLEMS.length) + 1} / {WORD_PROBLEMS.length}
                    </span>
                  </div>

                  <motion.div
                    key={wpIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 sm:p-8 border border-amber-200 dark:border-amber-800/50"
                  >
                    <p className="text-lg font-medium text-slate-800 dark:text-white leading-relaxed">{wordProblem.q}</p>
                  </motion.div>

                  <div className="flex items-center justify-center gap-3">
                    <input
                      type="number"
                      value={wpAnswer}
                      onChange={(e) => setWpAnswer(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && checkWp()}
                      className="w-24 h-14 text-center text-2xl font-black rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 outline-none transition-all"
                      placeholder="?"
                    />
                    <Button onClick={checkWp} className="h-14 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg shadow-amber-200 dark:shadow-amber-900/30">
                      <Sparkles className="w-4 h-4 mr-2" /> Check
                    </Button>
                  </div>

                  {wpFeedback === 'correct' && <FeedbackBanner type="correct">Correct! Awesome problem solving!</FeedbackBanner>}
                  {wpFeedback === 'try-again' && <FeedbackBanner type="try-again">Read again. Find the key numbers and operation.</FeedbackBanner>}

                  <div className="text-center">
                    <Button variant="outline" size="sm" onClick={() => { setWpIndex((i) => i + 1); setWpAnswer(''); setWpFeedback(null) }} className="rounded-2xl">
                      <SkipForward className="w-3.5 h-3.5 mr-1.5" /> Next Problem
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer tip */}
            <div className="px-5 sm:px-8 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <strong className="text-slate-600 dark:text-slate-300">💡 Tip for parents:</strong> Encourage your child to say each step in English: &quot;First I…, then I…&quot; for word problems. This builds math and language together.
              </p>
            </div>
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  )
}
