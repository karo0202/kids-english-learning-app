'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, RotateCcw, SkipForward, Sparkles } from 'lucide-react'

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

type Tab = 'operations' | 'making10' | 'time' | 'measure' | 'wordproblem' | 'graph'

const TAB_CONFIG: { id: Tab; label: string; emoji: string }[] = [
  { id: 'operations', label: 'Plus & Minus', emoji: '➕' },
  { id: 'making10', label: 'Making 10', emoji: '🎯' },
  { id: 'time', label: 'Time', emoji: '🕐' },
  { id: 'measure', label: 'Long / Short', emoji: '📏' },
  { id: 'wordproblem', label: 'Word Problems', emoji: '📝' },
  { id: 'graph', label: 'Graph', emoji: '📊' },
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

export default function MathElementaryModule() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('operations')
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
    { q: 'Anna has 7 apples 🍎. She buys 5 more. How many apples altogether?', ans: 12 },
    { q: 'Tom has 15 marbles. He gives 6 to his friend. How many are left?', ans: 9 },
    { q: 'There are 8 birds 🐦. 3 fly away. How many birds stay?', ans: 5 },
    { q: 'Lily has 4 pencils ✏️. Her mom gives her 9 more. How many in total?', ans: 13 },
    { q: 'A baker makes 12 cupcakes 🧁. He sells 7. How many cupcakes are left?', ans: 5 },
    { q: 'There are 6 red balloons 🎈 and 8 blue balloons. How many balloons in all?', ans: 14 },
    { q: 'Sara has 20 stickers ⭐. She gives 11 to her sister. How many does Sara have now?', ans: 9 },
    { q: 'A bus 🚌 has 9 passengers. At the next stop, 6 more people get on. How many passengers now?', ans: 15 },
    { q: 'You have 3 bags. Each bag has 5 toys 🧸. How many toys altogether?', ans: 15 },
    { q: 'A farmer collects 16 eggs 🥚. He uses 8 for breakfast. How many eggs are left?', ans: 8 },
    { q: 'There are 10 children in a park 🌳. 4 go home. Then 3 more arrive. How many children are in the park now?', ans: 9 },
    { q: 'Mom buys 2 packs of juice 🧃. Each pack has 6 bottles. How many bottles of juice in total?', ans: 12 },
  ]
  const wordProblem = WORD_PROBLEMS[wpIndex % WORD_PROBLEMS.length]

  const sum = op === '+' ? a + b : a - b
  const newOperation = () => {
    const add = Math.random() < 0.5
    setOp(add ? '+' : '-')
    if (add) {
      const x = randomInt(5, 50)
      const y = randomInt(5, 50)
      setA(x); setB(y)
    } else {
      const x = randomInt(10, 99)
      const y = randomInt(1, x - 1)
      setA(x); setB(y)
    }
    setAnswer(''); setFeedback(null)
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
      setTimeout(() => { setWpIndex((i) => i + 1); setWpFeedback(null); setWpAnswer('') }, 1000)
    } else setWpFeedback('try-again')
  }

  const graphData = { apples: 4, bananas: 7, oranges: 5 }
  const graphMax = Math.max(graphData.apples, graphData.bananas, graphData.oranges)
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
      setTimeout(() => { setMake10Num(randomInt(1, 9)); setMake10Answer(''); setMake10Feedback(null) }, 800)
    } else setMake10Feedback('try-again')
  }

  const clearFeedback = () => {
    setFeedback(null); setTimeFeedback(null); setWpFeedback(null); setMake10Feedback(null); setGraphFeedback(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50/40 dark:from-gray-900 dark:via-gray-900 dark:to-sky-950/20">
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
              <span className="text-2xl">🚀</span> Elementary Math
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Ages 6–8 · Operations, time & word problems</p>
          </div>
        </motion.header>

        {/* Tab Grid */}
        <nav className="mb-6">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {TAB_CONFIG.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); clearFeedback() }}
                className={`flex flex-col items-center gap-1 px-2 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                  tab === t.id
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25 scale-[1.02]'
                    : 'text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-900/20 border border-slate-200 dark:border-slate-700 shadow-sm'
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

              {/* Operations */}
              {tab === 'operations' && (
                <div className="space-y-6">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Addition and subtraction. Vocabulary: <em>plus, minus, sum, difference</em>.</p>
                  <motion.div
                    key={`${a}-${b}-${op}`}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 p-8 text-center text-white shadow-lg relative overflow-hidden"
                  >
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-3 right-5 text-5xl">✨</div>
                      <div className="absolute bottom-3 left-5 text-3xl">⭐</div>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Solve this</p>
                    <p className="text-5xl sm:text-6xl font-black tabular-nums">{a} {op} {b} = <span className="text-sky-200">?</span></p>
                  </motion.div>
                  <div className="flex items-center justify-center gap-3">
                    <input
                      type="number"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && checkOperation()}
                      className="w-20 h-14 text-center text-2xl font-black rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-800 outline-none transition-all"
                      placeholder="?"
                    />
                    <Button onClick={checkOperation} className="h-14 px-6 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-base shadow-lg shadow-sky-200 dark:shadow-sky-900/30">
                      <Sparkles className="w-4 h-4 mr-2" /> Check
                    </Button>
                    <Button variant="outline" onClick={newOperation} className="h-14 px-4 rounded-2xl border-slate-200 dark:border-slate-600">
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                  {feedback === 'correct' && <FeedbackBanner type="correct">Correct! The {op === '+' ? 'sum' : 'difference'} is {sum}.</FeedbackBanner>}
                  {feedback === 'try-again' && <FeedbackBanner type="try-again">Try again. Use counting or a number line.</FeedbackBanner>}
                </div>
              )}

              {/* Making 10 */}
              {tab === 'making10' && (
                <div className="space-y-6">
                  <p className="text-sm text-slate-500 dark:text-slate-400">What number do you add to make 10?</p>
                  <motion.div
                    key={make10Num}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 p-8 text-center text-white shadow-lg relative overflow-hidden"
                  >
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-3 left-5 text-5xl">🎯</div>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Target: 10</p>
                    <p className="text-5xl sm:text-6xl font-black tabular-nums">{make10Num} + <span className="text-orange-200">?</span> = 10</p>
                  </motion.div>
                  <div className="flex items-center justify-center gap-3">
                    <input
                      type="number"
                      value={make10Answer}
                      onChange={(e) => setMake10Answer(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && checkMake10()}
                      className="w-20 h-14 text-center text-2xl font-black rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-orange-400 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-800 outline-none transition-all"
                      placeholder="?"
                    />
                    <Button onClick={checkMake10} className="h-14 px-6 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg shadow-orange-200 dark:shadow-orange-900/30">
                      <Sparkles className="w-4 h-4 mr-2" /> Check
                    </Button>
                    <Button variant="outline" onClick={() => { setMake10Num(randomInt(1, 9)); setMake10Answer(''); setMake10Feedback(null) }} className="h-14 px-4 rounded-2xl border-slate-200 dark:border-slate-600">
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                  {/* Visual dots */}
                  <div className="flex items-center justify-center gap-1.5 flex-wrap max-w-xs mx-auto">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          i < make10Num
                            ? 'bg-orange-400 text-white shadow-sm'
                            : 'bg-slate-200 dark:bg-slate-600 text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  {make10Feedback === 'correct' && <FeedbackBanner type="correct">Yes! {make10Num} + {10 - make10Num} = 10!</FeedbackBanner>}
                  {make10Feedback === 'try-again' && <FeedbackBanner type="try-again">Count from {make10Num} to 10. How many more dots?</FeedbackBanner>}
                </div>
              )}

              {/* Time */}
              {tab === 'time' && (
                <div className="space-y-6">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Telling time: hour and half-hour. Vocabulary: <em>clock, hour, minute</em>.</p>
                  <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 sm:p-8 border border-indigo-100 dark:border-indigo-800/50 text-center">
                    <div className="text-7xl mb-3">🕐</div>
                    <p className="text-5xl font-mono font-black text-slate-800 dark:text-white tabular-nums">{hour}:{halfHour ? '30' : '00'}</p>
                    <p className="text-base text-slate-600 dark:text-slate-300 mt-3 font-semibold">What time is it? 🤔</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                    {(() => {
                      const hourNames = ['twelve','one','two','three','four','five','six','seven','eight','nine','ten','eleven']
                      const correctText = halfHour ? `half past ${hourNames[hour % 12]}` : `${hourNames[hour % 12]} o'clock`
                      const wrongHour1 = (hour + 2) % 12
                      const wrongHour2 = (hour + 5) % 12
                      const options = [
                        correctText,
                        halfHour ? `${hourNames[wrongHour1]} o'clock` : `half past ${hourNames[wrongHour1]}`,
                        `${hourNames[wrongHour2]} o'clock`,
                        halfHour ? `half past ${hourNames[wrongHour2]}` : `${hourNames[(hour + 3) % 12]} o'clock`
                      ].sort(() => Math.random() - 0.5)
                      return options.map((opt, i) => (
                        <motion.button
                          key={i}
                          whileTap={{ scale: 0.97 }}
                          className={`rounded-2xl border-2 py-3.5 font-semibold text-sm transition-all shadow-sm ${
                            timeFeedback === 'correct' && opt === correctText
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-400 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300'
                              : 'border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300'
                          }`}
                          onClick={() => {
                            if (opt === correctText) {
                              setTimeFeedback('correct')
                              setTimeout(() => { setHour(Math.floor(Math.random() * 12)); setHalfHour(Math.random() > 0.5); setTimeFeedback(null) }, 800)
                            } else setTimeFeedback('try-again')
                          }}
                        >{opt}</motion.button>
                      ))
                    })()}
                  </div>
                  {timeFeedback === 'correct' && <FeedbackBanner type="correct">Great job telling the time!</FeedbackBanner>}
                  {timeFeedback === 'try-again' && <FeedbackBanner type="try-again">Look at the clock again. Try another answer!</FeedbackBanner>}
                  <div className="text-center">
                    <Button variant="outline" size="sm" onClick={() => { setHour(Math.floor(Math.random() * 12)); setHalfHour(Math.random() > 0.5); setTimeFeedback(null) }} className="rounded-2xl">
                      <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> New Time
                    </Button>
                  </div>
                </div>
              )}

              {/* Measure */}
              {tab === 'measure' && (
                <div className="space-y-6">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Vocabulary: <em>long, short, tall, measure, ruler</em>. Compare the bars!</p>
                  <div className="rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-6 sm:p-8 border border-teal-100 dark:border-teal-800/50">
                    <div className="flex items-end justify-center gap-10 py-4">
                      <div className="text-center">
                        <motion.div
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          style={{ transformOrigin: 'bottom', height: 140 }}
                          className="w-12 bg-gradient-to-t from-sky-500 to-sky-400 rounded-t-xl mx-auto shadow-md"
                        />
                        <p className="text-base font-bold mt-3 text-sky-700 dark:text-sky-300">A</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Tall / Long</p>
                      </div>
                      <div className="text-center">
                        <motion.div
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ delay: 0.1 }}
                          style={{ transformOrigin: 'bottom', height: 80 }}
                          className="w-12 bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-xl mx-auto shadow-md"
                        />
                        <p className="text-base font-bold mt-3 text-amber-700 dark:text-amber-300">B</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Short</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 text-center">
                    <p className="text-slate-700 dark:text-slate-300">
                      Bar A is <strong className="text-sky-600 dark:text-sky-400">longer</strong>. 
                      Bar B is <strong className="text-amber-600 dark:text-amber-400">shorter</strong>. 
                      We can measure with a <strong>ruler</strong> 📏.
                    </p>
                  </div>
                </div>
              )}

              {/* Word Problems */}
              {tab === 'wordproblem' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Read the problem. Find the answer!</p>
                    <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">
                      {(wpIndex % WORD_PROBLEMS.length) + 1} / {WORD_PROBLEMS.length}
                    </span>
                  </div>
                  <motion.div
                    key={wpIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 sm:p-8 border border-green-200 dark:border-green-800/50"
                  >
                    <p className="text-lg font-medium text-slate-800 dark:text-white leading-relaxed">{wordProblem.q}</p>
                  </motion.div>
                  <div className="flex items-center justify-center gap-3">
                    <input
                      type="number"
                      value={wpAnswer}
                      onChange={(e) => setWpAnswer(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && checkWordProblem()}
                      className="w-20 h-14 text-center text-2xl font-black rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-green-400 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 outline-none transition-all"
                      placeholder="?"
                    />
                    <Button onClick={checkWordProblem} className="h-14 px-6 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold shadow-lg shadow-green-200 dark:shadow-green-900/30">
                      <Sparkles className="w-4 h-4 mr-2" /> Check
                    </Button>
                  </div>
                  {wpFeedback === 'correct' && <FeedbackBanner type="correct">Correct! Great math thinking!</FeedbackBanner>}
                  {wpFeedback === 'try-again' && <FeedbackBanner type="try-again">Read again. &quot;Altogether&quot; = add. &quot;Left&quot; = subtract.</FeedbackBanner>}
                  <div className="text-center">
                    <Button variant="outline" size="sm" onClick={() => { setWpIndex((i) => i + 1); setWpAnswer(''); setWpFeedback(null) }} className="rounded-2xl">
                      <SkipForward className="w-3.5 h-3.5 mr-1.5" /> Next Problem
                    </Button>
                  </div>
                </div>
              )}

              {/* Graph */}
              {tab === 'graph' && (
                <div className="space-y-6">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Read the chart. How many fruit altogether? Vocabulary: <em>graph, chart, total</em>.</p>
                  <div className="rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 p-6 border border-pink-200 dark:border-pink-800/50">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Fruit We Have 🍎🍌🍊</p>
                    <div className="space-y-3">
                      {[
                        { label: '🍎 Apples', count: graphData.apples, color: 'bg-red-400' },
                        { label: '🍌 Bananas', count: graphData.bananas, color: 'bg-yellow-400' },
                        { label: '🍊 Oranges', count: graphData.oranges, color: 'bg-orange-400' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-3">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 w-24 shrink-0">{item.label}</span>
                          <div className="flex-1 h-8 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(item.count / graphMax) * 100}%` }}
                              transition={{ duration: 0.6, ease: 'easeOut' }}
                              className={`h-full ${item.color} rounded-full flex items-center justify-end pr-2`}
                            >
                              <span className="text-xs font-bold text-white">{item.count}</span>
                            </motion.div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-base font-bold text-slate-800 dark:text-white text-center">How many pieces of fruit altogether? 🧐</p>
                  <div className="flex items-center justify-center gap-3">
                    <input
                      type="number"
                      value={graphAnswer}
                      onChange={(e) => setGraphAnswer(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && checkGraph()}
                      className="w-20 h-14 text-center text-2xl font-black rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-pink-400 focus:ring-2 focus:ring-pink-200 dark:focus:ring-pink-800 outline-none transition-all"
                      placeholder="?"
                    />
                    <Button onClick={checkGraph} className="h-14 px-6 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold shadow-lg shadow-pink-200 dark:shadow-pink-900/30">
                      <Sparkles className="w-4 h-4 mr-2" /> Check
                    </Button>
                  </div>
                  {graphFeedback === 'correct' && <FeedbackBanner type="correct">Correct! {graphData.apples} + {graphData.bananas} + {graphData.oranges} = {graphTotal}!</FeedbackBanner>}
                  {graphFeedback === 'try-again' && <FeedbackBanner type="try-again">Add all the fruit: apples + bananas + oranges.</FeedbackBanner>}
                </div>
              )}
            </div>

            {/* Footer tip */}
            <div className="px-5 sm:px-8 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <strong className="text-slate-600 dark:text-slate-300">💡 Tip for parents:</strong> Ask your child to explain in English how they got the answer. &quot;I added 7 and 5&quot; or &quot;I took away 6.&quot;
              </p>
            </div>
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  )
}
