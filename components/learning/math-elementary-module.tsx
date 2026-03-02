'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
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

  const tabLabels: Record<typeof tab, string> = {
    operations: 'Plus & Minus',
    making10: 'Making 10',
    time: 'Time',
    measure: 'Long/Short',
    wordproblem: 'Word problems',
    graph: 'Graph',
  }
  const tabsList = (['operations', 'making10', 'time', 'measure', 'wordproblem', 'graph'] as const)

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/50 via-white to-blue-50/30 dark:from-sky-950/20 dark:via-gray-900 dark:to-blue-950/20">
      <div className="max-w-3xl mx-auto px-4 py-6 md:py-8">
        <header className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.push('/learning/math')} className="rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-block w-1.5 h-8 rounded-full bg-gradient-to-b from-sky-500 to-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-white">Elementary</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Ages 6–8 · Operations, time & word problems</p>
              </div>
            </div>
          </div>
        </header>

        <nav className="flex gap-1.5 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {tabsList.map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setFeedback(null); setTimeFeedback(null); setWpFeedback(null); setMake10Feedback(null); setGraphFeedback(null); }}
              className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                tab === t ? 'bg-sky-600 text-white shadow-md shadow-sky-500/25 dark:bg-sky-500 dark:text-slate-900' : 'text-slate-600 dark:text-slate-400 bg-white/80 dark:bg-slate-800/60 hover:bg-sky-50 dark:hover:bg-sky-900/20 border border-slate-200/60 dark:border-slate-700/60'
              }`}
            >
              {tabLabels[t]}
            </button>
          ))}
        </nav>

        <main className="mt-6 rounded-2xl bg-white dark:bg-slate-800/80 shadow-xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden border-l-4 border-l-sky-500">
          <div className="p-6 md:p-8">
            {tab === 'operations' && (
              <div className="space-y-6">
                <p className="text-slate-600 dark:text-slate-300 text-sm">Addition and subtraction. Vocabulary: plus, minus, sum, difference.</p>
                <motion.div key={`${a}-${b}-${op}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl bg-sky-50 dark:bg-sky-900/20 p-6 border-2 border-sky-200/80 dark:border-sky-700/60">
                  <p className="text-2xl font-bold text-slate-800 dark:text-white tabular-nums">{a} {op} {b} = ?</p>
                </motion.div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="number"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && checkOperation()}
                    className="w-24 rounded-xl border-2 border-slate-200 dark:border-slate-600 dark:bg-slate-800/80 px-3 py-2 text-lg"
                    placeholder="?"
                  />
                  <Button onClick={checkOperation} className="rounded-xl bg-sky-600 hover:bg-sky-700">Check</Button>
                  <Button variant="outline" onClick={newOperation} className="rounded-xl border-slate-200 dark:border-slate-600">New</Button>
                </div>
                {feedback === 'correct' && <p className="text-emerald-600 dark:text-emerald-400 font-medium">Correct! The {op === '+' ? 'sum' : 'difference'} is {sum}.</p>}
                {feedback === 'try-again' && <p className="text-amber-600 dark:text-amber-400 font-medium">Try again. Use counting or a number line.</p>}
              </div>
            )}

            {tab === 'making10' && (
              <div className="space-y-6">
                <p className="text-slate-600 dark:text-slate-300 text-sm">Making 10: What number do you add to get 10?</p>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-700/50 p-6 border border-slate-200/60 dark:border-slate-600/60">
                  <p className="text-2xl font-bold text-slate-800 dark:text-white tabular-nums">{make10Num} + ? = 10</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input type="number" value={make10Answer} onChange={(e) => setMake10Answer(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkMake10()} className="w-20 rounded-xl border-2 border-slate-200 dark:border-slate-600 dark:bg-slate-800/80 px-3 py-2 text-lg" placeholder="?" />
                  <Button onClick={checkMake10} className="rounded-xl bg-sky-600 hover:bg-sky-700">Check</Button>
                  <Button variant="outline" onClick={() => { setMake10Num(randomInt(1, 9)); setMake10Answer(''); setMake10Feedback(null); }} className="rounded-xl border-slate-200 dark:border-slate-600">New</Button>
                </div>
                {make10Feedback === 'correct' && <p className="text-emerald-600 dark:text-emerald-400 font-medium">Yes! {make10Num} + {10 - make10Num} = 10.</p>}
                {make10Feedback === 'try-again' && <p className="text-amber-600 dark:text-amber-400 font-medium">Count from {make10Num} to 10. How many more?</p>}
              </div>
            )}

            {tab === 'time' && (
              <div className="space-y-6">
                <p className="text-slate-600 dark:text-slate-300 text-sm">Telling time: hour and half-hour. Vocabulary: clock, hour, minute.</p>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-700/50 p-6 border border-slate-200/60 dark:border-slate-600/60 text-center">
                  <p className="text-4xl font-mono font-bold text-slate-800 dark:text-white tabular-nums">{hour}:{halfHour ? '30' : '00'}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{halfHour ? 'half past' : "o'clock"} {['twelve','one','two','three','four','five','six','seven','eight','nine','ten','eleven'][hour % 12]}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setHour((h) => (h === 0 ? 11 : h - 1))} className="rounded-xl border-slate-200 dark:border-slate-600">Hour −</Button>
                  <Button variant="outline" onClick={() => setHour((h) => (h === 11 ? 0 : h + 1))} className="rounded-xl border-slate-200 dark:border-slate-600">Hour +</Button>
                  <Button variant="outline" onClick={() => setHalfHour((h) => !h)} className="rounded-xl border-slate-200 dark:border-slate-600">{halfHour ? 'Half past' : "O'clock"}</Button>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Say the time in English.</p>
              </div>
            )}

            {tab === 'wordproblem' && (
              <div className="space-y-6">
                <p className="text-slate-600 dark:text-slate-300 text-sm">Read the problem. Find the total or difference. Vocabulary: altogether, take away.</p>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-700/50 p-6 border border-slate-200/60 dark:border-slate-600/60">
                  <p className="text-lg text-slate-800 dark:text-white">{wordProblem.q}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input type="number" value={wpAnswer} onChange={(e) => setWpAnswer(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkWordProblem()} className="w-24 rounded-xl border-2 border-slate-200 dark:border-slate-600 dark:bg-slate-800/80 px-3 py-2 text-lg" placeholder="?" />
                  <Button onClick={checkWordProblem} className="rounded-xl bg-sky-600 hover:bg-sky-700">Check</Button>
                </div>
                {wpFeedback === 'correct' && <p className="text-emerald-600 dark:text-emerald-400 font-medium">Correct! Read the problem and find the total or take away.</p>}
                {wpFeedback === 'try-again' && <p className="text-amber-600 dark:text-amber-400 font-medium">Read again. Altogether = add. Left / take away = subtract.</p>}
                <Button variant="outline" size="sm" onClick={() => { setWpIndex((i) => i + 1); setWpAnswer(''); setWpFeedback(null); }} className="rounded-xl mt-2">Next problem</Button>
              </div>
            )}

            {tab === 'measure' && (
              <div className="space-y-6">
                <p className="text-slate-600 dark:text-slate-300 text-sm">Vocabulary: long, short, measure, ruler. Which bar is longer?</p>
                <div className="flex items-end justify-center gap-8 py-6">
                  <div className="text-center">
                    <div className="w-4 bg-sky-500 rounded-t mx-auto" style={{ height: 120 }} />
                    <p className="text-sm font-medium mt-2 text-slate-700 dark:text-slate-300">A</p>
                  </div>
                  <div className="text-center">
                    <div className="w-4 bg-amber-500 rounded-t mx-auto" style={{ height: 80 }} />
                    <p className="text-sm font-medium mt-2 text-slate-700 dark:text-slate-300">B</p>
                  </div>
                </div>
                <p className="text-center text-slate-600 dark:text-slate-300">Bar A is <strong>longer</strong>. Bar B is <strong>shorter</strong>. We can measure with a ruler.</p>
              </div>
            )}

            {tab === 'graph' && (
              <div className="space-y-6">
                <p className="text-slate-600 dark:text-slate-300 text-sm">Read the chart. How many fruit altogether? Vocabulary: graph, chart, total.</p>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-700/50 p-6 border border-slate-200/60 dark:border-slate-600/60">
                  <p className="font-semibold text-slate-800 dark:text-white mb-2">Fruit we have:</p>
                  <p className="text-slate-700 dark:text-slate-300">🍎 Apples: {graphData.apples}</p>
                  <p className="text-slate-700 dark:text-slate-300">🍌 Bananas: {graphData.bananas}</p>
                  <p className="text-slate-700 dark:text-slate-300">🍊 Oranges: {graphData.oranges}</p>
                </div>
                <p className="text-slate-700 dark:text-slate-300">How many pieces of fruit altogether?</p>
                <div className="flex flex-wrap items-center gap-2">
                  <input type="number" value={graphAnswer} onChange={(e) => setGraphAnswer(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkGraph()} className="w-24 rounded-xl border-2 border-slate-200 dark:border-slate-600 dark:bg-slate-800/80 px-3 py-2 text-lg" placeholder="?" />
                  <Button onClick={checkGraph} className="rounded-xl bg-sky-600 hover:bg-sky-700">Check</Button>
                </div>
                {graphFeedback === 'correct' && <p className="text-emerald-600 dark:text-emerald-400 font-medium">Correct! Total = {graphData.apples} + {graphData.bananas} + {graphData.oranges} = {graphTotal}.</p>}
                {graphFeedback === 'try-again' && <p className="text-amber-600 dark:text-amber-400 font-medium">Add apples + bananas + oranges.</p>}
              </div>
            )}
            <p className="mt-8 pt-4 border-t border-slate-200/60 dark:border-slate-600/60 text-xs text-slate-500 dark:text-slate-400">
              <strong className="text-slate-600 dark:text-slate-300">Tip for grown-ups:</strong> Ask your child to explain in English how they got the answer. &quot;I added 7 and 5&quot; or &quot;I took away 6.&quot;
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
