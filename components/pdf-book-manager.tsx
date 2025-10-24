'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { 
  Upload, FileText, Trash2, Eye, Download, 
  Plus, BookOpen, Star, Clock, User
} from 'lucide-react'
import SimplePDFViewer from './simple-pdf-viewer'

interface PDFBook {
  id: string
  title: string
  author: string
  description: string
  pdfUrl: string
  coverImage?: string
  ageGroup: string
  difficulty: number
  pages: number
  uploadDate: string
  category: string
}

export default function PDFBookManager() {
  const [books, setBooks] = useState<PDFBook[]>([])
  const [selectedBook, setSelectedBook] = useState<PDFBook | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<'all' | string>('all')
  const [age, setAge] = useState<'all' | string>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'pages'>('recent')

  useEffect(() => {
    loadBooks()
  }, [])

  const loadBooks = async () => {
    try {
      // Load from localStorage for now, in production this would be from an API
      const savedBooks = localStorage.getItem('pdf_books')
      if (savedBooks) {
        setBooks(JSON.parse(savedBooks))
      } else {
        // Sample books
        const sampleBooks: PDFBook[] = [
          {
            id: '1',
            title: 'The Little Red Hen',
            author: 'Traditional Tale',
            description: 'A classic story about hard work and cooperation.',
            pdfUrl: '/books/the-little-red-hen.pdf',
            coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300',
            ageGroup: '3-5',
            difficulty: 1,
            pages: 12,
            uploadDate: new Date().toISOString(),
            category: 'Fairy Tales'
          },
          {
            id: '2',
            title: 'ABC Adventures',
            author: 'Learning Books',
            description: 'Learn the alphabet with fun illustrations and activities.',
            pdfUrl: '/books/abc-adventures.pdf',
            coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
            ageGroup: '3-6',
            difficulty: 1,
            pages: 26,
            uploadDate: new Date().toISOString(),
            category: 'Educational'
          },
          {
            id: '3',
            title: 'My First Numbers',
            author: 'Math for Kids',
            description: 'Counting and number recognition for young learners.',
            pdfUrl: '/books/my-first-numbers.pdf',
            coverImage: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300',
            ageGroup: '4-7',
            difficulty: 2,
            pages: 20,
            uploadDate: new Date().toISOString(),
            category: 'Math'
          }
        ]
        setBooks(sampleBooks)
        localStorage.setItem('pdf_books', JSON.stringify(sampleBooks))
      }
    } catch (error) {
      console.error('Error loading books:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      // Simple page estimation based on file size
      const estimatedPages = Math.max(1, Math.floor(file.size / 50000)) // 50KB per page
      
      const reader = new FileReader()
      reader.onload = (e) => {
        const newBook: PDFBook = {
          id: Date.now().toString(),
          title: file.name.replace('.pdf', ''),
          author: 'Unknown',
          description: 'A new PDF book for kids to read.',
          pdfUrl: e.target?.result as string,
          ageGroup: '3-8',
          difficulty: 1,
          pages: estimatedPages,
          uploadDate: new Date().toISOString(),
          category: 'Custom'
        }
        
        const updatedBooks = [...books, newBook]
        setBooks(updatedBooks)
        localStorage.setItem('pdf_books', JSON.stringify(updatedBooks))
        setShowUpload(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const deleteBook = (bookId: string) => {
    const updatedBooks = books.filter(book => book.id !== bookId)
    setBooks(updatedBooks)
    localStorage.setItem('pdf_books', JSON.stringify(updatedBooks))
  }


  const openBook = (book: PDFBook) => {
    setSelectedBook(book)
  }

  const categories = Array.from(new Set(books.map(b => b.category))).sort()
  const ages = Array.from(new Set(books.map(b => b.ageGroup))).sort()

  const filtered = books
    .filter(b => (category === 'all' ? true : b.category === category))
    .filter(b => (age === 'all' ? true : b.ageGroup === age))
    .filter(b => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        (b.description || '').toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      if (sortBy === 'pages') return b.pages - a.pages
      return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
    })

  if (selectedBook) {
    return (
      <SimplePDFViewer
        pdfUrl={selectedBook.pdfUrl}
        title={selectedBook.title}
        author={selectedBook.author}
        onClose={() => setSelectedBook(null)}
      />
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading books...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-purple-500" />
                PDF Book Library
              </h1>
              <p className="text-gray-600 mt-2">Discover and read amazing PDF books for kids!</p>
            </div>
            
            <Button
              onClick={() => setShowUpload(!showUpload)}
              className="btn-primary-kid flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add PDF Book
            </Button>
          </div>

          {/* Toolbar */}
          <Card className="card-kid mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by title, author, or description"
                    className="bg-white"
                  />
                </div>
                <Select value={category} onValueChange={(v: string) => setCategory(v)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={age} onValueChange={(v: string) => setAge(v)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Age" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All ages</SelectItem>
                    {ages.map(a => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{filtered.length}</span> of{' '}
                  <span className="font-semibold">{books.length}</span> books
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sort by</span>
                  <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                    <SelectTrigger className="w-40 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most recent</SelectItem>
                      <SelectItem value="title">Title (A–Z)</SelectItem>
                      <SelectItem value="pages">Pages (High → Low)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload Section */}
          {showUpload && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <Card className="card-kid">
                <CardHeader>
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Upload className="w-6 h-6 text-blue-500" />
                    Upload New PDF Book
                  </h2>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-purple-300 rounded-2xl p-8 text-center hover:border-purple-400 transition-colors">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="pdf-upload"
                    />
                    <label
                      htmlFor="pdf-upload"
                      className="cursor-pointer flex flex-col items-center gap-4"
                    >
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                        <FileText className="w-8 h-8 text-purple-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">Choose PDF File</h3>
                        <p className="text-gray-600">Click to upload a PDF book for kids</p>
                      </div>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Books Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="card-kid group hover:scale-105 transition-all duration-300">
                  <div className="relative">
                    <img
                      src={book.coverImage || '/placeholder-book.jpg'}
                      alt={book.title}
                      className="w-full h-48 object-cover rounded-t-3xl"
                    />
                    <div className="absolute top-3 right-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white/90 hover:bg-white"
                          onClick={() => openBook(book)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white/90 hover:bg-white text-red-500 hover:text-red-600"
                          onClick={() => deleteBook(book.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="absolute left-3 top-3">
                      <span className="px-2 py-1 text-xs rounded-full bg-white/90 border text-gray-700">
                        {book.category}
                      </span>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800 group-hover:text-purple-600 transition-colors">
                          {book.title}
                        </h3>
                        <p className="text-sm text-gray-600">by {book.author}</p>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {book.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span>Age {book.ageGroup}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-blue-400" />
                          <span>{book.pages} pages</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => openBook(book)}
                          className="flex-1 btn-primary-kid"
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          Read Book
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a')
                            link.href = book.pdfUrl
                            link.download = `${book.title}.pdf`
                            link.click()
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {books.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No PDF Books Yet</h3>
              <p className="text-gray-600 mb-6">Upload your first PDF book to get started!</p>
              <Button
                onClick={() => setShowUpload(true)}
                className="btn-primary-kid"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Book
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

