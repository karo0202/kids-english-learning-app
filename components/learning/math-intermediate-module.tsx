'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function MathIntermediateModule() {
  const router = useRouter()
  const [tab, setTab] = useState<'fractions' | 'decimals' | 'geometry' | 'wordproblem' | 'perimeter'>('fractions')
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

  const GEOMETRY = [
    { name: 'Area', word: 'Area', desc: 'The space inside a shape. We measure it in square units.' },
    { name: 'Perimeter', word: 'Perimeter', desc: 'The distance around a shape.' },
    { name: 'Volume', word: 'Volume', desc: 'The space inside a 3D shape.' },
    { name: 'Angle', word: 'Angle', desc: 'The turn between two lines. We measure in degrees.' },
    { name: 'Cube', word: 'Cube', desc: 'A 3D shape with 6 square faces.' },
    { name: 'Sphere', word: 'Sphere', desc: 'A round 3D shape like a ball.' },
    { name: 'Cylinder', word: 'Cylinder', desc: 'A 3D shape like a can or tube.' },
  ]

  const FRACTION_QUESTIONS = [
    { q: 'What is one half of 8?', ans: 4 },
    { q: 'What is one half of 20?', ans: 10 },
    { q: 'What is one quarter of 12? (¼ of 12)', ans: 3 },
    { q: 'What is one quarter of 8?', ans: 2 },
    { q: 'What is one third of 9? (⅓ of 9)', ans: 3 },
    { q: 'What is one half of 14?', ans: 7 },
  ]
  const fractionQ = FRACTION_QUESTIONS[fracIndex % FRACTION_QUESTIONS.length]

  const WORD_PROBLEMS = [
    { q: 'A rectangle has length 5 and width 3. What is the area? (Area = length × width)', ans: 15 },
    { q: 'A rectangle has length 8 and width 4. What is the area?', ans: 32 },
    { q: 'Maria has 24 stickers. She shares them equally among 4 friends. How many does each friend get?', ans: 6 },
    { q: 'A box has 5 rows of 6 apples. How many apples in total?', ans: 30 },
    { q: 'A train travels 60 km per hour. How far does it travel in 3 hours?', ans: 180 },
    { q: 'A book has 120 pages. Sam reads 15 pages each day. How many days will it take to finish?', ans: 8 },
    { q: 'There are 45 students. The teacher puts them in groups of 9. How many groups are there?', ans: 5 },
    { q: 'A square garden has sides of 7 meters. What is the perimeter? (4 × side)', ans: 28 },
    { q: 'A store sells pencils for $3 each. How much do 12 pencils cost?', ans: 36 },
    { q: 'Sara scores 85, 90, and 95 on three tests. What is her total score?', ans: 270 },
    { q: 'A pizza is cut into 8 equal slices. 3 people each eat 2 slices. How many slices are left?', ans: 2 },
    { q: 'A factory makes 250 toys per day. How many toys in 4 days?', ans: 1000 },
  ]
  const wordProblem = WORD_PROBLEMS[wpIndex % WORD_PROBLEMS.length]

  const perimeterCorrect = 2 * perimLen + 2 * perimWid

  const checkFraction = () => {
    const num = parseInt(fracAnswer, 10)
    if (num === fractionQ.ans) {
      setFracFeedback('correct')
      setTimeout(() => { setFracIndex((i) => i + 1); setFracAnswer(''); setFracFeedback(null); }, 1000)
    } else setFracFeedback('try-again')
  }

  const checkWp = () => {
    const num = parseInt(wpAnswer, 10)
    if (num === wordProblem.ans) {
      setWpFeedback('correct')
      setTimeout(() => { setWpIndex((i) => i + 1); setWpAnswer(''); setWpFeedback(null); }, 1000)
    } else setWpFeedback('try-again')
  }

  const checkPerim = () => {
    const num = parseInt(perimAnswer, 10)
    if (num === perimeterCorrect) {
      setPerimFeedback('correct')
      setTimeout(() => { setPerimLen(4 + Math.floor(Math.random() * 5)); setPerimWid(2 + Math.floor(Math.random() * 4)); setPerimAnswer(''); setPerimFeedback(null); }, 1000)
    } else setPerimFeedback('try-again')
  }

  const tabsList = (['fractions', 'decimals', 'geometry', 'perimeter', 'wordproblem'] as const)
  const tabLabels: Record<typeof tab, string> = {
    fractions: 'Fractions',
    decimals: 'Decimals',
    geometry: 'Geometry',
    perimeter: 'Perimeter',
    wordproblem: 'Word problems',
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50/50 via-white to-purple-50/30 dark:from-violet-950/20 dark:via-gray-900 dark:to-purple-950/20">
      <div className="max-w-3xl mx-auto px-4 py-6 md:py-8">
        <header className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.push('/learning/math')} className="rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-block w-1.5 h-8 rounded-full bg-gradient-to-b from-violet-500 to-purple-600" />
              <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-white">Intermediate</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Ages 9–12 · Fractions, geometry & word problems</p>
              </div>
            </div>
          </div>
        </header>

        <nav className="flex gap-1.5 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {tabsList.map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setFracFeedback(null); setWpFeedback(null); setPerimFeedback(null); }}
              className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                tab === t ? 'bg-violet-600 text-white shadow-md shadow-violet-500/25 dark:bg-violet-500 dark:text-slate-900' : 'text-slate-600 dark:text-slate-400 bg-white/80 dark:bg-slate-800/60 hover:bg-violet-50 dark:hover:bg-violet-900/20 border border-slate-200/60 dark:border-slate-700/60'
              }`}
            >
              {tabLabels[t]}
            </button>
          ))}
        </nav>

        <main className="mt-6 rounded-2xl bg-white dark:bg-slate-800/80 shadow-xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden border-l-4 border-l-violet-500">
          <div className="p-6 md:p-8">
            {tab === 'fractions' && (
              <div className="space-y-6">
                <p className="text-slate-600 dark:text-slate-300 text-sm">Vocabulary: fraction, numerator, denominator, half, quarter.</p>
                <div className="rounded-xl bg-violet-50 dark:bg-violet-900/20 p-6 border-2 border-violet-200/80 dark:border-violet-700/60">
                  <p className="text-lg text-slate-800 dark:text-white">{fractionQ.q}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">One half = ½. So ½ of 8 = ?</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input type="number" value={fracAnswer} onChange={(e) => setFracAnswer(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkFraction()} className="w-24 rounded-xl border-2 border-slate-200 dark:border-slate-600 dark:bg-slate-800/80 px-3 py-2 text-lg" placeholder="?" />
                  <Button onClick={checkFraction} className="rounded-xl bg-violet-600 hover:bg-violet-700">Check</Button>
                </div>
                {fracFeedback === 'correct' && <p className="text-emerald-600 dark:text-emerald-400 font-medium">Correct! Vocabulary: numerator, denominator, fraction.</p>}
                {fracFeedback === 'try-again' && <p className="text-amber-600 dark:text-amber-400 font-medium">Think: half = ÷2, quarter = ÷4, third = ÷3.</p>}
                <Button variant="outline" size="sm" onClick={() => { setFracIndex((i) => i + 1); setFracAnswer(''); setFracFeedback(null); }} className="rounded-xl mt-2">Next question</Button>
              </div>
            )}

            {tab === 'decimals' && (
              <div className="space-y-6">
                <p className="text-slate-600 dark:text-slate-300 text-sm">Decimals and fractions: 0.5 = one half, 0.25 = one quarter. Vocabulary: decimal point, percent.</p>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-700/50 p-6 border border-slate-200/60 dark:border-slate-600/60 space-y-2">
                  <p className="font-semibold text-slate-800 dark:text-white">½ = 0.5 (zero point five)</p>
                  <p className="font-semibold text-slate-800 dark:text-white">¼ = 0.25 (zero point two five)</p>
                  <p className="font-semibold text-slate-800 dark:text-white">¾ = 0.75 (zero point seven five)</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">We use a decimal point to write parts of a whole. 50% means half; 25% means one quarter.</p>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-600 pt-4">
                  <p className="font-semibold text-slate-800 dark:text-white mb-3">Practice ({decimalIndex + 1}/{DECIMAL_QUESTIONS.length}):</p>
                  <motion.div key={decimalIndex} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                    <p className="text-lg font-medium text-slate-800 dark:text-white">{DECIMAL_QUESTIONS[decimalIndex].q}</p>
                  </motion.div>
                  <div className="flex items-center justify-center gap-3 mt-3">
                    <input
                      type="text"
                      value={decimalAnswer}
                      onChange={(e) => { setDecimalAnswer(e.target.value); setDecimalFeedback(null) }}
                      className="w-28 h-12 text-center text-xl font-bold rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                      placeholder="?"
                    />
                    <Button onClick={() => {
                      const clean = decimalAnswer.trim()
                      const expected = DECIMAL_QUESTIONS[decimalIndex].ans
                      if (clean === expected || parseFloat(clean) === parseFloat(expected)) {
                        setDecimalFeedback('correct')
                        setTimeout(() => { setDecimalIndex((i) => (i + 1) % DECIMAL_QUESTIONS.length); setDecimalAnswer(''); setDecimalFeedback(null) }, 700)
                      } else { setDecimalFeedback('try-again') }
                    }} className="btn-primary-kid h-12 px-5">Check</Button>
                  </div>
                  {decimalFeedback === 'correct' && <p className="text-emerald-600 dark:text-emerald-400 font-medium text-center mt-2">Correct!</p>}
                  {decimalFeedback === 'try-again' && <p className="text-amber-600 dark:text-amber-400 font-medium text-center mt-2">Not quite. Try again!</p>}
                </div>
              </div>
            )}

            {tab === 'geometry' && (
              <div className="space-y-6">
                <p className="text-slate-600 dark:text-slate-300 text-sm">Geometry vocabulary: area, perimeter, volume, angle, cube, sphere, cylinder.</p>
                <motion.div key={shapeIndex} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-slate-100 dark:bg-slate-700/50 p-6 border-2 border-slate-200/60 dark:border-slate-600/60">
                  <p className="text-2xl font-bold text-violet-700 dark:text-violet-300">{GEOMETRY[shapeIndex].word}</p>
                  <p className="text-slate-700 dark:text-slate-300 mt-2">{GEOMETRY[shapeIndex].desc}</p>
                </motion.div>
                <div className="flex justify-between gap-2">
                  <Button variant="outline" onClick={() => setShapeIndex((i) => (i === 0 ? GEOMETRY.length - 1 : i - 1))} className="rounded-xl border-slate-200 dark:border-slate-600">← Previous</Button>
                  <Button onClick={() => setShapeIndex((i) => (i === GEOMETRY.length - 1 ? 0 : i + 1))} className="rounded-xl bg-violet-600 hover:bg-violet-700">Next →</Button>
                </div>
              </div>
            )}

            {tab === 'perimeter' && (
              <div className="space-y-6">
                <p className="text-slate-600 dark:text-slate-300 text-sm">Perimeter = distance around. For a rectangle: 2 × length + 2 × width.</p>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-700/50 p-6 border border-slate-200/60 dark:border-slate-600/60">
                  <p className="text-lg text-slate-800 dark:text-white">A rectangle has length {perimLen} and width {perimWid}. What is the perimeter?</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input type="number" value={perimAnswer} onChange={(e) => setPerimAnswer(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkPerim()} className="w-24 rounded-xl border-2 border-slate-200 dark:border-slate-600 dark:bg-slate-800/80 px-3 py-2 text-lg" placeholder="?" />
                  <Button onClick={checkPerim} className="rounded-xl bg-violet-600 hover:bg-violet-700">Check</Button>
                </div>
                {perimFeedback === 'correct' && <p className="text-emerald-600 dark:text-emerald-400 font-medium">Correct! Perimeter = 2×{perimLen} + 2×{perimWid} = {perimeterCorrect}.</p>}
                {perimFeedback === 'try-again' && <p className="text-amber-600 dark:text-amber-400 font-medium">Add all four sides: length + length + width + width.</p>}
                <Button variant="outline" size="sm" onClick={() => { setPerimLen(4 + Math.floor(Math.random() * 5)); setPerimWid(2 + Math.floor(Math.random() * 4)); setPerimAnswer(''); setPerimFeedback(null); }} className="rounded-xl mt-2">New rectangle</Button>
              </div>
            )}

            {tab === 'wordproblem' && (
              <div className="space-y-6">
                <p className="text-slate-600 dark:text-slate-300 text-sm">Multi-step problem. Vocabulary: solve, solution, step, area.</p>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-700/50 p-6 border border-slate-200/60 dark:border-slate-600/60">
                  <p className="text-lg text-slate-800 dark:text-white">{wordProblem.q}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input type="number" value={wpAnswer} onChange={(e) => setWpAnswer(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkWp()} className="w-24 rounded-xl border-2 border-slate-200 dark:border-slate-600 dark:bg-slate-800/80 px-3 py-2 text-lg" placeholder="?" />
                  <Button onClick={checkWp} className="rounded-xl bg-violet-600 hover:bg-violet-700">Check</Button>
                </div>
                {wpFeedback === 'correct' && <p className="text-emerald-600 dark:text-emerald-400 font-medium">Correct! Vocabulary: solve, solution, step.</p>}
                {wpFeedback === 'try-again' && <p className="text-amber-600 dark:text-amber-400 font-medium">Read the problem again. Find the key numbers and operation.</p>}
                <Button variant="outline" size="sm" onClick={() => { setWpIndex((i) => i + 1); setWpAnswer(''); setWpFeedback(null); }} className="rounded-xl mt-2">Next problem</Button>
              </div>
            )}
            <p className="mt-8 pt-4 border-t border-slate-200/60 dark:border-slate-600/60 text-xs text-slate-500 dark:text-slate-400">
              <strong className="text-slate-600 dark:text-slate-300">Tip for grown-ups:</strong> Encourage your child to say each step in English: &quot;First I…, then I…&quot; for word problems. This builds math and language together.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
