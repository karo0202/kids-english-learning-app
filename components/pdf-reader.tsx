'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface PDFReaderProps {
  pdfUrl: string
  title: string
  author?: string
  onClose?: () => void
}

export default function PDFReader({ pdfUrl, title, author, onClose }: PDFReaderProps) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">PDF Reader</h2>
        <p className="text-gray-600 mb-4">
          PDF reading is temporarily disabled for performance optimization.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Title: {title}
          {author && <><br />Author: {author}</>}
        </p>
        <div className="space-x-4">
          <Button onClick={onClose} className="btn-primary-kid">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}