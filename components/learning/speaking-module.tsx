
'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Mascot } from '@/components/ui/mascot'
import { ProgressRing } from '@/components/ui/progress-ring'
import { 
  Mic, MicOff, Volume2, RefreshCw, CheckCircle, 
  ArrowLeft, Star, Trophy, Play, Pause, Award, 
  Zap, Target, Heart, Crown, Sparkles
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { audioManager } from '@/lib/audio'
import { audioManager as enhancedAudioManager } from '@/lib/audio-manager'
import { progressManager } from '@/lib/progress'
import { challengeManager } from '@/lib/challenges'
import { personalizationManager } from '@/lib/personalization'
import { adaptiveDifficultyManager } from '@/lib/adaptive-difficulty'
import OptimizedImage from '../common/optimized-image'
import { useImagePreload, useDebounce } from '@/hooks/use-performance'

interface Word {
  id: string
  word: string
  pronunciation: string
  definition: string
  imageUrl?: string
  difficulty: number
}

export default function SpeakingModule() {
  const router = useRouter()
  const [isListening, setIsListening] = useState(false)
  const [words, setWords] = useState<Word[]>([])
  const [wordIndex, setWordIndex] = useState(0)
  const [currentWord, setCurrentWord] = useState<Word | null>(null)
  const [userSpeech, setUserSpeech] = useState('')
  const [score, setScore] = useState(0)
  const [correctWords, setCorrectWords] = useState(0)
  const [totalWords, setTotalWords] = useState(10)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [activityType, setActivityType] = useState<'pronunciation' | 'singspeak'>('pronunciation')
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const [lastResult, setLastResult] = useState<{ word: string; transcript: string; correct: boolean } | null>(null)
  const advancingRef = useRef<boolean>(false)
  const checkPronunciationRef = useRef<((transcript: string) => void) | null>(null)
  const nextWordRef = useRef<(() => void) | null>(null)
  
  // Achievement system
  const [achievements, setAchievements] = useState<string[]>([])
  const [showAchievement, setShowAchievement] = useState(false)
  const [newAchievement, setNewAchievement] = useState<string>('')
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [perfectWords, setPerfectWords] = useState(0)
  
  // Personalization system
  const [childId] = useState('child_1') // Mock child ID
  const [learningProfile, setLearningProfile] = useState<any>(null)
  const [adaptiveSettings, setAdaptiveSettings] = useState<any>(null)
  const [personalizedWords, setPersonalizedWords] = useState<Word[]>([])
  const [showPersonalization, setShowPersonalization] = useState(false)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [difficultyInsights, setDifficultyInsights] = useState<any>(null)

  // Preload images for better performance - preload current, next, and previous images
  // Memoize to avoid recalculating on every render
  const imagesToPreload = useMemo(() => {
    if (words.length === 0) return []
    const images: string[] = []
    
    // Current image
    if (currentWord?.imageUrl) {
      images.push(currentWord.imageUrl)
    }
    
    // Next 3 images (look ahead)
    for (let i = 1; i <= 3; i++) {
      const nextIndex = (wordIndex + i) % words.length
      const word = words[nextIndex]
      const imageUrl = word?.imageUrl
      if (imageUrl && typeof imageUrl === 'string') {
        images.push(imageUrl)
      }
    }
    
    // Previous image (in case user goes back)
    if (wordIndex > 0) {
      const prevWord = words[wordIndex - 1]
      const prevImageUrl = prevWord?.imageUrl
      if (prevImageUrl && typeof prevImageUrl === 'string') {
        images.push(prevImageUrl)
      }
    }
    
    return images.filter((url, index, self) => self.indexOf(url) === index) // Remove duplicates
  }, [words, currentWord?.imageUrl, wordIndex])
  
  const { isLoaded: isImageLoaded } = useImagePreload(imagesToPreload)

  // Initialize and refresh personalization system
  const refreshPersonalization = useCallback(() => {
    try {
      // Get or create learning profile
      let profile = personalizationManager.getProfile(childId)
      if (!profile) {
        profile = personalizationManager.createProfile(childId, {
          learningStyle: 'mixed',
          difficultyLevel: 'beginner',
          interests: ['animals', 'colors', 'nature'],
          preferredPace: 'medium',
          attentionSpan: 15
        })
      }
      setLearningProfile(profile)

      // Get adaptive settings
      const settings = adaptiveDifficultyManager.getSettings(childId)
      setAdaptiveSettings(settings)

      // Get recommendations
      const recs = personalizationManager.getRecommendations(childId)
      setRecommendations(recs)

      // Get difficulty insights
      const insights = adaptiveDifficultyManager.getDifficultyInsights(childId)
      setDifficultyInsights(insights)

      // Get personalized content
      const adaptiveContent = personalizationManager.getAdaptiveContent(childId, 'speaking')
      if (adaptiveContent.length > 0) {
        // Convert adaptive content to words format
        const personalized = adaptiveContent.map(content => ({
          id: content.id,
          word: content.content.word || 'word',
          pronunciation: content.content.pronunciation || '',
          definition: content.content.definition || '',
          imageUrl: content.content.imageUrl,
          difficulty: content.difficulty
        }))
        setPersonalizedWords(personalized)
      }
    } catch (error) {
      console.error('Error refreshing personalization:', error)
    }
  }, [childId])

  // Initialize personalization on mount
  const initializePersonalization = useCallback(() => {
    refreshPersonalization()
  }, [refreshPersonalization])
  

  // Sing & Speak (karaoke) state
  type Song = { id: string; title: string; lines: string[] }
  const [songs, setSongs] = useState<Song[]>([])
  const [songIndex, setSongIndex] = useState(0)
  const [songLineIndex, setSongLineIndex] = useState(0)
  const [isSinging, setIsSinging] = useState(false)


  const getSampleWords = (): Word[] => {
    const cacheBuster = `?v=${Date.now()}&bust=${Math.random()}`
    return [
      // Animals
      {
        id: '1',
        word: 'cat',
        pronunciation: '/kæt/',
        definition: 'A furry pet that says "meow"',
        imageUrl: `https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=300&fit=crop&crop=center${cacheBuster}`,
        difficulty: 1
      },
      {
        id: '2',
        word: 'dog',
        pronunciation: '/dɔːɡ/',
        definition: 'A loyal pet that says "woof"',
        imageUrl: `https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=300&fit=crop&crop=center${cacheBuster}`,
        difficulty: 1
      },
      {
        id: '3',
        word: 'bird',
        pronunciation: '/bɜːrd/',
        definition: 'A flying animal with feathers',
        imageUrl: `https://images.unsplash.com/photo-1444464666168-49d633b86797?w=300&h=300&fit=crop&crop=center${cacheBuster}`,
        difficulty: 1
      },
      {
        id: '4',
        word: 'fish',
        pronunciation: '/fɪʃ/',
        definition: 'A swimming animal that lives in water',
        imageUrl: `https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=300&fit=crop&crop=center${cacheBuster}`,
        difficulty: 1
      },
      {
        id: '5',
        word: 'elephant',
        pronunciation: '/ˈel.ɪ.fənt/',
        definition: 'A large gray animal with a trunk',
        imageUrl: `https://images.unsplash.com/photo-1564760290292-23341e4df6ec?w=300&h=300&fit=crop&crop=center${cacheBuster}`,
        difficulty: 2
      },
      {
        id: '6',
        word: 'butterfly',
        pronunciation: '/ˈbʌt.ər.flaɪ/',
        definition: 'A colorful flying insect',
        imageUrl: `https://images.unsplash.com/photo-1444927714506-8492d94b5ba0?w=300&h=300&fit=crop&crop=center${cacheBuster}`,
        difficulty: 2
      },
      // Colors
      {
        id: '7',
        word: 'red',
        pronunciation: '/red/',
        definition: 'The color of apples and roses',
        imageUrl: `https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?w=300&h=300&fit=crop&crop=center${cacheBuster}`,
        difficulty: 1
      },
      {
        id: '8',
        word: 'blue',
        pronunciation: '/bluː/',
        definition: 'The color of the sky and ocean',
        imageUrl: `https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300&h=300&fit=crop&crop=center${cacheBuster}`,
        difficulty: 1
      },
      {
        id: '9',
        word: 'green',
        pronunciation: '/ɡriːn/',
        definition: 'The color of grass and leaves',
        imageUrl: `https://images.unsplash.com/photo-1448387473223-5c37445527e7?w=300&h=300&fit=crop&crop=center${cacheBuster}`,
        difficulty: 1
      },
      {
        id: '10',
        word: 'yellow',
        pronunciation: '/ˈjel.oʊ/',
        definition: 'The color of the sun and bananas',
        imageUrl: `https://images.unsplash.com/photo-1497864149936-299970c53d55?w=300&h=300&fit=crop&crop=center${cacheBuster}`,
        difficulty: 1
      },
      // Nature
      {
        id: '11',
        word: 'tree',
        pronunciation: '/triː/',
        definition: 'A tall plant with branches and leaves',
        imageUrl: `https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=300&h=300&fit=crop&crop=center${cacheBuster}`,
        difficulty: 1
      },
      {
        id: '12',
        word: 'flower',
        pronunciation: '/ˈflaʊ.ər/',
        definition: 'A beautiful plant with colorful petals',
        imageUrl: `https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=300&h=300&fit=crop&crop=center${cacheBuster}`,
        difficulty: 1
      },
      {
        id: '13',
        word: 'sun',
        pronunciation: '/sʌn/',
        definition: 'The bright star that gives us light',
        imageUrl: `https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=300&h=300&fit=crop&crop=center${cacheBuster}`,
        difficulty: 1
      },
      {
        id: '14',
        word: 'moon',
        pronunciation: '/muːn/',
        definition: 'The bright light in the night sky',
        imageUrl: `https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=300&h=300&fit=crop&crop=center${cacheBuster}`,
        difficulty: 1
      },
      {
        id: '15',
        word: 'rainbow',
        pronunciation: '/ˈreɪn.boʊ/',
        definition: 'Colorful arc in the sky after rain',
        imageUrl: `https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=300&fit=crop&crop=center${cacheBuster}`,
        difficulty: 2
      },
      // Food
      {
        id: '16',
        word: 'apple',
        pronunciation: '/ˈæp.əl/',
        definition: 'A round red or green fruit',
        imageUrl: `https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=300&h=300&fit=crop&crop=center${cacheBuster}`,
        difficulty: 1
      },
      {
        id: '17',
        word: 'banana',
        pronunciation: '/bəˈnɑː.nə/',
        definition: 'A long curved yellow fruit',
        imageUrl: `https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=300&h=300&fit=crop&crop=center${cacheBuster}`,
        difficulty: 1
      },
      {
        id: '18',
        word: 'cake',
        pronunciation: '/keɪk/',
        definition: 'A sweet dessert for celebrations',
        imageUrl: `https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=300&fit=crop&crop=center${cacheBuster}`,
        difficulty: 1
      },
      {
        id: '19',
        word: 'pizza',
        pronunciation: '/ˈpiːt.sə/',
        definition: 'A round food with cheese and toppings',
        imageUrl: `https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=300&fit=crop&crop=center${cacheBuster}`,
        difficulty: 1
      },
      {
        id: '20',
        word: 'ice cream',
        pronunciation: '/aɪs kriːm/',
        definition: 'A cold sweet treat',
        imageUrl: `https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300&h=300&fit=crop&crop=center${cacheBuster}`,
        difficulty: 2
      }
    ]
  }

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim()
        setUserSpeech(transcript)
        checkPronunciation(transcript)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }

    // Load words from public JSON; fallback to sampleWords
    const loadWords = async () => {
      try {
        const res = await fetch(`/pronunciation_words.json?v=${Date.now()}&bust=${Math.random()}`, { 
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            const normalized: Word[] = data
              .filter((w: any) => typeof w?.word === 'string' && w.word.trim().length > 0)
              .map((w: any, idx: number) => ({
                id: String(w.id ?? idx + 1),
                word: String(w.word),
                pronunciation: String(w.pronunciation ?? ''),
                definition: String(w.definition ?? ''),
                imageUrl: typeof w.imageUrl === 'string' ? w.imageUrl : undefined,
                difficulty: Number.isFinite(w.difficulty) ? Number(w.difficulty) : 1,
              }))
            console.log('Loaded words from JSON:', normalized.length, 'words')
            console.log('First word data:', normalized[0])
            setWords(normalized)
            setTotalWords(normalized.length)
            setWordIndex(0)
            setCurrentWord(normalized[0])
            
            // Preload first few images immediately after words load
            setTimeout(() => {
              normalized.slice(0, 3).forEach((word, idx) => {
                if (word.imageUrl) {
                  const img = new Image()
                  img.src = word.imageUrl
                  console.log('Preloading image', idx, word.imageUrl)
                }
              })
            }, 100)
            return
          }
        }
      } catch {}
      // Fallback
      const fallbackWords = getSampleWords()
      console.log('Using fallback sampleWords:', fallbackWords.length, 'words')
      console.log('First fallback word data:', fallbackWords[0])
      setWords(fallbackWords)
      setTotalWords(fallbackWords.length)
      setWordIndex(0)
      setCurrentWord(fallbackWords[0])
      
      // Preload first few images immediately after words load
      setTimeout(() => {
        fallbackWords.slice(0, 3).forEach((word, idx) => {
          if (word.imageUrl) {
            const img = new Image()
            img.src = word.imageUrl
            console.log('Preloading fallback image', idx, word.imageUrl)
          }
        })
      }, 100)
    }
    loadWords()
    initializePersonalization()

    // Load Sing & Speak songs
    const loadSongs = async () => {
      const builtIn: Song[] = [
        { id: 's1', title: 'Hello Song', lines: ['Hello, hello, how are you?', 'I am fine, thank you!', 'Let us sing and play today.', 'We will learn in a fun way!'] },
        { id: 's2', title: 'Colors Song', lines: ['Red and yellow, green and blue,', 'I like colors, how about you?', 'Purple, orange, pink so bright,', 'Colors make the world delight!'] }
      ]
      try {
        const res = await fetch('/singspeak_songs.json', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            const normalized: Song[] = data
              .filter((s: any) => Array.isArray(s?.lines) && s.lines.length > 0)
              .map((s: any, idx: number) => ({ id: String(s.id ?? `s${idx+1}`), title: String(s.title ?? `Song ${idx+1}`), lines: s.lines.map((l: any) => String(l)) }))
            setSongs(normalized)
            setSongIndex(0)
            setSongLineIndex(0)
            return
          }
        }
      } catch {}
      setSongs(builtIn)
      setSongIndex(0)
      setSongLineIndex(0)
    }
    loadSongs()
  }, [])

  const startListening = useCallback(() => {
    console.log('startListening called', { hasRecognition: !!recognitionRef.current })
    try {
      // Check if SpeechRecognition is available
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.')
        console.error('SpeechRecognition not available in window')
        return
      }

      // Reinitialize if not available
      if (!recognitionRef.current) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (!SpeechRecognition) {
          alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.')
          console.error('SpeechRecognition constructor not found')
          return
        }
        
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = 'en-US'

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          console.log('Speech recognition result event:', event)
          if (event.results && event.results.length > 0 && event.results[0].length > 0) {
            const transcript = event.results[0][0].transcript.toLowerCase().trim()
            console.log('Speech recognized:', transcript)
            setUserSpeech(transcript)
            // Use the latest checkPronunciation via ref
            if (checkPronunciationRef.current) {
              checkPronunciationRef.current(transcript)
            } else {
              console.warn('checkPronunciationRef.current is null - pronunciation check will be skipped')
              // Show the transcript but don't check pronunciation
              setShowFeedback(true)
              setIsCorrect(false)
              setTimeout(() => {
                setShowFeedback(false)
              }, 2000)
            }
          } else {
            console.warn('Speech recognition result event has no results')
          }
        }

        recognitionRef.current.onend = () => {
          console.log('Speech recognition ended', { isListening })
          setIsListening(false)
          
          // If recognition ended without results and we were listening, it might be a timeout
          if (isListening) {
            console.log('Recognition ended while listening - might be timeout or no speech')
          }
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error, event)
          setIsListening(false)
          
          let errorMessage = 'Speech recognition error occurred.'
          if (event.error === 'not-allowed') {
            errorMessage = 'Microphone permission denied. Please allow microphone access in your browser settings.'
          } else if (event.error === 'no-speech') {
            errorMessage = 'No speech detected. Please try speaking again.'
            // Don't show alert for no-speech, just log it
            console.log('No speech detected - user can try again')
            return
          } else if (event.error === 'network') {
            errorMessage = 'Network error. Please check your internet connection.'
          } else if (event.error === 'aborted') {
            console.log('Speech recognition aborted (likely by user)')
            return
          }
          
          alert(errorMessage)
        }

        recognitionRef.current.onstart = () => {
          console.log('Speech recognition started successfully')
        }

        recognitionRef.current.onaudiostart = () => {
          console.log('Audio input started')
        }

        recognitionRef.current.onsoundstart = () => {
          console.log('Sound detected')
        }

        recognitionRef.current.onsoundend = () => {
          console.log('Sound ended')
        }

        recognitionRef.current.onaudioend = () => {
          console.log('Audio input ended')
        }
      }
      
      // Ensure checkPronunciation ref is set
      if (!checkPronunciationRef.current) {
        checkPronunciationRef.current = checkPronunciation
        console.log('Set checkPronunciationRef.current')
      }
      
      // Start listening
      if (recognitionRef.current) {
        setIsListening(true)
        setUserSpeech('')
        try {
          recognitionRef.current.start()
          audioManager.playClick()
          console.log('Speech recognition start() called successfully')
        } catch (startError: any) {
          console.error('Error calling recognition.start():', startError)
          setIsListening(false)
          
          // If already started, stop and restart
          if (startError.message?.includes('already started') || startError.name === 'InvalidStateError') {
            console.log('Recognition already started, stopping and restarting...')
            try {
              recognitionRef.current.stop()
              setTimeout(() => {
                recognitionRef.current?.start()
                setIsListening(true)
              }, 100)
            } catch (restartError) {
              console.error('Error restarting recognition:', restartError)
              alert('Speech recognition is already active. Please wait a moment and try again.')
            }
          } else {
            throw startError
          }
        }
      } else {
        throw new Error('Failed to initialize SpeechRecognition')
      }
    } catch (error: any) {
      console.error('Error starting speech recognition:', error)
      setIsListening(false)
      const errorMessage = error?.message || 'Unable to start speech recognition. Please check your microphone permissions and try again.'
      alert(errorMessage)
    }
  }, [])

  const stopListening = useCallback(() => {
    console.log('stopListening called')
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      setIsListening(false)
      audioManager.playClick()
      console.log('Speech recognition stopped')
    } catch (error) {
      console.error('Error stopping speech recognition:', error)
      setIsListening(false)
    }
  }, [])

  const checkAchievements = useCallback((correct: boolean) => {
    const newAchievements: string[] = []
    
    if (correct) {
      const newStreak = streak + 1
      setStreak(newStreak)
      
      if (newStreak > bestStreak) {
        setBestStreak(newStreak)
      }
      
      // Streak achievements
      if (newStreak === 3 && !achievements.includes('streak_3')) {
        newAchievements.push('streak_3')
      }
      if (newStreak === 5 && !achievements.includes('streak_5')) {
        newAchievements.push('streak_5')
      }
      if (newStreak === 10 && !achievements.includes('streak_10')) {
        newAchievements.push('streak_10')
      }
      
      // Perfect pronunciation
      setPerfectWords(prev => prev + 1)
      if (perfectWords + 1 === 5 && !achievements.includes('perfect_5')) {
        newAchievements.push('perfect_5')
      }
      if (perfectWords + 1 === 10 && !achievements.includes('perfect_10')) {
        newAchievements.push('perfect_10')
      }
      
      // Score achievements
      if (score + 10 >= 50 && !achievements.includes('score_50')) {
        newAchievements.push('score_50')
      }
      if (score + 10 >= 100 && !achievements.includes('score_100')) {
        newAchievements.push('score_100')
      }
    } else {
      setStreak(0)
    }
    
    // Show new achievements
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements])
      setNewAchievement(newAchievements[0])
      setShowAchievement(true)
      setTimeout(() => {
        setShowAchievement(false)
      }, 3000)
    }
  }, [streak, achievements, score, perfectWords, bestStreak, refreshPersonalization])

  // Memoize achievement map to avoid recreating on every render
  type AchievementKey = 'streak_3' | 'streak_5' | 'streak_10' | 'perfect_5' | 'perfect_10' | 'score_50' | 'score_100'
  
  const achievementMap = useMemo(() => ({
    'streak_3': { title: 'Hot Streak! 🔥', description: '3 correct words in a row!', icon: <Zap className="w-6 h-6" />, color: 'text-orange-500' },
    'streak_5': { title: 'On Fire! 🔥🔥', description: '5 correct words in a row!', icon: <Zap className="w-6 h-6" />, color: 'text-red-500' },
    'streak_10': { title: 'Unstoppable! 🚀', description: '10 correct words in a row!', icon: <Crown className="w-6 h-6" />, color: 'text-purple-500' },
    'perfect_5': { title: 'Perfect Practice! ⭐', description: '5 perfect pronunciations!', icon: <Star className="w-6 h-6" />, color: 'text-yellow-500' },
    'perfect_10': { title: 'Pronunciation Master! 👑', description: '10 perfect pronunciations!', icon: <Crown className="w-6 h-6" />, color: 'text-purple-500' },
    'score_50': { title: 'Rising Star! ⭐', description: 'Earned 50 points!', icon: <Star className="w-6 h-6" />, color: 'text-blue-500' },
    'score_100': { title: 'Super Star! 🌟', description: 'Earned 100 points!', icon: <Sparkles className="w-6 h-6" />, color: 'text-yellow-500' }
  } as Record<string, { title: string; description: string; icon: React.ReactNode; color: string }>), [])

  const getAchievementInfo = useCallback((achievement: string) => {
    return achievementMap[achievement] || { title: 'Achievement!', description: 'Great job!', icon: <Award className="w-6 h-6" />, color: 'text-green-500' }
  }, [achievementMap])

  const checkPronunciation = useCallback((transcript: string) => {
    if (!currentWord) return

    const targetWord = currentWord.word.toLowerCase()
    const similarity = calculateSimilarity(transcript, targetWord)
    const correct = similarity > 0.7 || transcript.includes(targetWord)

    setIsCorrect(correct)
    setShowFeedback(true)
    // Ensure mic is stopped during feedback
    stopListening()

    if (correct) {
      setCorrectWords(prev => prev + 1)
      setScore(prev => prev + 10)
      
      // Play success sound and update progress
      enhancedAudioManager.playSuccess()
      progressManager.addScore(10, 5)
      challengeManager.updateChallengeProgress('speaking', 1)
    } else {
      // Play error sound
      enhancedAudioManager.playError()
    }

    // Check for achievements
    checkAchievements(correct)

    // Track performance for personalization
    if (personalizationManager && adaptiveDifficultyManager) {
      const performanceMetrics = {
        accuracy: correct ? 1 : 0,
        speed: 1 - (similarity * 0.3), // Higher speed for better pronunciation
        engagement: 0.8, // Assume good engagement during active learning
        retention: correct ? 0.9 : 0.3, // Better retention for correct answers
        confidence: similarity // Confidence based on pronunciation similarity
      }
      
      // Update personalization system
      personalizationManager.updateProfile(childId, performanceMetrics)
      
      // Record performance for adaptive difficulty
      adaptiveDifficultyManager.recordPerformance(childId, {
        timestamp: new Date().toISOString(),
        module: 'speaking',
        activity: 'pronunciation',
        accuracy: performanceMetrics.accuracy,
        speed: performanceMetrics.speed,
        engagement: performanceMetrics.engagement,
        timeSpent: 0, // Could be calculated from actual time
        attempts: 1,
        hintsUsed: 0
      })

      // Refresh personalization data after update
      setTimeout(() => refreshPersonalization(), 100)
    }

    // Store result to show on next word
    setLastResult({ word: currentWord.word, transcript, correct })

    if (!advancingRef.current) {
      advancingRef.current = true
      setTimeout(() => {
        setShowFeedback(false)
        if (nextWordRef.current) {
          nextWordRef.current()
        }
        advancingRef.current = false
      }, 1500)
    }
  }, [currentWord, stopListening, checkAchievements, childId])

  const calculateSimilarity = (a: string, b: string) => {
    const longer = a.length > b.length ? a : b
    const shorter = a.length > b.length ? b : a
    
    if (longer.length === 0) return 1.0
    
    const editDistance = levenshteinDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }

  const levenshteinDistance = (str1: string, str2: string) => {
    const matrix = []
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    return matrix[str2.length][str1.length]
  }

  // Preload next image ahead of time
  const preloadNextImage = (index: number) => {
    const list = words.length > 0 ? words : getSampleWords()
    if (list.length === 0) return
    
    const nextIndex = (index + 1) % list.length
    const nextWord = list[nextIndex]
    
    if (nextWord?.imageUrl) {
      const img = new Image()
      img.src = nextWord.imageUrl
      console.log('Preloading next image:', nextWord.imageUrl)
    }
  }

  const nextWord = useCallback(() => {
    console.log('nextWord called', { wordIndex, totalWords, wordsLength: words.length })
    try {
      // Stop listening if active
      if (isListening) {
        stopListening()
      }
      
      if (totalWords === 0) {
        // Initialize words if not loaded
        const sampleWords = getSampleWords()
        console.log('Initializing words:', sampleWords.length)
        setWords(sampleWords)
        setTotalWords(sampleWords.length)
        setWordIndex(0)
        setCurrentWord(sampleWords[0])
        setUserSpeech('')
        setIsCorrect(false)
        setShowFeedback(false)
        // Preload next image
        setTimeout(() => preloadNextImage(0), 100)
        audioManager.playClick()
        return
      }
      
      const list = words.length > 0 ? words : getSampleWords()
      console.log('Current list:', list.length, 'items')
      if (list.length === 0) {
        const sampleWords = getSampleWords()
        setWords(sampleWords)
        setTotalWords(sampleWords.length)
        setCurrentWord(sampleWords[0])
      } else {
        const nextIndex = (wordIndex + 1) % list.length
        console.log('Moving to next index:', nextIndex, 'word:', list[nextIndex]?.word)
        setWordIndex(nextIndex)
        setCurrentWord(list[nextIndex])
        // Preload the image after this one
        setTimeout(() => preloadNextImage(nextIndex), 100)
      }
      
      setUserSpeech('')
      setIsCorrect(false)
      setShowFeedback(false)
      setLastResult(null)
      audioManager.playClick()
      advancingRef.current = false
      console.log('Next word completed')
    } catch (error) {
      console.error('Error advancing to next word:', error)
    }
  }, [wordIndex, totalWords, words, isListening, stopListening])

  // Update refs whenever callbacks change (must be after function declarations)
  useEffect(() => {
    checkPronunciationRef.current = checkPronunciation
  }, [checkPronunciation])

  useEffect(() => {
    nextWordRef.current = nextWord
  }, [nextWord])

  const speakWord = () => {
    if (currentWord) {
      enhancedAudioManager.speak(currentWord.word, { rate: 0.8, pitch: 1.1 })
    }
  }

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.95
      utterance.pitch = 1
      window.speechSynthesis.speak(utterance)
    }
  }

  // Sing & Speak helpers
  const speakSongLine = (line: string, onEnd?: () => void) => {
    if (!('speechSynthesis' in window)) return
    const utterance = new SpeechSynthesisUtterance(line)
    utterance.rate = 0.85
    utterance.pitch = 1.05
    if (onEnd) utterance.onend = onEnd
    window.speechSynthesis.speak(utterance)
  }

  const playSong = () => {
    if (!songs.length) return
    setIsSinging(true)
    const lines = songs[songIndex].lines
    const playFrom = (idx: number) => {
      setSongLineIndex(idx)
      if (idx >= lines.length) { setIsSinging(false); return }
      speakSongLine(lines[idx], () => playFrom(idx + 1))
    }
    playFrom(songLineIndex)
  }

  const stopSong = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setIsSinging(false)
  }



  const activities = [
    { id: 'pronunciation', name: 'Pronunciation Practice', icon: <Mic className="w-5 h-5" /> },
    { id: 'singspeak', name: 'Sing & Speak', icon: <Volume2 className="w-5 h-5" /> }
  ]

  const progress = totalWords > 0 ? (correctWords / totalWords) * 100 : 0

  if (correctWords >= totalWords) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Card className="card-kid max-w-md">
            <CardContent className="p-8">
              <Mascot emotion="celebrating" size="large" className="mb-6" />
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Fantastic Job! 🎉</h2>
              <p className="text-gray-600 mb-6">You completed the speaking practice!</p>
              
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-1" />
                    <div className="text-2xl font-bold text-yellow-600">{score}</div>
                    <div className="text-sm text-gray-600">Points</div>
                  </div>
                  <div className="text-center">
                    <Star className="w-8 h-8 text-purple-600 mx-auto mb-1" />
                    <div className="text-2xl font-bold text-purple-600">{correctWords}/{totalWords}</div>
                    <div className="text-sm text-gray-600">Words</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  className="btn-primary-kid"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Practice Again
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 landscape-optimized">
      {/* Skip Link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50 focus:outline-none focus:ring-4 focus:ring-blue-300"
      >
        Skip to main content
      </a>
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
            <div className="flex items-center justify-between gap-2 md:gap-4 flex-1 min-w-0">
              <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/dashboard')}
                  className="flex-shrink-0"
                >
                  <ArrowLeft className="w-4 h-4 mr-1 md:mr-2" />
                  <span className="hidden xs:inline">Back</span>
                </Button>
                <div className="hidden sm:block flex-shrink-0">
                  <Mascot emotion="excited" size="medium" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg md:text-2xl font-bold text-gray-800 truncate">Speaking Practice</h1>
                  <p className="text-xs md:text-base text-gray-600 truncate">Practice pronunciation with AI buddy! 🎤</p>
                </div>
              </div>
              
              {/* Personalization Toggle */}
              <button
                onClick={() => setShowPersonalization(!showPersonalization)}
                className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                  showPersonalization 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                }`}
              >
                <span className="hidden sm:inline">🧠 AI Personalization</span>
                <span className="sm:hidden">🧠 AI</span>
              </button>
            </div>

            <ProgressRing 
              progress={progress}
              size={80}
              color="#3B82F6"
              className="hidden md:block"
            >
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{correctWords}</div>
                <div className="text-xs text-gray-500">/{totalWords}</div>
              </div>
            </ProgressRing>
          </div>
        </div>
      </div>

      {/* Personalization Panel */}
      <AnimatePresence>
        {showPersonalization && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-200"
          >
            <div className="container mx-auto px-4 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Learning Profile */}
                {learningProfile && (
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-200">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center text-sm">
                      🧠 Learning Profile
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Style:</span>
                        <span className="font-medium capitalize">{learningProfile.learningStyle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Level:</span>
                        <span className="font-medium capitalize">{learningProfile.difficultyLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pace:</span>
                        <span className="font-medium capitalize">{learningProfile.preferredPace}</span>
                      </div>
                      {learningProfile.strengths && learningProfile.strengths.length > 0 && (
                        <div className="pt-2 border-t border-gray-200">
                          <div className="text-gray-600 mb-1">Strengths:</div>
                          <div className="flex flex-wrap gap-1">
                            {learningProfile.strengths.slice(0, 2).map((s: string, i: number) => (
                              <span key={i} className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Adaptive Settings */}
                {adaptiveSettings && (
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-green-200">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center text-sm">
                      🎯 Adaptive Settings
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Difficulty:</span>
                        <span className="font-medium">Level {adaptiveSettings.currentDifficulty}/5</span>
                      </div>
                      {difficultyInsights && (
                        <div className="pt-2 border-t border-gray-200">
                          <div className="text-gray-600 mb-1">Progress:</div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(difficultyInsights.progression || 0) * 100}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {difficultyInsights.nextMilestone}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {recommendations.length > 0 && (
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-yellow-200">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center text-sm">
                      💡 Recommendations
                    </h3>
                    <div className="space-y-2 text-xs">
                      {recommendations.slice(0, 2).map((rec, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className={`text-xs ${rec.priority === 'high' ? 'text-red-500' : rec.priority === 'medium' ? 'text-yellow-500' : 'text-gray-500'}`}>
                            {rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '⚪'}
                          </span>
                          <div>
                            <div className="font-medium text-gray-800">{rec.action}</div>
                            <div className="text-gray-600 text-xs">{rec.reason}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Personalized Content */}
                {personalizedWords.length > 0 && (
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-purple-200">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center text-sm">
                      ✨ Personalized Words
                    </h3>
                    <div className="text-xs text-gray-600">
                      <p className="mb-2">AI-selected for your style:</p>
                      <div className="flex flex-wrap gap-1">
                        {personalizedWords.slice(0, 4).map((word, index) => (
                          <span key={index} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                            {word.word}
                          </span>
                        ))}
                        {personalizedWords.length > 4 && (
                          <span className="text-xs text-gray-500">+{personalizedWords.length - 4}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Fallback if no personalization data */}
                {!learningProfile && !adaptiveSettings && (
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 md:col-span-2 lg:col-span-4">
                    <div className="text-center text-sm text-gray-600">
                      <div className="mb-2">🧠 AI Personalization is active!</div>
                      <div className="text-xs">Complete a few exercises to see your personalized learning insights.</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8" id="main-content" role="main">
        {/* Activity Selector */}
        <motion.div 
          className="mb-4 md:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-wrap gap-2 md:gap-4 justify-center" role="tablist" aria-label="Activity selection">
            {activities.map((activity) => (
              <Button
                key={activity.id}
                variant={activityType === activity.id ? "default" : "outline"}
                onClick={() => setActivityType(activity.id as any)}
                className={`${activityType === activity.id ? 'btn-primary-kid' : ''} px-3 md:px-6 py-2 md:py-3 text-sm md:text-base focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50`}
                role="tab"
                aria-selected={activityType === activity.id}
                aria-controls={`${activity.id}-panel`}
                tabIndex={activityType === activity.id ? 0 : -1}
                aria-label={`Select ${activity.name} activity`}
              >
                <span aria-hidden="true">{activity.icon}</span>
                <span className="ml-1 md:ml-2">{activity.name}</span>
              </Button>
            ))}
          </div>
        </motion.div>

        {activityType === 'pronunciation' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 max-w-6xl mx-auto">
          {/* Word Display */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="card-speaking h-full">
              <CardContent className="p-4 md:p-8 text-center overflow-y-auto max-h-[calc(100vh-300px)]">
                {currentWord && (
                  <>
                    {/* Word Image */}
                    {currentWord.imageUrl && (
                      <div className="w-32 h-32 md:w-48 md:h-48 mx-auto mb-4 md:mb-6 rounded-xl md:rounded-2xl overflow-hidden shadow-lg bg-gray-100">
                        <OptimizedImage 
                          src={currentWord.imageUrl} 
                          alt={currentWord.word}
                          width={192}
                          height={192}
                          className="w-full h-full object-cover"
                          priority={true}
                          onLoad={() => {
                            console.log('Image loaded successfully:', currentWord.imageUrl)
                            // Preload next image immediately after current loads
                            setTimeout(() => preloadNextImage(wordIndex), 50)
                          }}
                          onError={() => console.error('Image failed to load:', currentWord.imageUrl)}
                        />
                      </div>
                    )}

                    {/* Word */}
                    <motion.h2 
                      className="text-3xl md:text-5xl font-bold text-gray-900 mb-2"
                      key={currentWord.id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      role="heading"
                      aria-level={2}
                    >
                      {currentWord.word}
                    </motion.h2>

                    {/* Pronunciation */}
                    <p className="text-lg md:text-2xl text-gray-700 mb-3 md:mb-4" aria-label={`Pronunciation: ${currentWord.pronunciation}`}>
                      {currentWord.pronunciation}
                    </p>

                    {/* Definition */}
                    <p className="text-sm md:text-lg text-gray-800 mb-4 md:mb-6" aria-label={`Definition: ${currentWord.definition}`}>
                      {currentWord.definition}
                    </p>

                    {/* Previous result banner (shows after advancing) */}
                    {lastResult && (
                      <div className={`mb-3 md:mb-4 rounded-lg p-2 md:p-3 text-xs md:text-sm ${lastResult.correct ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
                        Previous word "{lastResult.word}": {lastResult.correct ? 'Correct' : 'Try again next time'}{lastResult.transcript ? ` — You said: "${lastResult.transcript}"` : ''}
                      </div>
                    )}

                    {/* Listen Button */}
                    <Button
                      onClick={speakWord}
                      className="btn-secondary-kid mb-2 md:mb-4 text-sm md:text-base"
                      size="lg"
                    >
                      <Volume2 className="w-4 h-4 md:w-6 md:h-6 mr-2" />
                      Listen to Word
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Speaking Interface */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            style={{ position: 'relative', zIndex: 1 }}
          >
            <Card className="card-speaking h-full" style={{ position: 'relative' }}>
              <CardContent className="p-4 md:p-8" style={{ position: 'relative' }}>
                <div className="text-center mb-4 md:mb-8">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">Your Turn to Speak!</h3>
                  {currentWord && (
                    <div className="text-sm md:text-base text-gray-600 mb-2">Say the word: <strong>{currentWord.word}</strong></div>
                  )}
                  
                  {/* Microphone Button */}
                  <button
                    onClick={async (e) => {
                      console.log('Microphone button clicked', { isListening, hasRecognition: !!recognitionRef.current })
                      e.preventDefault()
                      e.stopPropagation()
                      
                      try {
                        if (isListening) {
                          stopListening()
                        } else {
                          // Request microphone permission first if needed
                          try {
                            await navigator.mediaDevices.getUserMedia({ audio: true })
                            console.log('Microphone permission granted')
                          } catch (permError: any) {
                            console.error('Microphone permission error:', permError)
                            if (permError.name === 'NotAllowedError' || permError.name === 'PermissionDeniedError') {
                              alert('Microphone permission is required. Please allow microphone access in your browser settings and try again.')
                              return
                            }
                          }
                          
                          startListening()
                        }
                      } catch (error) {
                        console.error('Button click error:', error)
                        alert('An error occurred. Please try again.')
                      }
                    }}
                    onMouseDown={(e) => {
                      console.log('Microphone button mouse down')
                      e.stopPropagation()
                    }}
                    onTouchStart={(e) => {
                      console.log('Microphone button touch start')
                      e.stopPropagation()
                    }}
                    className={`w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center text-white shadow-2xl mx-auto mb-4 md:mb-6 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50 cursor-pointer relative z-50 pointer-events-auto ${
                      isListening 
                        ? 'bg-gradient-to-br from-red-500 to-red-700 animate-pulse' 
                        : 'bg-gradient-to-br from-blue-500 to-blue-700 hover:scale-110 active:scale-95'
                    } transition-all duration-300`}
                    aria-label={isListening ? 'Stop listening' : 'Start listening'}
                    aria-describedby="mic-instructions"
                    tabIndex={0}
                    type="button"
                    disabled={false}
                    style={{ touchAction: 'manipulation' }}
                  >
                    {isListening ? (
                      <MicOff className="w-12 h-12 md:w-16 md:h-16 pointer-events-none" />
                    ) : (
                      <Mic className="w-12 h-12 md:w-16 md:h-16 pointer-events-none" />
                    )}
                  </button>

                  <p className="text-sm md:text-lg text-gray-600 mb-3 md:mb-4">
                    {isListening ? 'Listening... Speak now!' : 'Click to start speaking'}
                  </p>

                  {/* User Speech Display */}
                  {userSpeech && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-100 rounded-xl p-3 md:p-4 mb-3 md:mb-4"
                    >
                      <p className="text-sm md:text-base text-gray-700">You said: <strong>"{userSpeech}"</strong></p>
                    </motion.div>
                  )}

                  {/* Feedback */}
                  <AnimatePresence>
                    {showFeedback && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className={`p-4 md:p-6 rounded-xl ${
                          isCorrect 
                            ? 'bg-green-200 border-2 border-green-500' 
                            : 'bg-yellow-200 border-2 border-yellow-500'
                        }`}
                        role="alert"
                        aria-live="polite"
                        aria-label={isCorrect ? 'Correct pronunciation' : 'Incorrect pronunciation'}
                      >
                        <div className="flex items-center justify-center gap-2 md:gap-3 mb-2">
                          {isCorrect ? (
                            <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-green-800" aria-hidden="true" />
                          ) : (
                            <RefreshCw className="w-6 h-6 md:w-8 md:h-8 text-yellow-800" aria-hidden="true" />
                          )}
                          <h4 className={`text-base md:text-xl font-bold ${
                            isCorrect ? 'text-green-900' : 'text-yellow-900'
                          }`}>
                            {isCorrect ? 'Excellent!' : 'Good try!'}
                          </h4>
                        </div>
                        <p className={`text-sm md:text-base ${
                          isCorrect ? 'text-green-800' : 'text-yellow-800'
                        }`}>
                          {isCorrect 
                            ? 'Perfect pronunciation! Moving to next word...' 
                            : 'Keep practicing! Try saying it clearly.'
                          }
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Manual advance fallback */}
                  <div className="mt-3 md:mt-4 relative z-50 pointer-events-auto">
                    <Button 
                      variant="outline" 
                      onClick={(e) => {
                        console.log('Next word button clicked')
                        e.preventDefault()
                        e.stopPropagation()
                        nextWord()
                      }}
                      onMouseDown={(e) => {
                        console.log('Next word button mouse down')
                        e.stopPropagation()
                      }}
                      onTouchStart={(e) => {
                        console.log('Next word button touch start')
                        e.stopPropagation()
                      }}
                      className="text-sm md:text-base relative z-50 pointer-events-auto"
                      type="button"
                      disabled={false}
                    >
                      Next word
                    </Button>
                  </div>

                  {/* Enhanced Progress Stats */}
                  <div className="mt-4 md:mt-8 grid grid-cols-2 gap-3 md:gap-4">
                    <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-3 md:p-4 border-2 border-blue-400" role="region" aria-label="Score information">
                      <Star className="w-6 h-6 md:w-8 md:h-8 text-blue-800 mx-auto mb-1 md:mb-2" aria-hidden="true" />
                      <div className="text-xl md:text-2xl font-bold text-blue-900">{score}</div>
                      <div className="text-xs md:text-sm text-gray-800 font-semibold">Points</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-3 md:p-4 border-2 border-purple-400" role="region" aria-label="Correct words information">
                      <Trophy className="w-6 h-6 md:w-8 md:h-8 text-purple-800 mx-auto mb-1 md:mb-2" aria-hidden="true" />
                      <div className="text-xl md:text-2xl font-bold text-purple-900">{correctWords}</div>
                      <div className="text-xs md:text-sm text-gray-800 font-semibold">Correct</div>
                    </div>
                  </div>

                  {/* Streak and Achievements */}
                  <div className="mt-4 grid grid-cols-2 gap-3 md:gap-4">
                    <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl p-3 md:p-4 border-2 border-orange-400" role="region" aria-label="Current streak">
                      <Zap className="w-5 h-5 md:w-6 md:h-6 text-orange-800 mx-auto mb-1" aria-hidden="true" />
                      <div className="text-lg font-bold text-orange-900">{streak}</div>
                      <div className="text-xs text-gray-800 font-semibold">Streak</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-3 md:p-4 border-2 border-green-400" role="region" aria-label="Achievement badges">
                      <Award className="w-5 h-5 md:w-6 md:h-6 text-green-800 mx-auto mb-1" aria-hidden="true" />
                      <div className="text-lg font-bold text-green-900">{achievements.length}</div>
                      <div className="text-xs text-gray-800 font-semibold">Badges</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        )}


        {activityType === 'singspeak' && (
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="card-speaking">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-3xl font-bold text-gray-800 mb-2">Sing & Speak</h3>
                    <p className="text-gray-600">Sing along with karaoke-style lines.</p>
                  </div>

                  {/* Song selector */}
                  <div className="flex flex-wrap gap-2 justify-center mb-6">
                    {songs.map((s, i) => (
                      <Button key={s.id} variant={songIndex === i ? 'default' : 'outline'} onClick={() => { setSongIndex(i); setSongLineIndex(0) }}>
                        {s.title}
                      </Button>
                    ))}
                  </div>

                  {/* Lyrics */}
                  {songs[songIndex] && (
                    <div className="bg-white/70 rounded-xl p-6 border border-gray-100 shadow-sm">
                      <h4 className="text-xl font-bold text-gray-800 mb-4 text-center">{songs[songIndex].title}</h4>
                      <div className="space-y-2">
                        {songs[songIndex].lines.map((line, idx) => (
                          <div key={idx} className={`text-lg text-center px-2 py-1 rounded ${idx === songLineIndex ? 'bg-purple-50 text-purple-800 font-semibold' : 'text-gray-700'}`}>
                            {line}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Controls */}
                  <div className="mt-6 flex items-center justify-center gap-3">
                    <Button onClick={isSinging ? stopSong : playSong} className={isSinging ? '' : 'btn-primary-kid'}>
                      {isSinging ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                      {isSinging ? 'Stop' : 'Play' }
                    </Button>
                    <Button variant="outline" onClick={() => { stopSong(); setSongLineIndex(0); playSong() }}>
                      <RefreshCw className="w-4 h-4 mr-2" /> Restart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Instructions */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="card-kid max-w-2xl mx-auto">
            <CardContent className="p-6">
              <h4 className="text-lg font-bold text-gray-800 mb-3">How to Practice:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-blue-500" />
                  <span>1. Listen to the word</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mic className="w-5 h-5 text-green-500" />
                  <span>2. Click mic and speak clearly</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span>3. Get feedback and points!</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievement Popup */}
        <AnimatePresence>
          {showAchievement && newAchievement && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 50 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ rotate: -10 }}
                animate={{ rotate: 0 }}
                className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl border-4 border-yellow-300"
              >
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: 2 }}
                    className="mb-4"
                  >
                    {getAchievementInfo(newAchievement).icon}
                  </motion.div>
                  <h3 className={`text-2xl font-bold mb-2 ${getAchievementInfo(newAchievement).color}`}>
                    {getAchievementInfo(newAchievement).title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {getAchievementInfo(newAchievement).description}
                  </p>
                  <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-4">
                    <div className="flex items-center justify-center gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">{streak}</div>
                        <div className="text-xs text-gray-600">Current Streak</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{score}</div>
                        <div className="text-xs text-gray-600">Total Points</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
