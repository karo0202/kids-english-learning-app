'use client'

import { useState, useCallback, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { 
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, 
  RotateCw, Download, BookOpen, ArrowLeft
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

// Set up PDF.js worker - use CDN with fallback
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

interface PDFReaderProps {
  pdfUrl: string
  title: string
  author?: string
  onClose?: () => void
}

export default function PDFReader({ pdfUrl, title, author, onClose }: PDFReaderProps) {
  const router = useRouter()
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)
  const [rotation, setRotation] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setLoading(false)
    setError(null)
  }, [])

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('PDF load error:', error)
    setError(`Failed to load PDF: ${error.message || 'Unknown error'}. Please check if the file is a valid PDF.`)
    setLoading(false)
  }, [])

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setError('PDF loading timeout. The file might be corrupted or too large.')
        setLoading(false)
      }
    }, 15000) // 15 second timeout

    setTimeoutId(timeout)

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [loading])

  // Clean up timeout when component unmounts
  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [timeoutId])

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1))
  }

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages))
  }

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0))
  }

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5))
  }

  const rotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const downloadPDF = () => {
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = `${title}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onClose ? onClose() : router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-purple-500" />
                  {title}
                </h1>
                {author && (
                  <p className="text-gray-600">by {author}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Controls */}
          <Card className="card-kid mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPrevPage}
                    disabled={pageNumber <= 1}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  
                  <span className="text-sm font-medium px-3 py-1 bg-purple-100 rounded-full">
                    Page {pageNumber} of {numPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={pageNumber >= numPages}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={zoomOut}
                    className="flex items-center gap-2"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  
                  <span className="text-sm font-medium px-3 py-1 bg-blue-100 rounded-full">
                    {Math.round(scale * 100)}%
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={zoomIn}
                    className="flex items-center gap-2"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={rotate}
                    className="flex items-center gap-2"
                  >
                    <RotateCw className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadPDF}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PDF Viewer */}
          <Card className="card-kid">
            <CardContent className="p-6">
              {loading && (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 mb-2">Loading PDF...</p>
                    <p className="text-sm text-gray-500">This may take a few moments for large files</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">📄</div>
                    <p className="text-red-600 font-medium mb-2">Error Loading PDF</p>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <div className="flex gap-2 justify-center">
                      <Button
                        onClick={() => {
                          setError(null)
                          setLoading(true)
                          window.location.reload()
                        }}
                        className="bg-purple-500 hover:bg-purple-600"
                      >
                        Try Again
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setError(null)
                          setLoading(true)
                        }}
                      >
                        Reload PDF
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {!loading && !error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center"
                >
                  <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={
                      <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                          <p className="text-gray-600">Loading PDF...</p>
                        </div>
                      </div>
                    }
                  >
                    <Page
                      pageNumber={pageNumber}
                      scale={scale}
                      rotate={rotation}
                      className="shadow-lg rounded-lg overflow-hidden"
                    />
                  </Document>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Page Navigation */}
          {numPages > 1 && (
            <Card className="card-kid mt-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setPageNumber(1)}
                    disabled={pageNumber === 1}
                    size="sm"
                  >
                    First
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={goToPrevPage}
                    disabled={pageNumber <= 1}
                    size="sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <span className="text-sm font-medium px-4 py-2 bg-purple-100 rounded-full">
                    {pageNumber} / {numPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    onClick={goToNextPage}
                    disabled={pageNumber >= numPages}
                    size="sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setPageNumber(numPages)}
                    disabled={pageNumber === numPages}
                    size="sm"
                  >
                    Last
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

