'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Eraser, RotateCcw, Save, Volume2, ArrowLeft, ArrowRight, Palette, Minus, Plus } from 'lucide-react'

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
  const canvasBackRef = useRef<HTMLCanvasElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedColor, setSelectedColor] = useState(colorPalette[0])
  const [penSize, setPenSize] = useState(20)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isErasing, setIsErasing] = useState(false)
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0)
  const [showPenOptions, setShowPenOptions] = useState(true)

  const letters = word.toUpperCase().split('')

  const drawLetterOutline = (ctx: CanvasRenderingContext2D, w: number, h: number, char: string) => {
    const size = Math.min(w, h) * 0.7
    ctx.font = `bold ${Math.round(size)}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = Math.max(4, Math.round(size / 30))
    ctx.strokeText(char, w / 2, h / 2)
  }

  const drawLetterMask = (ctx: CanvasRenderingContext2D, w: number, h: number, char: string) => {
    const size = Math.min(w, h) * 0.7
    ctx.font = `bold ${Math.round(size)}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#ffffff'
    ctx.fillText(char, w / 2, h / 2)
  }

  const initCanvases = () => {
    const back = canvasBackRef.current
    const front = canvasRef.current
    const container = containerRef.current
    if (!back || !front || !container) return
    const w = container.offsetWidth
    const h = container.offsetHeight
    if (w <= 0 || h <= 0) return

    back.width = w
    back.height = h
    front.width = w
    front.height = h

    const backCtx = back.getContext('2d')
    const frontCtx = front.getContext('2d')
    if (!backCtx || !frontCtx) return

    const currentLetter = word.toUpperCase()[currentLetterIndex] ?? ''
    backCtx.fillStyle = '#ffffff'
    backCtx.fillRect(0, 0, w, h)
    drawLetterOutline(backCtx, w, h, currentLetter)

    frontCtx.clearRect(0, 0, w, h)
    if (savedData?.wordTracingData && savedData.wordTracingData[currentLetterIndex]) {
      const img = new Image()
      img.onload = () => {
        frontCtx?.drawImage(img, 0, 0, w, h)
      }
      img.src = savedData.wordTracingData[currentLetterIndex]
    }
  }

  useEffect(() => {
    initCanvases()
    const container = containerRef.current
    if (!container) return
    const ro = new ResizeObserver(() => initCanvases())
    ro.observe(container)
    return () => ro.disconnect()
  }, [currentLetterIndex, word, savedData])

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
    const size = isErasing ? Math.max(20, penSize + 8) : penSize
    const half = size / 2

    if (isErasing) {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = 'rgba(0,0,0,1)'
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = selectedColor
    }
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.fillRect(x - half, y - half, size, size)
  }

  const maskFrontToLetter = () => {
    const front = canvasRef.current
    if (!front) return
    const ctx = front.getContext('2d')
    if (!ctx) return
    const w = front.width
    const h = front.height
    const currentLetter = letters[currentLetterIndex] ?? ''
    ctx.globalCompositeOperation = 'destination-in'
    drawLetterMask(ctx, w, h, currentLetter)
    ctx.globalCompositeOperation = 'source-over'
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
    if (isDrawing && !isErasing) maskFrontToLetter()
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
    if (isDrawing && !isErasing) maskFrontToLetter()
    setIsDrawing(false)
  }

  const handleClear = () => {
    const front = canvasRef.current
    if (!front) return
    const ctx = front.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, front.width, front.height)
  }

  const handleSave = () => {
    const back = canvasBackRef.current
    const front = canvasRef.current
    if (!back || !front) return

    const w = back.width
    const h = back.height
    const off = document.createElement('canvas')
    off.width = w
    off.height = h
    const offCtx = off.getContext('2d')
    if (!offCtx) return
    offCtx.drawImage(back, 0, 0)
    offCtx.drawImage(front, 0, 0)
    const imageData = off.toDataURL('image/png')
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
        <div className="flex flex-wrap items-center justify-center gap-3 mb-3">
          <h3 className="text-xl font-bold text-gray-700 text-center">
            ✏️ Trace and Color Letter: {letters[currentLetterIndex]}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPenOptions(!showPenOptions)}
            className="shrink-0"
          >
            <Palette className="w-4 h-4 mr-1" />
            {showPenOptions ? 'Hide' : 'Show'} pen options
          </Button>
        </div>

        {/* Pen options: color palette + pen size */}
        {showPenOptions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4"
          >
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Pen color</p>
              <div className="flex flex-wrap gap-2">
                {colorPalette.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      selectedColor === color ? 'border-gray-800 dark:border-white scale-110 shadow-md' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      setSelectedColor(color)
                      setIsErasing(false)
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Pen size</p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPenSize((s) => Math.max(6, s - 4))}
                  className="h-9 w-9 p-0"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-10 text-center text-sm font-medium tabular-nums">{penSize}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPenSize((s) => Math.min(40, s + 4))}
                  className="h-9 w-9 p-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="relative bg-white dark:bg-gray-900 rounded-lg border-4 border-gray-300 dark:border-gray-600 p-4">
          <div
            ref={containerRef}
            className="relative w-full rounded overflow-hidden"
            style={{ height: 'min(500px, 70vw)' }}
          >
            <canvas
              ref={canvasBackRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
              aria-hidden
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full touch-none cursor-crosshair"
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

