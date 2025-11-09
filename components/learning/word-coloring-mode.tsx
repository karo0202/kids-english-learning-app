'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Eraser, RotateCcw, Save, Volume2, ArrowLeft, ArrowRight } from 'lucide-react'

interface WordColoringModeProps {
  letter: string
  word: string
  colorPalette: string[]
  savedData?: any
  onSave: (data: any) => void
  onLetterClick: () => void
}

export default function WordColoringMode({
  letter,
  word,
  colorPalette,
  savedData,
  onSave,
  onLetterClick
}: WordColoringModeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedColor, setSelectedColor] = useState(colorPalette[0])
  const [isDrawing, setIsDrawing] = useState(false)
  const [isErasing, setIsErasing] = useState(false)
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0)

  const letters = word.toUpperCase().split('')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Clear canvas
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw bubble letter outline for current letter
    const currentLetter = letters[currentLetterIndex]
    ctx.font = 'bold 120px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 5
    
    // Draw bubble letter
    ctx.strokeText(currentLetter, canvas.width / 2, canvas.height / 2)
    
    // Load saved coloring if available
    if (savedData?.wordTracingData && savedData.wordTracingData[currentLetterIndex]) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      }
      img.src = savedData.wordTracingData[currentLetterIndex]
    }
  }, [currentLetterIndex, letters, savedData])

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      }
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      }
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { x, y } = getCoordinates(e)
    
    if (isErasing) {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.lineWidth = 25
    } else {
      ctx.globalCompositeOperation = 'source-atop'
      ctx.fillStyle = selectedColor
      ctx.lineWidth = 20
    }

    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.fillRect(x - 10, y - 10, 20, 20)
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    draw(e)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    draw(e)
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    setIsDrawing(true)
    draw(e)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (isDrawing) {
      draw(e)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    setIsDrawing(false)
  }

  const handleClear = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Redraw letter outline
    const currentLetter = letters[currentLetterIndex]
    ctx.font = 'bold 120px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 5
    ctx.strokeText(currentLetter, canvas.width / 2, canvas.height / 2)
  }

  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const imageData = canvas.toDataURL('image/png')
    const existingData = savedData?.wordTracingData || {}
    
    onSave({
      ...savedData,
      wordTracingData: {
        ...existingData,
        [currentLetterIndex]: imageData
      },
      letter,
      word
    })
  }

  const handleNextLetter = () => {
    if (currentLetterIndex < letters.length - 1) {
      setCurrentLetterIndex(currentLetterIndex + 1)
    }
  }

  const handlePrevLetter = () => {
    if (currentLetterIndex > 0) {
      setCurrentLetterIndex(currentLetterIndex - 1)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.div
          className="text-6xl font-bold text-gray-700 mb-4 cursor-pointer"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={onLetterClick}
        >
          {letter}
        </motion.div>
        <motion.p
          className="text-2xl font-semibold text-gray-600 cursor-pointer mb-2"
          whileHover={{ scale: 1.05 }}
          onClick={onLetterClick}
        >
          {word}
        </motion.p>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLetterClick}
          className="mb-4"
        >
          <Volume2 className="w-4 h-4 mr-2" />
          Listen: {letter} for {word}
        </Button>
      </div>

      {/* Word Display */}
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4">
        <div className="flex items-center justify-center gap-2">
          {letters.map((ltr, idx) => (
            <motion.div
              key={idx}
              className={`text-4xl font-bold px-3 py-2 rounded-lg transition-all ${
                idx === currentLetterIndex
                  ? 'bg-yellow-300 scale-110 shadow-lg'
                  : idx < currentLetterIndex
                  ? 'bg-green-200 text-green-700'
                  : 'bg-gray-200 text-gray-500'
              }`}
              whileHover={{ scale: 1.1 }}
            >
              {ltr}
            </motion.div>
          ))}
        </div>
        <p className="text-center text-sm text-gray-600 mt-2">
          Letter {currentLetterIndex + 1} of {letters.length}
        </p>
      </div>

      {/* Letter Tracing Area */}
      <div className="relative">
        <h3 className="text-xl font-bold text-gray-700 mb-3 text-center">
          ✏️ Trace and Color Letter: {letters[currentLetterIndex]}
        </h3>
        <div className="relative bg-white rounded-lg border-4 border-gray-300 p-4">
          <canvas
            ref={canvasRef}
            className="w-full h-96 touch-none cursor-crosshair"
            style={{ maxHeight: '500px' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-center items-center gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={handlePrevLetter}
          disabled={currentLetterIndex === 0}
          className="text-lg px-6 py-3"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Previous
        </Button>
        
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700">
            {letters[currentLetterIndex]}
          </p>
        </div>
        
        <Button
          variant="outline"
          size="lg"
          onClick={handleNextLetter}
          disabled={currentLetterIndex === letters.length - 1}
          className="text-lg px-6 py-3"
        >
          Next
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>

      {/* Color Palette */}
      <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
        <h3 className="text-lg font-bold text-gray-700 mb-3 text-center">
          Color Palette
        </h3>
        <div className="grid grid-cols-6 gap-3">
          {colorPalette.map((color) => (
            <motion.button
              key={color}
              className={`w-12 h-12 rounded-full border-4 transition-all ${
                selectedColor === color
                  ? 'border-gray-800 scale-110 shadow-lg'
                  : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setSelectedColor(color)
                setIsErasing(false)
              }}
            />
          ))}
        </div>
      </div>

      {/* Tools */}
      <div className="flex flex-wrap justify-center gap-3">
        <Button
          variant={isErasing ? 'default' : 'outline'}
          size="lg"
          onClick={() => setIsErasing(!isErasing)}
          className="text-lg px-6 py-3"
        >
          <Eraser className="w-5 h-5 mr-2" />
          Eraser
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          onClick={handleClear}
          className="text-lg px-6 py-3"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Clear
        </Button>
        
        <Button
          variant="default"
          size="lg"
          onClick={handleSave}
          className="text-lg px-6 py-3 bg-green-500 hover:bg-green-600"
        >
          <Save className="w-5 h-5 mr-2" />
          Save
        </Button>
      </div>
    </div>
  )
}

