
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Mascot } from '@/components/ui/mascot'
import { ProgressRing } from '@/components/ui/progress-ring'
import { 
  Gamepad2, ArrowLeft, Star, Trophy, Clock, Shuffle,
  Brain, BookOpen, Target, Search, Zap, Heart
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface GameCard {
  id: string
  word: string
  image: string
  matched: boolean
  flipped: boolean
}

interface QuizQuestion {
  question: string
  options: string[]
  correct: number
  explanation: string
}

export default function GamesModule() {
  const router = useRouter()
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [gameTime, setGameTime] = useState(0)
  const [gameActive, setGameActive] = useState(false)
  
  // Memory Match Game
  const [memoryCards, setMemoryCards] = useState<GameCard[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matchedPairs, setMatchedPairs] = useState(0)

  // Word Hunt Game
  type HuntCell = { letter: string; found: boolean }
  const [huntWords, setHuntWords] = useState<string[]>([])
  const [foundWords, setFoundWords] = useState<string[]>([])
  const [huntGrid, setHuntGrid] = useState<HuntCell[][]>([])
  const [huntSelection, setHuntSelection] = useState<{ r: number; c: number }[]>([])
  const [huntSize, setHuntSize] = useState(10)

  // Quiz Arena
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [quizScore, setQuizScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showQuizResult, setShowQuizResult] = useState(false)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])

  // Story Adventure
  type StoryChoice = { text: string; next: number; points?: number }
  type StoryNode = { text: string; imageUrl?: string; choices: StoryChoice[] }
  type Story = { id: string; title: string; nodes: StoryNode[] }
  const [stories, setStories] = useState<Story[]>([])
  const [storyIndex, setStoryIndex] = useState(0)
  const [nodeIndex, setNodeIndex] = useState(0)
  const [storyActive, setStoryActive] = useState(false)

  // Spelling Bee
  type SpellingWord = { word: string; hint?: string; difficulty?: number }
  const [spellingWords, setSpellingWords] = useState<SpellingWord[]>([])
  const [spellingIndex, setSpellingIndex] = useState(0)
  const [spellingInput, setSpellingInput] = useState('')
  const [spellingCorrect, setSpellingCorrect] = useState<boolean | null>(null)
  const [spellingAttempts, setSpellingAttempts] = useState(0)

  const defaultQuiz: QuizQuestion[] = [
    { question: 'What sound does a cat make?', options: ['Woof', 'Meow', 'Moo', 'Chirp'], correct: 1, explanation: "Cats say 'meow'!" },
    { question: 'What color is the sun?', options: ['Blue', 'Green', 'Yellow', 'Purple'], correct: 2, explanation: 'The sun is bright yellow!' },
    { question: 'How many legs does a dog have?', options: ['Two', 'Three', 'Four', 'Five'], correct: 2, explanation: 'Dogs have four legs!' }
  ]

  const games = [
    {
      id: 'memory',
      name: 'Memory Match',
      description: 'Match pairs of words and pictures',
      icon: <Brain className="w-8 h-8" />,
      color: 'from-pink-400 to-rose-500',
      bgColor: 'bg-pink-50'
    },
    {
      id: 'story',
      name: 'Story Adventure',
      description: 'Interactive storytelling with choices',
      icon: <BookOpen className="w-8 h-8" />,
      color: 'from-purple-400 to-indigo-500',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'spelling',
      name: 'Spelling Bee',
      description: 'Spell words correctly to win',
      icon: <Target className="w-8 h-8" />,
      color: 'from-blue-400 to-cyan-500',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'quiz',
      name: 'Quiz Arena',
      description: 'Answer questions and test knowledge',
      icon: <Zap className="w-8 h-8" />,
      color: 'from-yellow-400 to-orange-500',
      bgColor: 'bg-yellow-50'
    },
    {
      id: 'hunt',
      name: 'Word Hunt',
      description: 'Find hidden words in the grid',
      icon: <Search className="w-8 h-8" />,
      color: 'from-green-400 to-emerald-500',
      bgColor: 'bg-green-50'
    }
  ]

  // Helpers: Word Hunt generation
  const directions = [
    { dr: 0, dc: 1 }, { dr: 1, dc: 0 }, { dr: 1, dc: 1 }, { dr: -1, dc: 1 },
    { dr: 0, dc: -1 }, { dr: -1, dc: 0 }, { dr: -1, dc: -1 }, { dr: 1, dc: -1 }
  ]

  const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

  const generateEmptyGrid = (size: number): HuntCell[][] =>
    Array.from({ length: size }, () => Array.from({ length: size }, () => ({ letter: '', found: false })))

  const canPlace = (grid: HuntCell[][], word: string, r: number, c: number, dr: number, dc: number) => {
    const size = grid.length
    for (let i = 0; i < word.length; i++) {
      const nr = r + dr * i, nc = c + dc * i
      if (nr < 0 || nr >= size || nc < 0 || nc >= size) return false
      const cell = grid[nr][nc]
      if (cell.letter && cell.letter !== word[i]) return false
    }
    return true
  }

  const placeWord = (grid: HuntCell[][], word: string) => {
    const size = grid.length
    for (let attempts = 0; attempts < 200; attempts++) {
      const dir = directions[randomInt(0, directions.length - 1)]
      const r = randomInt(0, size - 1)
      const c = randomInt(0, size - 1)
      if (canPlace(grid, word, r, c, dir.dr, dir.dc)) {
        for (let i = 0; i < word.length; i++) {
          const nr = r + dir.dr * i, nc = c + dir.dc * i
          grid[nr][nc].letter = word[i]
        }
        return true
      }
    }
    return false
  }

  const generateHunt = (words: string[], size: number) => {
    const grid = generateEmptyGrid(size)
    const sorted = [...words].sort((a, b) => b.length - a.length)
    sorted.forEach(w => placeWord(grid, w))
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!grid[r][c].letter) grid[r][c].letter = alphabet[randomInt(0, alphabet.length - 1)]
      }
    }
    setHuntGrid(grid)
    setFoundWords([])
    setHuntSelection([])
  }

  // Load Story Adventures
  useEffect(() => {
    const builtIn: Story[] = [
      {
        id: 'magic-forest',
        title: 'The Magic Forest',
        nodes: [
          { text: 'You enter a forest that sparkles with tiny lights. Two paths appear.', choices: [ { text: 'Go left', next: 1, points: 5 }, { text: 'Go right', next: 2, points: 5 } ] },
          { text: 'You meet a friendly fairy who offers a glowing key.', choices: [ { text: 'Take the key', next: 3, points: 10 }, { text: 'Say no thanks', next: 4 } ] },
          { text: 'You find a tall tree with a ladder leading up.', choices: [ { text: 'Climb the ladder', next: 5, points: 10 }, { text: 'Walk past it', next: 4 } ] },
          { text: 'The key opens a tiny door in a tree. Inside is a treasure of new words!', choices: [ { text: 'Celebrate!', next: -1, points: 10 } ] },
          { text: 'You keep walking and learn from the sounds of birds and wind.', choices: [ { text: 'Listen closely', next: -1, points: 5 } ] },
          { text: 'At the top, you can see the whole forest and a rainbow library.', choices: [ { text: 'Visit the library', next: -1, points: 10 } ] }
        ]
      }
    ]
    const loadStories = async () => {
      try {
        const res = await fetch('/story_adventures.json', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) { setStories(data); return }
        }
      } catch {}
      setStories(builtIn)
    }
    loadStories()

    const defaultSpelling: SpellingWord[] = [
      { word: 'APPLE', hint: 'A round red or green fruit', difficulty: 1 },
      { word: 'BUTTERFLY', hint: 'A colorful flying insect', difficulty: 2 },
      { word: 'ELEPHANT', hint: 'A large animal with a trunk', difficulty: 2 },
      { word: 'RAINBOW', hint: 'Many colors in the sky', difficulty: 1 },
      { word: 'UMBRELLA', hint: 'Keeps you dry in rain', difficulty: 1 },
      { word: 'XYLOPHONE', hint: 'An instrument you hit with sticks', difficulty: 3 }
    ]
    const loadSpelling = async () => {
      try {
        const res = await fetch('/spelling_bee_words.json', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) { setSpellingWords(data.map((w: any) => ({ word: String(w.word).toUpperCase(), hint: w.hint ? String(w.hint) : undefined, difficulty: Number(w.difficulty) || 1 }))); return }
        }
      } catch {}
      setSpellingWords(defaultSpelling)
    }
    loadSpelling()

    // Load Quiz Arena questions
    const loadQuiz = async () => {
      try {
        const res = await fetch('/quiz_questions.json', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            const normalized = data
              .filter((q: any) => typeof q?.question === 'string' && Array.isArray(q?.options) && Number.isInteger(q?.correct))
              .map((q: any) => ({
                question: String(q.question),
                options: q.options.slice(0, 4).map((o: any) => String(o)),
                correct: Math.max(0, Math.min(3, Number(q.correct))),
                explanation: typeof q.explanation === 'string' ? q.explanation : ''
              }))
            if (normalized.length > 0) { setQuizQuestions(normalized); return }
          }
        }
      } catch {}
      setQuizQuestions(defaultQuiz)
    }
    loadQuiz()

    // Load Word Hunt content
    const defaultHunt = ['CAT', 'DOG', 'BIRD', 'FISH', 'TREE', 'CLOUD', 'SUN', 'MOON', 'GRASS', 'RIVER']
    const loadHunt = async () => {
      try {
        const res = await fetch('/word_hunt.json', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            const ws = data.map((w: any) => String(w).toUpperCase())
            setHuntWords(ws)
            generateHunt(ws, huntSize)
            return
          }
          if (Array.isArray(data?.words)) {
            const ws = data.words.map((w: any) => String(w).toUpperCase())
            const size = Math.max(8, Math.min(14, data.size || huntSize))
            setHuntWords(ws)
            setHuntSize(size)
            generateHunt(ws, size)
            return
          }
        }
      } catch {}
      setHuntWords(defaultHunt)
      generateHunt(defaultHunt, huntSize)
    }
    loadHunt()
  }, [])

  // Initialize Memory Match Game
  const initializeMemoryGame = () => {
    const words = ['CAT', 'DOG', 'SUN', 'TREE', 'FISH', 'BIRD']
    const gameCards: GameCard[] = []
    
    const wordImages: { [key: string]: string } = {
      'CAT': 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop&crop=center',
      'DOG': 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&h=200&fit=crop&crop=center',
      'SUN': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop&crop=center',
      'TREE': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=200&fit=crop&crop=center',
      'FISH': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200&h=200&fit=crop&crop=center',
      'BIRD': 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=200&h=200&fit=crop&crop=center'
    }
    
    words.forEach((word, index) => {
      gameCards.push(
        { id: `${word}-word`, word, image: '', matched: false, flipped: false },
        { id: `${word}-img`, word, image: wordImages[word] || `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop&crop=center`, matched: false, flipped: false }
      )
    })

    setMemoryCards(shuffleArray(gameCards))
    setFlippedCards([])
    setMatchedPairs(0)
  }

  const shuffleArray = (array: any[]) => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  // Memory game logic
  const flipCard = (index: number) => {
    if (flippedCards.length === 2 || memoryCards[index].flipped || memoryCards[index].matched) return

    const newCards = [...memoryCards]
    newCards[index].flipped = true
    setMemoryCards(newCards)

    const newFlipped = [...flippedCards, index]
    setFlippedCards(newFlipped)

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped
      const firstCard = newCards[first]
      const secondCard = newCards[second]

      if (firstCard.word === secondCard.word) {
        // Match found
        setTimeout(() => {
          newCards[first].matched = true
          newCards[second].matched = true
          setMemoryCards([...newCards])
          setMatchedPairs(prev => prev + 1)
          setScore(prev => prev + 20)
          setFlippedCards([])
        }, 1000)
      } else {
        // No match
        setTimeout(() => {
          newCards[first].flipped = false
          newCards[second].flipped = false
          setMemoryCards([...newCards])
          setFlippedCards([])
        }, 1500)
      }
    }
  }

  // Quiz game logic
  const selectAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
    setShowQuizResult(true)

    if (answerIndex === quizQuestions[currentQuestion].correct) {
      setQuizScore(prev => prev + 10)
      setScore(prev => prev + 10)
    }

    setTimeout(() => {
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(prev => prev + 1)
        setSelectedAnswer(null)
        setShowQuizResult(false)
      } else {
        // Quiz complete
        setGameActive(false)
      }
    }, 2000)
  }

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (gameActive) {
      interval = setInterval(() => {
        setGameTime(prev => prev + 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [gameActive])

  // Start game
  const startGame = (gameId: string) => {
    setSelectedGame(gameId)
    setGameActive(true)
    setGameTime(0)
    
    if (gameId === 'memory') {
      initializeMemoryGame()
    } else if (gameId === 'quiz') {
      setCurrentQuestion(0)
      setQuizScore(0)
      setSelectedAnswer(null)
      setShowQuizResult(false)
    } else if (gameId === 'story') {
      setStoryActive(true)
      setStoryIndex(0)
      setNodeIndex(0)
    } else if (gameId === 'spelling') {
      setSpellingIndex(0)
      setSpellingInput('')
      setSpellingCorrect(null)
      setSpellingAttempts(0)
    } else if (gameId === 'hunt') {
      generateHunt(huntWords.length ? huntWords : ['CAT','DOG','SUN','TREE'], huntSize)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins + ':' + secs.toString().padStart(2, '0')
  }

  if (!selectedGame) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-50">
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
                  <Mascot emotion="excited" size="medium" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">Educational Games</h1>
                    <p className="text-gray-600">Fun games and adventures! 🎮</p>
                  </div>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-4">
                <div className="bg-white rounded-full px-4 py-2 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="font-bold text-gray-800">{score}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Choose Your Adventure!</h2>
            <p className="text-xl text-gray-600">Pick a game and start learning while having fun!</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {games.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="cursor-pointer"
                onClick={() => startGame(game.id)}
              >
                <Card className={'card-games ' + game.bgColor + ' h-full border-4 border-transparent hover:border-purple-300'}>
                  <CardContent className="p-6 text-center">
                    <div className={'w-20 h-20 bg-gradient-to-r ' + game.color + ' rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-xl'}>
                      {game.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{game.name}</h3>
                    <p className="text-gray-600 mb-6">{game.description}</p>
                    <Button className="btn-primary-kid w-full">
                      <Gamepad2 className="w-5 h-5 mr-2" />
                      Play Now!
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 text-center"
          >
            <Card className="card-kid max-w-2xl mx-auto">
              <CardContent className="p-6">
                <h4 className="text-xl font-bold text-gray-800 mb-4">Game Benefits 🌟</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-500" />
                    <span>Improve Memory</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    <span>Enhance Focus</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-500" />
                    <span>Build Confidence</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Game Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedGame(null)
                  setGameActive(false)
                  setGameTime(0)
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Games
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  {games.find(g => g.id === selectedGame)?.name}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(gameTime)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    <span>{score} points</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Mascot emotion="excited" size="medium" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Memory Match Game */}
        {selectedGame === 'memory' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Memory Match</h2>
              <p className="text-gray-600">Find matching pairs of words and pictures!</p>
              <div className="flex justify-center items-center gap-4 mt-4">
                <div className="bg-pink-100 px-4 py-2 rounded-full">
                  <span className="text-pink-800 font-semibold">Matches: {matchedPairs}/6</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              {memoryCards.map((card, index) => (
                <motion.div
                  key={card.id}
                  className="aspect-square cursor-pointer"
                  onClick={() => flipCard(index)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="relative w-full h-full">
                    <motion.div
                      className="w-full h-full rounded-xl shadow-lg"
                      animate={{ rotateY: card.flipped || card.matched ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {/* Card Back */}
                      <div 
                        className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center"
                        style={{ backfaceVisibility: 'hidden' }}
                      >
                        <div className="text-white text-4xl">?</div>
                      </div>
                      
                      {/* Card Front */}
                      <div 
                        className="absolute inset-0 bg-white rounded-xl p-2 flex items-center justify-center border-4 border-gray-200"
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                      >
                        {card.image ? (
                          <img 
                            src={card.image} 
                            alt={card.word}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-gray-800 text-lg font-bold text-center">
                            {card.word}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>

            {matchedPairs === 6 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center mt-8"
              >
                <Card className="card-kid max-w-md mx-auto">
                  <CardContent className="p-6">
                    <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Fantastic!</h3>
                    <p className="text-gray-600 mb-4">You found all the matches!</p>
                    <Button
                      onClick={() => initializeMemoryGame()}
                      className="btn-primary-kid"
                    >
                      <Shuffle className="w-4 h-4 mr-2" />
                      Play Again
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Quiz Arena Game */}
        {selectedGame === 'quiz' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto"
          >
            {gameActive && currentQuestion < quizQuestions.length ? (
              <Card className="card-kid">
                <CardHeader>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-800">Quiz Arena</h3>
                    <div className="flex justify-center items-center gap-4 mt-2">
                      <span className="text-gray-600">Question {currentQuestion + 1} of {quizQuestions.length}</span>
                      <div className="bg-blue-100 px-3 py-1 rounded-full">
                        <span className="text-blue-800 font-semibold">{quizScore} points</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h4 className="text-xl font-bold text-gray-800 mb-6">
                      {quizQuestions[currentQuestion].question}
                    </h4>

                    <div className="grid grid-cols-1 gap-4">
                      {quizQuestions[currentQuestion].options.map((option, index) => (
                        <motion.button
                          key={index}
                          onClick={() => !showQuizResult && selectAnswer(index)}
                          className={`p-4 rounded-xl text-left font-semibold transition-all ${
                            showQuizResult
                              ? index === quizQuestions[currentQuestion].correct
                                ? 'bg-green-100 border-2 border-green-400 text-green-800'
                                : index === selectedAnswer
                                ? 'bg-red-100 border-2 border-red-400 text-red-800'
                                : 'bg-gray-100 text-gray-600'
                              : 'bg-blue-50 hover:bg-blue-100 border-2 border-transparent hover:border-blue-300 text-gray-800'
                          }`}
                          whileHover={!showQuizResult ? { scale: 1.02 } : {}}
                          whileTap={!showQuizResult ? { scale: 0.98 } : {}}
                          disabled={showQuizResult}
                        >
                          {option}
                        </motion.button>
                      ))}
                    </div>

                    {showQuizResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-6 p-4 rounded-xl ${
                          selectedAnswer === quizQuestions[currentQuestion].correct
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        <p className="font-semibold">
                          {selectedAnswer === quizQuestions[currentQuestion].correct ? '✅ Correct!' : '❌ Not quite!'}
                        </p>
                        <p className="text-sm mt-1">{quizQuestions[currentQuestion].explanation}</p>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <Card className="card-kid">
                  <CardContent className="p-8">
                    <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-3xl font-bold text-gray-800 mb-2">Quiz Complete!</h3>
                    <p className="text-gray-600 mb-4">Final Score: {quizScore} points</p>
                    <div className="flex gap-4 justify-center">
                      <Button
                        onClick={() => {
                          setCurrentQuestion(0)
                          setQuizScore(0)
                          setSelectedAnswer(null)
                          setShowQuizResult(false)
                          setGameActive(true)
                        }}
                        className="btn-primary-kid"
                      >
                        Play Again
                      </Button>
                      <Button
                        onClick={() => setSelectedGame(null)}
                        variant="outline"
                      >
                        Choose Different Game
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Story Adventure */}
        {selectedGame === 'story' && stories[storyIndex] && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto">
            <Card className="card-kid">
              <CardHeader>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-800">{stories[storyIndex].title}</h3>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                {/* Story chooser */}
                {stories.length > 1 && (
                  <div className="flex flex-wrap gap-2 justify-center mb-6">
                    {stories.map((s, i) => (
                      <Button key={s.id} variant={storyIndex === i ? 'default' : 'outline'} onClick={() => { setStoryIndex(i); setNodeIndex(0); setStoryActive(true) }}>
                        {s.title}
                      </Button>
                    ))}
                  </div>
                )}
                <div className="text-center mb-6">
                  <p className="text-lg text-gray-700 mb-4">{stories[storyIndex].nodes[nodeIndex].text}</p>
                  <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
                    {stories[storyIndex].nodes[nodeIndex].choices.map((c, i) => (
                      <Button key={i} className="btn-primary-kid" onClick={() => {
                        if (typeof c.points === 'number') setScore(prev => prev + c.points!)
                        if (c.next === -1) { setStoryActive(false); return }
                        setNodeIndex(c.next)
                      }}>
                        {c.text}
                      </Button>
                    ))}
                  </div>
                </div>

                {!storyActive && (
                  <div className="text-center">
                    <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                    <p className="text-gray-700 mb-4">Adventure complete! Points earned: {score}</p>
                    <div className="flex gap-3 justify-center">
                      <Button onClick={() => { setStoryActive(true); setNodeIndex(0) }} className="btn-primary-kid">Play Again</Button>
                      {stories.length > 1 && (
                        <Button variant="outline" onClick={() => { const next = (storyIndex + 1) % stories.length; setStoryIndex(next); setNodeIndex(0); setStoryActive(true) }}>Next Story</Button>
                      )}
                      <Button variant="outline" onClick={() => setSelectedGame(null)}>Choose Different Game</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Word Hunt */}
        {selectedGame === 'hunt' && huntGrid.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto">
            <Card className="card-kid">
              <CardHeader>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-800">Word Hunt</h3>
                  <p className="text-gray-600">Find all the hidden words in the grid.</p>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="inline-grid" style={{ gridTemplateColumns: `repeat(${huntGrid.length}, 2.5rem)` }}>
                      {huntGrid.map((row, r) => row.map((cell, c) => (
                        <button
                          key={`${r}-${c}`}
                          onClick={() => {
                            setHuntSelection(sel => sel.some(p => p.r===r && p.c===c) ? sel.filter(p => !(p.r===r && p.c===c)) : [...sel, { r, c }])
                          }}
                          className={`w-10 h-10 m-[2px] rounded-lg font-bold ${cell.found ? 'bg-green-200 text-green-900' : 'bg-white text-gray-800 border'} ${huntSelection.some(p => p.r===r && p.c===c) ? 'ring-2 ring-purple-400' : ''}`}
                        >
                          {cell.letter}
                        </button>
                      )))}
                    </div>
                    <div className="mt-4 flex gap-3">
                      <Button variant="outline" onClick={() => setHuntSelection([])}>Clear Selection</Button>
                      <Button className="btn-primary-kid" onClick={() => {
                        if (huntSelection.length < 2) { setHuntSelection([]); return }
                        const rows = huntSelection.map(p=>p.r), cols = huntSelection.map(p=>p.c)
                        const dr = Math.sign(rows[rows.length-1]-rows[0])
                        const dc = Math.sign(cols[cols.length-1]-cols[0])
                        for (let i=1;i<huntSelection.length;i++) {
                          if (huntSelection[i].r !== huntSelection[0].r + dr*i || huntSelection[i].c !== huntSelection[0].c + dc*i) { setHuntSelection([]); return }
                        }
                        const str = huntSelection.map(p => huntGrid[p.r][p.c].letter).join('')
                        const strRev = str.split('').reverse().join('')
                        const match = huntWords.find(w => w === str || w === strRev)
                        if (match && !foundWords.includes(match)) {
                          setFoundWords(prev => [...prev, match])
                          const newGrid = huntGrid.map(row => row.map(cell => ({...cell})))
                          huntSelection.forEach(p => newGrid[p.r][p.c].found = true)
                          setHuntGrid(newGrid)
                          setScore(s => s + 10)
                        }
                        setHuntSelection([])
                      }}>Check Selection</Button>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-2">Words to find</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {huntWords.map(w => (
                        <div key={w} className={`px-3 py-2 rounded-lg text-center text-sm ${foundWords.includes(w) ? 'bg-green-100 text-green-800 line-through' : 'bg-gray-100 text-gray-700'}`}>{w}</div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <Button variant="outline" onClick={() => generateHunt(huntWords, huntSize)}>Regenerate</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Spelling Bee */}
        {selectedGame === 'spelling' && spellingWords.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto">
            <Card className="card-kid">
              <CardHeader>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-800">Spelling Bee</h3>
                  <div className="text-sm text-gray-600">Word {spellingIndex + 1} of {spellingWords.length}</div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="mb-3 text-gray-700">Hint: {spellingWords[spellingIndex].hint ?? 'Listen and spell the word.'}</div>
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Button onClick={() => {
                      const word = spellingWords[spellingIndex].word
                      if ('speechSynthesis' in window) {
                        const u = new SpeechSynthesisUtterance(word)
                        u.rate = 0.9; u.pitch = 1.0
                        window.speechSynthesis.speak(u)
                      }
                    }} className="btn-secondary-kid">
                      Listen to Word
                    </Button>
                    <Button variant="outline" onClick={() => setSpellingInput('')}>Clear</Button>
                  </div>

                  <input
                    value={spellingInput}
                    onChange={(e) => setSpellingInput(e.target.value.toUpperCase())}
                    placeholder="Type the spelling here"
                    className="w-full max-w-md mx-auto text-center text-2xl p-4 rounded-xl border-2 border-blue-200 focus:border-blue-400 outline-none"
                  />

                  <div className="mt-4 flex items-center justify-center gap-3">
                    <Button
                      onClick={() => {
                        const target = spellingWords[spellingIndex].word
                        const correct = spellingInput.trim() === target
                        setSpellingCorrect(correct)
                        setSpellingAttempts(a => a + 1)
                        if (correct) {
                          setScore(prev => prev + 10)
                          setTimeout(() => {
                            setSpellingCorrect(null)
                            setSpellingInput('')
                            const next = (spellingIndex + 1) % spellingWords.length
                            setSpellingIndex(next)
                          }, 800)
                        }
                      }}
                      className="btn-primary-kid"
                    >
                      Check
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSpellingCorrect(null)
                        setSpellingInput('')
                        const next = (spellingIndex + 1) % spellingWords.length
                        setSpellingIndex(next)
                      }}
                    >
                      Next
                    </Button>
                  </div>

                  {spellingCorrect !== null && (
                    <div className={`mt-4 px-4 py-3 rounded-xl inline-block ${spellingCorrect ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {spellingCorrect ? 'Correct! Great spelling.' : `Not quite. The word was "${spellingWords[spellingIndex].word}"`}
                    </div>
                  )}

                  <div className="mt-6 grid grid-cols-2 gap-4 max-w-md mx-auto">
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                      <div className="text-sm text-gray-600">Attempts</div>
                      <div className="text-xl font-bold text-blue-600">{spellingAttempts}</div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4 text-center">
                      <div className="text-sm text-gray-600">Points</div>
                      <div className="text-xl font-bold text-purple-600">{score}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
