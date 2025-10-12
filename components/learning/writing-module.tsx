
'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Mascot } from '@/components/ui/mascot'
import { ProgressRing } from '@/components/ui/progress-ring'
import { 
  PenTool, RefreshCw, CheckCircle, ArrowLeft, Star, 
  Trophy, Shuffle, RotateCcw, Lightbulb, Target
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { audioManager } from '@/lib/audio'
import { progressManager } from '@/lib/progress'
import { challengeManager } from '@/lib/challenges'

interface TracingLetter {
  letter: string
  paths: string[]
  color: string
}

interface WordBuildingWord {
  word: string
  letters: string[]
  hint: string
  imageUrl?: string
}

export default function WritingModule() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activityType, setActivityType] = useState<'tracing' | 'wordbuilder' | 'sentences' | 'creative'>('tracing')
  const [currentLetter, setCurrentLetter] = useState<TracingLetter | null>(null)
  const [letterIndex, setLetterIndex] = useState(0)
  const [currentWord, setCurrentWord] = useState<WordBuildingWord | null>(null)
  const [wordBank, setWordBank] = useState<WordBuildingWord[] | null>(null)
  const [score, setScore] = useState(0)
  const [completedActivities, setCompletedActivities] = useState(0)
  const [totalActivities] = useState(8)
  const [isDrawing, setIsDrawing] = useState(false)
  const [builderLetters, setBuilderLetters] = useState<string[]>([])
  const [builtWord, setBuiltWord] = useState<string[]>([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [strokeLength, setStrokeLength] = useState(0)
  const [strokesCompleted, setStrokesCompleted] = useState(0)
  const [requiredStrokes, setRequiredStrokes] = useState(1)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const drawStartTimeRef = useRef<number | null>(null)
  const visitedCellsRef = useRef<Set<string>>(new Set())

  // Redraw the guide whenever letter or stroke step changes
  useEffect(() => {
    drawLetterGuide()
  }, [currentLetter, strokesCompleted, requiredStrokes])

  // Sentence Puzzles state
  const defaultSentenceBank = [
    'THE CAT IS BIG',
    'I LIKE RED APPLES',
    'THE SUN IS BRIGHT',
    'BIRDS FLY IN SKY',
    'PLEASE CLOSE THE DOOR',
    'FISH SWIM IN WATER'
  ]
  const [sentences, setSentences] = useState<string[] | null>(null)
  const [sentenceIndex, setSentenceIndex] = useState(0)
  const [currentSentence, setCurrentSentence] = useState<string | null>(null)
  const [scrambledWords, setScrambledWords] = useState<string[]>([])
  const [chosenWords, setChosenWords] = useState<string[]>([])

  // Creative Writing state
  interface WritingPrompt { title: string; prompt: string; words?: string[] }
  const defaultPrompts: WritingPrompt[] = [
    { title: 'A Day at the Park', prompt: 'Write a short story about a fun day at the park with your friends.', words: ['play', 'tree', 'slide', 'sunny'] },
    { title: 'My Magic Pet', prompt: 'Imagine you have a magic pet. What can it do? What adventures do you have together?', words: ['magic', 'friend', 'fly', 'secret'] },
    { title: 'Rainy Day', prompt: 'It is raining outside. Describe what you do at home and how you feel.', words: ['rain', 'window', 'warm', 'music'] }
  ]
  const [prompts, setPrompts] = useState<WritingPrompt[] | null>(null)
  const [promptIndex, setPromptIndex] = useState(0)
  const [currentPrompt, setCurrentPrompt] = useState<WritingPrompt | null>(null)
  const [storyText, setStoryText] = useState('')

  const TRACING_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#14B8A6', '#F97316', '#EC4899']
  
  // Stroke patterns for each letter - defines how many strokes and their characteristics
  const letterStrokePatterns: { [key: string]: { strokes: number; description: string; difficulty: 'easy' | 'medium' | 'hard' } } = {
    'A': { strokes: 2, description: 'Triangle shape, horizontal crossbar', difficulty: 'medium' },
    'B': { strokes: 2, description: 'Vertical line, two semicircles', difficulty: 'hard' },
    'C': { strokes: 1, description: 'Curved line (open circle)', difficulty: 'easy' },
    'D': { strokes: 2, description: 'Vertical line, semicircle', difficulty: 'medium' },
    'E': { strokes: 3, description: 'Vertical line, top horizontal, middle horizontal, bottom horizontal', difficulty: 'medium' },
    'F': { strokes: 2, description: 'Vertical line, top horizontal, middle horizontal', difficulty: 'medium' },
    'G': { strokes: 2, description: 'Curved line, horizontal line', difficulty: 'hard' },
    'H': { strokes: 2, description: 'Left vertical, right vertical, horizontal crossbar', difficulty: 'medium' },
    'I': { strokes: 2, description: 'Top dot, vertical line, bottom dot', difficulty: 'easy' },
    'J': { strokes: 2, description: 'Curved line, horizontal line', difficulty: 'medium' },
    'K': { strokes: 2, description: 'Vertical line, two diagonal lines', difficulty: 'hard' },
    'L': { strokes: 2, description: 'Vertical line, horizontal line', difficulty: 'easy' },
    'M': { strokes: 3, description: 'Left vertical, diagonal down, diagonal up, right vertical', difficulty: 'hard' },
    'N': { strokes: 2, description: 'Left vertical, diagonal line, right vertical', difficulty: 'medium' },
    'O': { strokes: 1, description: 'Curved line (circle)', difficulty: 'easy' },
    'P': { strokes: 2, description: 'Vertical line, semicircle', difficulty: 'medium' },
    'Q': { strokes: 2, description: 'Circle, diagonal line', difficulty: 'hard' },
    'R': { strokes: 2, description: 'Vertical line, semicircle with diagonal', difficulty: 'hard' },
    'S': { strokes: 1, description: 'Curved line (S-shape)', difficulty: 'medium' },
    'T': { strokes: 2, description: 'Horizontal line, vertical line', difficulty: 'easy' },
    'U': { strokes: 2, description: 'Two vertical lines, curved bottom', difficulty: 'medium' },
    'V': { strokes: 2, description: 'Left diagonal, right diagonal', difficulty: 'easy' },
    'W': { strokes: 3, description: 'Left diagonal, right diagonal, left diagonal, right diagonal', difficulty: 'hard' },
    'X': { strokes: 2, description: 'Left diagonal, right diagonal', difficulty: 'easy' },
    'Y': { strokes: 2, description: 'Two diagonal lines, vertical line', difficulty: 'medium' },
    'Z': { strokes: 2, description: 'Top horizontal, diagonal line, bottom horizontal', difficulty: 'medium' }
  }

  const tracingLetters: TracingLetter[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter, idx) => ({
    letter,
    paths: [],
    color: TRACING_COLORS[idx % TRACING_COLORS.length]
  }))

  const defaultWordBuildingWords: WordBuildingWord[] = [
    {
      word: 'CAT',
      letters: ['C', 'A', 'T', 'D', 'O', 'G'],
      hint: 'A furry pet that says "meow"',
      imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200'
    },
    {
      word: 'SUN',
      letters: ['S', 'U', 'N', 'M', 'O', 'R'],
      hint: 'Bright star in the sky',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200'
    },
    {
      word: 'TREE',
      letters: ['T', 'R', 'E', 'E', 'F', 'L'],
      hint: 'Green plant with branches',
      imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200'
    }
  ]

  useEffect(() => {
    // Load large word list for Word Builder from public JSON (optional)
    const loadWords = async () => {
      try {
        const res = await fetch('/wordbuilder_words.json', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            // Normalize and keep only safe fields
            const normalized: WordBuildingWord[] = data
              .filter((w: any) => typeof w?.word === 'string' && w.word.length >= 3)
              .map((w: any) => ({
                word: String(w.word).toUpperCase(),
                letters: Array.from(String(w.word).toUpperCase()),
                hint: w.hint ? String(w.hint) : `Build the word: ${String(w.word).toUpperCase()}`,
                imageUrl: w.imageUrl ? String(w.imageUrl) : undefined
              }))
            setWordBank(normalized)
          } else {
            setWordBank(defaultWordBuildingWords)
          }
        } else {
          setWordBank(defaultWordBuildingWords)
        }
      } catch {
        setWordBank(defaultWordBuildingWords)
      }
    }

    const loadSentences = async () => {
      try {
        const res = await fetch('/sentences.json', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            const normalized = data
              .filter((s: any) => typeof s === 'string' && s.trim().length > 0)
              .map((s: string) => s.toUpperCase().replace(/\s+/g, ' ').trim())
            setSentences(normalized)
          } else {
            setSentences(defaultSentenceBank)
          }
        } else {
          setSentences(defaultSentenceBank)
        }
      } catch {
        setSentences(defaultSentenceBank)
      }
    }

    const loadPrompts = async () => {
      try {
        const res = await fetch('/prompts.json', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            const normalized: WritingPrompt[] = data
              .filter((p: any) => p && typeof p.title === 'string' && typeof p.prompt === 'string')
              .map((p: any) => ({
                title: String(p.title),
                prompt: String(p.prompt),
                words: Array.isArray(p.words) ? p.words.map((w: any) => String(w)) : undefined
              }))
            setPrompts(normalized)
          } else {
            setPrompts(defaultPrompts)
          }
        } else {
          setPrompts(defaultPrompts)
        }
      } catch {
        setPrompts(defaultPrompts)
      }
    }

    if (activityType === 'wordbuilder') {
      loadWords().then(() => initializeActivity())
    } else if (activityType === 'sentences') {
      loadSentences().then(() => initializeActivity())
    } else if (activityType === 'creative') {
      loadPrompts().then(() => initializeActivity())
    } else {
    initializeActivity()
    }
  }, [activityType])

  const initializeActivity = () => {
    if (activityType === 'tracing') {
      setLetterIndex(0)
      setCurrentLetter(tracingLetters[0])
      setRequiredStrokes(getRequiredStrokes(tracingLetters[0].letter))
      setStrokesCompleted(0)
    } else if (activityType === 'wordbuilder') {
      const source = wordBank && wordBank.length ? wordBank : defaultWordBuildingWords
      const word = source[0]
      setCurrentWord(word)
      setBuilderLetters(shuffleArray([...word.letters]))
      setBuiltWord([])
    } else if (activityType === 'sentences') {
      const source = sentences && sentences.length ? sentences : defaultSentenceBank
      const s = source[0]
      setSentenceIndex(0)
      setCurrentSentence(s)
      setChosenWords([])
      setScrambledWords(shuffleArray(s.split(' ')))
    } else if (activityType === 'creative') {
      const source = prompts && prompts.length ? prompts : defaultPrompts
      setPromptIndex(0)
      setCurrentPrompt(source[0])
      setStoryText('')
    }
  }

  const getRequiredStrokes = (letter: string) => {
    // Use the stroke patterns defined above
    const pattern = letterStrokePatterns[letter]
    return pattern ? pattern.strokes : 2 // default to 2 strokes if pattern not found
  }

  const getStrokeDescription = (letter: string) => {
    const pattern = letterStrokePatterns[letter]
    return pattern ? pattern.description : 'Multiple strokes'
  }

  const getLetterDifficulty = (letter: string) => {
    const pattern = letterStrokePatterns[letter]
    return pattern ? pattern.difficulty : 'medium'
  }

  const shuffleArray = (array: string[]) => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  const activities = [
    { id: 'tracing', name: 'Letter Tracing', icon: <PenTool className="w-5 h-5" /> },
    { id: 'wordbuilder', name: 'Word Builder', icon: <Target className="w-5 h-5" /> },
    { id: 'sentences', name: 'Sentence Puzzles', icon: <Shuffle className="w-5 h-5" /> },
    { id: 'creative', name: 'Creative Writing', icon: <Lightbulb className="w-5 h-5" /> }
  ]

  // Canvas drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    setStrokeLength(0)
    drawStartTimeRef.current = Date.now()
    visitedCellsRef.current = new Set()
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    lastPointRef.current = { x, y }

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.strokeStyle = currentLetter?.color || '#3B82F6'
      ctx.lineWidth = 8
      ctx.lineCap = 'round'
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.lineTo(x, y)
      ctx.stroke()
      // Accumulate stroke length to ensure sufficient drawing was performed
      const last = lastPointRef.current
      if (last) {
        const dx = x - last.x
        const dy = y - last.y
        setStrokeLength(prev => prev + Math.sqrt(dx * dx + dy * dy))
      }
      lastPointRef.current = { x, y }

      // Mark visited cell in a 3x3 grid to ensure spread across canvas
      const CELL_COLS = 3
      const CELL_ROWS = 3
      const cellX = Math.min(CELL_COLS - 1, Math.max(0, Math.floor((x / canvas.width) * CELL_COLS)))
      const cellY = Math.min(CELL_ROWS - 1, Math.max(0, Math.floor((y / canvas.height) * CELL_ROWS)))
      visitedCellsRef.current.add(`${cellX},${cellY}`)
    }
  }

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false)
      // Just stop drawing, don't evaluate yet
      // The user can continue drawing or use the "Check" button to evaluate
    }
  }

  const checkCurrentStroke = () => {
    // Determine success based on multiple simple heuristics
    const MIN_STROKE_LENGTH = 300 // pixels
    const MIN_DRAW_DURATION_MS = 800
    const MIN_VISITED_CELLS = 4

    const durationMs = drawStartTimeRef.current ? Date.now() - drawStartTimeRef.current : 0
    const visitedCells = visitedCellsRef.current.size
    const didTraceEnough = strokeLength >= MIN_STROKE_LENGTH && durationMs >= MIN_DRAW_DURATION_MS && visitedCells >= MIN_VISITED_CELLS

    if (didTraceEnough && currentLetter) {
      const nextCount = strokesCompleted + 1
      setStrokesCompleted(nextCount)
        setIsCorrect(true)
        setShowFeedback(true)
      audioManager.playSuccess()
        
      // Check if all required strokes are completed
      if (nextCount >= requiredStrokes) {
        // All strokes completed - finish the letter
        setTimeout(() => {
          setShowFeedback(false)
          setScore(prev => prev + 10)
          setCompletedActivities(prev => prev + 1)
          progressManager.addScore(10, 5)
          challengeManager.updateChallengeProgress('writing', 1)
          setStrokesCompleted(0)
          nextActivity()
        }, 1500)
      } else {
        // More strokes needed - clear canvas and wait for next stroke
        setTimeout(() => {
          setShowFeedback(false)
          clearCanvas()
        }, 800)
      }
    } else {
      // Stroke not good enough - show error and clear
      setIsCorrect(false)
      setShowFeedback(true)
      audioManager.playError()
      setTimeout(() => {
        setShowFeedback(false)
        clearCanvas()
      }, 1500)
    }
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drawLetterGuide()
    }
  }

  const drawLetterGuide = () => {
    const canvas = canvasRef.current
    if (!canvas || !currentLetter) return

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      // grid background for orientation
      ctx.strokeStyle = '#F1F5F9'
      ctx.lineWidth = 1
      for (let i = 1; i < 3; i++) {
        const p = (canvas.width / 3) * i
        ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, canvas.height); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(canvas.width, p); ctx.stroke()
      }
      // (Arrows removed intentionally; show only start dots with step numbers)

      // Stroke plans per letter (correct stroke directions)
      type Segment = { from: [number, number]; to: [number, number] }
      const planFor = (letter: string): Segment[][] => {
        // Letter A: left diagonal, right diagonal, crossbar
        const A: Segment[] = [
          { from: [90, 240], to: [150, 60] }, // left diagonal up
          { from: [150, 60], to: [210, 240] }, // right diagonal down
          { from: [120, 160], to: [180, 160] }, // crossbar left to right
        ]
        // Letter M: left vertical, diagonal down, diagonal up, right vertical
        const M: Segment[] = [
          { from: [80, 240], to: [80, 60] }, // left vertical up
          { from: [80, 60], to: [150, 160] }, // diagonal down to middle
          { from: [150, 160], to: [220, 60] }, // diagonal up to top right
          { from: [220, 60], to: [220, 240] }, // right vertical down
        ]
        // Letter N: left vertical, diagonal, right vertical
        const N: Segment[] = [
          { from: [90, 240], to: [90, 60] }, // left vertical up
          { from: [90, 60], to: [210, 240] }, // diagonal down to bottom right
          { from: [210, 240], to: [210, 60] }, // right vertical up
        ]
        // Letter W: left diagonal, up diagonal, down diagonal, right diagonal
        const W: Segment[] = [
          { from: [80, 60], to: [110, 240] }, // left diagonal down
          { from: [110, 240], to: [150, 120] }, // up diagonal
          { from: [150, 120], to: [190, 240] }, // down diagonal
          { from: [190, 240], to: [220, 60] }, // right diagonal up
        ]
        // Letter K: vertical, upper diagonal, lower diagonal
        const K: Segment[] = [
          { from: [90, 240], to: [90, 60] }, // vertical up
          { from: [90, 150], to: [210, 60] }, // upper diagonal up-right
          { from: [90, 150], to: [210, 240] }, // lower diagonal down-right
        ]
        // Letter R: vertical, curve, diagonal
        const R: Segment[] = [
          { from: [90, 240], to: [90, 60] }, // vertical up
          { from: [90, 60], to: [200, 120] }, // curve to right
          { from: [200, 120], to: [120, 240] }, // diagonal down-left
        ]
        // Letter B: vertical, upper curve, lower curve
        const B: Segment[] = [
          { from: [100, 240], to: [100, 60] }, // vertical up
          { from: [100, 60], to: [180, 120] }, // upper curve
          { from: [100, 150], to: [180, 210] }, // lower curve
        ]
        // Letter D: vertical, curve
        const D: Segment[] = [
          { from: [100, 240], to: [100, 60] }, // vertical up
          { from: [100, 60], to: [200, 150] }, // curve to right
        ]
        // Letter E: vertical, top horizontal, middle horizontal, bottom horizontal
        const E: Segment[] = [
          { from: [100, 240], to: [100, 60] }, // vertical up
          { from: [100, 60], to: [200, 60] }, // top horizontal
          { from: [100, 150], to: [180, 150] }, // middle horizontal
          { from: [100, 240], to: [200, 240] }, // bottom horizontal
        ]
        // Letter F: vertical, top horizontal, middle horizontal
        const F: Segment[] = [
          { from: [100, 240], to: [100, 60] }, // vertical up
          { from: [100, 60], to: [200, 60] }, // top horizontal
          { from: [100, 150], to: [180, 150] }, // middle horizontal
        ]
        // Letter H: left vertical, horizontal, right vertical
        const H: Segment[] = [
          { from: [100, 240], to: [100, 60] }, // left vertical up
          { from: [100, 150], to: [200, 150] }, // horizontal
          { from: [200, 240], to: [200, 60] }, // right vertical up
        ]
        // Letter P: vertical, curve
        const P: Segment[] = [
          { from: [100, 240], to: [100, 60] }, // vertical up
          { from: [100, 60], to: [180, 120] }, // curve to right
        ]
        // Letter Q: circle, tail
        const Q: Segment[] = [
          { from: [150, 120], to: [150, 180] }, // circle start
          { from: [180, 210], to: [200, 240] }, // tail diagonal
        ]
        // Letter X: diagonal down, diagonal up
        const X: Segment[] = [
          { from: [100, 60], to: [200, 240] }, // diagonal down-right
          { from: [100, 240], to: [200, 60] }, // diagonal up-right
        ]
        // Letter Y: V-shape, vertical
        const Y: Segment[] = [
          { from: [100, 60], to: [150, 150] }, // left diagonal down
          { from: [200, 60], to: [150, 150] }, // right diagonal down
          { from: [150, 150], to: [150, 240] }, // vertical down
        ]
        // Letter Z: top horizontal, diagonal, bottom horizontal
        const Z: Segment[] = [
          { from: [100, 60], to: [200, 60] }, // top horizontal
          { from: [200, 60], to: [100, 240] }, // diagonal down-left
          { from: [100, 240], to: [200, 240] }, // bottom horizontal
        ]

        const threeMap: Record<string, Segment[]> = { A, M, N, W, K, R }
        const twoMap: Record<string, Segment[]> = { B, D, E, F, H, P, Q, X, Y, Z }
        
        if (threeMap[letter]) return [threeMap[letter].slice(0, 1), threeMap[letter].slice(1, 2), threeMap[letter].slice(2, 3)]
        if (twoMap[letter]) return [twoMap[letter].slice(0, 1), twoMap[letter].slice(1, 2)]

        // Default fallback for other letters
        const defaultTwo: Segment[] = [
          { from: [100, 240], to: [100, 60] }, // vertical up
          { from: [100, 60], to: [200, 150] }, // curve to right
        ]
        return [defaultTwo.slice(0, 1), defaultTwo.slice(1, 2)]
      }

      const segmentsByStep = planFor(currentLetter.letter)

      // Draw all steps as light hints; highlight current step
      segmentsByStep.forEach((segments, idx) => {
        const isCurrent = idx === strokesCompleted
        const color = isCurrent ? '#22C55E' : '#CBD5E1'
        segments.forEach(seg => {
          // start dot
          ctx.beginPath()
          ctx.fillStyle = color
          ctx.arc(seg.from[0], seg.from[1], isCurrent ? 7 : 5, 0, Math.PI * 2)
          ctx.fill()
          // number
          ctx.fillStyle = isCurrent ? '#065F46' : '#94A3B8'
          ctx.font = 'bold 12px sans-serif'
          ctx.fillText(String(idx + 1), seg.from[0] - 3, seg.from[1] + 4)
          // (Arrow path removed)
        })
      })
    }
  }

  const addLetterToWord = (letter: string) => {
    if (!currentWord) return
    
    const newBuiltWord = [...builtWord, letter]
    setBuiltWord(newBuiltWord)
    setBuilderLetters(prev => prev.filter((l, i) => i !== prev.indexOf(letter)))

    if (newBuiltWord.length === currentWord.word.length) {
      const isCorrectWord = newBuiltWord.join('') === currentWord.word
      setIsCorrect(isCorrectWord)
      setShowFeedback(true)
      
      if (isCorrectWord) {
        setScore(prev => prev + 15)
        setCompletedActivities(prev => prev + 1)
        
        // Play success sound and update progress
        audioManager.playSuccess()
        progressManager.addScore(15, 8)
        challengeManager.updateChallengeProgress('writing', 1)
      } else {
        // Play error sound
        audioManager.playError()
      }

      setTimeout(() => {
        setShowFeedback(false)
        if (isCorrectWord) {
          nextActivity()
        } else {
          resetWordBuilder()
        }
      }, 2000)
    }
  }

  const removeLetterFromWord = (index: number) => {
    const removedLetter = builtWord[index]
    setBuiltWord(prev => prev.filter((_, i) => i !== index))
    setBuilderLetters(prev => [...prev, removedLetter])
  }

  const resetWordBuilder = () => {
    if (currentWord) {
      setBuilderLetters(shuffleArray([...currentWord.letters]))
      setBuiltWord([])
    }
  }

  const nextActivity = () => {
    if (activityType === 'tracing') {
      const nextIndex = (letterIndex + 1) % tracingLetters.length
      setLetterIndex(nextIndex)
      setCurrentLetter(tracingLetters[nextIndex])
      setRequiredStrokes(getRequiredStrokes(tracingLetters[nextIndex].letter))
      setStrokesCompleted(0)
      setTimeout(() => {
        clearCanvas()
      }, 100)
    } else if (activityType === 'wordbuilder') {
      const source = wordBank && wordBank.length ? wordBank : defaultWordBuildingWords
      const currentIdx = Math.max(0, source.findIndex(w => w.word === currentWord?.word))
      const nextIndex = (currentIdx + 1) % source.length
      const nextWord = source[nextIndex]
      setCurrentWord(nextWord)
      setBuilderLetters(shuffleArray([...nextWord.letters]))
      setBuiltWord([])
    } else if (activityType === 'sentences') {
      const source = sentences && sentences.length ? sentences : defaultSentenceBank
      const next = (sentenceIndex + 1) % source.length
      setSentenceIndex(next)
      const s = source[next]
      setCurrentSentence(s)
      setChosenWords([])
      setScrambledWords(shuffleArray(s.split(' ')))
    } else if (activityType === 'creative') {
      const source = prompts && prompts.length ? prompts : defaultPrompts
      const next = (promptIndex + 1) % source.length
      setPromptIndex(next)
      setCurrentPrompt(source[next])
      setStoryText('')
    }
  }

  const progress = (completedActivities / totalActivities) * 100

  if (completedActivities >= totalActivities) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Card className="card-kid max-w-md">
            <CardContent className="p-8">
              <Mascot emotion="celebrating" size="large" className="mb-6" />
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Amazing Writing! 🖊️</h2>
              <p className="text-gray-600 mb-6">You completed all writing activities!</p>
              
              <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <Trophy className="w-8 h-8 text-green-600 mx-auto mb-1" />
                    <div className="text-2xl font-bold text-green-600">{score}</div>
                    <div className="text-sm text-gray-600">Points</div>
                  </div>
                  <div className="text-center">
                    <Star className="w-8 h-8 text-purple-600 mx-auto mb-1" />
                    <div className="text-2xl font-bold text-purple-600">{completedActivities}</div>
                    <div className="text-sm text-gray-600">Activities</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  className="btn-success-kid"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Practice More
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <Mascot emotion="happy" size="medium" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Writing & Spelling</h1>
                  <p className="text-gray-600">Trace letters and build words! ✏️</p>
                </div>
              </div>
            </div>

            <ProgressRing 
              progress={progress}
              size={80}
              color="#10B981"
              className="hidden md:block"
            >
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{completedActivities}</div>
                <div className="text-xs text-gray-500">/{totalActivities}</div>
              </div>
            </ProgressRing>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Activity Selector */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-wrap gap-4 justify-center">
            {activities.map((activity) => (
              <Button
                key={activity.id}
                variant={activityType === activity.id ? "default" : "outline"}
                onClick={() => setActivityType(activity.id as any)}
                className={`${activityType === activity.id ? 'btn-success-kid' : ''} px-6 py-3`}
              >
                {activity.icon}
                <span className="ml-2">{activity.name}</span>
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Letter Tracing Activity */}
        {activityType === 'tracing' && currentLetter && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="card-writing h-full">
                <CardHeader>
                  <h3 className="text-2xl font-bold text-center text-gray-800">
                    Trace the Letter: {currentLetter.letter}
                  </h3>
                  <div className="text-center mt-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
                         style={{ 
                           backgroundColor: getLetterDifficulty(currentLetter.letter) === 'easy' ? '#DCFCE7' : 
                                          getLetterDifficulty(currentLetter.letter) === 'medium' ? '#FEF3C7' : '#FEE2E2',
                           color: getLetterDifficulty(currentLetter.letter) === 'easy' ? '#166534' : 
                                 getLetterDifficulty(currentLetter.letter) === 'medium' ? '#92400E' : '#991B1B'
                         }}>
                      <span className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: getLetterDifficulty(currentLetter.letter) === 'easy' ? '#22C55E' : 
                                                   getLetterDifficulty(currentLetter.letter) === 'medium' ? '#F59E0B' : '#EF4444' }}></span>
                      {getLetterDifficulty(currentLetter.letter).toUpperCase()} • {requiredStrokes} stroke{requiredStrokes > 1 ? 's' : ''}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div 
                      className="text-8xl font-bold mx-auto mb-4 inline-block px-6 py-4 rounded-2xl bg-gray-50 border-4 border-dashed border-gray-300"
                      style={{ color: currentLetter.color }}
                    >
                      {currentLetter.letter}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {getStrokeDescription(currentLetter.letter)}
                    </p>
                  </div>

                  <div className="mobile-canvas-container">
                    <canvas
                    ref={canvasRef}
                    width={300}
                    height={300}
                    className="border-4 border-gray-200 rounded-2xl mx-auto bg-white cursor-crosshair touch-none select-none"
                    style={{ touchAction: 'none', userSelect: 'none' }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      const touch = e.touches[0]
                      const rect = canvasRef.current?.getBoundingClientRect()
                      if (rect) {
                        const x = touch.clientX - rect.left
                        const y = touch.clientY - rect.top
                        startDrawing({ clientX: touch.clientX, clientY: touch.clientY } as any)
                      }
                    }}
                    onTouchMove={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      const touch = e.touches[0]
                      const rect = canvasRef.current?.getBoundingClientRect()
                      if (rect) {
                        const x = touch.clientX - rect.left
                        const y = touch.clientY - rect.top
                        draw({ clientX: touch.clientX, clientY: touch.clientY } as any)
                      }
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      stopDrawing()
                    }}
                  />
                  </div>

                  <div className="flex justify-center gap-4 mt-6">
                    <Button onClick={() => { const prev = (letterIndex - 1 + tracingLetters.length) % tracingLetters.length; setLetterIndex(prev); setCurrentLetter(tracingLetters[prev]); clearCanvas(); }} variant="outline">
                      Previous
                    </Button>
                    <Button onClick={clearCanvas} variant="outline">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                    <Button onClick={checkCurrentStroke} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Check Stroke
                    </Button>
                    <Button onClick={() => { const next = (letterIndex + 1) % tracingLetters.length; setLetterIndex(next); setCurrentLetter(tracingLetters[next]); clearCanvas(); }}>
                      Next
                    </Button>
                  </div>

                  <div className="mt-4 text-center">
                    <div className="text-sm text-gray-600 mb-2">
                      Step {Math.min(strokesCompleted + 1, requiredStrokes)} of {requiredStrokes}
                    </div>
                    <div className="flex justify-center gap-1">
                      {Array.from({ length: requiredStrokes }, (_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            i < strokesCompleted 
                              ? 'bg-green-500' 
                              : i === strokesCompleted 
                                ? 'bg-blue-500 animate-pulse' 
                                : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="card-writing h-full">
                <CardContent className="p-8">
                  <h4 className="text-xl font-bold text-gray-800 mb-6 text-center">How to Trace</h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
                      <p className="text-gray-700">Draw each stroke of the letter</p>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
                      <p className="text-gray-700">Click "Check Stroke" when done with each stroke</p>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                      <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
                      <p className="text-gray-700">Complete all {requiredStrokes} stroke{requiredStrokes > 1 ? 's' : ''} to finish</p>
                    </div>
                  </div>

                  {/* Score Display */}
                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="bg-yellow-50 rounded-xl p-4 text-center">
                      <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-yellow-600">{score}</div>
                      <div className="text-sm text-gray-600">Points</div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                      <Trophy className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">{completedActivities}</div>
                      <div className="text-sm text-gray-600">Done</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Creative Writing Activity */}
        {activityType === 'creative' && currentPrompt && (
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="card-writing">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-3xl font-bold text-gray-800 mb-2">{currentPrompt.title}</h3>
                    <p className="text-gray-700 mb-4">{currentPrompt.prompt}</p>
                    {currentPrompt.words && currentPrompt.words.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-2 mb-4">
                        {currentPrompt.words.map((w, i) => (
                          <span key={i} className="px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-200">{w}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <textarea
                    value={storyText}
                    onChange={(e) => setStoryText(e.target.value)}
                    className="w-full min-h-[220px] p-4 border-4 border-gray-200 rounded-2xl outline-none focus:border-green-300"
                    placeholder="Start your story here..."
                  />

                  <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                    <div>
                      Words: {storyText.trim() ? storyText.trim().split(/\s+/).length : 0}
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setStoryText('')}
                      >
                        Clear
                      </Button>
                      <Button
                        className="btn-primary-kid"
                        onClick={() => {
                          const wordsCount = storyText.trim() ? storyText.trim().split(/\s+/).length : 0
                          const MIN_WORDS = 20
                          const usesPromptWord = (currentPrompt.words || []).some(w =>
                            new RegExp(`\\b${w}\\b`, 'i').test(storyText)
                          )
                          const ok = wordsCount >= MIN_WORDS && (!currentPrompt.words || usesPromptWord)
                          setIsCorrect(ok)
                          setShowFeedback(true)
                          if (ok) {
                            setScore(prev => prev + 20)
                            setCompletedActivities(prev => prev + 1)
                            setTimeout(() => { setShowFeedback(false); nextActivity() }, 2000)
                          } else {
                            setTimeout(() => setShowFeedback(false), 1800)
                          }
                        }}
                      >
                        Submit
                      </Button>
                      <Button variant="outline" onClick={nextActivity}>Next Prompt</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Word Builder Activity */}
        {activityType === 'wordbuilder' && currentWord && (
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="card-writing">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-bold text-gray-800 mb-4">Build the Word!</h3>
                    
                    {/* Word Image */}
                    {currentWord.imageUrl && (
                      <div className="w-32 h-32 mx-auto mb-4 rounded-2xl overflow-hidden shadow-lg">
                        <img 
                          src={currentWord.imageUrl} 
                          alt={currentWord.word}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <p className="text-xl text-gray-600 mb-6">Hint: {currentWord.hint}</p>

                    {/* Built Word Display */}
                    <div className="flex justify-center gap-2 mb-8">
                      {Array.from({ length: currentWord.word.length }).map((_, index) => (
                        <motion.button
                          key={index}
                          className="w-16 h-16 border-4 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-2xl font-bold bg-white hover:bg-gray-50"
                          onClick={() => builtWord[index] && removeLetterFromWord(index)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {builtWord[index] || ''}
                        </motion.button>
                      ))}
                    </div>

                    {/* Available Letters */}
                    <div className="flex flex-wrap justify-center gap-3">
                      {builderLetters.map((letter, index) => (
                        <motion.button
                          key={`${letter}-${index}`}
                          className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 text-white rounded-xl font-bold text-xl shadow-lg hover:shadow-xl"
                          onClick={() => addLetterToWord(letter)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          layout
                        >
                          {letter}
                        </motion.button>
                      ))}
                    </div>

                    {/* Reset Button */}
                    <Button
                      onClick={resetWordBuilder}
                      variant="outline"
                      className="mt-6"
                    >
                      <Shuffle className="w-4 h-4 mr-2" />
                      Shuffle Letters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Sentence Puzzles Activity */}
        {activityType === 'sentences' && currentSentence && (
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="card-writing">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-bold text-gray-800 mb-4">Arrange the Words!</h3>
                    <p className="text-gray-600 mb-6">Tap words to build the sentence in the correct order.</p>

                    {/* Chosen Sentence */}
                    <div className="flex flex-wrap justify-center gap-2 mb-8 min-h-[64px]">
                      {Array.from({ length: currentSentence.split(' ').length }).map((_, i) => (
                        <motion.button
                          key={i}
                          className="px-4 h-12 border-4 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-lg font-bold bg-white hover:bg-gray-50"
                          onClick={() => {
                            if (chosenWords[i]) {
                              const word = chosenWords[i]
                              setChosenWords(prev => prev.filter((_, idx) => idx !== i))
                              setScrambledWords(prev => [...prev, word])
                            }
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {chosenWords[i] || ''}
                        </motion.button>
                      ))}
                    </div>

                    {/* Available Words */}
                    <div className="flex flex-wrap justify-center gap-3">
                      {scrambledWords.map((w, idx) => (
                        <motion.button
                          key={`${w}-${idx}`}
                          className="px-4 h-12 bg-gradient-to-br from-purple-400 to-pink-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl"
                          onClick={() => {
                            setChosenWords(prev => [...prev, w])
                            setScrambledWords(prev => prev.filter((_, i) => i !== idx))
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {w}
                        </motion.button>
                      ))}
                    </div>

                    {/* Controls */}
                    <div className="flex gap-4 justify-center mt-8">
                      <Button
                        onClick={() => {
                          const target = currentSentence
                          const attempted = chosenWords.join(' ')
                          const ok = attempted === target
                          setIsCorrect(ok)
                          setShowFeedback(true)
                          if (ok) {
                            setScore(prev => prev + 15)
                            setCompletedActivities(prev => prev + 1)
                            setTimeout(() => { setShowFeedback(false); nextActivity() }, 2000)
                          } else {
                            setTimeout(() => { setShowFeedback(false) }, 1500)
                          }
                        }}
                        className="btn-primary-kid"
                      >
                        Check
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setChosenWords([])
                          setScrambledWords(shuffleArray(currentSentence.split(' ')))
                        }}
                      >
                        Shuffle
                      </Button>
                      <Button variant="outline" onClick={nextActivity}>Next</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Feedback Modal */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <Card className="card-kid max-w-md">
                <CardContent className="p-8 text-center">
                  <div className="mb-4">
                    {isCorrect ? (
                      <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                    ) : (
                      <RefreshCw className="w-16 h-16 text-yellow-600 mx-auto" />
                    )}
                  </div>
                  <h3 className={`text-2xl font-bold mb-2 ${
                    isCorrect ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                    {isCorrect ? 'Excellent Work!' : 'Keep Trying!'}
                  </h3>
                  <p className={`${
                    isCorrect ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {isCorrect 
                      ? 'Perfect! Moving to the next activity...' 
                      : 'Good effort! Try again to get it right.'
                    }
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
