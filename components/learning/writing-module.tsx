
'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
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

// Static constants moved outside component to avoid recreation on every render
const TRACING_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#14B8A6', '#F97316', '#EC4899']

const DEFAULT_SENTENCE_BANK = [
  'THE CAT IS BIG',
  'I LIKE RED APPLES',
  'THE SUN IS BRIGHT',
  'BIRDS FLY IN SKY',
  'PLEASE CLOSE THE DOOR',
  'FISH SWIM IN WATER'
]

interface WritingPrompt { title: string; prompt: string; words?: string[] }
const DEFAULT_PROMPTS: WritingPrompt[] = [
  { title: 'A Day at the Park', prompt: 'Write a short story about a fun day at the park with your friends.', words: ['play', 'tree', 'slide', 'sunny'] },
  { title: 'My Magic Pet', prompt: 'Imagine you have a magic pet. What can it do? What adventures do you have together?', words: ['magic', 'friend', 'fly', 'secret'] },
  { title: 'Rainy Day', prompt: 'It is raining outside. Describe what you do at home and how you feel.', words: ['rain', 'window', 'warm', 'music'] }
]

const LETTER_STROKE_PATTERNS: { [key: string]: { strokes: number; description: string; difficulty: 'easy' | 'medium' | 'hard' } } = {
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
  const [isInitialized, setIsInitialized] = useState(false)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const drawStartTimeRef = useRef<number | null>(null)
  const visitedCellsRef = useRef<Set<string>>(new Set())

  // Component mount check
  useEffect(() => {
    console.log('WritingModule component mounted')
    return () => {
      console.log('WritingModule component unmounting')
    }
  }, [])

  // Define drawLetterGuide with useCallback first
  const drawLetterGuide = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !currentLetter || activityType !== 'tracing') return

    const ctx = canvas.getContext('2d')
    if (ctx) {
      // Ensure canvas has proper dimensions
      if (canvas.width === 0 || canvas.height === 0) {
        const container = canvas.parentElement
        if (container) {
          const size = Math.min(container.clientWidth, container.clientHeight, 400)
          const scale = window.devicePixelRatio || 1
          canvas.width = size * scale
          canvas.height = size * scale
          ctx.scale(scale, scale)
        }
      }
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      // grid background for orientation
      ctx.strokeStyle = '#F1F5F9'
      ctx.lineWidth = 1
      for (let i = 1; i < 3; i++) {
        const p = (canvas.width / 3) * i
        ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, canvas.height); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(canvas.width, p); ctx.stroke()
      }

      // Stroke plans per letter (correct stroke directions)
      type Segment = { from: [number, number]; to: [number, number] }
      const planFor = (letter: string): Segment[][] => {
        const A: Segment[] = [
          { from: [90, 240], to: [150, 60] },
          { from: [150, 60], to: [210, 240] },
          { from: [120, 160], to: [180, 160] },
        ]
        const M: Segment[] = [
          { from: [80, 240], to: [80, 60] },
          { from: [80, 60], to: [150, 160] },
          { from: [150, 160], to: [220, 60] },
          { from: [220, 60], to: [220, 240] },
        ]
        const N: Segment[] = [
          { from: [90, 240], to: [90, 60] },
          { from: [90, 60], to: [210, 240] },
          { from: [210, 240], to: [210, 60] },
        ]
        const W: Segment[] = [
          { from: [80, 60], to: [110, 240] },
          { from: [110, 240], to: [150, 120] },
          { from: [150, 120], to: [190, 240] },
          { from: [190, 240], to: [220, 60] },
        ]
        const K: Segment[] = [
          { from: [90, 240], to: [90, 60] },
          { from: [90, 150], to: [210, 60] },
          { from: [90, 150], to: [210, 240] },
        ]
        const R: Segment[] = [
          { from: [90, 240], to: [90, 60] },
          { from: [90, 60], to: [200, 120] },
          { from: [200, 120], to: [120, 240] },
        ]
        const B: Segment[] = [
          { from: [100, 240], to: [100, 60] },
          { from: [100, 60], to: [180, 120] },
          { from: [100, 150], to: [180, 210] },
        ]
        const D: Segment[] = [
          { from: [100, 240], to: [100, 60] },
          { from: [100, 60], to: [200, 150] },
        ]
        const E: Segment[] = [
          { from: [100, 240], to: [100, 60] },
          { from: [100, 60], to: [200, 60] },
          { from: [100, 150], to: [180, 150] },
          { from: [100, 240], to: [200, 240] },
        ]
        const F: Segment[] = [
          { from: [100, 240], to: [100, 60] },
          { from: [100, 60], to: [200, 60] },
          { from: [100, 150], to: [180, 150] },
        ]
        const H: Segment[] = [
          { from: [100, 240], to: [100, 60] },
          { from: [100, 150], to: [200, 150] },
          { from: [200, 240], to: [200, 60] },
        ]
        const P: Segment[] = [
          { from: [100, 240], to: [100, 60] },
          { from: [100, 60], to: [180, 120] },
        ]
        const Q: Segment[] = [
          { from: [150, 120], to: [150, 180] },
          { from: [180, 210], to: [200, 240] },
        ]
        const X: Segment[] = [
          { from: [100, 60], to: [200, 240] },
          { from: [100, 240], to: [200, 60] },
        ]
        const Y: Segment[] = [
          { from: [100, 60], to: [150, 150] },
          { from: [200, 60], to: [150, 150] },
          { from: [150, 150], to: [150, 240] },
        ]
        const Z: Segment[] = [
          { from: [100, 60], to: [200, 60] },
          { from: [200, 60], to: [100, 240] },
          { from: [100, 240], to: [200, 240] },
        ]

        const threeMap: Record<string, Segment[]> = { A, M, N, W, K, R }
        const twoMap: Record<string, Segment[]> = { B, D, E, F, H, P, Q, X, Y, Z }
        
        if (threeMap[letter]) return [threeMap[letter].slice(0, 1), threeMap[letter].slice(1, 2), threeMap[letter].slice(2, 3)]
        if (twoMap[letter]) return [twoMap[letter].slice(0, 1), twoMap[letter].slice(1, 2)]

        const defaultTwo: Segment[] = [
          { from: [100, 240], to: [100, 60] },
          { from: [100, 60], to: [200, 150] },
        ]
        return [defaultTwo.slice(0, 1), defaultTwo.slice(1, 2)]
      }

      const segmentsByStep = planFor(currentLetter.letter)

      segmentsByStep.forEach((segments, idx) => {
        const isCurrent = idx === strokesCompleted
        const color = isCurrent ? '#22C55E' : '#CBD5E1'
        segments.forEach(seg => {
          ctx.beginPath()
          ctx.fillStyle = color
          ctx.arc(seg.from[0], seg.from[1], isCurrent ? 7 : 5, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = isCurrent ? '#065F46' : '#94A3B8'
          ctx.font = 'bold 12px sans-serif'
          ctx.fillText(String(idx + 1), seg.from[0] - 3, seg.from[1] + 4)
        })
      })
    }
  }, [currentLetter, strokesCompleted, activityType])

  // Redraw the guide whenever letter or stroke step changes
  useEffect(() => {
    if (canvasRef.current && currentLetter && activityType === 'tracing') {
      drawLetterGuide()
    }
  }, [drawLetterGuide, currentLetter, strokesCompleted, requiredStrokes, activityType])

  // Resize canvas based on container size
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const container = canvas.parentElement
      if (!container) return

      // Get container dimensions
      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight
      
      // Calculate size (use smaller dimension to maintain square aspect)
      const size = Math.min(containerWidth, containerHeight, 400)
      
      // Set canvas display size (CSS)
      canvas.style.width = `${size}px`
      canvas.style.height = `${size}px`
      
      // Set canvas internal resolution (for crisp rendering)
      const scale = window.devicePixelRatio || 1
      canvas.width = size * scale
      canvas.height = size * scale
      
      // Scale context to handle device pixel ratio
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(scale, scale)
      }
      
      // Redraw guide after resize
      if (currentLetter && activityType === 'tracing') {
        drawLetterGuide()
      }
    }

    // Initial resize
    resizeCanvas()

    // Resize on window resize
    window.addEventListener('resize', resizeCanvas)
    window.addEventListener('orientationchange', resizeCanvas)

    // Use ResizeObserver for container size changes
    const container = canvasRef.current?.parentElement
    let resizeObserver: ResizeObserver | null = null
    
    if (container && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(resizeCanvas)
      resizeObserver.observe(container)
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('orientationchange', resizeCanvas)
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    }
  }, [currentLetter, drawLetterGuide, activityType])

  // Sentence Puzzles state
  const [sentences, setSentences] = useState<string[] | null>(null)
  const [sentenceIndex, setSentenceIndex] = useState(0)
  const [currentSentence, setCurrentSentence] = useState<string | null>(null)
  const [scrambledWords, setScrambledWords] = useState<string[]>([])
  const [chosenWords, setChosenWords] = useState<string[]>([])

  // Creative Writing state
  const [prompts, setPrompts] = useState<WritingPrompt[] | null>(null)
  const [promptIndex, setPromptIndex] = useState(0)
  const [currentPrompt, setCurrentPrompt] = useState<WritingPrompt | null>(null)
  const [storyText, setStoryText] = useState('')

  // Memoize tracingLetters to avoid recreation on every render
  const tracingLetters = useMemo(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter, idx) => ({
    letter,
    paths: [],
    color: TRACING_COLORS[idx % TRACING_COLORS.length]
  })), [])

  const getDefaultWordBuildingWords = (): WordBuildingWord[] => {
    const cacheBuster = `?v=${Date.now()}&bust=${Math.random()}`
    return [
    // Animals
    {
      word: 'CAT',
      letters: ['C', 'A', 'T', 'D', 'O', 'G'],
      hint: 'A furry pet that says "meow"',
      imageUrl: `https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=300&fit=crop&crop=center${cacheBuster}`
    },
    {
      word: 'DOG',
      letters: ['D', 'O', 'G', 'C', 'A', 'T'],
      hint: 'A loyal pet that says "woof"',
      imageUrl: `https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=300&fit=crop&crop=center${cacheBuster}`
    },
    {
      word: 'BIRD',
      letters: ['B', 'I', 'R', 'D', 'F', 'L'],
      hint: 'A flying animal with feathers',
      imageUrl: `https://images.unsplash.com/photo-1444464666168-49d633b86797?w=300&h=300&fit=crop&crop=center${cacheBuster}`
    },
    {
      word: 'FISH',
      letters: ['F', 'I', 'S', 'H', 'W', 'A'],
      hint: 'A swimming animal that lives in water',
      imageUrl: `https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=300&fit=crop&crop=center${cacheBuster}`
    },
    // Colors
    {
      word: 'RED',
      letters: ['R', 'E', 'D', 'B', 'L', 'U'],
      hint: 'The color of apples and roses',
      imageUrl: `https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=300&h=300&fit=crop&crop=center${cacheBuster}`
    },
    {
      word: 'BLUE',
      letters: ['B', 'L', 'U', 'E', 'R', 'D'],
      hint: 'The color of the sky and ocean',
      imageUrl: `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop&crop=center${cacheBuster}`
    },
    {
      word: 'GREEN',
      letters: ['G', 'R', 'E', 'E', 'N', 'B'],
      hint: 'The color of grass and leaves',
      imageUrl: `https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop&crop=center${cacheBuster}`
    },
    // Nature
    {
      word: 'SUN',
      letters: ['S', 'U', 'N', 'M', 'O', 'R'],
      hint: 'Bright star in the sky',
      imageUrl: `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop&crop=center${cacheBuster}`
    },
    {
      word: 'TREE',
      letters: ['T', 'R', 'E', 'E', 'F', 'L'],
      hint: 'Green plant with branches',
      imageUrl: `https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop&crop=center${cacheBuster}`
    },
    {
      word: 'MOON',
      letters: ['M', 'O', 'O', 'N', 'S', 'U'],
      hint: 'Bright light in the night sky',
      imageUrl: `https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=300&h=300&fit=crop&crop=center${cacheBuster}`
    },
    // Food
    {
      word: 'CAKE',
      letters: ['C', 'A', 'K', 'E', 'B', 'A'],
      hint: 'A sweet dessert for celebrations',
      imageUrl: `https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=300&fit=crop&crop=center${cacheBuster}`
    },
    {
      word: 'APPLE',
      letters: ['A', 'P', 'P', 'L', 'E', 'R'],
      hint: 'A round red or green fruit',
      imageUrl: `https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=300&h=300&fit=crop&crop=center${cacheBuster}`
    },
    // Objects
    {
      word: 'BALL',
      letters: ['B', 'A', 'L', 'L', 'T', 'O'],
      hint: 'Round toy for playing',
      imageUrl: `https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=300&fit=crop&crop=center${cacheBuster}`
    },
    {
      word: 'HOUSE',
      letters: ['H', 'O', 'U', 'S', 'E', 'H'],
      hint: 'A place where people live',
      imageUrl: `https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300&h=300&fit=crop&crop=center${cacheBuster}`
    },
    {
      word: 'FAMILY',
      letters: ['F', 'A', 'M', 'I', 'L', 'Y'],
      hint: 'People who live with you',
      imageUrl: `https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=300&fit=crop&crop=center${cacheBuster}`
    }
  ]
  }

  // Helper functions (defined before use)
  const getRequiredStrokes = (letter: string) => {
    const pattern = LETTER_STROKE_PATTERNS[letter]
    return pattern ? pattern.strokes : 2
  }

  const getStrokeDescription = (letter: string) => {
    const pattern = LETTER_STROKE_PATTERNS[letter]
    return pattern ? pattern.description : 'Multiple strokes'
  }

  const getLetterDifficulty = (letter: string) => {
    const pattern = LETTER_STROKE_PATTERNS[letter]
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

  const initializeActivity = useCallback(() => {
    console.log('Initializing activity:', activityType)
    try {
      if (activityType === 'tracing') {
        console.log('Setting up tracing, letters available:', tracingLetters.length)
        if (tracingLetters.length === 0) {
          console.error('No tracing letters available!')
          return
        }
        setLetterIndex(0)
        const firstLetter = tracingLetters[0]
        console.log('First letter:', firstLetter)
        setCurrentLetter(firstLetter)
        const strokes = getRequiredStrokes(firstLetter.letter)
        console.log('Required strokes:', strokes)
        setRequiredStrokes(strokes)
        setStrokesCompleted(0)
        setIsInitialized(true)
        setTimeout(() => {
          if (canvasRef.current) {
            console.log('Clearing canvas')
            const canvas = canvasRef.current
            const ctx = canvas.getContext('2d')
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height)
              if (currentLetter && activityType === 'tracing') {
                drawLetterGuide()
              }
            }
          } else {
            console.warn('Canvas ref not available')
          }
        }, 300)
      } else if (activityType === 'wordbuilder') {
        const source = wordBank && wordBank.length ? wordBank : getDefaultWordBuildingWords()
        console.log('Word builder source:', source?.length, 'words')
        if (source && source.length > 0) {
          const word = source[0]
          console.log('Setting current word:', word.word)
          setCurrentWord(word)
          const shuffled = shuffleArray([...word.letters])
          console.log('Shuffled letters:', shuffled)
          setBuilderLetters(shuffled)
          setBuiltWord([])
          setIsInitialized(true)
        } else {
          console.warn('No words available for word builder')
        }
      } else if (activityType === 'sentences') {
        const source = sentences && sentences.length ? sentences : DEFAULT_SENTENCE_BANK
        console.log('Sentences source:', source?.length, 'sentences')
        if (source && source.length > 0) {
          const s = source[0]
          console.log('Setting current sentence:', s)
          setSentenceIndex(0)
          setCurrentSentence(s)
          setChosenWords([])
          const scrambled = shuffleArray(s.split(' '))
          console.log('Scrambled words:', scrambled)
          setScrambledWords(scrambled)
          setIsInitialized(true)
        } else {
          console.warn('No sentences available')
        }
      } else if (activityType === 'creative') {
        const source = prompts && prompts.length ? prompts : DEFAULT_PROMPTS
        console.log('Creative prompts source:', source?.length, 'prompts')
        if (source && source.length > 0) {
          const prompt = source[0]
          console.log('Setting current prompt:', prompt.title)
          setPromptIndex(0)
          setCurrentPrompt(prompt)
          setStoryText('')
          setIsInitialized(true)
        } else {
          console.warn('No prompts available')
        }
      }
    } catch (error) {
      console.error('Error initializing activity:', error)
      if (activityType === 'tracing' && tracingLetters.length > 0) {
        setCurrentLetter(tracingLetters[0])
        setRequiredStrokes(2)
        setStrokesCompleted(0)
        setIsInitialized(true)
      }
    }
  }, [activityType, wordBank, sentences, prompts, tracingLetters, drawLetterGuide])

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
            setWordBank(getDefaultWordBuildingWords())
          }
        } else {
          setWordBank(getDefaultWordBuildingWords())
        }
      } catch {
        setWordBank(getDefaultWordBuildingWords())
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
            setSentences(DEFAULT_SENTENCE_BANK)
          }
        } else {
          setSentences(DEFAULT_SENTENCE_BANK)
        }
      } catch {
        setSentences(DEFAULT_SENTENCE_BANK)
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

    console.log('Activity type changed to:', activityType)
    setIsInitialized(false) // Reset initialization when switching activities
    
    if (activityType === 'wordbuilder') {
      loadWords().then(() => {
        console.log('Words loaded, initializing activity')
        setTimeout(() => initializeActivity(), 100)
      }).catch(err => {
        console.error('Error loading words:', err)
        setTimeout(() => initializeActivity(), 100)
      })
    } else if (activityType === 'sentences') {
      loadSentences().then(() => {
        console.log('Sentences loaded, initializing activity')
        setTimeout(() => initializeActivity(), 100)
      }).catch(err => {
        console.error('Error loading sentences:', err)
        setTimeout(() => initializeActivity(), 100)
      })
    } else if (activityType === 'creative') {
      loadPrompts().then(() => {
        console.log('Prompts loaded, initializing activity')
        setTimeout(() => initializeActivity(), 100)
      }).catch(err => {
        console.error('Error loading prompts:', err)
        setTimeout(() => initializeActivity(), 100)
      })
    } else {
      // Tracing activity - initialize immediately
      console.log('Initializing tracing activity')
      setTimeout(() => initializeActivity(), 100)
    }
  }, [activityType, initializeActivity])

  // Canvas drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | TouchEvent | any) => {
    e.preventDefault?.()
    e.stopPropagation?.()
    
    setIsDrawing(true)
    setStrokeLength(0)
    drawStartTimeRef.current = Date.now()
    visitedCellsRef.current = new Set()
    const canvas = canvasRef.current
    if (!canvas || !currentLetter) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0
    const x = (clientX - rect.left) * scaleX
    const y = (clientY - rect.top) * scaleY
    lastPointRef.current = { x, y }

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.strokeStyle = currentLetter.color || '#3B82F6'
      ctx.lineWidth = 8
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | TouchEvent | any) => {
    if (!isDrawing || !currentLetter) return
    
    const canvas = canvasRef.current
    if (!canvas) return

    e.preventDefault?.()
    e.stopPropagation?.()

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0
    const x = (clientX - rect.left) * scaleX
    const y = (clientY - rect.top) * scaleY

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.lineTo(x, y)
      ctx.stroke()
      const last = lastPointRef.current
      if (last) {
        const dx = x - last.x
        const dy = y - last.y
        setStrokeLength(prev => prev + Math.sqrt(dx * dx + dy * dy))
      }
      lastPointRef.current = { x, y }

      const CELL_COLS = 3
      const CELL_ROWS = 3
      const displayWidth = rect.width
      const displayHeight = rect.height
      const cellX = Math.min(CELL_COLS - 1, Math.max(0, Math.floor(((clientX - rect.left) / displayWidth) * CELL_COLS)))
      const cellY = Math.min(CELL_ROWS - 1, Math.max(0, Math.floor(((clientY - rect.top) / displayHeight) * CELL_ROWS)))
      visitedCellsRef.current.add(`${cellX},${cellY}`)
    }
  }

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false)
    }
  }

  const checkCurrentStroke = () => {
    if (!currentLetter) return
    
    const MIN_STROKE_LENGTH = 200
    const MIN_DRAW_DURATION_MS = 500
    const MIN_VISITED_CELLS = 3

    const durationMs = drawStartTimeRef.current ? Date.now() - drawStartTimeRef.current : 0
    const visitedCells = visitedCellsRef.current.size
    const didTraceEnough = strokeLength >= MIN_STROKE_LENGTH && durationMs >= MIN_DRAW_DURATION_MS && visitedCells >= MIN_VISITED_CELLS

    if (didTraceEnough) {
      const nextCount = strokesCompleted + 1
      setStrokesCompleted(nextCount)
      setIsCorrect(true)
      setShowFeedback(true)
      
      try {
        audioManager.playSuccess()
      } catch (error) {
        console.error('Error playing success sound:', error)
      }
        
      if (nextCount >= requiredStrokes) {
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
        setTimeout(() => {
          setShowFeedback(false)
          clearCanvas()
        }, 800)
      }
    } else {
      setIsCorrect(false)
      setShowFeedback(true)
      try {
        audioManager.playError()
      } catch (error) {
        console.error('Error playing error sound:', error)
      }
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
      if (currentLetter && activityType === 'tracing') {
        drawLetterGuide()
      }
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
        
        try {
          audioManager.playSuccess()
          progressManager.addScore(15, 8)
          challengeManager.updateChallengeProgress('writing', 1)
        } catch (error) {
          console.error('Error updating progress:', error)
        }
      } else {
        try {
          audioManager.playError()
        } catch (error) {
          console.error('Error playing sound:', error)
        }
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
    if (index < 0 || index >= builtWord.length) return
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
      const source = wordBank && wordBank.length ? wordBank : getDefaultWordBuildingWords()
      const currentIdx = Math.max(0, source.findIndex(w => w.word === currentWord?.word))
      const nextIndex = (currentIdx + 1) % source.length
      const nextWord = source[nextIndex]
      setCurrentWord(nextWord)
      setBuilderLetters(shuffleArray([...nextWord.letters]))
      setBuiltWord([])
    } else if (activityType === 'sentences') {
      const source = sentences && sentences.length ? sentences : DEFAULT_SENTENCE_BANK
      const next = (sentenceIndex + 1) % source.length
      setSentenceIndex(next)
      const s = source[next]
      setCurrentSentence(s)
      setChosenWords([])
      setScrambledWords(shuffleArray(s.split(' ')))
    } else if (activityType === 'creative') {
      const source = prompts && prompts.length ? prompts : DEFAULT_PROMPTS
      const next = (promptIndex + 1) % source.length
      setPromptIndex(next)
      setCurrentPrompt(source[next])
      setStoryText('')
    }
  }

  const activities = [
    { id: 'tracing', name: 'Letter Tracing', icon: <PenTool className="w-5 h-5" /> },
    { id: 'wordbuilder', name: 'Word Builder', icon: <Target className="w-5 h-5" /> },
    { id: 'sentences', name: 'Sentence Puzzles', icon: <Shuffle className="w-5 h-5" /> },
    { id: 'creative', name: 'Creative Writing', icon: <Lightbulb className="w-5 h-5" /> }
  ]

  const progress = (completedActivities / totalActivities) * 100

  if (completedActivities >= totalActivities) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4 landscape-optimized">
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 landscape-optimized">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-green-100 dark:border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2 md:gap-4">
            <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="flex-shrink-0 px-2 md:px-3 text-xs md:text-sm dark:border-slate-600 dark:text-white"
              >
                <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                <span className="hidden xs:inline">Back</span>
              </Button>
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <div className="hidden sm:block flex-shrink-0">
                  <Mascot emotion="happy" size="medium" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800 dark:text-white truncate">Writing & Spelling</h1>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 hidden sm:block">Trace letters and build words! ✏️</p>
                </div>
              </div>
            </div>

            <ProgressRing 
              progress={progress}
              size={60}
              color="#10B981"
              className="hidden sm:block flex-shrink-0"
            >
              <div className="text-center">
                <div className="text-base md:text-lg font-bold text-green-600 dark:text-green-400">{completedActivities}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">/{totalActivities}</div>
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
          <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
            {activities.map((activity) => (
              <Button
                key={activity.id}
                variant={activityType === activity.id ? 'default' : 'outline'}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setActivityType(activity.id as 'tracing' | 'wordbuilder' | 'sentences' | 'creative')
                  setIsInitialized(false)
                }}
                className={`btn-kid ${
                  activityType === activity.id
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white border-0'
                    : 'bg-white/80 dark:bg-slate-800/80'
                }`}
                style={{ pointerEvents: 'auto', zIndex: 10 }}
                type="button"
              >
                {activity.icon}
                <span className="ml-2">{activity.name}</span>
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Letter Tracing Activity */}
        {activityType === 'tracing' ? (
          currentLetter ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8 max-w-7xl mx-auto px-3 md:px-4 h-[calc(100vh-180px)] md:h-[calc(100vh-200px)]">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col min-h-0"
            >
              <Card className="card-writing h-full flex flex-col dark:bg-slate-800 dark:border-slate-700">
                <CardHeader className="p-3 md:p-4 lg:p-6 flex-shrink-0">
                  <h3 className="text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-center text-gray-800 dark:text-white break-words leading-tight">
                    Trace the Letter: {currentLetter.letter}
                  </h3>
                  <div className="text-center mt-2">
                    <div className="inline-flex items-center gap-2 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium"
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
                <CardContent className="p-3 md:p-4 lg:p-6 flex-1 flex flex-col min-h-0 overflow-y-auto">
                  <div className="text-center mb-3 md:mb-4 flex-shrink-0">
                    <div 
                      className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mx-auto mb-2 md:mb-3 inline-block px-3 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 rounded-xl md:rounded-2xl bg-gray-50 dark:bg-slate-700 border-4 border-dashed border-gray-300 dark:border-slate-600"
                      style={{ color: currentLetter.color }}
                    >
                      {currentLetter.letter}
                    </div>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {getStrokeDescription(currentLetter.letter)}
                    </p>
                  </div>

                  <div className="mobile-canvas-container flex-1 flex items-center justify-center min-h-0 my-2 md:my-4">
                  <canvas
                    ref={canvasRef}
                    width={300}
                    height={300}
                    className="border-4 border-gray-300 dark:border-slate-600 rounded-xl md:rounded-2xl bg-white dark:bg-slate-900 cursor-crosshair touch-none select-none focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50 w-full h-full max-w-full max-h-full aspect-square"
                    style={{ touchAction: 'none', userSelect: 'none' }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (e.touches && e.touches.length > 0) {
                        startDrawing(e)
                      }
                    }}
                    onTouchMove={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (e.touches && e.touches.length > 0) {
                        draw(e)
                      }
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      stopDrawing()
                    }}
                    tabIndex={0}
                    role="img"
                    aria-label={`Drawing canvas for letter ${currentLetter?.letter}. Use mouse or touch to trace the letter.`}
                    aria-describedby="canvas-instructions"
                  />
                  </div>

                  {/* Mobile-optimized button layout */}
                  <div className="mt-2 md:mt-3 space-y-2 md:space-y-3 flex-shrink-0">
                    {/* Primary action row */}
                    <div className="flex justify-center">
                      <Button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          console.log('Check stroke clicked')
                          checkCurrentStroke()
                        }} 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 md:px-6 lg:px-8 py-1.5 md:py-2 lg:py-3 text-sm md:text-base lg:text-lg font-semibold shadow-lg"
                        size="lg"
                        style={{ pointerEvents: 'auto', zIndex: 10 }}
                      >
                        <CheckCircle className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 mr-1 md:mr-2" />
                        Check Stroke
                      </Button>
                    </div>
                    
                    {/* Secondary actions row */}
                    <div className="flex justify-center gap-1.5 md:gap-2 lg:gap-3">
                      <Button 
                        onClick={() => { const prev = (letterIndex - 1 + tracingLetters.length) % tracingLetters.length; setLetterIndex(prev); setCurrentLetter(tracingLetters[prev]); clearCanvas(); }} 
                        variant="outline"
                        className="px-2 md:px-3 lg:px-4 py-1.5 md:py-2 text-xs md:text-sm lg:text-base dark:border-slate-600 dark:text-white"
                      >
                        Previous
                      </Button>
                      <Button 
                        onClick={clearCanvas} 
                        variant="outline"
                        className="px-2 md:px-3 lg:px-4 py-1.5 md:py-2 text-xs md:text-sm lg:text-base dark:border-slate-600 dark:text-white"
                      >
                        <RotateCcw className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                      Clear
                    </Button>
                      <Button 
                        onClick={() => { const next = (letterIndex + 1) % tracingLetters.length; setLetterIndex(next); setCurrentLetter(tracingLetters[next]); clearCanvas(); }}
                        className="px-2 md:px-3 lg:px-4 py-1.5 md:py-2 text-xs md:text-sm lg:text-base dark:bg-blue-600 dark:text-white"
                      >
                        Next
                    </Button>
                    </div>
                  </div>

                  {/* Progress indicator */}
                  <div className="mt-2 md:mt-3 text-center flex-shrink-0">
                    <div className="text-xs md:text-sm lg:text-base md:text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1.5 md:mb-2 lg:mb-3">
                      Step {Math.min(strokesCompleted + 1, requiredStrokes)} of {requiredStrokes}
                    </div>
                    <div className="flex justify-center gap-1.5 md:gap-2">
                      {Array.from({ length: requiredStrokes }, (_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 ${
                            i < strokesCompleted 
                              ? 'bg-green-500 shadow-lg' 
                              : i === strokesCompleted 
                                ? 'bg-blue-500 shadow-lg animate-pulse' 
                                : 'bg-gray-300 dark:bg-gray-600'
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
              className="hidden md:flex flex-col min-h-0"
            >
              <Card className="card-writing h-full flex flex-col dark:bg-slate-800 dark:border-slate-700">
                <CardContent className="p-3 md:p-4 lg:p-6 xl:p-8 flex flex-col h-full overflow-y-auto">
                  <h4 className="text-base md:text-lg lg:text-xl font-bold text-gray-800 dark:text-white mb-3 md:mb-4 lg:mb-6 text-center flex-shrink-0">How to Trace</h4>
                  
                  <div className="space-y-2 md:space-y-3 lg:space-y-4 flex-1">
                    <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 lg:p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg md:rounded-xl">
                      <div className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xs md:text-sm lg:text-base flex-shrink-0">1</div>
                      <p className="text-xs md:text-sm lg:text-base text-gray-700 dark:text-gray-200">Draw each stroke of the letter</p>
                    </div>
                    
                    <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 lg:p-4 bg-green-50 dark:bg-green-900/30 rounded-lg md:rounded-xl">
                      <div className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-xs md:text-sm lg:text-base flex-shrink-0">2</div>
                      <p className="text-xs md:text-sm lg:text-base text-gray-700 dark:text-gray-200">Click "Check Stroke" when done with each stroke</p>
                    </div>
                    
                    <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 lg:p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg md:rounded-xl">
                      <div className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-xs md:text-sm lg:text-base flex-shrink-0">3</div>
                      <p className="text-xs md:text-sm lg:text-base text-gray-700 dark:text-gray-200">Complete all {requiredStrokes} stroke{requiredStrokes > 1 ? 's' : ''} to finish</p>
                    </div>
                  </div>

                  {/* Score Display */}
                  <div className="mt-4 md:mt-6 lg:mt-8 grid grid-cols-2 gap-2 md:gap-3 lg:gap-4 flex-shrink-0">
                    <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg md:rounded-xl p-2 md:p-3 lg:p-4 text-center">
                      <Star className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-1 md:mb-2" />
                      <div className="text-lg md:text-xl lg:text-2xl font-bold text-yellow-600 dark:text-yellow-400">{score}</div>
                      <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Points</div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg md:rounded-xl p-2 md:p-3 lg:p-4 text-center">
                      <Trophy className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-blue-600 dark:text-blue-400 mx-auto mb-1 md:mb-2" />
                      <div className="text-lg md:text-xl lg:text-2xl font-bold text-blue-600 dark:text-blue-400">{completedActivities}</div>
                      <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Done</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          ) : (
            <div className="max-w-4xl mx-auto text-center p-8">
              <Card className="card-writing">
                <CardContent className="p-8">
                  <p className="text-gray-600">Loading letter tracing...</p>
                  <p className="text-sm text-gray-500 mt-2">Initializing canvas...</p>
                </CardContent>
              </Card>
            </div>
          )
        ) : null}

        {/* Creative Writing Activity */}
        {activityType === 'creative' ? (
          currentPrompt ? (
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
                          type="button"
                          className="btn-primary-kid"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            console.log('Submit creative writing clicked')
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
                          style={{ pointerEvents: 'auto', zIndex: 10 }}
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
          ) : (
            <div className="max-w-4xl mx-auto text-center p-8">
              <Card className="card-writing">
                <CardContent className="p-8">
                  <p className="text-gray-600">Loading creative writing...</p>
                  <p className="text-sm text-gray-500 mt-2">Current prompt: {currentPrompt?.title || 'None'}</p>
                </CardContent>
              </Card>
            </div>
          )
        ) : null}

        {/* Word Builder Activity */}
        {activityType === 'wordbuilder' ? (
          currentWord ? (
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
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            console.log('Letter clicked:', letter)
                            addLetterToWord(letter)
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          layout
                          style={{ pointerEvents: 'auto', zIndex: 10 }}
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
          ) : (
            <div className="max-w-4xl mx-auto text-center p-8">
              <Card className="card-writing">
                <CardContent className="p-8">
                  <p className="text-gray-600">Loading word builder...</p>
                  <p className="text-sm text-gray-500 mt-2">Current word: {currentWord?.word || 'None'}</p>
                  <p className="text-sm text-gray-500">Letters available: {builderLetters.length}</p>
                </CardContent>
              </Card>
            </div>
          )
        ) : null}

        {/* Sentence Puzzles Activity */}
        {activityType === 'sentences' ? (
          currentSentence ? (
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
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            console.log('Word clicked:', w)
                            setChosenWords(prev => [...prev, w])
                            setScrambledWords(prev => prev.filter((_, i) => i !== idx))
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          style={{ pointerEvents: 'auto', zIndex: 10 }}
                        >
                          {w}
                        </motion.button>
                      ))}
                    </div>

                    {/* Controls */}
                    <div className="flex gap-4 justify-center mt-8">
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          console.log('Check sentence clicked')
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
                        style={{ pointerEvents: 'auto', zIndex: 10 }}
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
          ) : (
            <div className="max-w-4xl mx-auto text-center p-8">
              <Card className="card-writing">
                <CardContent className="p-8">
                  <p className="text-gray-600">Loading sentence puzzles...</p>
                  <p className="text-sm text-gray-500 mt-2">Current sentence: {currentSentence || 'None'}</p>
                  <p className="text-sm text-gray-500">Words available: {scrambledWords.length}</p>
                </CardContent>
              </Card>
            </div>
          )
        ) : null}

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
