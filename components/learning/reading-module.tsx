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

  const defaultBooks: Book[] = [
    {
      id: '1',
      title: 'The Friendly Cat',
      author: 'Story Time',
      coverImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300',
      ageGroup: 'AGE_3_5',
      difficulty: 1,
      estimatedTime: 5,
      pages: [
        {
          id: '1-1',
          pageNumber: 1,
          text: 'Once upon a time, there was a friendly cat named Whiskers.',
          imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400'
        },
        {
          id: '1-2',
          pageNumber: 2,
          text: 'Whiskers loved to play with children and purr loudly when happy.',
          imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400'
        },
        {
          id: '1-3',
          pageNumber: 3,
          text: 'Every day, Whiskers would visit the park to make new friends.',
          imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400'
        }
      ]
    },
    {
      id: '2',
      title: 'The Magic School Bus',
      author: 'Adventure Stories',
      coverImage: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=300',
      ageGroup: 'AGE_6_8',
      difficulty: 2,
      estimatedTime: 8,
      pages: [
        {
          id: '2-1',
          pageNumber: 1,
          text: 'Emma and her friends boarded the magic school bus for an amazing adventure.',
          imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400'
        },
        {
          id: '2-2',
          pageNumber: 2,
          text: 'They visited different countries and learned new words in each place.',
          imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400'
        },
        {
          id: '2-3',
          pageNumber: 3,
          text: 'The bus could fly, swim, and even travel through time!',
          imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400'
        }
      ]
    },
    {
      id: '3',
      title: 'The Adventure of Learning',
      author: 'Educational Tales',
      coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
      ageGroup: 'AGE_9_12',
      difficulty: 3,
      estimatedTime: 12,
      pages: [
        {
          id: '3-1',
          pageNumber: 1,
          text: 'Sophie discovered that learning English was like going on a great adventure.',
          imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
        },
        {
          id: '3-2',
          pageNumber: 2,
          text: 'Every new word was like finding a treasure, and every sentence was like solving a puzzle.',
          imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
        },
        {
          id: '3-3',
          pageNumber: 3,
          text: 'With practice and determination, Sophie became a master of the English language.',
          imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
        }
      ]
    }
  ]

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const res = await fetch('/books.json', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            setBooks(data)
          } else {
            setBooks(defaultBooks)
          }
        } else {
          setBooks(defaultBooks)
        }
      } catch {
        setBooks(defaultBooks)
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        {/* Reading Header */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsReading(false)
                    setSelectedBook(null)
                    setCurrentPage(0)
                  }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Library
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">{selectedBook.title}</h1>
                  <p className="text-sm text-gray-600">by {selectedBook.author}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  Page {currentPage + 1} of {selectedBook.pages.length}
                </div>
                <Mascot emotion="happy" size="medium" />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Book Page Content */}
              <Card className="card-reading h-full">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                      Page {currentPageData.pageNumber}
                    </h2>
                    
                    {currentPageData.imageUrl && (
                      <div className="w-full h-64 mb-6 rounded-2xl overflow-hidden shadow-lg">
                        <img 
                          src={currentPageData.imageUrl} 
                          alt={`Page ${currentPageData.pageNumber}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="bg-white rounded-2xl p-6 shadow-lg space-y-6">
                      <p className="text-lg text-gray-800 leading-relaxed">
                        {currentPageData.text}
                      </p>

                      {Array.isArray(currentPageData.vocabulary) && currentPageData.vocabulary.length > 0 && (
                        <div>
                          <h4 className="text-xl font-bold text-gray-900 mb-3">🧠 Vocabulary</h4>
                          <div className="overflow-hidden rounded-xl border border-gray-200">
                            <table className="w-full text-left">
                              <thead className="bg-gray-50 text-gray-700 text-sm">
                                <tr>
                                  <th className="px-4 py-3">Word</th>
                                  <th className="px-4 py-3">Definition</th>
                                  <th className="px-4 py-3">Example Sentence</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 text-gray-800">
                                {currentPageData.vocabulary.map((v, i) => (
                                  <tr key={i} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-semibold">{v.word}</td>
                                    <td className="px-4 py-3">{v.definition}</td>
                                    <td className="px-4 py-3 text-gray-700">{v.example}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {Array.isArray(currentPageData.questions) && currentPageData.questions.length > 0 && (
                        <div>
                          <h4 className="text-xl font-bold text-gray-900 mb-3">💬 Practice Questions</h4>

                          <ol className="list-decimal pl-6 space-y-2 text-gray-800">
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
                              onClick={async () => {
                                try {
                                  const { jsPDF } = await import('jspdf')
                                  const doc = new jsPDF()
                                  const marginX = 14
                                  const width = doc.internal.pageSize.getWidth() - marginX * 2
                                  doc.setFontSize(16)
                                  doc.text(`${selectedBook.title} - Practice Questions`, marginX, 20)
                                  doc.setFontSize(12)
                                  let y = 30
                                  (currentPageData.questions || []).forEach((q, i) => {
                                    const wrapped = doc.splitTextToSize(`${i + 1}. ${q}`, width)
                                    if (y + wrapped.length * 7 > doc.internal.pageSize.getHeight() - 20) {
                                      doc.addPage()
                                      y = 20
                                    }
                                    doc.text(wrapped, marginX, y)
                                    y += wrapped.length * 7 + 4
                                  })
                                  const filename = `${selectedBook.title.replace(/[^a-z0-9\- ]/gi, '').replace(/\s+/g, '_')}_questions.pdf`
                                  doc.save(filename)
                                } catch (e) {
                                  console.error('Failed to generate PDF', e)
                                }
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
                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={previousPage}
                      variant="outline"
                      disabled={currentPage === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={nextPage}
                      className="btn-primary-kid"
                    >
                      {isLastPage ? 'Finish Book' : 'Next Page'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Reading Helper */}
              <Card className="card-reading h-full">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
                    Reading Helper
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                      <Volume2 className="w-6 h-6 text-blue-500" />
                      <p className="text-gray-700">Listen to the story</p>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                      <BookOpen className="w-6 h-6 text-green-500" />
                      <p className="text-gray-700">Read along with the text</p>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                      <Star className="w-6 h-6 text-purple-500" />
                      <p className="text-gray-700">Take your time to understand</p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mt-8">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Reading Progress</span>
                      <span>{Math.round(((currentPage + 1) / selectedBook.pages.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${((currentPage + 1) / selectedBook.pages.length) * 100}%` }}
                      />
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
                      <div className="text-2xl font-bold text-blue-600">{completedBooks}</div>
                      <div className="text-sm text-gray-600">Books</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
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
          {(books || defaultBooks).map((book, index) => (
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
