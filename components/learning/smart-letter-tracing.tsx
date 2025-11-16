'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Mascot } from '@/components/ui/mascot'
import { 
  RefreshCw, Star, Volume2, VolumeX, Palette, 
  Minus, Plus, Sparkles, Trophy, CheckCircle, XCircle
} from 'lucide-react'
import { audioManager } from '@/lib/audio-manager'

interface LetterPath {
  strokes: Array<Array<{ x: number; y: number }>>
  bounds: { minX: number; minY: number; maxX: number; maxY: number }
}

interface SmartLetterTracingProps {
  letter: string
  onComplete?: () => void
  onNext?: () => void
}

// Letter path definitions with proper stroke order (normalized to 0-100 coordinate system)
const LETTER_PATHS: { [key: string]: LetterPath } = {
  'A': {
    strokes: [
      [{ x: 30, y: 80 }, { x: 50, y: 20 }], // Left diagonal
      [{ x: 50, y: 20 }, { x: 70, y: 80 }], // Right diagonal
      [{ x: 40, y: 50 }, { x: 60, y: 50 }] // Crossbar
    ],
    bounds: { minX: 30, minY: 20, maxX: 70, maxY: 80 }
  },
  'B': {
    strokes: [
      [{ x: 30, y: 20 }, { x: 30, y: 80 }], // Vertical line
      [{ x: 30, y: 20 }, { x: 60, y: 30 }, { x: 60, y: 45 }, { x: 30, y: 50 }], // Top curve
      [{ x: 30, y: 50 }, { x: 60, y: 60 }, { x: 60, y: 75 }, { x: 30, y: 80 }] // Bottom curve
    ],
    bounds: { minX: 30, minY: 20, maxX: 60, maxY: 80 }
  },
  'C': {
    strokes: [
      [{ x: 60, y: 30 }, { x: 40, y: 30 }, { x: 30, y: 40 }, { x: 30, y: 60 }, { x: 40, y: 70 }, { x: 60, y: 70 }]
    ],
    bounds: { minX: 30, minY: 30, maxX: 60, maxY: 70 }
  },
  'D': {
    strokes: [
      [{ x: 30, y: 20 }, { x: 30, y: 80 }], // Vertical line
      [{ x: 30, y: 20 }, { x: 60, y: 30 }, { x: 60, y: 70 }, { x: 30, y: 80 }] // Curve
    ],
    bounds: { minX: 30, minY: 20, maxX: 60, maxY: 80 }
  },
  'E': {
    strokes: [
      [{ x: 30, y: 20 }, { x: 30, y: 80 }], // Vertical line
      [{ x: 30, y: 20 }, { x: 60, y: 20 }], // Top horizontal
      [{ x: 30, y: 50 }, { x: 55, y: 50 }], // Middle horizontal
      [{ x: 30, y: 80 }, { x: 60, y: 80 }] // Bottom horizontal
    ],
    bounds: { minX: 30, minY: 20, maxX: 60, maxY: 80 }
  },
  'F': {
    strokes: [
      [{ x: 30, y: 20 }, { x: 30, y: 80 }], // Vertical line
      [{ x: 30, y: 20 }, { x: 60, y: 20 }], // Top horizontal
      [{ x: 30, y: 50 }, { x: 55, y: 50 }] // Middle horizontal
    ],
    bounds: { minX: 30, minY: 20, maxX: 60, maxY: 80 }
  },
  'G': {
    strokes: [
      [{ x: 60, y: 30 }, { x: 40, y: 30 }, { x: 30, y: 40 }, { x: 30, y: 60 }, { x: 40, y: 70 }, { x: 60, y: 70 }, { x: 60, y: 50 }, { x: 50, y: 50 }]
    ],
    bounds: { minX: 30, minY: 30, maxX: 60, maxY: 70 }
  },
  'H': {
    strokes: [
      [{ x: 30, y: 20 }, { x: 30, y: 80 }], // Left vertical
      [{ x: 30, y: 50 }, { x: 60, y: 50 }], // Horizontal crossbar
      [{ x: 60, y: 20 }, { x: 60, y: 80 }] // Right vertical
    ],
    bounds: { minX: 30, minY: 20, maxX: 60, maxY: 80 }
  },
  'I': {
    strokes: [
      [{ x: 30, y: 20 }, { x: 60, y: 20 }], // Top horizontal
      [{ x: 45, y: 20 }, { x: 45, y: 80 }], // Vertical line
      [{ x: 30, y: 80 }, { x: 60, y: 80 }] // Bottom horizontal
    ],
    bounds: { minX: 30, minY: 20, maxX: 60, maxY: 80 }
  },
  'J': {
    strokes: [
      [{ x: 45, y: 20 }, { x: 45, y: 70 }, { x: 40, y: 75 }, { x: 30, y: 75 }]
    ],
    bounds: { minX: 30, minY: 20, maxX: 45, maxY: 75 }
  },
  'K': {
    strokes: [
      [{ x: 30, y: 20 }, { x: 30, y: 80 }], // Vertical line
      [{ x: 30, y: 50 }, { x: 60, y: 25 }], // Top diagonal
      [{ x: 30, y: 50 }, { x: 60, y: 75 }] // Bottom diagonal
    ],
    bounds: { minX: 30, minY: 20, maxX: 60, maxY: 80 }
  },
  'L': {
    strokes: [
      [{ x: 30, y: 20 }, { x: 30, y: 80 }, { x: 60, y: 80 }]
    ],
    bounds: { minX: 30, minY: 20, maxX: 60, maxY: 80 }
  },
  'M': {
    strokes: [
      [{ x: 30, y: 80 }, { x: 30, y: 20 }], // Left vertical
      [{ x: 30, y: 20 }, { x: 45, y: 50 }], // Left diagonal
      [{ x: 45, y: 50 }, { x: 60, y: 20 }], // Right diagonal
      [{ x: 60, y: 20 }, { x: 60, y: 80 }] // Right vertical
    ],
    bounds: { minX: 30, minY: 20, maxX: 60, maxY: 80 }
  },
  'N': {
    strokes: [
      [{ x: 30, y: 80 }, { x: 30, y: 20 }], // Left vertical
      [{ x: 30, y: 20 }, { x: 60, y: 80 }], // Diagonal
      [{ x: 60, y: 80 }, { x: 60, y: 20 }] // Right vertical
    ],
    bounds: { minX: 30, minY: 20, maxX: 60, maxY: 80 }
  },
  'O': {
    strokes: [
      [{ x: 45, y: 30 }, { x: 35, y: 40 }, { x: 35, y: 60 }, { x: 45, y: 70 }, { x: 55, y: 60 }, { x: 55, y: 40 }, { x: 45, y: 30 }]
    ],
    bounds: { minX: 35, minY: 30, maxX: 55, maxY: 70 }
  },
  'P': {
    strokes: [
      [{ x: 30, y: 20 }, { x: 30, y: 80 }], // Vertical line
      [{ x: 30, y: 20 }, { x: 55, y: 30 }, { x: 55, y: 45 }, { x: 30, y: 50 }] // Top curve
    ],
    bounds: { minX: 30, minY: 20, maxX: 55, maxY: 80 }
  },
  'Q': {
    strokes: [
      [{ x: 45, y: 30 }, { x: 35, y: 40 }, { x: 35, y: 60 }, { x: 45, y: 70 }, { x: 55, y: 60 }, { x: 55, y: 40 }, { x: 45, y: 30 }], // Circle
      [{ x: 50, y: 65 }, { x: 60, y: 75 }] // Tail
    ],
    bounds: { minX: 35, minY: 30, maxX: 60, maxY: 75 }
  },
  'R': {
    strokes: [
      [{ x: 30, y: 20 }, { x: 30, y: 80 }], // Vertical line
      [{ x: 30, y: 20 }, { x: 55, y: 30 }, { x: 55, y: 45 }, { x: 30, y: 50 }], // Top curve
      [{ x: 30, y: 50 }, { x: 60, y: 75 }] // Diagonal
    ],
    bounds: { minX: 30, minY: 20, maxX: 60, maxY: 80 }
  },
  'S': {
    strokes: [
      [{ x: 50, y: 25 }, { x: 40, y: 30 }, { x: 35, y: 40 }, { x: 40, y: 50 }, { x: 50, y: 55 }, { x: 60, y: 60 }, { x: 65, y: 70 }, { x: 60, y: 75 }, { x: 50, y: 75 }]
    ],
    bounds: { minX: 35, minY: 25, maxX: 65, maxY: 75 }
  },
  'T': {
    strokes: [
      [{ x: 20, y: 20 }, { x: 70, y: 20 }], // Top horizontal
      [{ x: 45, y: 20 }, { x: 45, y: 80 }] // Vertical line
    ],
    bounds: { minX: 20, minY: 20, maxX: 70, maxY: 80 }
  },
  'U': {
    strokes: [
      [{ x: 30, y: 20 }, { x: 30, y: 60 }, { x: 35, y: 70 }, { x: 55, y: 70 }, { x: 60, y: 60 }, { x: 60, y: 20 }]
    ],
    bounds: { minX: 30, minY: 20, maxX: 60, maxY: 70 }
  },
  'V': {
    strokes: [
      [{ x: 30, y: 20 }, { x: 45, y: 80 }, { x: 60, y: 20 }]
    ],
    bounds: { minX: 30, minY: 20, maxX: 60, maxY: 80 }
  },
  'W': {
    strokes: [
      [{ x: 25, y: 20 }, { x: 35, y: 80 }], // Left diagonal
      [{ x: 35, y: 80 }, { x: 45, y: 50 }], // Middle left
      [{ x: 45, y: 50 }, { x: 55, y: 80 }], // Middle right
      [{ x: 55, y: 80 }, { x: 65, y: 20 }] // Right diagonal
    ],
    bounds: { minX: 25, minY: 20, maxX: 65, maxY: 80 }
  },
  'X': {
    strokes: [
      [{ x: 30, y: 20 }, { x: 60, y: 80 }], // Top-left to bottom-right
      [{ x: 60, y: 20 }, { x: 30, y: 80 }] // Top-right to bottom-left
    ],
    bounds: { minX: 30, minY: 20, maxX: 60, maxY: 80 }
  },
  'Y': {
    strokes: [
      [{ x: 45, y: 20 }, { x: 45, y: 50 }], // Top vertical
      [{ x: 30, y: 20 }, { x: 45, y: 50 }], // Left diagonal
      [{ x: 60, y: 20 }, { x: 45, y: 50 }], // Right diagonal
      [{ x: 45, y: 50 }, { x: 45, y: 80 }] // Bottom vertical
    ],
    bounds: { minX: 30, minY: 20, maxX: 60, maxY: 80 }
  },
  'Z': {
    strokes: [
      [{ x: 30, y: 20 }, { x: 60, y: 20 }], // Top horizontal
      [{ x: 60, y: 20 }, { x: 30, y: 80 }], // Diagonal
      [{ x: 30, y: 80 }, { x: 60, y: 80 }] // Bottom horizontal
    ],
    bounds: { minX: 30, minY: 20, maxX: 60, maxY: 80 }
  }
}

// Default to 'A' if letter not found
const getLetterPath = (letter: string): LetterPath => {
  return LETTER_PATHS[letter.toUpperCase()] || LETTER_PATHS['A']
}

// Confetti particle component
const ConfettiParticle = ({ delay, color, x }: { delay: number; color: string; x: number }) => {
  const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 800
  
  return (
    <motion.div
      className="fixed pointer-events-none z-50"
      style={{
        left: `${x}%`,
        top: '-10px',
        width: '12px',
        height: '12px',
        backgroundColor: color,
        borderRadius: '50%',
      }}
      initial={{ y: -10, rotate: 0, opacity: 1 }}
      animate={{ 
        y: screenHeight + 100,
        rotate: 360,
        opacity: 0,
        scale: [1, 1.2, 0.8, 0]
      }}
      transition={{
        duration: 2,
        delay,
        ease: 'easeOut'
      }}
    />
  )
}

// Star burst animation
const StarBurst = ({ x, y }: { x: number; y: number }) => {
  const stars = Array.from({ length: 8 }, (_, i) => i)
  return (
    <div className="fixed pointer-events-none z-50" style={{ left: `${x}%`, top: `${y}%` }}>
      {stars.map((star) => (
        <motion.div
          key={star}
          className="absolute"
          style={{
            width: '20px',
            height: '20px',
            color: '#FFD700',
          }}
          initial={{ 
            x: 0, 
            y: 0, 
            scale: 0, 
            rotate: 0,
            opacity: 1 
          }}
          animate={{
            x: Math.cos((star * Math.PI * 2) / 8) * 80,
            y: Math.sin((star * Math.PI * 2) / 8) * 80,
            scale: [0, 1.5, 0],
            rotate: 360,
            opacity: [1, 1, 0]
          }}
          transition={{
            duration: 1,
            ease: 'easeOut'
          }}
        >
          <Star className="w-full h-full fill-current" />
        </motion.div>
      ))}
    </div>
  )
}

export default function SmartLetterTracing({ letter, onComplete, onNext }: SmartLetterTracingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const guideAnimationRef = useRef<number | null>(null)
  const currentStrokeRef = useRef<number>(0)
  const isAnimatingGuideRef = useRef<boolean>(false)
  
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentStroke, setCurrentStroke] = useState(0)
  const [drawingPath, setDrawingPath] = useState<Array<{ x: number; y: number }>>([])
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [starsEarned, setStarsEarned] = useState(0)
  const [progress, setProgress] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showStarBurst, setShowStarBurst] = useState(false)
  const [starBurstPos, setStarBurstPos] = useState({ x: 50, y: 50 })
  
  // Pen customization
  const [penColor, setPenColor] = useState('#3B82F6')
  const [penSize, setPenSize] = useState(4)
  const [showPenOptions, setShowPenOptions] = useState(false)
  
  // Audio settings
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [backgroundMusic, setBackgroundMusic] = useState(false)
  
  const letterPath = getLetterPath(letter)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const completedStrokesRef = useRef<Set<number>>(new Set())
  const startTimeRef = useRef<number>(0)

  const penColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#EC4899', '#14B8A6', '#000000'
  ]

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (!container) return

      const size = Math.min(container.clientWidth - 40, 500)
      const scale = window.devicePixelRatio || 1
      
      canvas.width = size * scale
      canvas.height = size * scale
      canvas.style.width = `${size}px`
      canvas.style.height = `${size}px`
      
      ctx.scale(scale, scale)
      drawGuide()
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [letter])

  // Draw the letter guide
  const drawGuide = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1))
    
    const size = canvas.width / (window.devicePixelRatio || 1)
    const scale = size / 100
    const offsetX = (size - (letterPath.bounds.maxX - letterPath.bounds.minX) * scale) / 2
    const offsetY = (size - (letterPath.bounds.maxY - letterPath.bounds.minY) * scale) / 2

    // Draw grid background
    ctx.strokeStyle = '#E5E7EB'
    ctx.lineWidth = 1
    for (let i = 1; i < 3; i++) {
      const p = (size / 3) * i
      ctx.beginPath()
      ctx.moveTo(p, 0)
      ctx.lineTo(p, size)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, p)
      ctx.lineTo(size, p)
      ctx.stroke()
    }

    // Draw letter guide paths (faint)
    letterPath.strokes.forEach((stroke, strokeIndex) => {
      if (stroke.length < 2) return
      
      ctx.strokeStyle = completedStrokesRef.current.has(strokeIndex) 
        ? '#10B981' 
        : 'rgba(59, 130, 246, 0.2)'
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      
      ctx.beginPath()
      const start = stroke[0]
      ctx.moveTo(
        offsetX + (start.x - letterPath.bounds.minX) * scale,
        offsetY + (start.y - letterPath.bounds.minY) * scale
      )
      
      for (let i = 1; i < stroke.length; i++) {
        const point = stroke[i]
        ctx.lineTo(
          offsetX + (point.x - letterPath.bounds.minX) * scale,
          offsetY + (point.y - letterPath.bounds.minY) * scale
        )
      }
      ctx.stroke()
    })
  }, [letter, letterPath])

  // Animate guide stroke order
  const animateGuide = useCallback(() => {
    if (isAnimatingGuideRef.current) return
    isAnimatingGuideRef.current = true

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = canvas.width / (window.devicePixelRatio || 1)
    const scale = size / 100
    const offsetX = (size - (letterPath.bounds.maxX - letterPath.bounds.minX) * scale) / 2
    const offsetY = (size - (letterPath.bounds.maxY - letterPath.bounds.minY) * scale) / 2

    let strokeIndex = 0
    let pointIndex = 0

    const animate = () => {
      if (strokeIndex >= letterPath.strokes.length) {
        isAnimatingGuideRef.current = false
        drawGuide()
        return
      }

      const stroke = letterPath.strokes[strokeIndex]
      if (pointIndex < stroke.length - 1) {
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)'
        ctx.lineWidth = 4
        ctx.lineCap = 'round'
        
        const start = stroke[pointIndex]
        const end = stroke[pointIndex + 1]
        
        ctx.beginPath()
        ctx.moveTo(
          offsetX + (start.x - letterPath.bounds.minX) * scale,
          offsetY + (start.y - letterPath.bounds.minY) * scale
        )
        ctx.lineTo(
          offsetX + (end.x - letterPath.bounds.minX) * scale,
          offsetY + (end.y - letterPath.bounds.minY) * scale
        )
        ctx.stroke()

        pointIndex++
        guideAnimationRef.current = requestAnimationFrame(animate)
      } else {
        strokeIndex++
        pointIndex = 0
        setTimeout(() => {
          drawGuide()
          guideAnimationRef.current = requestAnimationFrame(animate)
        }, 300)
      }
    }

    drawGuide()
    setTimeout(() => {
      guideAnimationRef.current = requestAnimationFrame(animate)
    }, 500)
  }, [letterPath, drawGuide])

  // Start drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return

    // Record start time for analytics
    if (startTimeRef.current === 0) {
      startTimeRef.current = Date.now()
    }

    const rect = canvas.getBoundingClientRect()
    const scale = window.devicePixelRatio || 1
    const displayWidth = rect.width
    const displayHeight = rect.height

    let clientX = 0
    let clientY = 0

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else if ('clientX' in e) {
      clientX = e.clientX
      clientY = e.clientY
    }

    const x = (clientX - rect.left) * scale
    const y = (clientY - rect.top) * scale

    setIsDrawing(true)
    setDrawingPath([{ x, y }])
    lastPointRef.current = { x, y }
    setIsCorrect(null)
    setShowFeedback(false)
  }

  // Continue drawing
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const scale = window.devicePixelRatio || 1

    let clientX = 0
    let clientY = 0

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else if ('clientX' in e) {
      clientX = e.clientX
      clientY = e.clientY
    }

    const x = (clientX - rect.left) * scale
    const y = (clientY - rect.top) * scale

    if (lastPointRef.current) {
      ctx.strokeStyle = penColor
      ctx.lineWidth = penSize * scale
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      
      ctx.beginPath()
      ctx.moveTo(lastPointRef.current.x / scale, lastPointRef.current.y / scale)
      ctx.lineTo(x / scale, y / scale)
      ctx.stroke()

      // Check if path is correct (simplified - check distance to guide)
      checkPathCorrectness(x / scale, y / scale)

      setDrawingPath(prev => [...prev, { x: x / scale, y: y / scale }])
    }

    lastPointRef.current = { x, y }
  }

  // Validate overall shape matches the target letter
  const validateLetterShape = (drawnPath: Array<{ x: number; y: number }>): boolean => {
    if (drawnPath.length < 10) return false // Need minimum points to validate
    
    const size = canvasRef.current?.width ? canvasRef.current.width / (window.devicePixelRatio || 1) : 500
    const scale = size / 100
    const offsetX = (size - (letterPath.bounds.maxX - letterPath.bounds.minX) * scale) / 2
    const offsetY = (size - (letterPath.bounds.maxY - letterPath.bounds.minY) * scale) / 2

    // Normalize drawn path to 0-100 coordinate system for comparison
    const normalizedDrawn: Array<{ x: number; y: number }> = drawnPath.map(point => ({
      x: ((point.x - offsetX) / scale) + letterPath.bounds.minX,
      y: ((point.y - offsetY) / scale) + letterPath.bounds.minY
    }))

    // Get all guide points from the target letter
    const allGuidePoints: Array<{ x: number; y: number }> = []
    letterPath.strokes.forEach(stroke => {
      stroke.forEach(point => allGuidePoints.push(point))
    })

    // Calculate average distance from drawn path to guide points
    let totalDistance = 0
    let matchedPoints = 0
    const MAX_DISTANCE = 15 // Stricter threshold

    normalizedDrawn.forEach(drawnPoint => {
      let minDist = Infinity
      allGuidePoints.forEach(guidePoint => {
        const dist = Math.sqrt((drawnPoint.x - guidePoint.x) ** 2 + (drawnPoint.y - guidePoint.y) ** 2)
        if (dist < minDist) {
          minDist = dist
        }
      })
      if (minDist < MAX_DISTANCE) {
        totalDistance += minDist
        matchedPoints++
      }
    })

    // Require at least 70% of drawn points to be close to guide points
    const matchRatio = matchedPoints / normalizedDrawn.length
    const avgDistance = matchedPoints > 0 ? totalDistance / matchedPoints : Infinity

    // Additional validation: Check letter-specific characteristics
    const letterUpper = letter.toUpperCase()
    
    if (letterUpper === 'B') {
      // B must have:
      // 1. A vertical line on the left (check for points near x=30)
      // 2. Two distinct curves (top and bottom)
      const leftVerticalPoints = normalizedDrawn.filter(p => Math.abs(p.x - 30) < 10)
      const hasVerticalLine = leftVerticalPoints.length > normalizedDrawn.length * 0.2 // At least 20% of points near left edge
      
      // Check for two curves by looking at y-coordinate distribution
      // B should have curves at top (y ~30-50) and bottom (y ~50-80)
      const topCurvePoints = normalizedDrawn.filter(p => p.y >= 20 && p.y <= 50 && p.x > 30)
      const bottomCurvePoints = normalizedDrawn.filter(p => p.y >= 50 && p.y <= 80 && p.x > 30)
      
      // B should have both top and bottom curves
      if (!hasVerticalLine || topCurvePoints.length < normalizedDrawn.length * 0.15 || 
          bottomCurvePoints.length < normalizedDrawn.length * 0.15) {
        return false
      }
      
      // Reject if it looks like D (only one curve) or C (no vertical line)
      const rightCurvePoints = normalizedDrawn.filter(p => p.x > 40 && p.x < 60)
      // If there's only one main curve area, it might be D
      if (rightCurvePoints.length > normalizedDrawn.length * 0.6 && !hasVerticalLine) {
        return false // Looks like C
      }
    } 
    else if (letterUpper === 'D') {
      // D must have:
      // 1. A vertical line on the left
      // 2. One curve (not two like B)
      const leftVerticalPoints = normalizedDrawn.filter(p => Math.abs(p.x - 30) < 10)
      const hasVerticalLine = leftVerticalPoints.length > normalizedDrawn.length * 0.2
      
      // D should have one continuous curve, not two separate ones
      const curvePoints = normalizedDrawn.filter(p => p.x > 30 && p.x < 60)
      
      // Reject if it looks like B (two distinct curves) or C (no vertical line)
      if (!hasVerticalLine) {
        return false // Looks like C
      }
      
      // Check if there are two distinct curve areas (like B)
      const topHalf = normalizedDrawn.filter(p => p.y < 50)
      const bottomHalf = normalizedDrawn.filter(p => p.y >= 50)
      const topCurveArea = topHalf.filter(p => p.x > 30 && p.x < 60).length
      const bottomCurveArea = bottomHalf.filter(p => p.x > 30 && p.x < 60).length
      
      // If both top and bottom have significant curve areas, it might be B
      if (topCurveArea > topHalf.length * 0.3 && bottomCurveArea > bottomHalf.length * 0.3) {
        return false // Looks like B (two curves)
      }
    } 
    else if (letterUpper === 'C') {
      // C must have:
      // 1. One continuous curve
      // 2. NO vertical line on the left
      const leftVerticalPoints = normalizedDrawn.filter(p => Math.abs(p.x - 30) < 10)
      const hasVerticalLine = leftVerticalPoints.length > normalizedDrawn.length * 0.15
      
      // C should NOT have a vertical line
      if (hasVerticalLine) {
        return false // Has vertical line, might be B or D
      }
      
      // C should be mostly curved points
      const curvePoints = normalizedDrawn.filter(p => {
        const centerX = 45
        const centerY = 50
        const distFromCenter = Math.sqrt((p.x - centerX) ** 2 + (p.y - centerY) ** 2)
        return distFromCenter > 10 && distFromCenter < 30
      })
      
      if (curvePoints.length < normalizedDrawn.length * 0.5) {
        return false // Not enough curve points
      }
    }

    // Final validation: match ratio and average distance
    return matchRatio >= 0.7 && avgDistance < MAX_DISTANCE
  }

  // Check if drawing path is correct
  const checkPathCorrectness = (x: number, y: number) => {
    const size = canvasRef.current?.width ? canvasRef.current.width / (window.devicePixelRatio || 1) : 500
    const scale = size / 100
    const offsetX = (size - (letterPath.bounds.maxX - letterPath.bounds.minX) * scale) / 2
    const offsetY = (size - (letterPath.bounds.maxY - letterPath.bounds.minY) * scale) / 2

    let minDistance = Infinity
    let closestStroke = -1

    letterPath.strokes.forEach((stroke, strokeIndex) => {
      stroke.forEach(point => {
        const guideX = offsetX + (point.x - letterPath.bounds.minX) * scale
        const guideY = offsetY + (point.y - letterPath.bounds.minY) * scale
        const distance = Math.sqrt((x - guideX) ** 2 + (y - guideY) ** 2)
        
        if (distance < minDistance) {
          minDistance = distance
          closestStroke = strokeIndex
        }
      })
    })

    // Stricter threshold: If within 15px of guide (reduced from 20px)
    if (minDistance < 15) {
      if (closestStroke === currentStroke && !completedStrokesRef.current.has(closestStroke)) {
        completedStrokesRef.current.add(closestStroke)
        setCurrentStroke(prev => prev + 1)
        setProgress(prev => Math.min(prev + (100 / letterPath.strokes.length), 100))
        
        // Visual feedback - green glow
        const canvas = canvasRef.current
        if (canvas) {
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.shadowColor = '#10B981'
            ctx.shadowBlur = 15
            setTimeout(() => {
              if (ctx) {
                ctx.shadowBlur = 0
              }
            }, 200)
          }
        }
      }
      setIsCorrect(true)
    } else if (minDistance > 30) {
      // Too far from guide - red highlight (stricter threshold)
      setIsCorrect(false)
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.shadowColor = '#EF4444'
          ctx.shadowBlur = 10
          setTimeout(() => {
            if (ctx) {
              ctx.shadowBlur = 0
            }
          }, 100)
        }
      }
    }
  }

  // Stop drawing and check completion
  const stopDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)

    // Validate the overall shape matches the target letter
    const shapeIsValid = validateLetterShape(drawingPath)
    
    // Check if all strokes are completed AND shape is valid
    const allStrokesCompleted = completedStrokesRef.current.size === letterPath.strokes.length
    
    if (allStrokesCompleted && shapeIsValid) {
      handleComplete()
    } else {
      // If strokes are completed but shape doesn't match, show error
      if (allStrokesCompleted && !shapeIsValid) {
        setIsCorrect(false)
        setShowFeedback(true)
        // Reset completed strokes to allow retry
        completedStrokesRef.current.clear()
        setCurrentStroke(0)
        setProgress(0)
        
        if (soundEnabled) {
          audioManager.playError()
        }
        
        setTimeout(() => {
          setShowFeedback(false)
        }, 2000)
      } else {
        // Show feedback for incomplete strokes
        setShowFeedback(true)
        if (soundEnabled) {
          if (isCorrect) {
            audioManager.playSuccess()
          } else {
            audioManager.playError()
          }
        }
        
        setTimeout(() => {
          setShowFeedback(false)
        }, 1500)
      }
    }

    lastPointRef.current = null
  }

  // Handle letter completion
  const handleComplete = () => {
    setShowFeedback(true)
    setIsCorrect(true)
    setStarsEarned(prev => prev + 1)
    setProgress(100)

    // Track analytics
    if (typeof window !== 'undefined') {
      try {
        const { parentAnalytics } = require('@/lib/parent-analytics')
        const startTime = startTimeRef.current
        const endTime = Date.now()
        const timeSpent = (endTime - startTime) / 1000 // seconds
        
        // Get current child ID from localStorage
        const currentChild = JSON.parse(localStorage.getItem('currentChild') || 'null')
        if (currentChild?.id && currentChild?.parentId) {
          // Calculate accuracy based on correct strokes
          const accuracy = (completedStrokesRef.current.size / letterPath.strokes.length) * 100
          
          // Save trace data (optional - can be enhanced to save canvas data)
          parentAnalytics.recordLetterTracing(
            currentChild.parentId,
            currentChild.id,
            letter,
            true, // success
            accuracy,
            timeSpent
          )
        }
      } catch (error) {
        console.error('Error recording analytics:', error)
      }
    }

    // Play letter sound
    if (soundEnabled) {
      try {
        audioManager.speak(`${letter} says ${getLetterSound(letter)}`)
      } catch (error) {
        console.error('Error speaking letter:', error)
      }
      audioManager.playSuccess()
    }

    // Show celebrations
    setShowConfetti(true)
    setShowStarBurst(true)
    setStarBurstPos({ x: 50, y: 50 })

    setTimeout(() => {
      setShowConfetti(false)
      setShowStarBurst(false)
    }, 2000)

    setTimeout(() => {
      onComplete?.()
      if (onNext) {
        resetTracing()
      }
    }, 2500)
  }

  // Get letter sound for phonics
  const getLetterSound = (letter: string): string => {
    const sounds: { [key: string]: string } = {
      'A': 'ah', 'B': 'buh', 'C': 'kuh', 'D': 'duh', 'E': 'eh',
      'F': 'fuh', 'G': 'guh', 'H': 'huh', 'I': 'ih', 'J': 'juh',
      'K': 'kuh', 'L': 'luh', 'M': 'muh', 'N': 'nuh', 'O': 'oh',
      'P': 'puh', 'Q': 'kwuh', 'R': 'ruh', 'S': 'suh', 'T': 'tuh',
      'U': 'uh', 'V': 'vuh', 'W': 'wuh', 'X': 'ks', 'Y': 'yuh', 'Z': 'zuh'
    }
    return sounds[letter.toUpperCase()] || 'uh'
  }

  // Reset tracing
  const resetTracing = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
    
    setIsDrawing(false)
    setCurrentStroke(0)
    startTimeRef.current = 0
    setDrawingPath([])
    setIsCorrect(null)
    setShowFeedback(false)
    setProgress(0)
    completedStrokesRef.current.clear()
    lastPointRef.current = null
    drawGuide()
  }

  // Show guide animation on mount
  useEffect(() => {
    setTimeout(() => {
      animateGuide()
    }, 1000)
  }, [letter, animateGuide])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="mb-4 bg-white/80 backdrop-blur-sm border-2 border-purple-200 rounded-3xl shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-between mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPenOptions(!showPenOptions)}
                className="rounded-full"
              >
                <Palette className="w-5 h-5" />
              </Button>
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {letter}
              </motion.div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="rounded-full"
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </Button>
            </div>
            
            {/* Progress and Stars */}
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                <span className="text-2xl font-bold text-gray-700">{starsEarned}</span>
              </div>
              
              <div className="flex-1 max-w-xs">
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Pen Options Panel */}
        <AnimatePresence>
          {showPenOptions && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4"
            >
              <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200 rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Pen Color</p>
                      <div className="flex gap-2">
                        {penColors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setPenColor(color)}
                            className={`w-10 h-10 rounded-full border-2 transition-all ${
                              penColor === color ? 'border-gray-800 scale-110' : 'border-gray-300'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Pen Size</p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPenSize(Math.max(2, penSize - 1))}
                          className="rounded-full"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-12 text-center font-bold">{penSize}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPenSize(Math.min(10, penSize + 1))}
                          className="rounded-full"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Canvas Container */}
        <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200 rounded-3xl shadow-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="relative flex justify-center">
              <canvas
                ref={canvasRef}
                className="border-2 border-purple-300 rounded-2xl shadow-lg bg-white touch-none"
                style={{ maxWidth: '100%', height: 'auto' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              
              {/* Feedback Overlay */}
              <AnimatePresence>
                {showFeedback && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    {isCorrect ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.2, 1] }}
                        className="bg-green-500 text-white rounded-full p-6 shadow-2xl"
                      >
                        <CheckCircle className="w-16 h-16" />
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.2, 1] }}
                        className="bg-red-500 text-white rounded-full p-6 shadow-2xl"
                      >
                        <XCircle className="w-16 h-16" />
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-6">
          <Button
            onClick={resetTracing}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-8 py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Again
          </Button>
          
          {onNext && (
            <Button
              onClick={onNext}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full px-8 py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
            >
              Next Letter
            </Button>
          )}
        </div>

        {/* Success Message */}
        <AnimatePresence>
          {showFeedback && isCorrect && completedStrokesRef.current.size === letterPath.strokes.length && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-6 text-center"
            >
              <Card className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 shadow-2xl">
                <CardContent className="p-6">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                  >
                    <Trophy className="w-12 h-12 mx-auto mb-2" />
                  </motion.div>
                  <h3 className="text-3xl font-bold mb-2">Great Job! 🎉</h3>
                  <p className="text-xl">You traced {letter} perfectly!</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 50 }).map((_, i) => (
            <ConfettiParticle
              key={i}
              delay={i * 0.05}
              color={penColors[Math.floor(Math.random() * penColors.length)]}
              x={Math.random() * 100}
            />
          ))}
        </div>
      )}

      {/* Star Burst */}
      {showStarBurst && (
        <StarBurst x={starBurstPos.x} y={starBurstPos.y} />
      )}
    </div>
  )
}

