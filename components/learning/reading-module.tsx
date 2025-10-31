'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Mascot } from '@/components/ui/mascot'
import { ProgressRing } from '@/components/ui/progress-ring'
import { 
  BookOpen, ArrowLeft, Star, Trophy, Clock, 
  Play, Pause, RotateCcw, Volume2, VolumeX, FileText
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import OptimizedImage from '../common/optimized-image'
import { useImagePreload, useDebounce } from '@/hooks/use-performance'

interface Book {
  id: string
  title: string
  author: string
  coverImage: string
  pages: BookPage[]
  ageGroup: 'AGE_3_5' | 'AGE_6_8' | 'AGE_9_12'
  difficulty: number
  estimatedTime: number
}

interface BookPage {
  id: string
  pageNumber: number
  text: string
  imageUrl?: string
  audioUrl?: string
  vocabulary?: { word: string; definition: string; example: string }[]
  questions?: string[]
}

export default function ReadingModule() {
  const router = useRouter()
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [isReading, setIsReading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [score, setScore] = useState(0)
  const [completedBooks, setCompletedBooks] = useState(0)
  const [totalBooks] = useState(5)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [books, setBooks] = useState<Book[] | null>(null)

  const getDefaultBooks = (): Book[] => {
    const cacheBuster = `?v=${Date.now()}&bust=${Math.random()}`
    return [
    {
      id: '1',
      title: 'The Friendly Cat',
      author: 'Story Time',
      coverImage: `https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300${cacheBuster}`,
      ageGroup: 'AGE_3_5',
      difficulty: 1,
      estimatedTime: 5,
      pages: [
        {
          id: '1-1',
          pageNumber: 1,
          text: 'Once upon a time, there was a friendly cat named Whiskers.',
          imageUrl: `https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400${cacheBuster}`,
          vocabulary: [
            { word: 'friendly', definition: 'kind and nice', example: 'The cat is friendly to everyone.' },
            { word: 'cat', definition: 'a furry pet animal', example: 'My cat likes to play.' }
          ]
        },
        {
          id: '1-2',
          pageNumber: 2,
          text: 'Whiskers loved to play with children and purr loudly when happy.',
          imageUrl: `https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400${cacheBuster}`,
          vocabulary: [
            { word: 'play', definition: 'to have fun', example: 'Children love to play games.' },
            { word: 'purr', definition: 'the sound a cat makes when happy', example: 'The cat purrs when I pet it.' }
          ]
        },
        {
          id: '1-3',
          pageNumber: 3,
          text: 'Every day, Whiskers would visit the park to make new friends.',
          imageUrl: `https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400${cacheBuster}`,
          vocabulary: [
            { word: 'visit', definition: 'to go to a place', example: 'I visit my grandmother every week.' },
            { word: 'friends', definition: 'people you like to be with', example: 'My friends and I play together.' }
          ]
        }
      ]
    },
    {
      id: '2',
      title: 'The Magic School Bus',
      author: 'Adventure Stories',
      coverImage: `https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=300${cacheBuster}`,
      ageGroup: 'AGE_6_8',
      difficulty: 2,
      estimatedTime: 8,
      pages: [
        {
          id: '2-1',
          pageNumber: 1,
          text: 'Emma and her friends boarded the magic school bus for an amazing adventure.',
          imageUrl: `https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400${cacheBuster}`,
          vocabulary: [
            { word: 'boarded', definition: 'got on a vehicle', example: 'We boarded the train to go home.' },
            { word: 'adventure', definition: 'an exciting journey', example: 'Going to the zoo was a big adventure.' }
          ]
        },
        {
          id: '2-2',
          pageNumber: 2,
          text: 'They visited different countries and learned new words in each place.',
          imageUrl: `https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400${cacheBuster}`,
          vocabulary: [
            { word: 'countries', definition: 'different places in the world', example: 'France and Italy are countries in Europe.' },
            { word: 'learned', definition: 'gained new knowledge', example: 'I learned how to ride a bike.' }
          ]
        },
        {
          id: '2-3',
          pageNumber: 3,
          text: 'The bus could fly, swim, and even travel through time!',
          imageUrl: `https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400${cacheBuster}`,
          vocabulary: [
            { word: 'fly', definition: 'to move through the air', example: 'Birds can fly high in the sky.' },
            { word: 'travel', definition: 'to go from one place to another', example: 'We travel by car to visit family.' }
          ]
        }
      ]
    },
    {
      id: '3',
      title: 'The Adventure of Learning',
      author: 'Educational Tales',
      coverImage: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300${cacheBuster}`,
      ageGroup: 'AGE_9_12',
      difficulty: 3,
      estimatedTime: 12,
      pages: [
        {
          id: '3-1',
          pageNumber: 1,
          text: 'Sophie discovered that learning English was like going on a great adventure.',
          imageUrl: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400${cacheBuster}`,
          vocabulary: [
            { word: 'discovered', definition: 'found out something new', example: 'I discovered a new game to play.' },
            { word: 'learning', definition: 'gaining knowledge and skills', example: 'Learning to read is very important.' }
          ]
        },
        {
          id: '3-2',
          pageNumber: 2,
          text: 'Every new word was like finding a treasure, and every sentence was like solving a puzzle.',
          imageUrl: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400${cacheBuster}`,
          vocabulary: [
            { word: 'treasure', definition: 'something very valuable', example: 'The pirate found a treasure chest.' },
            { word: 'puzzle', definition: 'a game that tests your thinking', example: 'I love to solve jigsaw puzzles.' }
          ]
        },
        {
          id: '3-3',
          pageNumber: 3,
          text: 'With practice and determination, Sophie became a master of the English language.',
          imageUrl: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400${cacheBuster}`,
          vocabulary: [
            { word: 'practice', definition: 'repeated exercise to improve', example: 'I practice piano every day.' },
            { word: 'determination', definition: 'strong will to achieve something', example: 'With determination, you can do anything!' }
          ]
        }
      ]
    },
    {
      id: '4',
      title: 'The Rainbow Garden',
      author: 'Nature Stories',
      coverImage: `https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=300${cacheBuster}`,
      ageGroup: 'AGE_3_5',
      difficulty: 1,
      estimatedTime: 6,
      pages: [
        {
          id: '4-1',
          pageNumber: 1,
          text: 'In a beautiful garden, flowers of every color bloomed under the warm sun.',
          imageUrl: `https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400${cacheBuster}`,
          vocabulary: [
            { word: 'garden', definition: 'a place where plants grow', example: 'My grandmother has a beautiful garden.' },
            { word: 'flowers', definition: 'colorful parts of plants', example: 'Roses and tulips are flowers.' }
          ]
        },
        {
          id: '4-2',
          pageNumber: 2,
          text: 'Bees buzzed happily from flower to flower, collecting sweet nectar.',
          imageUrl: `https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400${cacheBuster}`,
          vocabulary: [
            { word: 'bees', definition: 'flying insects that make honey', example: 'Bees help flowers grow by carrying pollen.' },
            { word: 'nectar', definition: 'sweet liquid in flowers', example: 'Bees drink nectar from flowers.' }
          ]
        },
        {
          id: '4-3',
          pageNumber: 3,
          text: 'The garden was a magical place where all creatures lived in harmony.',
          imageUrl: `https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400${cacheBuster}`,
          vocabulary: [
            { word: 'magical', definition: 'having special powers', example: 'The fairy tale had a magical ending.' },
            { word: 'harmony', definition: 'peaceful living together', example: 'All the animals lived in harmony.' }
          ]
        }
      ]
    },
    {
      id: '5',
      title: 'The Brave Little Mouse',
      author: 'Courage Tales',
      coverImage: `https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300${cacheBuster}`,
      ageGroup: 'AGE_6_8',
      difficulty: 2,
      estimatedTime: 7,
      pages: [
        {
          id: '5-1',
          pageNumber: 1,
          text: 'Mimi was a small mouse with a big heart and even bigger dreams.',
          imageUrl: `https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400${cacheBuster}`,
          vocabulary: [
            { word: 'brave', definition: 'showing courage', example: 'The brave firefighter saved the cat.' },
            { word: 'dreams', definition: 'hopes and wishes for the future', example: 'My dream is to become a doctor.' }
          ]
        },
        {
          id: '5-2',
          pageNumber: 2,
          text: 'When her friends needed help, Mimi never hesitated to come to their aid.',
          imageUrl: `https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400${cacheBuster}`,
          vocabulary: [
            { word: 'hesitated', definition: 'paused before acting', example: 'She hesitated before jumping into the water.' },
            { word: 'aid', definition: 'help and support', example: 'The doctor came to the aid of the injured person.' }
          ]
        },
        {
          id: '5-3',
          pageNumber: 3,
          text: 'Her courage inspired all the other animals to be brave and kind too.',
          imageUrl: `https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400${cacheBuster}`,
          vocabulary: [
            { word: 'courage', definition: 'bravery in facing danger', example: 'It takes courage to try new things.' },
            { word: 'inspired', definition: 'motivated to do something', example: 'The teacher inspired me to study harder.' }
          ]
        }
      ]
    }
  ]
  }

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const res = await fetch(`/books.json?v=${Date.now()}&bust=${Math.random()}`, { 
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
            setBooks(data)
          } else {
            setBooks(getDefaultBooks())
          }
        } else {
          setBooks(getDefaultBooks())
        }
      } catch {
        setBooks(getDefaultBooks())
      }
    }

    loadBooks()
  }, [])

  const startReading = (book: Book) => {
    setSelectedBook(book)
    setCurrentPage(0)
    setIsReading(true)
  }

  const nextPage = () => {
    if (selectedBook && currentPage < selectedBook.pages.length - 1) {
      setCurrentPage(prev => prev + 1)
    } else {
      // Book completed
      setIsCorrect(true)
      setShowFeedback(true)
      setScore(prev => prev + 25)
      setCompletedBooks(prev => prev + 1)
      
      setTimeout(() => {
        setShowFeedback(false)
        setIsReading(false)
        setSelectedBook(null)
        setCurrentPage(0)
      }, 2000)
    }
  }

  const previousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const progress = (completedBooks / totalBooks) * 100

  if (completedBooks >= totalBooks) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4 landscape-optimized">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Card className="card-kid max-w-md">
            <CardContent className="p-8">
              <Mascot emotion="celebrating" size="large" className="mb-6" />
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Amazing Reading! 📚</h2>
              <p className="text-gray-600 mb-6">You completed all reading activities!</p>
              
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <Trophy className="w-8 h-8 text-blue-600 mx-auto mb-1" />
                    <div className="text-2xl font-bold text-blue-600">{score}</div>
                    <div className="text-sm text-gray-600">Points</div>
                  </div>
                  <div className="text-center">
                    <Star className="w-8 h-8 text-purple-600 mx-auto mb-1" />
                    <div className="text-2xl font-bold text-purple-600">{completedBooks}</div>
                    <div className="text-sm text-gray-600">Books</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  className="btn-success-kid"
                  onClick={() => window.location.reload()}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Read More
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

  if (isReading && selectedBook) {
    const currentPageData = selectedBook.pages[currentPage]
    const isLastPage = currentPage === selectedBook.pages.length - 1

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 landscape-optimized">
        {/* Reading Header */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-blue-100 dark:border-gray-700 sticky top-0 z-50">
          <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
              <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsReading(false)
                    setSelectedBook(null)
                    setCurrentPage(0)
                  }}
                  className="flex-shrink-0"
                >
                  <ArrowLeft className="w-4 h-4 mr-1 md:mr-2" />
                  <span className="hidden xs:inline">Back to Library</span>
                </Button>
                <div className="min-w-0 flex-1">
                  <h1 className="text-base md:text-xl font-bold text-gray-800 dark:text-white truncate">{selectedBook.title}</h1>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 truncate">by {selectedBook.author}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between md:justify-end gap-2 md:gap-4 flex-shrink-0">
                <div className="text-xs md:text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  Page {currentPage + 1} of {selectedBook.pages.length}
                </div>
                <div className="hidden sm:block">
                  <Mascot emotion="happy" size="medium" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8"
            >
              {/* Book Page Content */}
              <Card className="card-reading h-full">
                <CardContent className="p-4 md:p-8 overflow-y-auto max-h-[calc(100vh-200px)]">
                  <div className="space-y-4 md:space-y-6">
                    {currentPageData.imageUrl && (
                      <div className="w-full h-48 md:h-64 rounded-xl md:rounded-2xl overflow-hidden shadow-lg bg-gray-100">
                        <img 
                          src={currentPageData.imageUrl} 
                          alt={`Illustration for ${selectedBook.title} page ${currentPageData.pageNumber}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Hide broken images on mobile
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      </div>
                    )}

                    <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg space-y-4 md:space-y-6">
                      <p className="text-base md:text-lg text-gray-900 dark:text-gray-100 leading-relaxed" role="main" aria-label="Story text">
                        {currentPageData.text}
                      </p>

                      {Array.isArray(currentPageData.vocabulary) && currentPageData.vocabulary.length > 0 && (
                        <div>
                          <h4 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-3">🧠 Vocabulary</h4>
                          <div className="overflow-x-auto rounded-xl border-2 border-gray-300 dark:border-gray-600">
                            <table className="w-full text-left min-w-[600px]" role="table" aria-label="Vocabulary words and definitions">
                              <thead className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-xs md:text-sm">
                                <tr>
                                  <th className="px-2 md:px-4 py-2 md:py-3 font-semibold">Word</th>
                                  <th className="px-2 md:px-4 py-2 md:py-3 font-semibold">Definition</th>
                                  <th className="px-2 md:px-4 py-2 md:py-3 font-semibold">Example Sentence</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 dark:divide-gray-600 text-gray-900 dark:text-gray-100 text-xs md:text-sm">
                                {currentPageData.vocabulary.map((v, i) => (
                                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700" tabIndex={0}>
                                    <td className="px-2 md:px-4 py-2 md:py-3 font-bold text-blue-900 dark:text-blue-300">{v.word}</td>
                                    <td className="px-2 md:px-4 py-2 md:py-3">{v.definition}</td>
                                    <td className="px-2 md:px-4 py-2 md:py-3 text-gray-800 dark:text-gray-200">{v.example}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {Array.isArray(currentPageData.questions) && currentPageData.questions.length > 0 && (
                        <div>
                          <h4 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-3">💬 Practice Questions</h4>

                          <ol className="list-decimal pl-5 md:pl-6 space-y-2 text-sm md:text-base text-gray-800 dark:text-gray-200">
                            {currentPageData.questions.map((q, i) => (
                              <li key={i}>{q}</li>
                            ))}
                          </ol>

                          <div className="mt-4 flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                try {
                                  const title = `${selectedBook.title} - Practice Questions`
                                  const lines = [
                                    title,
                                    ''.padEnd(title.length, '='),
                                    '',
                                    ...(currentPageData.questions || []).map((q, idx) => `${idx + 1}. ${q}`)
                                  ]
                                  const content = lines.join('\n')
                                  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
                                  const url = URL.createObjectURL(blob)
                                  const a = document.createElement('a')
                                  a.href = url
                                  a.download = `${selectedBook.title.replace(/[^a-z0-9\- ]/gi, '').replace(/\s+/g, '_')}_questions.txt`
                                  document.body.appendChild(a)
                                  a.click()
                                  a.remove()
                                  URL.revokeObjectURL(url)
                                } catch (e) {
                                  console.error('Failed to download questions', e)
                                }
                              }}
                            >
                              Download TXT
                            </Button>

                            <Button
                              className="btn-primary-kid"
                              onClick={() => {
                                // PDF generation temporarily disabled for performance optimization
                                console.log('PDF generation disabled for performance optimization')
                                alert('PDF generation is temporarily disabled for better performance')
                              }}
                            >
                              Download PDF
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reading Controls */}
                  <div className="flex justify-center gap-3 md:gap-4 mt-4 md:mt-6">
                    <Button
                      onClick={previousPage}
                      variant="outline"
                      disabled={currentPage === 0}
                      className="text-sm md:text-base"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={nextPage}
                      className="btn-primary-kid text-sm md:text-base"
                    >
                      {isLastPage ? 'Finish Book' : 'Next Page'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Reading Helper */}
              <Card className="card-reading h-full hidden lg:block">
                <CardContent className="p-4 md:p-8">
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6 text-center">
                    Reading Helper
                  </h3>
                  
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 bg-blue-50 rounded-xl">
                      <Volume2 className="w-5 h-5 md:w-6 md:h-6 text-blue-500 flex-shrink-0" />
                      <p className="text-sm md:text-base text-gray-700">Listen to the story</p>
                    </div>
                    
                    <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 bg-green-50 rounded-xl">
                      <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-green-500 flex-shrink-0" />
                      <p className="text-sm md:text-base text-gray-700">Read along with the text</p>
                    </div>
                    
                    <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 bg-purple-50 rounded-xl">
                      <Star className="w-5 h-5 md:w-6 md:h-6 text-purple-500 flex-shrink-0" />
                      <p className="text-sm md:text-base text-gray-700">Take your time to understand</p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mt-6 md:mt-8">
                    <div className="flex justify-between text-xs md:text-sm text-gray-600 mb-2">
                      <span>Reading Progress</span>
                      <span>{Math.round(((currentPage + 1) / selectedBook.pages.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 md:h-3 rounded-full transition-all duration-300"
                        style={{ width: `${((currentPage + 1) / selectedBook.pages.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Score Display */}
                  <div className="mt-6 md:mt-8 grid grid-cols-2 gap-3 md:gap-4">
                    <div className="bg-yellow-50 rounded-xl p-3 md:p-4 text-center">
                      <Star className="w-6 h-6 md:w-8 md:h-8 text-yellow-600 mx-auto mb-1 md:mb-2" />
                      <div className="text-xl md:text-2xl font-bold text-yellow-600">{score}</div>
                      <div className="text-xs md:text-sm text-gray-600">Points</div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3 md:p-4 text-center">
                      <Trophy className="w-6 h-6 md:w-8 md:h-8 text-blue-600 mx-auto mb-1 md:mb-2" />
                      <div className="text-xl md:text-2xl font-bold text-blue-600">{completedBooks}</div>
                      <div className="text-xs md:text-sm text-gray-600">Books</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Mobile-only Reading Helper (simplified) */}
            <div className="lg:hidden mt-4">
              <Card className="card-reading">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-yellow-50 rounded-xl p-3 text-center">
                      <Star className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
                      <div className="text-lg font-bold text-yellow-600">{score}</div>
                      <div className="text-xs text-gray-600">Points</div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3 text-center">
                      <Trophy className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <div className="text-lg font-bold text-blue-600">{completedBooks}</div>
                      <div className="text-xs text-gray-600">Books</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{Math.round(((currentPage + 1) / selectedBook.pages.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentPage + 1) / selectedBook.pages.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[#f5f3ff] via-[#eef2ff] to-[#e0f2fe]" />
      <div className="absolute inset-0 opacity-[0.35] pointer-events-none" style={{backgroundImage:'radial-gradient(circle at 10% 10%, rgba(99,102,241,0.08) 0 12%, transparent 12%), radial-gradient(circle at 90% 20%, rgba(236,72,153,0.08) 0 12%, transparent 12%), radial-gradient(circle at 30% 80%, rgba(16,185,129,0.08) 0 12%, transparent 12%)'}} />
      <div className="relative">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-md border-b border-white/60 sticky top-0 z-50">
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
                  <h1 className="text-2xl font-bold text-gray-800">Reading Library</h1>
                  <p className="text-gray-600">Discover amazing stories! 📚</p>
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
                <div className="text-lg font-bold text-blue-600">{completedBooks}</div>
                <div className="text-xs text-gray-500">/{totalBooks}</div>
              </div>
            </ProgressRing>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-3">Choose Your Story!</h2>
          <p className="text-lg text-gray-600">Beautiful covers, clear details, and a gentle premium look.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {(books || getDefaultBooks()).map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer"
              onClick={() => startReading(book)}
            >
              <Card className="bg-white/70 backdrop-blur-xl border-white/60 shadow-xl h-full">
                <CardContent className="p-6">
                  <div className="w-full h-56 mb-4 rounded-2xl overflow-hidden shadow-lg">
                    <img 
                      src={book.coverImage} 
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{book.title}</h3>
                  <p className="text-gray-600 mb-3">by {book.author}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{book.ageGroup.replace('AGE_', '').replace('_', '-')} years</span>
                    <span>{book.estimatedTime} min read</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-5">
                    {Array.from({ length: book.difficulty }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                    ))}
                    {Array.from({ length: 3 - book.difficulty }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-gray-300" />
                    ))}
                  </div>
                  
                  <Button className="btn-primary-kid w-full">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Start Reading
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* PDF Books Section removed as per request */}
      </div>
      </div>

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
                  <Trophy className="w-16 h-16 text-green-600 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-green-800">
                  Book Completed!
                </h3>
                <p className="text-green-600">
                  Great job reading! You earned 25 points!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
