'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Eraser, RotateCcw, Save, Volume2, Sparkles } from 'lucide-react'

interface ColoringCardProps {
  letter: string
  word: string
  colorPalette: string[]
  savedData?: any
  onSave: (data: any) => void
  onComplete: () => void
  onLetterClick: () => void
}

export default function ColoringCard({
  letter,
  word,
  colorPalette,
  savedData,
  onSave,
  onComplete,
  onLetterClick
}: ColoringCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wordCanvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedColor, setSelectedColor] = useState(colorPalette[0])
  const [isDrawing, setIsDrawing] = useState(false)
  const [isErasing, setIsErasing] = useState(false)
  const [showSparkles, setShowSparkles] = useState(false)
  const [sparklePositions, setSparklePositions] = useState<Array<{ x: number; y: number }>>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Load saved data if available
    if (savedData?.imageData) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      }
      img.src = savedData.imageData
    } else {
      // Draw outline image placeholder (in real app, this would be an actual image)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Draw a simple outline shape based on the letter
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 3
      drawOutlineShape(ctx, canvas.width, canvas.height, letter)
    }
  }, [letter, savedData])

  useEffect(() => {
    const canvas = wordCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Draw word outline
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    ctx.font = 'bold 48px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 3
    
    // Draw bubble letter outline
    ctx.strokeText(word.toUpperCase(), canvas.width / 2, canvas.height / 2)
    
    // Load saved word coloring if available
    if (savedData?.wordData) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      }
      img.src = savedData.wordData
    }
  }, [word, savedData])

  const drawOutlineShape = (ctx: CanvasRenderingContext2D, width: number, height: number, letter: string) => {
    const centerX = width / 2
    const centerY = height / 2
    const size = Math.min(width, height) * 0.35
    
    ctx.beginPath()
    
    switch (letter.toUpperCase()) {
      case 'A': // Apple
        // Apple body
        ctx.ellipse(centerX, centerY - size * 0.1, size * 0.6, size * 0.7, 0, 0, Math.PI * 2)
        // Apple top indent
        ctx.moveTo(centerX - size * 0.3, centerY - size * 0.8)
        ctx.lineTo(centerX, centerY - size * 1.1)
        ctx.lineTo(centerX + size * 0.3, centerY - size * 0.8)
        // Leaf
        ctx.moveTo(centerX + size * 0.1, centerY - size * 1.1)
        ctx.quadraticCurveTo(centerX + size * 0.3, centerY - size * 1.3, centerX + size * 0.2, centerY - size * 1.2)
        break
      
      case 'B': // Bird
        // Bird body
        ctx.ellipse(centerX, centerY, size * 0.5, size * 0.6, 0, 0, Math.PI * 2)
        // Head
        ctx.arc(centerX - size * 0.3, centerY - size * 0.4, size * 0.3, 0, Math.PI * 2)
        // Beak
        ctx.moveTo(centerX - size * 0.6, centerY - size * 0.4)
        ctx.lineTo(centerX - size * 0.8, centerY - size * 0.3)
        ctx.lineTo(centerX - size * 0.6, centerY - size * 0.2)
        // Wing
        ctx.moveTo(centerX + size * 0.2, centerY - size * 0.2)
        ctx.quadraticCurveTo(centerX + size * 0.6, centerY - size * 0.4, centerX + size * 0.4, centerY)
        break
      
      case 'C': // Cat
        // Cat head
        ctx.arc(centerX, centerY, size * 0.6, 0, Math.PI * 2)
        // Ears
        ctx.moveTo(centerX - size * 0.4, centerY - size * 0.5)
        ctx.lineTo(centerX - size * 0.2, centerY - size * 0.8)
        ctx.lineTo(centerX, centerY - size * 0.5)
        ctx.moveTo(centerX + size * 0.4, centerY - size * 0.5)
        ctx.lineTo(centerX + size * 0.2, centerY - size * 0.8)
        ctx.lineTo(centerX, centerY - size * 0.5)
        break
      
      case 'D': // Dolphin
        // Dolphin body
        ctx.ellipse(centerX, centerY, size * 0.7, size * 0.4, -0.3, 0, Math.PI * 2)
        // Tail
        ctx.moveTo(centerX - size * 0.7, centerY)
        ctx.lineTo(centerX - size, centerY - size * 0.3)
        ctx.lineTo(centerX - size * 0.9, centerY)
        ctx.lineTo(centerX - size, centerY + size * 0.3)
        // Fin
        ctx.moveTo(centerX + size * 0.3, centerY - size * 0.2)
        ctx.quadraticCurveTo(centerX + size * 0.5, centerY - size * 0.5, centerX + size * 0.4, centerY - size * 0.3)
        break
      
      case 'E': // Eggs
        ctx.ellipse(centerX - size * 0.3, centerY, size * 0.25, size * 0.35, 0, 0, Math.PI * 2)
        ctx.moveTo(centerX + size * 0.3, centerY)
        ctx.ellipse(centerX + size * 0.3, centerY, size * 0.25, size * 0.35, 0, 0, Math.PI * 2)
        break
      
      case 'F': // Fish
        // Fish body
        ctx.ellipse(centerX, centerY, size * 0.6, size * 0.4, 0, 0, Math.PI * 2)
        // Tail
        ctx.moveTo(centerX - size * 0.6, centerY)
        ctx.lineTo(centerX - size * 0.9, centerY - size * 0.3)
        ctx.lineTo(centerX - size * 0.8, centerY)
        ctx.lineTo(centerX - size * 0.9, centerY + size * 0.3)
        // Fin
        ctx.moveTo(centerX, centerY - size * 0.4)
        ctx.quadraticCurveTo(centerX + size * 0.2, centerY - size * 0.6, centerX + size * 0.1, centerY - size * 0.4)
        break
      
      case 'G': // Gloves
        // Left glove
        ctx.moveTo(centerX - size * 0.4, centerY - size * 0.6)
        ctx.quadraticCurveTo(centerX - size * 0.5, centerY - size * 0.3, centerX - size * 0.4, centerY)
        ctx.quadraticCurveTo(centerX - size * 0.3, centerY + size * 0.3, centerX - size * 0.2, centerY)
        ctx.quadraticCurveTo(centerX - size * 0.3, centerY - size * 0.3, centerX - size * 0.4, centerY - size * 0.6)
        // Right glove
        ctx.moveTo(centerX + size * 0.2, centerY - size * 0.6)
        ctx.quadraticCurveTo(centerX + size * 0.1, centerY - size * 0.3, centerX + size * 0.2, centerY)
        ctx.quadraticCurveTo(centerX + size * 0.3, centerY + size * 0.3, centerX + size * 0.4, centerY)
        ctx.quadraticCurveTo(centerX + size * 0.3, centerY - size * 0.3, centerX + size * 0.2, centerY - size * 0.6)
        break
      
      case 'H': // House
        // House base
        ctx.rect(centerX - size * 0.5, centerY, size, size * 0.6)
        // Roof
        ctx.moveTo(centerX - size * 0.5, centerY)
        ctx.lineTo(centerX, centerY - size * 0.5)
        ctx.lineTo(centerX + size * 0.5, centerY)
        // Door
        ctx.rect(centerX - size * 0.15, centerY + size * 0.3, size * 0.3, size * 0.3)
        break
      
      case 'I': // Ice cream
        // Cone
        ctx.moveTo(centerX - size * 0.3, centerY + size * 0.5)
        ctx.lineTo(centerX, centerY + size * 0.8)
        ctx.lineTo(centerX + size * 0.3, centerY + size * 0.5)
        // Scoop 1
        ctx.arc(centerX, centerY + size * 0.2, size * 0.3, 0, Math.PI * 2)
        // Scoop 2
        ctx.arc(centerX, centerY - size * 0.1, size * 0.3, 0, Math.PI * 2)
        break
      
      case 'J': // Jug
        // Jug body
        ctx.ellipse(centerX, centerY, size * 0.4, size * 0.5, 0, 0, Math.PI * 2)
        // Handle
        ctx.moveTo(centerX + size * 0.4, centerY - size * 0.2)
        ctx.quadraticCurveTo(centerX + size * 0.6, centerY, centerX + size * 0.4, centerY + size * 0.2)
        // Spout
        ctx.moveTo(centerX - size * 0.4, centerY - size * 0.5)
        ctx.lineTo(centerX - size * 0.6, centerY - size * 0.6)
        ctx.lineTo(centerX - size * 0.4, centerY - size * 0.4)
        break
      
      case 'K': // Kite
        // Kite diamond
        ctx.moveTo(centerX, centerY - size * 0.6)
        ctx.lineTo(centerX + size * 0.5, centerY)
        ctx.lineTo(centerX, centerY + size * 0.6)
        ctx.lineTo(centerX - size * 0.5, centerY)
        ctx.closePath()
        // Tail
        ctx.moveTo(centerX, centerY + size * 0.6)
        ctx.lineTo(centerX, centerY + size * 0.9)
        break
      
      case 'L': // Lion
        // Lion head
        ctx.arc(centerX, centerY, size * 0.6, 0, Math.PI * 2)
        // Mane
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2
          const x = centerX + Math.cos(angle) * size * 0.7
          const y = centerY + Math.sin(angle) * size * 0.7
          ctx.moveTo(centerX, centerY)
          ctx.lineTo(x, y)
        }
        break
      
      case 'M': // Mushroom
        // Stem
        ctx.rect(centerX - size * 0.1, centerY, size * 0.2, size * 0.4)
        // Cap
        ctx.arc(centerX, centerY, size * 0.5, 0, Math.PI * 2)
        // Spots
        ctx.arc(centerX - size * 0.2, centerY - size * 0.1, size * 0.1, 0, Math.PI * 2)
        ctx.arc(centerX + size * 0.2, centerY + size * 0.1, size * 0.1, 0, Math.PI * 2)
        break
      
      case 'N': // Necklace
        // Chain links
        for (let i = 0; i < 5; i++) {
          const x = centerX - size * 0.4 + (i * size * 0.2)
          ctx.arc(x, centerY, size * 0.1, 0, Math.PI * 2)
        }
        break
      
      case 'O': // Octopus
        // Body
        ctx.arc(centerX, centerY, size * 0.4, 0, Math.PI * 2)
        // Tentacles
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2
          const startX = centerX + Math.cos(angle) * size * 0.4
          const startY = centerY + Math.sin(angle) * size * 0.4
          const endX = centerX + Math.cos(angle) * size * 0.7
          const endY = centerY + Math.sin(angle) * size * 0.7
          ctx.moveTo(startX, startY)
          ctx.lineTo(endX, endY)
        }
        break
      
      case 'P': // Pig
        // Body
        ctx.ellipse(centerX, centerY, size * 0.5, size * 0.4, 0, 0, Math.PI * 2)
        // Head
        ctx.arc(centerX - size * 0.3, centerY, size * 0.3, 0, Math.PI * 2)
        // Snout
        ctx.ellipse(centerX - size * 0.5, centerY, size * 0.15, size * 0.1, 0, 0, Math.PI * 2)
        // Tail
        ctx.moveTo(centerX + size * 0.5, centerY)
        ctx.quadraticCurveTo(centerX + size * 0.7, centerY - size * 0.2, centerX + size * 0.6, centerY - size * 0.1)
        break
      
      case 'Q': // Queen
        // Head
        ctx.arc(centerX, centerY - size * 0.2, size * 0.3, 0, Math.PI * 2)
        // Crown
        ctx.moveTo(centerX - size * 0.3, centerY - size * 0.5)
        ctx.lineTo(centerX - size * 0.1, centerY - size * 0.7)
        ctx.lineTo(centerX, centerY - size * 0.5)
        ctx.lineTo(centerX + size * 0.1, centerY - size * 0.7)
        ctx.lineTo(centerX + size * 0.3, centerY - size * 0.5)
        break
      
      case 'R': // Rabbit
        // Body
        ctx.ellipse(centerX, centerY, size * 0.4, size * 0.5, 0, 0, Math.PI * 2)
        // Head
        ctx.arc(centerX, centerY - size * 0.4, size * 0.3, 0, Math.PI * 2)
        // Ears
        ctx.moveTo(centerX - size * 0.2, centerY - size * 0.7)
        ctx.lineTo(centerX - size * 0.1, centerY - size * 1)
        ctx.lineTo(centerX, centerY - size * 0.7)
        ctx.moveTo(centerX + size * 0.2, centerY - size * 0.7)
        ctx.lineTo(centerX + size * 0.1, centerY - size * 1)
        ctx.lineTo(centerX, centerY - size * 0.7)
        break
      
      case 'S': // Snake
        // Snake body (curved)
        ctx.moveTo(centerX - size * 0.6, centerY - size * 0.3)
        ctx.quadraticCurveTo(centerX, centerY - size * 0.5, centerX + size * 0.3, centerY - size * 0.2)
        ctx.quadraticCurveTo(centerX + size * 0.5, centerY, centerX + size * 0.3, centerY + size * 0.2)
        ctx.quadraticCurveTo(centerX, centerY + size * 0.5, centerX - size * 0.3, centerY + size * 0.2)
        // Head
        ctx.arc(centerX - size * 0.6, centerY - size * 0.3, size * 0.15, 0, Math.PI * 2)
        break
      
      case 'T': // Telephone
        // Base
        ctx.rect(centerX - size * 0.3, centerY + size * 0.2, size * 0.6, size * 0.4)
        // Receiver
        ctx.arc(centerX - size * 0.4, centerY - size * 0.2, size * 0.2, 0, Math.PI * 2)
        ctx.arc(centerX + size * 0.4, centerY - size * 0.2, size * 0.2, 0, Math.PI * 2)
        // Cord
        ctx.moveTo(centerX - size * 0.4, centerY - size * 0.2)
        ctx.quadraticCurveTo(centerX, centerY, centerX + size * 0.4, centerY - size * 0.2)
        break
      
      case 'U': // Unicorn
        // Head
        ctx.arc(centerX, centerY, size * 0.4, 0, Math.PI * 2)
        // Horn
        ctx.moveTo(centerX, centerY - size * 0.4)
        ctx.lineTo(centerX, centerY - size * 0.7)
        ctx.lineTo(centerX + size * 0.1, centerY - size * 0.5)
        ctx.lineTo(centerX, centerY - size * 0.4)
        // Mane
        ctx.moveTo(centerX + size * 0.3, centerY - size * 0.2)
        ctx.quadraticCurveTo(centerX + size * 0.5, centerY - size * 0.4, centerX + size * 0.4, centerY - size * 0.2)
        break
      
      case 'V': // Violin
        // Body
        ctx.ellipse(centerX, centerY, size * 0.3, size * 0.6, 0, 0, Math.PI * 2)
        // Neck
        ctx.rect(centerX - size * 0.05, centerY - size * 0.6, size * 0.1, size * 0.4)
        // Scroll
        ctx.arc(centerX, centerY - size * 0.8, size * 0.1, 0, Math.PI * 2)
        break
      
      case 'W': // Whale
        // Whale body
        ctx.ellipse(centerX, centerY, size * 0.7, size * 0.4, 0, 0, Math.PI * 2)
        // Tail
        ctx.moveTo(centerX - size * 0.7, centerY)
        ctx.lineTo(centerX - size, centerY - size * 0.3)
        ctx.lineTo(centerX - size * 0.9, centerY)
        ctx.lineTo(centerX - size, centerY + size * 0.3)
        // Spout
        ctx.moveTo(centerX + size * 0.5, centerY - size * 0.4)
        ctx.quadraticCurveTo(centerX + size * 0.6, centerY - size * 0.6, centerX + size * 0.5, centerY - size * 0.5)
        break
      
      case 'X': // Xylophone
        // Bars
        for (let i = 0; i < 5; i++) {
          const width = size * (0.3 - i * 0.05)
          const x = centerX - width / 2
          const y = centerY - size * 0.3 + i * size * 0.15
          ctx.rect(x, y, width, size * 0.1)
        }
        break
      
      case 'Y': // Yoga
        // Person in tree pose
        // Head
        ctx.arc(centerX, centerY - size * 0.6, size * 0.15, 0, Math.PI * 2)
        // Body
        ctx.moveTo(centerX, centerY - size * 0.45)
        ctx.lineTo(centerX, centerY + size * 0.2)
        // Arms
        ctx.moveTo(centerX, centerY - size * 0.3)
        ctx.lineTo(centerX - size * 0.3, centerY)
        ctx.lineTo(centerX + size * 0.3, centerY)
        // Legs
        ctx.moveTo(centerX, centerY + size * 0.2)
        ctx.lineTo(centerX - size * 0.2, centerY + size * 0.5)
        ctx.lineTo(centerX + size * 0.2, centerY + size * 0.5)
        break
      
      case 'Z': // Zebra
        // Head
        ctx.ellipse(centerX, centerY - size * 0.2, size * 0.3, size * 0.25, 0, 0, Math.PI * 2)
        // Body
        ctx.ellipse(centerX, centerY + size * 0.2, size * 0.5, size * 0.3, 0, 0, Math.PI * 2)
        // Stripes
        for (let i = 0; i < 5; i++) {
          const x = centerX - size * 0.4 + i * size * 0.2
          ctx.moveTo(x, centerY + size * 0.05)
          ctx.lineTo(x, centerY + size * 0.35)
        }
        break
      
      default:
        // Generic circle
        ctx.arc(centerX, centerY, size, 0, Math.PI * 2)
    }
    
    ctx.stroke()
  }

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

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement, isWord = false) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { x, y } = getCoordinates(e)
    
    if (isErasing) {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.lineWidth = 20
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = selectedColor
      ctx.strokeStyle = selectedColor
      ctx.lineWidth = 15
    }

    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    
    if (isWord) {
      // Only color within the text outline
      ctx.globalCompositeOperation = 'source-atop'
      ctx.fillStyle = selectedColor
      ctx.fillRect(x - 10, y - 10, 20, 20)
    } else {
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x, y)
      ctx.stroke()
    }

    // Add sparkle effect
    if (!isErasing) {
      setSparklePositions(prev => [...prev, { x, y }])
      setShowSparkles(true)
      setTimeout(() => {
        setSparklePositions(prev => prev.slice(1))
        if (sparklePositions.length === 0) {
          setShowSparkles(false)
        }
      }, 500)
    }
  }, [selectedColor, isErasing, sparklePositions.length])

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>, isWord = false) => {
    setIsDrawing(true)
    const canvas = isWord ? wordCanvasRef.current : canvasRef.current
    if (canvas) {
      draw(e, canvas, isWord)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>, isWord = false) => {
    if (!isDrawing) return
    
    const canvas = isWord ? wordCanvasRef.current : canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const { x, y } = getCoordinates(e)
      
      if (isErasing) {
        ctx.globalCompositeOperation = 'destination-out'
        ctx.lineWidth = 20
      } else {
        ctx.globalCompositeOperation = isWord ? 'source-atop' : 'source-over'
        ctx.fillStyle = selectedColor
        ctx.strokeStyle = selectedColor
        ctx.lineWidth = 15
      }

      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      
      if (isWord) {
        ctx.fillRect(x - 10, y - 10, 20, 20)
      } else {
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x, y)
        ctx.stroke()
      }

      // Sparkle effect
      if (!isErasing && Math.random() > 0.7) {
        setSparklePositions(prev => [...prev.slice(-5), { x, y }])
      }
    }
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
  }

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>, isWord = false) => {
    e.preventDefault()
    handleMouseDown(e as any, isWord)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>, isWord = false) => {
    e.preventDefault()
    handleMouseMove(e as any, isWord)
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    handleMouseUp()
  }

  const handleClear = () => {
    const canvas = canvasRef.current
    const wordCanvas = wordCanvasRef.current
    
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        drawOutlineShape(ctx, canvas.width, canvas.height, letter)
      }
    }
    
    if (wordCanvas) {
      const ctx = wordCanvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, wordCanvas.width, wordCanvas.height)
        ctx.font = 'bold 48px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 3
        ctx.strokeText(word.toUpperCase(), wordCanvas.width / 2, wordCanvas.height / 2)
      }
    }
  }

  const handleSave = () => {
    const canvas = canvasRef.current
    const wordCanvas = wordCanvasRef.current
    
    if (canvas && wordCanvas) {
      const imageData = canvas.toDataURL('image/png')
      const wordData = wordCanvas.toDataURL('image/png')
      
      onSave({
        imageData,
        wordData,
        letter,
        word
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Letter and Word Header */}
      <div className="text-center">
        <motion.div
          className="text-8xl font-bold text-gray-700 mb-4 cursor-pointer"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={onLetterClick}
        >
          {letter}
        </motion.div>
        <motion.p
          className="text-3xl font-semibold text-gray-600 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          onClick={onLetterClick}
        >
          {word}
        </motion.p>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLetterClick}
          className="mt-2"
        >
          <Volume2 className="w-4 h-4 mr-2" />
          Listen: {letter} for {word}
        </Button>
      </div>

      {/* Picture Coloring Area */}
      <div className="relative">
        <h3 className="text-xl font-bold text-gray-700 mb-3 text-center">
          🎨 Color the Picture
        </h3>
        <div className="relative bg-white rounded-lg border-4 border-gray-300 p-4">
          <canvas
            ref={canvasRef}
            className="w-full h-96 touch-none cursor-crosshair"
            style={{ maxHeight: '500px' }}
            onMouseDown={(e) => handleMouseDown(e, false)}
            onMouseMove={(e) => handleMouseMove(e, false)}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={(e) => handleTouchStart(e, false)}
            onTouchMove={(e) => handleTouchMove(e, false)}
            onTouchEnd={handleTouchEnd}
          />
          
          {/* Sparkle animations */}
          <AnimatePresence>
            {showSparkles && sparklePositions.map((pos, idx) => (
              <motion.div
                key={idx}
                className="absolute pointer-events-none"
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  transform: 'translate(-50%, -50%)'
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1, rotate: 360 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Sparkles className="w-6 h-6 text-yellow-400" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Word Coloring Area */}
      <div className="relative">
        <h3 className="text-xl font-bold text-gray-700 mb-3 text-center">
          ✏️ Color the Word
        </h3>
        <div className="relative bg-white rounded-lg border-4 border-gray-300 p-4">
          <canvas
            ref={wordCanvasRef}
            className="w-full h-32 touch-none cursor-crosshair"
            onMouseDown={(e) => handleMouseDown(e, true)}
            onMouseMove={(e) => handleMouseMove(e, true)}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={(e) => handleTouchStart(e, true)}
            onTouchMove={(e) => handleTouchMove(e, true)}
            onTouchEnd={handleTouchEnd}
          />
        </div>
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
          Clear All
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

