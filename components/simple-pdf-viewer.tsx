'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, 
  RotateCw, Download, BookOpen, ArrowLeft
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SimplePDFViewerProps {
  pdfUrl: string
  title: string
  author?: string
  onClose?: () => void
}

export default function SimplePDFViewer({ pdfUrl, title, author, onClose }: SimplePDFViewerProps) {
  const router = useRouter()
  const [scale, setScale] = useState<number>(1.0)
  const [rotation, setRotation] = useState<number>(0)

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
                  <span className="text-sm font-medium px-3 py-1 bg-purple-100 rounded-full">
                    PDF Viewer
                  </span>
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
            <CardContent className="p-4">
              <div className="w-full overflow-auto rounded-xl border border-purple-100 bg-white">
                {/*
                  We render the PDF inline using an iframe. Zoom and rotation are
                  applied via CSS transforms to the iframe wrapper.
                */}
                <div
                  className="min-w-full"
                  style={{
                    transform: `scale(${scale}) rotate(${rotation}deg)`,
                    transformOrigin: 'top left',
                    // Adjust width so scaled content fits the container
                    width: `${100 / scale}%`
                  }}
                >
                  <iframe
                    src={pdfUrl}
                    title={title}
                    className="w-full"
                    style={{ height: '80vh', border: '0' }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-center gap-3 mt-4">
                <Button
                  onClick={() => window.open(pdfUrl, '_blank')}
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                  size="sm"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Open in New Tab
                </Button>
                <Button
                  onClick={downloadPDF}
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

