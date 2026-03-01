'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mascot } from '@/components/ui/mascot'
import { ArrowLeft } from 'lucide-react'

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

export default function MathElementaryModule() {
  const router = useRouter()
  const [tab, setTab] = useState<'operations' | 'making10' | 'time' | 'measure' | 'wordproblem' | 'graph'>('operations')
  const [a, setA] = useState(12)
  const [b, setB] = useState(7)
  const [op, setOp] = useState<'+' | '-'>('+')
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'try-again' | null>(null)
  const [hour, setHour] = useState(3)
  const [halfHour, setHalfHour] = useState(false)
  const [timeFeedback, setTimeFeedback] = useState<'correct' | 'try-again' | null>(null)
  const [wpAnswer, setWpAnswer] = useState('')
  const [wpFeedback, setWpFeedback] = useState<'correct' | 'try-again' | null>(null)
  const [wpIndex, setWpIndex] = useState(0)
  const [make10Num, setMake10Num] = useState(7)
  const [make10Answer, setMake10Answer] = useState('')
  const [make10Feedback, setMake10Feedback] = useState<'correct' | 'try-again' | null>(null)
  const [graphAnswer, setGraphAnswer] = useState('')
  const [graphFeedback, setGraphFeedback] = useState<'correct' | 'try-again' | null>(null)

  const WORD_PROBLEMS = [
    { q: 'Anna has 7 apples. She buys 5 more. How many apples altogether?', ans: 12 },
    { q: 'Tom has 15 marbles. He gives 6 to his friend. How many are left? (Take away)', ans: 9 },
    { q: 'There are 8 birds. 3 fly away. How many birds stay?', ans: 5 },
    { q: 'Lily has 4 pencils. Her mom gives her 9 more. How many in total?', ans: 13 },
  ]
  const wordProblem = WORD_PROBLEMS[wpIndex % WORD_PROBLEMS.length]

  const sum = op === '+' ? a + b : a - b
  const timeStr = `${hour}:${halfHour ? '30' : '00'}`

  const newOperation = () => {
    const add = Math.random() < 0.5
    setOp(add ? '+' : '-')
    if (add) {
      const x = randomInt(5, 50)
      const y = randomInt(5, 50)
      setA(x)
      setB(y)
    } else {
      const x = randomInt(10, 99)
      const y = randomInt(1, x - 1)
      setA(x)
      setB(y)
    }
    setAnswer('')
    setFeedback(null)
  }

  const checkOperation = () => {
    const num = parseInt(answer, 10)
    if (num === sum) {
      setFeedback('correct')
      setTimeout(newOperation, 800)
    } else setFeedback('try-again')
  }

  const checkWordProblem = () => {
    const num = parseInt(wpAnswer, 10)
    if (num === wordProblem.ans) {
      setWpFeedback('correct')
      setTimeout(() => { setWpIndex((i) => i + 1); setWpFeedback(null); setWpAnswer(''); }, 1000)
    } else setWpFeedback('try-again')
  }

  const graphData = { apples: 4, bananas: 7, oranges: 5 }
  const graphTotal = graphData.apples + graphData.bananas + graphData.oranges
  const checkGraph = () => {
    const num = parseInt(graphAnswer, 10)
    if (num === graphTotal) setGraphFeedback('correct')
    else setGraphFeedback('try-again')
  }

  const checkMake10 = () => {
    const num = parseInt(make10Answer, 10)
    if (num === 10 - make10Num) {
      setMake10Feedback('correct')
      setTimeout(() => { setMake10Num(randomInt(1, 9)); setMake10Answer(''); setMake10Feedback(null); }, 800)
    } else setMake10Feedback('try-again')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl space-y-4">
        <Button variant="ghost" onClick={() => router.push('/learning/math')} className="rounded-2xl bg-white/70">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Math
        </Button>

        <Card className="card-kid border-2 border-sky-200/70 shadow-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <Mascot emotion="excited" size="medium" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Elementary (Ages 6–8)</h2>
                <p className="text-sm text-gray-600">Operations, time, measurement & word problems in English</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {(['operations', 'making10', 'time', 'measure', 'wordproblem', 'graph'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setFeedback(null); setTimeFeedback(null); setWpFeedback(null); setMake10Feedback(null); setGraphFeedback(null); }}
                  className={`px-3 py-1 rounded-full text-sm font-semibold border transition ${
                    tab === t ? 'bg-sky-500 text-white border-sky-500' : 'bg-white border-sky-200 hover:bg-sky-50'
                  }`}
                >
                  {t === 'operations' ? 'Plus & Minus' : t === 'making10' ? 'Making 10' : t === 'time' ? 'Time' : t === 'measure' ? 'Long/Short' : t === 'wordproblem' ? 'Word problems' : 'Graph'}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {tab === 'operations' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-700">Addition and subtraction. Vocabulary: plus, minus, sum, difference.</p>
                <motion.div key={`${a}-${b}-${op}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl bg-sky-50 p-6 border border-sky-200">
                  <p className="text-2xl font-bold text-gray-900">{a} {op} {b} = ?</p>
                </motion.div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="number"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && checkOperation()}
                    className="w-24 rounded-xl border-2 border-sky-200 px-3 py-2 text-lg"
                    placeholder="?"
                  />
                  <Button onClick={checkOperation} className="rounded-2xl bg-sky-500 hover:bg-sky-600">Check</Button>
                  <Button variant="outline" onClick={newOperation} className="rounded-2xl">New</Button>
                </div>
                {feedback === 'correct' && <p className="text-emerald-700 font-medium">Correct! The {op === '+' ? 'sum' : 'difference'} is {sum}.</p>}
                {feedback === 'try-again' && <p className="text-amber-700 font-medium">Try again. Use counting or a number line.</p>}
              </div>
            )}

            {tab === 'making10' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-700">Making 10: What number do you add to get 10? Vocabulary: plus, equals, ten.</p>
                <div className="rounded-2xl bg-sky-50 p-6 border border-sky-200">
                  <p className="text-2xl font-bold text-gray-900">{make10Num} + ? = 10</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="number"
                    value={make10Answer}
                    onChange={(e) => setMake10Answer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && checkMake10()}
                    className="w-20 rounded-xl border-2 border-sky-200 px-3 py-2 text-lg"
                    placeholder="?"
                  />
                  <Button onClick={checkMake10} className="rounded-2xl bg-sky-500">Check</Button>
                  <Button variant="outline" onClick={() => { setMake10Num(randomInt(1, 9)); setMake10Answer(''); setMake10Feedback(null); }} className="rounded-2xl">New</Button>
                </div>
                {make10Feedback === 'correct' && <p className="text-emerald-700 font-medium">Yes! {make10Num} + {10 - make10Num} = 10.</p>}
                {make10Feedback === 'try-again' && <p className="text-amber-700 font-medium">Count from {make10Num} to 10. How many more?</p>}
              </div>
            )}

            {tab === 'time' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-700">Telling time: hour and half-hour. Vocabulary: clock, hour, minute.</p>
                <div className="rounded-2xl bg-sky-50 p-6 border border-sky-200 text-center">
                  <p className="text-4xl font-mono font-bold text-gray-900">{hour}:{halfHour ? '30' : '00'}</p>
                  <p className="text-sm text-gray-600 mt-1">{halfHour ? 'half past' : "o'clock"} {['twelve','one','two','three','four','five','six','seven','eight','nine','ten','eleven'][hour % 12]}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setHour((h) => (h === 0 ? 11 : h - 1))} className="rounded-2xl">Hour −</Button>
                  <Button variant="outline" onClick={() => setHour((h) => (h === 11 ? 0 : h + 1))} className="rounded-2xl">Hour +</Button>
                  <Button variant="outline" onClick={() => setHalfHour((h) => !h)} className="rounded-2xl">{halfHour ? 'Half past' : 'O\'clock'}</Button>
                </div>
                <p className="text-sm text-gray-600">Say the time in English: &quot;It is three o&apos;clock&quot; or &quot;It is half past three.&quot;</p>
              </div>
            )}

            {tab === 'wordproblem' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-700">Read the problem. Find the total or difference. Vocabulary: altogether, take away.</p>
                <div className="rounded-2xl bg-sky-50 p-6 border border-sky-200">
                  <p className="text-lg text-gray-800">{wordProblem.q}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="number"
                    value={wpAnswer}
                    onChange={(e) => setWpAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && checkWordProblem()}
                    className="w-24 rounded-xl border-2 border-sky-200 px-3 py-2 text-lg"
                    placeholder="?"
                  />
                  <Button onClick={checkWordProblem} className="rounded-2xl bg-sky-500 hover:bg-sky-600">Check</Button>
                </div>
                {wpFeedback === 'correct' && <p className="text-emerald-700 font-medium">Correct! Read the problem and find the total or take away.</p>}
                {wpFeedback === 'try-again' && <p className="text-amber-700 font-medium">Read again. Altogether = add. Left / take away = subtract.</p>}
                <Button variant="outline" size="sm" onClick={() => { setWpIndex((i) => i + 1); setWpAnswer(''); setWpFeedback(null); }} className="rounded-2xl">Next problem</Button>
              </div>
            )}

            {tab === 'measure' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-700">Vocabulary: long, short, measure, ruler. Which bar is longer?</p>
                <div className="flex items-end justify-center gap-8 py-6">
                  <div className="text-center">
                    <div className="w-4 bg-sky-500 rounded-t mx-auto" style={{ height: 120 }} />
                    <p className="text-sm font-medium mt-2">A</p>
                  </div>
                  <div className="text-center">
                    <div className="w-4 bg-amber-500 rounded-t mx-auto" style={{ height: 80 }} />
                    <p className="text-sm font-medium mt-2">B</p>
                  </div>
                </div>
                <p className="text-center text-gray-700">Bar A is <strong>longer</strong>. Bar B is <strong>shorter</strong>. We can measure with a ruler.</p>
              </div>
            )}

            {tab === 'graph' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-700">Read the chart. How many fruit altogether? Vocabulary: graph, chart, total.</p>
                <div className="rounded-2xl bg-sky-50 p-6 border border-sky-200">
                  <p className="font-semibold text-gray-800 mb-2">Fruit we have:</p>
                  <p>🍎 Apples: {graphData.apples}</p>
                  <p>🍌 Bananas: {graphData.bananas}</p>
                  <p>🍊 Oranges: {graphData.oranges}</p>
                </div>
                <p className="text-gray-700">How many pieces of fruit altogether?</p>
                <div className="flex flex-wrap items-center gap-2">
                  <input type="number" value={graphAnswer} onChange={(e) => setGraphAnswer(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkGraph()} className="w-24 rounded-xl border-2 border-sky-200 px-3 py-2 text-lg" placeholder="?" />
                  <Button onClick={checkGraph} className="rounded-2xl bg-sky-500">Check</Button>
                </div>
                {graphFeedback === 'correct' && <p className="text-emerald-700 font-medium">Correct! Total = {graphData.apples} + {graphData.bananas} + {graphData.oranges} = {graphTotal}.</p>}
                {graphFeedback === 'try-again' && <p className="text-amber-700 font-medium">Add apples + bananas + oranges.</p>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
