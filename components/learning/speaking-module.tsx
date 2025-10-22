
'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Mascot } from '@/components/ui/mascot'
import { ProgressRing } from '@/components/ui/progress-ring'
import { 
  Mic, MicOff, Volume2, RefreshCw, CheckCircle, 
  ArrowLeft, Star, Trophy, Play, Pause 
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { audioManager } from '@/lib/audio'
import { progressManager } from '@/lib/progress'
import { challengeManager } from '@/lib/challenges'

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
  const [activityType, setActivityType] = useState<'pronunciation' | 'roleplay' | 'singspeak'>('pronunciation')
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const [lastResult, setLastResult] = useState<{ word: string; transcript: string; correct: boolean } | null>(null)
  const advancingRef = useRef<boolean>(false)
  
  // Premium content state
  const [premiumDialogues, setPremiumDialogues] = useState<any[]>([])
  const [isPremiumUser, setIsPremiumUser] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)

  // Check premium status on component mount
  useEffect(() => {
    const checkPremiumStatus = () => {
      if (typeof window !== 'undefined') {
        const isPremium = localStorage.getItem('isPremium') === 'true'
        setIsPremiumUser(isPremium)
        
        // Debug: Log premium status
        console.log('Premium status:', isPremium)
        console.log('Premium user state:', isPremium)
        
        // For testing: Auto-unlock premium after 3 seconds
        setTimeout(() => {
          if (!isPremium) {
            console.log('Auto-unlocking premium for testing...')
            localStorage.setItem('isPremium', 'true')
            setIsPremiumUser(true)
          }
        }, 3000)
      }
    }
    checkPremiumStatus()
  }, [])

  // Add a debug function to unlock premium for testing
  const unlockPremiumForTesting = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('isPremium', 'true')
      setIsPremiumUser(true)
      console.log('Premium unlocked for testing!')
    }
  }

  // Sing & Speak (karaoke) state
  type Song = { id: string; title: string; lines: string[] }
  const [songs, setSongs] = useState<Song[]>([])
  const [songIndex, setSongIndex] = useState(0)
  const [songLineIndex, setSongLineIndex] = useState(0)
  const [isSinging, setIsSinging] = useState(false)

  // Roleplay dialog state
  type RoleLine = { speaker: 'Buddy' | 'You'; text: string }
  type RoleScene = { title: string; lines: RoleLine[] }
  const roleScenes: RoleScene[] = []
  const [sceneIndex, setSceneIndex] = useState(0)
  const [lineIndex, setLineIndex] = useState(0)
  const [targetLine, setTargetLine] = useState<RoleLine | null>(null)
  const currentLineKeyRef = useRef<string | null>(null)

  const getSampleWords = (): Word[] => {
    const cacheBuster = `?v=${Date.now()}&bust=${Math.random()}`
    return [
      {
        id: '1',
        word: 'apple',
        pronunciation: '/ˈæp.əl/',
        definition: 'A round red or green fruit',
        imageUrl: `https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=300&h=300&fit=crop&crop=center${cacheBuster}`,
        difficulty: 1
      },
      {
        id: '2',
        word: 'banana',
        pronunciation: '/bəˈnɑː.nə/',
        definition: 'A long curved yellow fruit',
        imageUrl: `https://images.unsplash.com/photo-1571772805064-207c8435df79?w=300&h=300&fit=crop&crop=center${cacheBuster}`,
        difficulty: 1
      },
      {
        id: '3', 
        word: 'butterfly',
        pronunciation: '/ˈbʌt.ər.flaɪ/',
        definition: 'A colorful flying insect',
        imageUrl: `https://images.unsplash.com/photo-1444927714506-8492d94b5ba0?w=300&h=300&fit=crop&crop=center${cacheBuster}`,
        difficulty: 2
      },
      {
        id: '4',
        word: 'elephant',
        pronunciation: '/ˈɛl.ɪ.fənt/',
        definition: 'A large gray animal with a trunk',
        imageUrl: `https://images.unsplash.com/photo-1564760290292-23341e4df6ec?w=300&h=300&fit=crop&crop=center${cacheBuster}`,
        difficulty: 2
      },
      {
        id: '5',
        word: 'rainbow',
        pronunciation: '/ˈreɪn.boʊ/',
        definition: 'Colorful arc in the sky after rain',
        imageUrl: `https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=300&fit=crop&crop=center${cacheBuster}`,
        difficulty: 3
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
        if (activityType === 'roleplay') {
          checkRoleplay(transcript)
        } else {
          checkPronunciation(transcript)
        }
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
    }
    loadWords()

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
    // Initialize first roleplay line
    setTargetLine(roleScenes[0].lines[0])
  }, [])

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true)
      setUserSpeech('')
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  const checkPronunciation = (transcript: string) => {
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
      audioManager.playSuccess()
      progressManager.addScore(10, 5)
      challengeManager.updateChallengeProgress('speaking', 1)
    } else {
      // Play error sound
      audioManager.playError()
    }

    // Store result to show on next word
    setLastResult({ word: currentWord.word, transcript, correct })

    if (!advancingRef.current) {
      advancingRef.current = true
      setTimeout(() => {
        setShowFeedback(false)
        nextWord()
        advancingRef.current = false
      }, 1500)
    }
  }

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

  const nextWord = () => {
    if (totalWords === 0) return
    const list = words.length > 0 ? words : sampleWords
    const nextIndex = (wordIndex + 1) % list.length
    setWordIndex(nextIndex)
    setCurrentWord(list[nextIndex])
    setUserSpeech('')
    setIsCorrect(false)
    setShowFeedback(false)
  }

  const speakWord = () => {
    if (currentWord && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord.word)
      utterance.rate = 0.8
      utterance.pitch = 1.1
      window.speechSynthesis.speak(utterance)
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

  // Roleplay helpers
  const startScene = (index: number) => {
    setSceneIndex(index)
    setLineIndex(0)
    const first = roleScenes[index].lines[0]
    setTargetLine(first)
  }

  const advanceLine = () => {
    const scene = roleScenes[sceneIndex]
    const next = lineIndex + 1
    if (next >= scene.lines.length) {
      // scene complete
      setIsCorrect(true)
      setShowFeedback(true)
      setScore(prev => prev + 20)
      setCorrectWords(prev => prev + 1)
      
      // Play success sound and update progress
      audioManager.playSuccess()
      progressManager.addScore(20, 10)
      challengeManager.updateChallengeProgress('speaking', 1)
      
      setTimeout(() => {
        setShowFeedback(false)
        const nextScene = (sceneIndex + 1) % roleScenes.length
        startScene(nextScene)
      }, 1800)
      return
    }
    setLineIndex(next)
    const line = scene.lines[next]
    setTargetLine(line)
  }

  const checkRoleplay = (transcript: string) => {
    if (!targetLine || targetLine.speaker !== 'You') return
    const target = targetLine.text.toLowerCase()
    const similarity = calculateSimilarity(transcript, target)
    const ok = similarity > 0.7 || transcript.includes(target.split(' ')[0])
    setIsCorrect(ok)
    setShowFeedback(true)
    if (ok) {
      setScore(prev => prev + 10)
      setTimeout(() => {
        setShowFeedback(false)
        advanceLine()
      }, 800)
    } else {
      setTimeout(() => setShowFeedback(false), 900)
    }
  }

  // Auto-play buddy lines exactly once per line
  useEffect(() => {
    if (activityType !== 'roleplay' || !targetLine) return
    const key = `${sceneIndex}-${lineIndex}`
    if (targetLine.speaker === 'Buddy' && currentLineKeyRef.current !== key) {
      currentLineKeyRef.current = key
      speakText(targetLine.text)
      const delay = 1200 + targetLine.text.length * 25
      const t = setTimeout(() => advanceLine(), delay)
      return () => clearTimeout(t)
    }
  }, [activityType, targetLine, sceneIndex, lineIndex])

  const activities = [
    { id: 'pronunciation', name: 'Pronunciation Practice', icon: <Mic className="w-5 h-5" /> },
    { id: 'roleplay', name: 'Role Play Dialogues', icon: <Play className="w-5 h-5" /> },
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
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
                  <h1 className="text-2xl font-bold text-gray-800">Speaking Practice</h1>
                  <p className="text-gray-600">Practice pronunciation with AI buddy! 🎤</p>
                </div>
              </div>
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
                className={`${activityType === activity.id ? 'btn-primary-kid' : ''} px-6 py-3`}
              >
                {activity.icon}
                <span className="ml-2">{activity.name}</span>
              </Button>
            ))}
          </div>
        </motion.div>

        {activityType === 'pronunciation' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Word Display */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="card-speaking h-full">
              <CardContent className="p-8 text-center">
                {currentWord && (
                  <>
                    {/* Word Image */}
                    {currentWord.imageUrl && (
                      <div className="w-48 h-48 mx-auto mb-6 rounded-2xl overflow-hidden shadow-lg">
                        <img 
                          src={currentWord.imageUrl} 
                          alt={currentWord.word}
                          className="w-full h-full object-cover"
                          onLoad={() => console.log('Image loaded successfully:', currentWord.imageUrl)}
                          onError={(e) => console.error('Image failed to load:', currentWord.imageUrl, e)}
                        />
                      </div>
                    )}

                    {/* Word */}
                    <motion.h2 
                      className="text-5xl font-bold text-gray-800 mb-2"
                      key={currentWord.id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      {currentWord.word}
                    </motion.h2>

                    {/* Pronunciation */}
                    <p className="text-2xl text-gray-600 mb-4">{currentWord.pronunciation}</p>

                    {/* Definition */}
                    <p className="text-lg text-gray-700 mb-6">{currentWord.definition}</p>

                    {/* Previous result banner (shows after advancing) */}
                    {lastResult && (
                      <div className={`mb-4 rounded-lg p-3 text-sm ${lastResult.correct ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
                        Previous word "{lastResult.word}": {lastResult.correct ? 'Correct' : 'Try again next time'}{lastResult.transcript ? ` — You said: "${lastResult.transcript}"` : ''}
                      </div>
                    )}

                    {/* Listen Button */}
                    <Button
                      onClick={speakWord}
                      className="btn-secondary-kid mb-4"
                      size="lg"
                    >
                      <Volume2 className="w-6 h-6 mr-2" />
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
          >
            <Card className="card-speaking h-full">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Your Turn to Speak!</h3>
                  {currentWord && (
                    <div className="text-gray-600 mb-2">Say the word: <strong>{currentWord.word}</strong></div>
                  )}
                  
                  {/* Microphone Button */}
                  <motion.button
                    onClick={isListening ? stopListening : startListening}
                    className={`w-32 h-32 rounded-full flex items-center justify-center text-white shadow-2xl mx-auto mb-6 ${
                      isListening 
                        ? 'bg-gradient-to-br from-red-400 to-red-600 animate-pulse' 
                        : 'bg-gradient-to-br from-blue-400 to-blue-600 hover:scale-110'
                    } transition-all duration-300`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isListening ? (
                      <MicOff className="w-16 h-16" />
                    ) : (
                      <Mic className="w-16 h-16" />
                    )}
                  </motion.button>

                  <p className="text-lg text-gray-600 mb-4">
                    {isListening ? 'Listening... Speak now!' : 'Click to start speaking'}
                  </p>

                  {/* User Speech Display */}
                  {userSpeech && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-100 rounded-xl p-4 mb-4"
                    >
                      <p className="text-gray-700">You said: <strong>"{userSpeech}"</strong></p>
                    </motion.div>
                  )}

                  {/* Feedback */}
                  <AnimatePresence>
                    {showFeedback && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className={`p-6 rounded-xl ${
                          isCorrect 
                            ? 'bg-green-100 border-2 border-green-300' 
                            : 'bg-yellow-100 border-2 border-yellow-300'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-3 mb-2">
                          {isCorrect ? (
                            <CheckCircle className="w-8 h-8 text-green-600" />
                          ) : (
                            <RefreshCw className="w-8 h-8 text-yellow-600" />
                          )}
                          <h4 className={`text-xl font-bold ${
                            isCorrect ? 'text-green-800' : 'text-yellow-800'
                          }`}>
                            {isCorrect ? 'Excellent!' : 'Good try!'}
                          </h4>
                        </div>
                        <p className={`${
                          isCorrect ? 'text-green-700' : 'text-yellow-700'
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
                  <div className="mt-4">
                    <Button variant="outline" onClick={nextWord}>Next word</Button>
                  </div>

                  {/* Progress Stats */}
                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <Star className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">{score}</div>
                      <div className="text-sm text-gray-600">Points</div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4">
                      <Trophy className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-purple-600">{correctWords}</div>
                      <div className="text-sm text-gray-600">Correct</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        )}

        {activityType === 'roleplay' && (
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="card-speaking">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-3xl font-bold text-gray-800 mb-2">Role Play Dialogues</h3>
                    <p className="text-gray-600">Practice speaking in short conversations.</p>
                    {isPremiumUser && (
                      <div className="mt-2 inline-flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-orange-100 px-4 py-2 rounded-full">
                        <Star className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-semibold text-yellow-800">Premium Active</span>
                      </div>
                    )}
                    {!isPremiumUser && (
                      <div className="mt-2">
                        <Button 
                          onClick={unlockPremiumForTesting}
                          size="sm"
                          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                        >
                          🔓 Unlock Premium (Testing)
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center mb-6">
                    {roleScenes.map((s, i) => (
                      <div key={i} className="relative">
                        <Button 
                          variant={sceneIndex === i ? 'default' : 'outline'} 
                          onClick={() => {
                            if (s.premium && !isPremiumUser) {
                              setShowPremiumModal(true)
                            } else {
                              startScene(i)
                            }
                          }}
                          className={s.premium && !isPremiumUser ? 'opacity-60' : ''}
                        >
                          {s.premium && <Star className="w-4 h-4 mr-2 text-yellow-500" />}
                          {s.title}
                        </Button>
                        {s.premium && !isPremiumUser && (
                          <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                            PREMIUM
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {targetLine && (
                    <div className="mb-6">
                      <div className="text-center text-sm text-gray-500 mb-1">Turn: {targetLine.speaker}</div>
                      <div className="text-center text-2xl font-bold text-gray-800">{targetLine.text}</div>
                    </div>
                  )}

                  <div className="text-center">
                    <motion.button
                      onClick={isListening ? stopListening : startListening}
                      className={`w-28 h-28 rounded-full flex items-center justify-center text-white shadow-xl mx-auto mb-4 ${
                        isListening ? 'bg-gradient-to-br from-red-400 to-red-600 animate-pulse' : 'bg-gradient-to-br from-blue-400 to-blue-600 hover:scale-110'
                      } transition-all duration-300`}
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={!targetLine}
                    >
                      {isListening ? <MicOff className="w-12 h-12" /> : <Mic className="w-12 h-12" />}
                    </motion.button>
                    <div className="text-gray-600 mb-4">
                      {targetLine && targetLine.speaker === 'You' 
                        ? 'Your turn: say the line' 
                        : targetLine && targetLine.speaker !== 'You'
                        ? 'Click mic to continue the conversation'
                        : 'Listening to buddy...'
                      }
                    </div>

                    {userSpeech && (
                      <div className="bg-gray-100 rounded-xl p-3 inline-block">You said: <strong>"{userSpeech}"</strong></div>
                    )}
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

        {/* Premium Modal */}
        {showPremiumModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-8 max-w-md mx-4"
            >
              <div className="text-center">
                <Star className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Premium Content</h3>
                <p className="text-gray-600 mb-6">
                  Unlock advanced dialogues with 10+ lines for professional conversations!
                </p>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl">
                    <h4 className="font-bold text-gray-800 mb-2">Premium Features:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Advanced restaurant dialogues (15+ lines)</li>
                      <li>• Job interview scenarios (12+ lines)</li>
                      <li>• Business meeting conversations</li>
                      <li>• Travel planning discussions</li>
                      <li>• Doctor visit consultations</li>
                    </ul>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowPremiumModal(false)}
                      className="flex-1"
                    >
                      Maybe Later
                    </Button>
                    <Button 
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('isPremium', 'true')
                          setIsPremiumUser(true)
                          setShowPremiumModal(false)
                          // Show success message
                          alert('🎉 Premium unlocked! You now have access to all advanced dialogues!')
                        }
                      }}
                      className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                    >
                      Unlock Premium
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
