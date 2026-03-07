'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Mascot } from '@/components/ui/mascot'
import { 
  Puzzle, ArrowLeft, Star, Trophy, RefreshCw, CheckCircle, 
  X, Volume2, VolumeX, Shuffle, Lightbulb, Target
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { audioManager } from '@/lib/audio-manager'
import { progressManager } from '@/lib/progress'
import { challengeManager } from '@/lib/challenges'

type PuzzleType = 'word' | 'sentence' | 'picture' | 'word-picture' | 'jigsaw'

interface WordPuzzle {
  word: string
  hint: string
  scrambled: string[]
}

interface SentencePuzzle {
  sentence: string
  words: string[]
  scrambled: string[]
}

interface PicturePuzzle {
  word: string
  image: string
  options: string[]
  correct: number
}

interface JigsawPuzzle {
  id: string
  image: string
  pieces: number
  category: string
}

/** Fisher-Yates shuffle - ensures uniform random order (unlike sort(() => Math.random() - 0.5)) */
function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Word + picture puzzles: each piece has an image part and one letter; assemble to spell the word (e.g. bug, pig, duck, cat) */
interface WordPicturePuzzle {
  word: string
  emoji: string
  hint: string
}

const WORD_PICTURE_PUZZLES: WordPicturePuzzle[] = [
  { word: 'bug', emoji: '🐞', hint: 'A little red insect with spots' },
  { word: 'pig', emoji: '🐷', hint: 'Says oink!' },
  { word: 'duck', emoji: '🦆', hint: 'Likes water and says quack' },
  { word: 'cat', emoji: '🐱', hint: 'A furry pet that says meow' },
  { word: 'dog', emoji: '🐶', hint: 'A loyal friend' },
  { word: 'sun', emoji: '☀️', hint: 'Shines in the sky' },
  { word: 'car', emoji: '🚗', hint: 'Takes you places' },
  { word: 'ball', emoji: '⚽', hint: 'You can kick or throw it' },
]

const WORD_PUZZLES: WordPuzzle[] = [
  { word: 'APPLE', hint: 'A red fruit', scrambled: ['A', 'P', 'P', 'L', 'E'] },
  { word: 'BANANA', hint: 'A yellow fruit', scrambled: ['B', 'A', 'N', 'A', 'N', 'A'] },
  { word: 'CAT', hint: 'A furry pet', scrambled: ['C', 'A', 'T'] },
  { word: 'DOG', hint: 'A loyal friend', scrambled: ['D', 'O', 'G'] },
  { word: 'ELEPHANT', hint: 'A big gray animal', scrambled: ['E', 'L', 'E', 'P', 'H', 'A', 'N', 'T'] },
  { word: 'FISH', hint: 'Lives in water', scrambled: ['F', 'I', 'S', 'H'] },
  { word: 'GIRAFFE', hint: 'Has a long neck', scrambled: ['G', 'I', 'R', 'A', 'F', 'F', 'E'] },
  { word: 'HOUSE', hint: 'Where we live', scrambled: ['H', 'O', 'U', 'S', 'E'] },
  { word: 'ICE', hint: 'Frozen water', scrambled: ['I', 'C', 'E'] },
  { word: 'JUMP', hint: 'Move up quickly', scrambled: ['J', 'U', 'M', 'P'] },
  { word: 'KITE', hint: 'Flies in the sky', scrambled: ['K', 'I', 'T', 'E'] },
  { word: 'LION', hint: 'King of the jungle', scrambled: ['L', 'I', 'O', 'N'] },
  { word: 'MOON', hint: 'Shines at night', scrambled: ['M', 'O', 'O', 'N'] },
  { word: 'NOSE', hint: 'We smell with it', scrambled: ['N', 'O', 'S', 'E'] },
  { word: 'ORANGE', hint: 'A round orange fruit', scrambled: ['O', 'R', 'A', 'N', 'G', 'E'] },
  { word: 'PIG', hint: 'Says oink', scrambled: ['P', 'I', 'G'] },
  { word: 'QUEEN', hint: 'A royal lady', scrambled: ['Q', 'U', 'E', 'E', 'N'] },
  { word: 'RAIN', hint: 'Falls from clouds', scrambled: ['R', 'A', 'I', 'N'] },
  { word: 'SUN', hint: 'Shines in the day', scrambled: ['S', 'U', 'N'] },
  { word: 'TREE', hint: 'Has leaves and branches', scrambled: ['T', 'R', 'E', 'E'] },
  { word: 'UMBRELLA', hint: 'Keeps us dry', scrambled: ['U', 'M', 'B', 'R', 'E', 'L', 'L', 'A'] },
  { word: 'VIOLIN', hint: 'A musical instrument', scrambled: ['V', 'I', 'O', 'L', 'I', 'N'] },
  { word: 'WATER', hint: 'We drink it', scrambled: ['W', 'A', 'T', 'E', 'R'] },
  { word: 'XRAY', hint: 'Shows bones', scrambled: ['X', 'R', 'A', 'Y'] },
  { word: 'YELLOW', hint: 'Color of the sun', scrambled: ['Y', 'E', 'L', 'L', 'O', 'W'] },
  { word: 'ZEBRA', hint: 'Black and white stripes', scrambled: ['Z', 'E', 'B', 'R', 'A'] }
]

const SENTENCE_PUZZLES: SentencePuzzle[] = [
  { sentence: 'I love apples', words: ['I', 'love', 'apples'], scrambled: ['apples', 'I', 'love'] },
  { sentence: 'The cat is sleeping', words: ['The', 'cat', 'is', 'sleeping'], scrambled: ['sleeping', 'The', 'cat', 'is'] },
  { sentence: 'We play in the park', words: ['We', 'play', 'in', 'the', 'park'], scrambled: ['park', 'We', 'play', 'in', 'the'] },
  { sentence: 'My dog is happy', words: ['My', 'dog', 'is', 'happy'], scrambled: ['happy', 'My', 'dog', 'is'] },
  { sentence: 'The sun is bright', words: ['The', 'sun', 'is', 'bright'], scrambled: ['bright', 'The', 'sun', 'is'] },
  { sentence: 'I can read books', words: ['I', 'can', 'read', 'books'], scrambled: ['books', 'I', 'can', 'read'] },
  { sentence: 'Birds fly in the sky', words: ['Birds', 'fly', 'in', 'the', 'sky'], scrambled: ['sky', 'Birds', 'fly', 'in', 'the'] },
  { sentence: 'Fish swim in water', words: ['Fish', 'swim', 'in', 'water'], scrambled: ['water', 'Fish', 'swim', 'in'] }
]

const PICTURE_PUZZLES: PicturePuzzle[] = [
  { word: 'APPLE', image: '🍎', options: ['APPLE', 'ORANGE', 'BANANA', 'GRAPE'], correct: 0 },
  { word: 'CAT', image: '🐱', options: ['DOG', 'CAT', 'BIRD', 'FISH'], correct: 1 },
  { word: 'DOG', image: '🐶', options: ['CAT', 'DOG', 'RABBIT', 'MOUSE'], correct: 1 },
  { word: 'SUN', image: '☀️', options: ['MOON', 'STAR', 'SUN', 'CLOUD'], correct: 2 },
  { word: 'TREE', image: '🌳', options: ['FLOWER', 'TREE', 'GRASS', 'LEAF'], correct: 1 },
  { word: 'CAR', image: '🚗', options: ['BUS', 'CAR', 'BIKE', 'PLANE'], correct: 1 },
  { word: 'BOOK', image: '📚', options: ['PEN', 'BOOK', 'PAPER', 'PENCIL'], correct: 1 },
  { word: 'BALL', image: '⚽', options: ['BALL', 'TOY', 'DOLL', 'BLOCK'], correct: 0 }
]

export default function PuzzleModule() {
  const router = useRouter()
  const [puzzleType, setPuzzleType] = useState<PuzzleType | null>(null)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [showHint, setShowHint] = useState(false)
  const [muted, setMuted] = useState(false)

  // Word Puzzle State
  const [wordPuzzleIndex, setWordPuzzleIndex] = useState(0)
  const [selectedLetters, setSelectedLetters] = useState<string[]>([])
  const [availableLetters, setAvailableLetters] = useState<string[]>([])

  // Sentence Puzzle State
  const [sentencePuzzleIndex, setSentencePuzzleIndex] = useState(0)
  const [selectedWords, setSelectedWords] = useState<string[]>([])
  const [availableWords, setAvailableWords] = useState<string[]>([])

  // Picture Puzzle State
  const [picturePuzzleIndex, setPicturePuzzleIndex] = useState(0)
  const [selectedPictureAnswer, setSelectedPictureAnswer] = useState<number | null>(null)

  // Word-Picture (letter pieces) state: order[i] = letter index at slot i
  const [wordPictureIndex, setWordPictureIndex] = useState(0)
  const [pieceOrder, setPieceOrder] = useState<number[]>([])
  const [draggedSlot, setDraggedSlot] = useState<number | null>(null)
  const [tappedSlot, setTappedSlot] = useState<number | null>(null)

  // Game state
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [completedPuzzles, setCompletedPuzzles] = useState(0)

  useEffect(() => {
    if (puzzleType === 'word' && WORD_PUZZLES[wordPuzzleIndex]) {
      const puzzle = WORD_PUZZLES[wordPuzzleIndex]
      const shuffled = [...puzzle.scrambled].sort(() => Math.random() - 0.5)
      setAvailableLetters(shuffled)
      setSelectedLetters([])
      setShowHint(false)
    }
  }, [puzzleType, wordPuzzleIndex])

  useEffect(() => {
    if (puzzleType === 'sentence' && SENTENCE_PUZZLES[sentencePuzzleIndex]) {
      const puzzle = SENTENCE_PUZZLES[sentencePuzzleIndex]
      const shuffled = [...puzzle.scrambled].sort(() => Math.random() - 0.5)
      setAvailableWords(shuffled)
      setSelectedWords([])
      setShowHint(false)
    }
  }, [puzzleType, sentencePuzzleIndex])

  useEffect(() => {
    if (puzzleType === 'word-picture' && WORD_PICTURE_PUZZLES[wordPictureIndex]) {
      const puzzle = WORD_PICTURE_PUZZLES[wordPictureIndex]
      const indices = Array.from({ length: puzzle.word.length }, (_, i) => i)
      let order = shuffleArray(indices)
      // Never show puzzle already solved: reshuffle until order is not correct
      while (order.every((letterIndex, slot) => letterIndex === slot) && order.length > 1) {
        order = shuffleArray(indices)
      }
      setPieceOrder(order)
      setShowHint(false)
    }
  }, [puzzleType, wordPictureIndex])

  const handleLetterClick = (letter: string, index: number) => {
    if (puzzleType !== 'word') return
    
    setAvailableLetters(prev => prev.filter((_, i) => i !== index))
    setSelectedLetters(prev => [...prev, letter])
    checkWordPuzzle()
  }

  const handleLetterRemove = (letter: string, index: number) => {
    if (puzzleType !== 'word') return
    
    setSelectedLetters(prev => prev.filter((_, i) => i !== index))
    setAvailableLetters(prev => [...prev, letter].sort(() => Math.random() - 0.5))
    checkWordPuzzle()
  }

  const handleWordClick = (word: string, index: number) => {
    if (puzzleType !== 'sentence') return
    
    setAvailableWords(prev => prev.filter((_, i) => i !== index))
    setSelectedWords(prev => [...prev, word])
    checkSentencePuzzle()
  }

  const handleWordRemove = (word: string, index: number) => {
    if (puzzleType !== 'sentence') return
    
    setSelectedWords(prev => prev.filter((_, i) => i !== index))
    setAvailableWords(prev => [...prev, word].sort(() => Math.random() - 0.5))
    checkSentencePuzzle()
  }

  const checkWordPuzzle = () => {
    if (puzzleType !== 'word' || !WORD_PUZZLES[wordPuzzleIndex]) return
    
    const puzzle = WORD_PUZZLES[wordPuzzleIndex]
    const currentWord = selectedLetters.join('')
    
    if (currentWord.length === puzzle.word.length) {
      if (currentWord === puzzle.word) {
        handleCorrect()
      }
    }
  }

  const checkSentencePuzzle = () => {
    if (puzzleType !== 'sentence' || !SENTENCE_PUZZLES[sentencePuzzleIndex]) return
    
    const puzzle = SENTENCE_PUZZLES[sentencePuzzleIndex]
    const currentSentence = selectedWords.join(' ')
    
    if (selectedWords.length === puzzle.words.length) {
      if (currentSentence.toLowerCase() === puzzle.sentence.toLowerCase()) {
        handleCorrect()
      }
    }
  }

  const handlePictureAnswer = (index: number) => {
    if (puzzleType !== 'picture') return
    
    setSelectedPictureAnswer(index)
    const puzzle = PICTURE_PUZZLES[picturePuzzleIndex]
    
    if (index === puzzle.correct) {
      handleCorrect()
    } else {
      handleIncorrect()
    }
  }

  const handleCorrect = () => {
    setIsCorrect(true)
    setShowFeedback(true)
    setScore(prev => prev + 10)
    setCompletedPuzzles(prev => prev + 1)
    
    try {
      audioManager.playSuccess()
      progressManager.addScore(10, 5)
      challengeManager.updateChallengeProgress('puzzle', 1)
    } catch (error) {
      console.error('Error updating progress:', error)
    }

    setTimeout(() => {
      nextPuzzle()
    }, 1500)
  }

  const handleIncorrect = () => {
    setIsCorrect(false)
    setShowFeedback(true)
    
    try {
      audioManager.playError()
    } catch (error) {
      console.error('Error playing sound:', error)
    }

    setTimeout(() => {
      setShowFeedback(false)
      setIsCorrect(null)
      if (puzzleType === 'picture') {
        setSelectedPictureAnswer(null)
      }
    }, 1500)
  }

  const nextPuzzle = () => {
    setShowFeedback(false)
    setIsCorrect(null)
    setShowHint(false)
    
    if (puzzleType === 'word') {
      const nextIndex = (wordPuzzleIndex + 1) % WORD_PUZZLES.length
      setWordPuzzleIndex(nextIndex)
      if (nextIndex === 0) setLevel(prev => prev + 1)
    } else if (puzzleType === 'sentence') {
      const nextIndex = (sentencePuzzleIndex + 1) % SENTENCE_PUZZLES.length
      setSentencePuzzleIndex(nextIndex)
      if (nextIndex === 0) setLevel(prev => prev + 1)
    } else if (puzzleType === 'picture') {
      const nextIndex = (picturePuzzleIndex + 1) % PICTURE_PUZZLES.length
      setPicturePuzzleIndex(nextIndex)
      setSelectedPictureAnswer(null)
      if (nextIndex === 0) setLevel(prev => prev + 1)
    } else if (puzzleType === 'word-picture') {
      setPieceOrder([]) // clear so stale "solved" order doesn't trigger checkWordPictureCorrect and skip the next puzzle
      setTappedSlot(null)
      const nextIndex = (wordPictureIndex + 1) % WORD_PICTURE_PUZZLES.length
      setWordPictureIndex(nextIndex)
      if (nextIndex === 0) setLevel(prev => prev + 1)
    }
  }

  const resetPuzzle = () => {
    setShowFeedback(false)
    setIsCorrect(null)
    setShowHint(false)
    
    if (puzzleType === 'word') {
      const puzzle = WORD_PUZZLES[wordPuzzleIndex]
      const shuffled = [...puzzle.scrambled].sort(() => Math.random() - 0.5)
      setAvailableLetters(shuffled)
      setSelectedLetters([])
    } else if (puzzleType === 'sentence') {
      const puzzle = SENTENCE_PUZZLES[sentencePuzzleIndex]
      const shuffled = [...puzzle.scrambled].sort(() => Math.random() - 0.5)
      setAvailableWords(shuffled)
      setSelectedWords([])
    } else if (puzzleType === 'picture') {
      setSelectedPictureAnswer(null)
    } else if (puzzleType === 'word-picture') {
      const puzzle = WORD_PICTURE_PUZZLES[wordPictureIndex]
      const indices = Array.from({ length: puzzle.word.length }, (_, i) => i)
      let order = shuffleArray(indices)
      while (order.every((letterIndex, slot) => letterIndex === slot) && order.length > 1) {
        order = shuffleArray(indices)
      }
      setPieceOrder(order)
      setTappedSlot(null)
    }
  }

  const checkWordPictureCorrect = useCallback(() => {
    const puzzle = WORD_PICTURE_PUZZLES[wordPictureIndex]
    if (puzzleType !== 'word-picture' || !puzzle || pieceOrder.length !== puzzle.word.length) return
    const correct = pieceOrder.every((letterIndex, slot) => letterIndex === slot)
    if (correct && !showFeedback) handleCorrect()
  }, [puzzleType, wordPictureIndex, pieceOrder, showFeedback])

  useEffect(() => {
    checkWordPictureCorrect()
  }, [pieceOrder, checkWordPictureCorrect])

  const handlePieceDragStart = (slotIndex: number) => {
    setDraggedSlot(slotIndex)
  }
  const handlePieceDragOver = (e: React.DragEvent) => e.preventDefault()
  const handlePieceDrop = (targetSlot: number) => {
    if (draggedSlot === null || draggedSlot === targetSlot) return
    setPieceOrder(prev => {
      const next = [...prev]
      ;[next[draggedSlot!], next[targetSlot]] = [next[targetSlot], next[draggedSlot!]]
      return next
    })
    setDraggedSlot(null)
  }

  const handlePieceClick = (slotIndex: number) => {
    if (tappedSlot === null) {
      setTappedSlot(slotIndex)
      return
    }
    if (tappedSlot === slotIndex) {
      setTappedSlot(null)
      return
    }
    setPieceOrder(prev => {
      const next = [...prev]
      ;[next[tappedSlot], next[slotIndex]] = [next[slotIndex], next[tappedSlot]]
      return next
    })
    setTappedSlot(null)
  }

  const speakWord = (word: string) => {
    if (!muted) {
      try {
        audioManager.speak(word)
      } catch (error) {
        console.error('Error speaking:', error)
      }
    }
  }

  const puzzleTypes = [
    {
      id: 'word-picture' as PuzzleType,
      name: 'Word Picture Puzzle',
      description: 'Put the pieces in order to spell the word!',
      icon: <Puzzle className="w-8 h-8" />,
      color: 'from-[#8eca40] to-[#00aeef]'
    },
    {
      id: 'word' as PuzzleType,
      name: 'Word Puzzle',
      description: 'Arrange letters to form words',
      icon: <Target className="w-8 h-8" />,
      color: 'from-blue-400 to-cyan-500'
    },
    {
      id: 'sentence' as PuzzleType,
      name: 'Sentence Puzzle',
      description: 'Arrange words to form sentences',
      icon: <Target className="w-8 h-8" />,
      color: 'from-green-400 to-emerald-500'
    },
    {
      id: 'picture' as PuzzleType,
      name: 'Picture Match',
      description: 'Match pictures with words',
      icon: <Lightbulb className="w-8 h-8" />,
      color: 'from-purple-400 to-pink-500'
    }
  ]

  if (!puzzleType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900 p-4">
        <div className="container mx-auto max-w-6xl py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => router.push('/learning')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Learning
            </Button>
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg"
              >
                <Puzzle className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Puzzle Games
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Solve puzzles and learn English!
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {puzzleTypes.map((type, index) => (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  className="card-kid cursor-pointer group relative overflow-hidden h-full"
                  onClick={() => setPuzzleType(type.id)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  <CardContent className="p-6 text-center relative">
                    <motion.div
                      className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${type.color} flex items-center justify-center shadow-lg text-white`}
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {type.icon}
                    </motion.div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                      {type.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {type.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const currentWordPuzzle = WORD_PUZZLES[wordPuzzleIndex]
  const currentSentencePuzzle = SENTENCE_PUZZLES[sentencePuzzleIndex]
  const currentPicturePuzzle = PICTURE_PUZZLES[picturePuzzleIndex]
  const currentWordPicturePuzzle = WORD_PICTURE_PUZZLES[wordPictureIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900 p-4">
      <div className="container mx-auto max-w-4xl py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => setPuzzleType(null)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 px-4 py-2 rounded-full shadow-md">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="font-bold text-gray-800 dark:text-white">{score}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 px-4 py-2 rounded-full shadow-md">
              <Trophy className="w-5 h-5 text-purple-500" />
              <span className="font-bold text-gray-800 dark:text-white">Level {level}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMuted(!muted)}
              className="rounded-full"
            >
              {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Word Puzzle */}
        {puzzleType === 'word' && currentWordPuzzle && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <Card className="card-kid">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Word Puzzle
                  </h2>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowHint(!showHint)}
                    >
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Hint
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetPuzzle}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {showHint && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-xl p-4"
                  >
                    <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
                      💡 Hint: {currentWordPuzzle.hint}
                    </p>
                  </motion.div>
                )}

                <div className="text-center">
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 min-h-[120px] flex items-center justify-center border-4 border-dashed border-purple-300 dark:border-purple-700">
                    {selectedLetters.length > 0 ? (
                      <div className="flex gap-3 flex-wrap justify-center">
                        {selectedLetters.map((letter, index) => (
                          <motion.button
                            key={`${letter}-${index}`}
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleLetterRemove(letter, index)}
                            className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 text-white text-2xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                          >
                            {letter}
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 dark:text-gray-500 text-lg">
                        Arrange the letters below to form a word
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 text-center">
                    Available Letters
                  </p>
                  <div className="flex gap-3 flex-wrap justify-center">
                    {availableLetters.map((letter, index) => (
                      <motion.button
                        key={`${letter}-${index}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.1, y: -5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleLetterClick(letter, index)}
                        className="w-16 h-16 bg-white dark:bg-slate-700 text-gray-800 dark:text-white text-2xl font-bold rounded-xl shadow-md hover:shadow-lg border-2 border-purple-200 dark:border-purple-800 transition-all cursor-pointer"
                      >
                        {letter}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <AnimatePresence>
                  {showFeedback && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className={`text-center p-4 rounded-xl ${
                        isCorrect
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                      }`}
                    >
                      {isCorrect ? (
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle className="w-6 h-6" />
                          <span className="font-bold text-lg">Excellent! +10 points</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <X className="w-6 h-6" />
                          <span className="font-bold text-lg">Try again!</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Sentence Puzzle */}
        {puzzleType === 'sentence' && currentSentencePuzzle && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <Card className="card-kid">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Sentence Puzzle
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetPuzzle}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 min-h-[120px] flex items-center justify-center border-4 border-dashed border-green-300 dark:border-green-700">
                    {selectedWords.length > 0 ? (
                      <div className="flex gap-3 flex-wrap justify-center">
                        {selectedWords.map((word, index) => (
                          <motion.button
                            key={`${word}-${index}`}
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleWordRemove(word, index)}
                            className="px-6 py-3 bg-gradient-to-br from-green-400 to-emerald-500 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                          >
                            {word}
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 dark:text-gray-500 text-lg">
                        Arrange the words below to form a sentence
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 text-center">
                    Available Words
                  </p>
                  <div className="flex gap-3 flex-wrap justify-center">
                    {availableWords.map((word, index) => (
                      <motion.button
                        key={`${word}-${index}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.1, y: -5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleWordClick(word, index)}
                        className="px-6 py-3 bg-white dark:bg-slate-700 text-gray-800 dark:text-white text-lg font-semibold rounded-xl shadow-md hover:shadow-lg border-2 border-green-200 dark:border-green-800 transition-all cursor-pointer"
                      >
                        {word}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <AnimatePresence>
                  {showFeedback && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className={`text-center p-4 rounded-xl ${
                        isCorrect
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                      }`}
                    >
                      {isCorrect ? (
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle className="w-6 h-6" />
                          <span className="font-bold text-lg">Excellent! +10 points</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <X className="w-6 h-6" />
                          <span className="font-bold text-lg">Try again!</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Picture Puzzle */}
        {puzzleType === 'picture' && currentPicturePuzzle && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <Card className="card-kid">
              <CardHeader>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Picture Match
                </h2>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="text-9xl mb-6"
                  >
                    {currentPicturePuzzle.image}
                  </motion.div>
                  <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-6">
                    What word matches this picture?
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {currentPicturePuzzle.options.map((option, index) => (
                    <motion.button
                      key={option}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePictureAnswer(index)}
                      disabled={selectedPictureAnswer !== null}
                      className={`p-6 rounded-2xl text-lg font-bold shadow-lg transition-all ${
                        selectedPictureAnswer === index
                          ? index === currentPicturePuzzle.correct
                            ? 'bg-green-400 text-white'
                            : 'bg-red-400 text-white'
                          : 'bg-white dark:bg-slate-700 text-gray-800 dark:text-white hover:bg-purple-100 dark:hover:bg-purple-900/30 border-2 border-purple-200 dark:border-purple-800'
                      }`}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>

                <AnimatePresence>
                  {showFeedback && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className={`text-center p-4 rounded-xl ${
                        isCorrect
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                      }`}
                    >
                      {isCorrect ? (
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle className="w-6 h-6" />
                          <span className="font-bold text-lg">Excellent! +10 points</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <X className="w-6 h-6" />
                          <span className="font-bold text-lg">Try again! The correct answer is: {currentPicturePuzzle.word}</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Word Picture Puzzle - pieces with image + letter, drag to reorder */}
        {puzzleType === 'word-picture' && currentWordPicturePuzzle && pieceOrder.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <Card className="card-kid overflow-hidden border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Word Picture Puzzle
                  </h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowHint(!showHint)}>
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Hint
                    </Button>
                    <Button variant="outline" size="sm" onClick={resetPuzzle}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {showHint && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-4"
                  >
                    <p className="text-amber-800 dark:text-amber-200 font-semibold">
                      💡 {currentWordPicturePuzzle.hint}
                    </p>
                  </motion.div>
                )}

                <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
                  Drag pieces to reorder, or tap one piece then another to swap. Spell the word!
                </p>

                {/* Striped background area + puzzle pieces - responsive for portrait */}
                <div
                  className="relative rounded-2xl overflow-hidden min-h-[200px] p-4 sm:p-6"
                  style={{
                    background: 'repeating-linear-gradient(135deg, #e8f5e9 0px, #e8f5e9 12px, #fff 12px, #fff 24px)',
                  }}
                >
                  <div className="flex flex-wrap justify-center items-end gap-3 sm:gap-4">
                    {pieceOrder.map((letterIndex, slotIndex) => {
                      const letter = currentWordPicturePuzzle.word[letterIndex]
                      return (
                        <motion.div
                          key={`${slotIndex}-${letterIndex}`}
                          draggable
                          onDragStart={() => handlePieceDragStart(slotIndex)}
                          onDragOver={handlePieceDragOver}
                          onDrop={() => handlePieceDrop(slotIndex)}
                          onDragEnd={() => setDraggedSlot(null)}
                          onClick={() => handlePieceClick(slotIndex)}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: slotIndex * 0.05 }}
                          className={`
                            flex flex-col rounded-xl border-2 border-amber-200 dark:border-amber-800
                            bg-white dark:bg-slate-800 shadow-lg cursor-grab active:cursor-grabbing touch-manipulation
                            w-20 h-28 sm:w-24 sm:h-32 md:w-28 md:h-36
                            ${draggedSlot === slotIndex ? 'opacity-60 scale-95 ring-2 ring-[#00aeef]' : ''}
                            ${tappedSlot === slotIndex ? 'ring-2 ring-[#00aeef] ring-offset-2 scale-105' : ''}
                            hover:shadow-xl hover:scale-[1.02]
                          `}
                        >
                          <div className="flex-1 flex items-center justify-center p-1 text-4xl sm:text-5xl md:text-6xl">
                            {currentWordPicturePuzzle.emoji}
                          </div>
                          <div className="h-8 sm:h-10 flex items-center justify-center border-t-2 border-amber-200 dark:border-amber-700 bg-amber-50/80 dark:bg-slate-700/80 rounded-b-lg">
                            <span className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white lowercase">
                              {letter}
                            </span>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => speakWord(currentWordPicturePuzzle.word)}
                    className="text-gray-600 dark:text-gray-400"
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    Hear the word
                  </Button>
                </div>

                <AnimatePresence>
                  {showFeedback && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className={`text-center p-4 rounded-xl ${
                        isCorrect
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                      }`}
                    >
                      {isCorrect ? (
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle className="w-6 h-6" />
                          <span className="font-bold text-lg">Excellent! +10 points</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <X className="w-6 h-6" />
                          <span className="font-bold text-lg">Try again!</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}

