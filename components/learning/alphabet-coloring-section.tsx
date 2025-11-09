'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  ArrowLeft, ArrowRight, Eraser, RotateCcw, Save, 
  Volume2, Music, VolumeX, Sparkles, Star, X
} from 'lucide-react'
import { audioManager } from '@/lib/audio-manager'
import ColoringCard from './coloring-card'
import WordColoringMode from './word-coloring-mode'

interface AlphabetCard {
  letter: string
  word: string
  imageUrl?: string
}

const ALPHABET_DATA: AlphabetCard[] = [
  { letter: 'A', word: 'Apple' },
  { letter: 'B', word: 'Bird' },
  { letter: 'C', word: 'Cat' },
  { letter: 'D', word: 'Dolphin' },
  { letter: 'E', word: 'Eggs' },
  { letter: 'F', word: 'Fish' },
  { letter: 'G', word: 'Gloves' },
  { letter: 'H', word: 'House' },
  { letter: 'I', word: 'Ice cream' },
  { letter: 'J', word: 'Jug' },
  { letter: 'K', word: 'Kite' },
  { letter: 'L', word: 'Lion' },
  { letter: 'M', word: 'Mushroom' },
  { letter: 'N', word: 'Necklace' },
  { letter: 'O', word: 'Octopus' },
  { letter: 'P', word: 'Pig' },
  { letter: 'Q', word: 'Queen' },
  { letter: 'R', word: 'Rabbit' },
  { letter: 'S', word: 'Snake' },
  { letter: 'T', word: 'Telephone' },
  { letter: 'U', word: 'Unicorn' },
  { letter: 'V', word: 'Violin' },
  { letter: 'W', word: 'Whale' },
  { letter: 'X', word: 'Xylophone' },
  { letter: 'Y', word: 'Yoga' },
  { letter: 'Z', word: 'Zebra' }
]

const COLOR_PALETTE = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Light Salmon
  '#98D8C8', // Mint
  '#F7DC6F', // Yellow
  '#BB8FCE', // Purple
  '#85C1E2', // Sky Blue
  '#F8B739', // Orange
  '#52BE80', // Green
  '#EC7063', // Coral
  '#5DADE2'  // Light Blue
]

export default function AlphabetColoringSection() {
  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const [currentMode, setCurrentMode] = useState<'coloring' | 'word-practice'>('coloring')
  const [backgroundMusic, setBackgroundMusic] = useState(false)
  const [savedProgress, setSavedProgress] = useState<Record<string, any>>({})
  const [achievements, setAchievements] = useState<string[]>([])
  const [showAchievement, setShowAchievement] = useState(false)
  const [newAchievement, setNewAchievement] = useState('')
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null)
  const confettiRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load saved progress from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('alphabet-coloring-progress')
      if (saved) {
        try {
          setSavedProgress(JSON.parse(saved))
        } catch (e) {
          console.error('Error loading saved progress:', e)
        }
      }
      
      // Load achievements
      const savedAchievements = localStorage.getItem('alphabet-coloring-achievements')
      if (savedAchievements) {
        try {
          setAchievements(JSON.parse(savedAchievements))
        } catch (e) {
          console.error('Error loading achievements:', e)
        }
      }
      
      // Initialize background music
      backgroundMusicRef.current = new Audio()
      backgroundMusicRef.current.loop = true
      backgroundMusicRef.current.volume = 0.3
      // Using a simple melody - in production, use actual music file
      // backgroundMusicRef.current.src = '/audio/background-music.mp3'
    }
    
    return () => {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause()
        backgroundMusicRef.current = null
      }
    }
  }, [])
  
  const checkAchievements = useCallback((completedCount: number, currentAchievements: string[]) => {
    const newAchievements: string[] = []
    let achievementMessage = ''
    
    if (completedCount >= 5 && !currentAchievements.includes('first-5')) {
      newAchievements.push('first-5')
      achievementMessage = '🎨 First 5 Letters!'
    }
    if (completedCount >= 10 && !currentAchievements.includes('first-10')) {
      newAchievements.push('first-10')
      achievementMessage = '🌟 Halfway Hero!'
    }
    if (completedCount >= 15 && !currentAchievements.includes('first-15')) {
      newAchievements.push('first-15')
      achievementMessage = '✨ Coloring Champion!'
    }
    if (completedCount >= 20 && !currentAchievements.includes('first-20')) {
      newAchievements.push('first-20')
      achievementMessage = '🏆 Almost There!'
    }
    if (completedCount >= 26 && !currentAchievements.includes('all-letters')) {
      newAchievements.push('all-letters')
      achievementMessage = '👑 Alphabet Master!'
    }
    
    if (newAchievements.length > 0) {
      const updated = [...currentAchievements, ...newAchievements]
      setAchievements(updated)
      setNewAchievement(achievementMessage)
      localStorage.setItem('alphabet-coloring-achievements', JSON.stringify(updated))
      setShowAchievement(true)
      setTimeout(() => setShowAchievement(false), 3000)
    }
  }, [])
  
  useEffect(() => {
    // Check for achievements
    const completedCount = Object.keys(savedProgress).length
    if (completedCount > 0) {
      checkAchievements(completedCount, achievements)
    }
  }, [savedProgress, checkAchievements, achievements])

  const handleCardClick = (index: number) => {
    setSelectedCard(index)
    const card = ALPHABET_DATA[index]
    audioManager.speak(`${card.letter} for ${card.word}`)
  }

  const handleLetterClick = (letter: string, word: string) => {
    audioManager.speak(`${letter} for ${word}`)
  }

  const handleSave = (cardIndex: number, coloringData: any) => {
    const key = `${ALPHABET_DATA[cardIndex].letter}_${cardIndex}`
    const newProgress = {
      ...savedProgress,
      [key]: {
        ...coloringData,
        savedAt: new Date().toISOString()
      }
    }
    setSavedProgress(newProgress)
    localStorage.setItem('alphabet-coloring-progress', JSON.stringify(newProgress))
    
    // Show success animation
    triggerConfetti('save')
  }

  const handleComplete = (cardIndex: number) => {
    triggerConfetti('complete')
  }

  const triggerConfetti = (type: 'save' | 'complete' = 'save') => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#F7DC6F', '#BB8FCE', '#FFA07A', '#98D8C8', '#85C1E2']
    const count = type === 'complete' ? 100 : 50
    const shapes = ['circle', 'square', 'star', 'triangle']
    
    for (let i = 0; i < count; i++) {
      const confetti = document.createElement('div')
      const shape = shapes[Math.floor(Math.random() * shapes.length)]
      const color = colors[Math.floor(Math.random() * colors.length)]
      const size = Math.random() * 10 + 5
      const startX = Math.random() * window.innerWidth
      const duration = Math.random() * 2 + 1
      const rotation = Math.random() * 360
      
      confetti.style.position = 'fixed'
      confetti.style.left = startX + 'px'
      confetti.style.top = '-20px'
      confetti.style.width = size + 'px'
      confetti.style.height = size + 'px'
      confetti.style.backgroundColor = color
      confetti.style.pointerEvents = 'none'
      confetti.style.zIndex = '9999'
      
      if (shape === 'circle') {
        confetti.style.borderRadius = '50%'
      } else if (shape === 'square') {
        confetti.style.borderRadius = '2px'
      } else if (shape === 'star') {
        confetti.style.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
      } else if (shape === 'triangle') {
        confetti.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)'
      }
      
      confetti.style.animation = `confetti-fall-${shape} ${duration}s linear forwards`
      confetti.style.transform = `rotate(${rotation}deg)`
      
      document.body.appendChild(confetti)
      setTimeout(() => confetti.remove(), duration * 1000)
    }
  }

  if (selectedCard !== null) {
    const card = ALPHABET_DATA[selectedCard]
    const savedKey = `${card.letter}_${selectedCard}`
    const savedData = savedProgress[savedKey]

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
        <style jsx>{`
          @keyframes confetti-fall-circle {
            to {
              transform: translateY(120vh) rotate(720deg);
              opacity: 0;
            }
          }
          @keyframes confetti-fall-square {
            to {
              transform: translateY(120vh) rotate(540deg);
              opacity: 0;
            }
          }
          @keyframes confetti-fall-star {
            to {
              transform: translateY(120vh) rotate(1080deg) scale(1.5);
              opacity: 0;
            }
          }
          @keyframes confetti-fall-triangle {
            to {
              transform: translateY(120vh) rotate(360deg);
              opacity: 0;
            }
          }
          @keyframes sparkle {
            0%, 100% { opacity: 0; transform: scale(0); }
            50% { opacity: 1; transform: scale(1); }
          }
          @keyframes achievement-popup {
            0% { transform: scale(0) rotate(-180deg); opacity: 0; }
            50% { transform: scale(1.2) rotate(10deg); }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
          }
        `}</style>
        
        {/* Achievement Popup */}
        <AnimatePresence>
          {showAchievement && newAchievement && (
            <motion.div
              initial={{ opacity: 0, scale: 0, y: -50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0, y: -50 }}
              className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[10000] bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-2xl shadow-2xl border-4 border-white"
              style={{ animation: 'achievement-popup 0.5s ease-out' }}
            >
              <div className="text-center">
                <div className="text-4xl mb-2">{newAchievement}</div>
                <p className="text-lg font-semibold">Achievement Unlocked!</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => setSelectedCard(null)}
              className="text-lg p-3"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Alphabet
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant={currentMode === 'coloring' ? 'default' : 'outline'}
                onClick={() => setCurrentMode('coloring')}
                className="text-lg px-4 py-2"
              >
                🎨 Coloring
              </Button>
              <Button
                variant={currentMode === 'word-practice' ? 'default' : 'outline'}
                onClick={() => setCurrentMode('word-practice')}
                className="text-lg px-4 py-2"
              >
                ✏️ Word Practice
              </Button>
            </div>
          </div>

          {/* Main Card View */}
          <Card className="card-kid shadow-2xl">
            <CardContent className="p-6">
              {currentMode === 'coloring' ? (
                <ColoringCard
                  letter={card.letter}
                  word={card.word}
                  colorPalette={COLOR_PALETTE}
                  savedData={savedData}
                  onSave={(data) => handleSave(selectedCard, data)}
                  onComplete={() => handleComplete(selectedCard)}
                  onLetterClick={() => handleLetterClick(card.letter, card.word)}
                />
              ) : (
                <WordColoringMode
                  letter={card.letter}
                  word={card.word}
                  colorPalette={COLOR_PALETTE}
                  savedData={savedData}
                  onSave={(data) => handleSave(selectedCard, data)}
                  onLetterClick={() => handleLetterClick(card.letter, card.word)}
                />
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              onClick={() => {
                if (selectedCard > 0) {
                  setSelectedCard(selectedCard - 1)
                  const prevCard = ALPHABET_DATA[selectedCard - 1]
                  audioManager.speak(`${prevCard.letter} for ${prevCard.word}`)
                }
              }}
              disabled={selectedCard === 0}
              className="text-lg px-6 py-3"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Previous
            </Button>

            <div className="text-center">
              <p className="text-xl font-bold text-gray-700">
                {card.letter} - {card.word}
              </p>
              <p className="text-sm text-gray-500">
                {selectedCard + 1} of {ALPHABET_DATA.length}
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                if (selectedCard < ALPHABET_DATA.length - 1) {
                  setSelectedCard(selectedCard + 1)
                  const nextCard = ALPHABET_DATA[selectedCard + 1]
                  audioManager.speak(`${nextCard.letter} for ${nextCard.word}`)
                }
              }}
              disabled={selectedCard === ALPHABET_DATA.length - 1}
              className="text-lg px-6 py-3"
            >
              Next
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-gray-800 mb-4"
          >
            🎨 Alphabet & Word Coloring
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600"
          >
            Click any letter to start coloring and learning!
          </motion.p>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-6">
          <Button
            variant={backgroundMusic ? 'default' : 'outline'}
            onClick={() => {
              const newState = !backgroundMusic
              setBackgroundMusic(newState)
              if (backgroundMusicRef.current) {
                if (newState) {
                  // Try to play background music
                  backgroundMusicRef.current.play().catch(e => {
                    console.log('Background music not available:', e)
                    setBackgroundMusic(false)
                  })
                } else {
                  backgroundMusicRef.current.pause()
                }
              }
            }}
            className="text-lg px-4 py-2"
          >
            {backgroundMusic ? <Music className="w-5 h-5 mr-2" /> : <VolumeX className="w-5 h-5 mr-2" />}
            Music
          </Button>
          
          {achievements.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                // Show achievements modal or list
                alert(`Achievements Unlocked:\n${achievements.map(a => {
                  const names: Record<string, string> = {
                    'first-5': '🎨 First 5 Letters',
                    'first-10': '🌟 Halfway Hero',
                    'first-15': '✨ Coloring Champion',
                    'first-20': '🏆 Almost There',
                    'all-letters': '👑 Alphabet Master'
                  }
                  return names[a] || a
                }).join('\n')}`)
              }}
              className="text-lg px-4 py-2"
            >
              <Star className="w-5 h-5 mr-2" />
              Achievements ({achievements.length})
            </Button>
          )}
        </div>

        {/* Alphabet Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {ALPHABET_DATA.map((card, index) => {
            const savedKey = `${card.letter}_${index}`
            const hasProgress = savedProgress[savedKey]
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  className="card-kid cursor-pointer relative overflow-hidden group"
                  onClick={() => handleCardClick(index)}
                >
                  <CardContent className="p-4 text-center">
                    {hasProgress && (
                      <div className="absolute top-2 right-2">
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      </div>
                    )}
                    
                    <motion.div
                      className="text-6xl font-bold mb-2 text-gray-700"
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleLetterClick(card.letter, card.word)
                      }}
                    >
                      {card.letter}
                    </motion.div>
                    
                    <p className="text-lg font-semibold text-gray-600 mb-2">
                      {card.word}
                    </p>
                    
                    <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      <span className="text-4xl">
                        {card.letter === 'A' && '🍎'}
                        {card.letter === 'B' && '🐦'}
                        {card.letter === 'C' && '🐱'}
                        {card.letter === 'D' && '🐬'}
                        {card.letter === 'E' && '🥚'}
                        {card.letter === 'F' && '🐟'}
                        {card.letter === 'G' && '🧤'}
                        {card.letter === 'H' && '🏠'}
                        {card.letter === 'I' && '🍦'}
                        {card.letter === 'J' && '🫖'}
                        {card.letter === 'K' && '🪁'}
                        {card.letter === 'L' && '🦁'}
                        {card.letter === 'M' && '🍄'}
                        {card.letter === 'N' && '📿'}
                        {card.letter === 'O' && '🐙'}
                        {card.letter === 'P' && '🐷'}
                        {card.letter === 'Q' && '👑'}
                        {card.letter === 'R' && '🐰'}
                        {card.letter === 'S' && '🐍'}
                        {card.letter === 'T' && '☎️'}
                        {card.letter === 'U' && '🦄'}
                        {card.letter === 'V' && '🎻'}
                        {card.letter === 'W' && '🐋'}
                        {card.letter === 'X' && '🎹'}
                        {card.letter === 'Y' && '🧘'}
                        {card.letter === 'Z' && '🦓'}
                      </span>
                    </div>
                    
                    <Button
                      variant="ghost"
                      className="mt-2 text-sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleLetterClick(card.letter, card.word)
                      }}
                    >
                      <Volume2 className="w-4 h-4 mr-1" />
                      Listen
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

