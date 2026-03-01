'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mascot } from '@/components/ui/mascot'
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
    { q: 'A box has 5 rows of 6 apples. How many apples in total? (Multiply)', ans: 30 },
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl space-y-4">
        <Button variant="ghost" onClick={() => router.push('/learning/math')} className="rounded-2xl bg-white/70">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Math
        </Button>

        <Card className="card-kid border-2 border-violet-200/70 shadow-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <Mascot emotion="excited" size="medium" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Intermediate (Ages 9–12)</h2>
                <p className="text-sm text-gray-600">Fractions, geometry & multi-step word problems in English</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {(['fractions', 'decimals', 'geometry', 'perimeter', 'wordproblem'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setFracFeedback(null); setWpFeedback(null); setPerimFeedback(null); }}
                  className={`px-3 py-1 rounded-full text-sm font-semibold border transition ${
                    tab === t ? 'bg-violet-500 text-white border-violet-500' : 'bg-white border-violet-200 hover:bg-violet-50'
                  }`}
                >
                  {t === 'fractions' ? 'Fractions' : t === 'decimals' ? 'Decimals' : t === 'geometry' ? 'Geometry' : t === 'perimeter' ? 'Perimeter' : 'Word problems'}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {tab === 'fractions' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-700">Vocabulary: fraction, numerator, denominator, half, quarter.</p>
                <div className="rounded-2xl bg-violet-50 p-6 border border-violet-200">
                  <p className="text-lg text-gray-800">{fractionQ.q}</p>
                  <p className="text-sm text-gray-600 mt-1">One half = ½. So ½ of 8 = ?</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="number"
                    value={fracAnswer}
                    onChange={(e) => setFracAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && checkFraction()}
                    className="w-24 rounded-xl border-2 border-violet-200 px-3 py-2 text-lg"
                    placeholder="?"
                  />
                  <Button onClick={checkFraction} className="rounded-2xl bg-violet-500 hover:bg-violet-600">Check</Button>
                </div>
                {fracFeedback === 'correct' && <p className="text-emerald-700 font-medium">Correct! Vocabulary: numerator, denominator, fraction.</p>}
                {fracFeedback === 'try-again' && <p className="text-amber-700 font-medium">Think: half = ÷2, quarter = ÷4, third = ÷3.</p>}
                <Button variant="outline" size="sm" onClick={() => { setFracIndex((i) => i + 1); setFracAnswer(''); setFracFeedback(null); }} className="rounded-2xl">Next question</Button>
              </div>
            )}

            {tab === 'decimals' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-700">Decimals and fractions: 0.5 = one half, 0.25 = one quarter. Vocabulary: decimal point, percent.</p>
                <div className="rounded-2xl bg-violet-50 p-6 border border-violet-200 space-y-2">
                  <p className="font-semibold text-gray-800">½ = 0.5 (zero point five)</p>
                  <p className="font-semibold text-gray-800">¼ = 0.25 (zero point two five)</p>
                  <p className="font-semibold text-gray-800">¾ = 0.75 (zero point seven five)</p>
                  <p className="text-sm text-gray-600 mt-2">We use a decimal point to write parts of a whole. 50% means half; 25% means one quarter.</p>
                </div>
              </div>
            )}

            {tab === 'geometry' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-700">Geometry vocabulary: area, perimeter, volume, angle, cube, sphere, cylinder.</p>
                <motion.div
                  key={shapeIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-violet-50 p-6 border-2 border-violet-200"
                >
                  <p className="text-2xl font-bold text-violet-900">{GEOMETRY[shapeIndex].word}</p>
                  <p className="text-gray-700 mt-2">{GEOMETRY[shapeIndex].desc}</p>
                </motion.div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setShapeIndex((i) => (i === 0 ? GEOMETRY.length - 1 : i - 1))} className="rounded-2xl">← Previous</Button>
                  <Button onClick={() => setShapeIndex((i) => (i === GEOMETRY.length - 1 ? 0 : i + 1))} className="rounded-2xl bg-violet-500">Next →</Button>
                </div>
              </div>
            )}

            {tab === 'perimeter' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-700">Perimeter = distance around. For a rectangle: 2 × length + 2 × width.</p>
                <div className="rounded-2xl bg-violet-50 p-6 border border-violet-200">
                  <p className="text-lg text-gray-800">A rectangle has length {perimLen} and width {perimWid}. What is the perimeter?</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input type="number" value={perimAnswer} onChange={(e) => setPerimAnswer(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkPerim()} className="w-24 rounded-xl border-2 border-violet-200 px-3 py-2 text-lg" placeholder="?" />
                  <Button onClick={checkPerim} className="rounded-2xl bg-violet-500">Check</Button>
                </div>
                {perimFeedback === 'correct' && <p className="text-emerald-700 font-medium">Correct! Perimeter = 2×{perimLen} + 2×{perimWid} = {perimeterCorrect}.</p>}
                {perimFeedback === 'try-again' && <p className="text-amber-700 font-medium">Add all four sides: length + length + width + width.</p>}
                <Button variant="outline" size="sm" onClick={() => { setPerimLen(4 + Math.floor(Math.random() * 5)); setPerimWid(2 + Math.floor(Math.random() * 4)); setPerimAnswer(''); setPerimFeedback(null); }} className="rounded-2xl">New rectangle</Button>
              </div>
            )}

            {tab === 'wordproblem' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-700">Multi-step problem. Vocabulary: solve, solution, step, area.</p>
                <div className="rounded-2xl bg-violet-50 p-6 border border-violet-200">
                  <p className="text-lg text-gray-800">{wordProblem.q}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="number"
                    value={wpAnswer}
                    onChange={(e) => setWpAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && checkWp()}
                    className="w-24 rounded-xl border-2 border-violet-200 px-3 py-2 text-lg"
                    placeholder="?"
                  />
                  <Button onClick={checkWp} className="rounded-2xl bg-violet-500 hover:bg-violet-600">Check</Button>
                </div>
                {wpFeedback === 'correct' && <p className="text-emerald-700 font-medium">Correct! Vocabulary: solve, solution, step.</p>}
                {wpFeedback === 'try-again' && <p className="text-amber-700 font-medium">Read the problem again. Find the key numbers and operation.</p>}
                <Button variant="outline" size="sm" onClick={() => { setWpIndex((i) => i + 1); setWpAnswer(''); setWpFeedback(null); }} className="rounded-2xl">Next problem</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
