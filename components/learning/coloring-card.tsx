'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Eraser, RotateCcw, Save, Volume2, PenTool, Paintbrush, Highlighter } from 'lucide-react'

interface ColoringCardProps {
  letter: string
  word: string
  colorPalette: string[]
  savedData?: any
  onSave: (data: any) => void
  onComplete: () => void
  onLetterClick: () => void
}

// Map letters to image filenames
const getImagePath = (letter: string, word: string): string => {
  const filename = `${letter.toLowerCase()}-${word.toLowerCase()}.jpg`
  return `/images/alphabet-coloring/${filename}`
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
  const [imageLoaded, setImageLoaded] = useState(false)
  const [useImage, setUseImage] = useState(false)
  const imageRef = useRef<HTMLImageElement | null>(null)
  
  // Pen/Brush options
  const [brushSize, setBrushSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [toolType, setToolType] = useState<'pen' | 'marker' | 'paintbrush'>('pen')
  const [showToolOptions, setShowToolOptions] = useState(false)

  // Check if image exists and load it
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
      return
    }

    // Try to load image from public folder
    const imagePath = getImagePath(letter, word)
    const img = new Image()
    
    img.onload = () => {
      // Image exists, use it
      setUseImage(true)
      setImageLoaded(true)
      imageRef.current = img
      
      // Draw the image on canvas
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Calculate dimensions to maintain aspect ratio
      const imgAspect = img.width / img.height
      const canvasAspect = canvas.width / canvas.height
      
      let drawWidth = canvas.width
      let drawHeight = canvas.height
      let drawX = 0
      let drawY = 0
      
      if (imgAspect > canvasAspect) {
        // Image is wider
        drawHeight = canvas.width / imgAspect
        drawY = (canvas.height - drawHeight) / 2
      } else {
        // Image is taller
        drawWidth = canvas.height * imgAspect
        drawX = (canvas.width - drawWidth) / 2
      }
      
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
    }
    
    img.onerror = () => {
      // Image doesn't exist, fall back to canvas drawing
      setUseImage(false)
      setImageLoaded(true)
      
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 4
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      drawOutlineShape(ctx, canvas.width, canvas.height, letter)
    }
    
    img.src = imagePath
  }, [letter, word, savedData])

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
    const size = Math.min(width, height) * 0.45
    
    ctx.beginPath()
    
    switch (letter.toUpperCase()) {
      case 'A': // Apple - simple apple with stem and leaf
        // Apple body (simple rounded shape)
        ctx.arc(centerX, centerY, size * 0.4, 0, Math.PI * 2)
        // Top indent
        ctx.moveTo(centerX - size * 0.1, centerY - size * 0.3)
        ctx.lineTo(centerX, centerY - size * 0.4)
        ctx.lineTo(centerX + size * 0.1, centerY - size * 0.3)
        // Stem
        ctx.moveTo(centerX, centerY - size * 0.4)
        ctx.lineTo(centerX, centerY - size * 0.5)
        // Leaf
        ctx.moveTo(centerX, centerY - size * 0.5)
        ctx.quadraticCurveTo(centerX + size * 0.15, centerY - size * 0.55, centerX + size * 0.1, centerY - size * 0.45)
        ctx.quadraticCurveTo(centerX + size * 0.05, centerY - size * 0.5, centerX, centerY - size * 0.5)
        break
      
      case 'B': // Bear - simple bear outline
        // Head (circle)
        ctx.arc(centerX, centerY - size * 0.1, size * 0.3, 0, Math.PI * 2)
        // Body (oval)
        ctx.ellipse(centerX, centerY + size * 0.2, size * 0.35, size * 0.3, 0, 0, Math.PI * 2)
        // Ears (circles)
        ctx.arc(centerX - size * 0.2, centerY - size * 0.3, size * 0.12, 0, Math.PI * 2)
        ctx.arc(centerX + size * 0.2, centerY - size * 0.3, size * 0.12, 0, Math.PI * 2)
        // Arms
        ctx.ellipse(centerX - size * 0.35, centerY + size * 0.15, size * 0.1, size * 0.2, -0.3, 0, Math.PI * 2)
        ctx.ellipse(centerX + size * 0.35, centerY + size * 0.15, size * 0.1, size * 0.2, 0.3, 0, Math.PI * 2)
        // Legs
        ctx.ellipse(centerX - size * 0.2, centerY + size * 0.45, size * 0.12, size * 0.15, 0, 0, Math.PI * 2)
        ctx.ellipse(centerX + size * 0.2, centerY + size * 0.45, size * 0.12, size * 0.15, 0, 0, Math.PI * 2)
        break
      
      case 'C': // Cat - simple cat face
        // Head (circle)
        ctx.arc(centerX, centerY, size * 0.45, 0, Math.PI * 2)
        // Left ear (triangle)
        ctx.moveTo(centerX - size * 0.25, centerY - size * 0.25)
        ctx.lineTo(centerX - size * 0.1, centerY - size * 0.55)
        ctx.lineTo(centerX, centerY - size * 0.3)
        ctx.closePath()
        // Right ear (triangle)
        ctx.moveTo(centerX + size * 0.25, centerY - size * 0.25)
        ctx.lineTo(centerX + size * 0.1, centerY - size * 0.55)
        ctx.lineTo(centerX, centerY - size * 0.3)
        ctx.closePath()
        break
      
      case 'D': // Dog - simple dog outline
        // Head (circle)
        ctx.arc(centerX, centerY - size * 0.15, size * 0.28, 0, Math.PI * 2)
        // Body (oval)
        ctx.ellipse(centerX, centerY + size * 0.2, size * 0.35, size * 0.3, 0, 0, Math.PI * 2)
        // Ears (droopy)
        ctx.moveTo(centerX - size * 0.2, centerY - size * 0.3)
        ctx.quadraticCurveTo(centerX - size * 0.3, centerY - size * 0.4, centerX - size * 0.25, centerY - size * 0.25)
        ctx.moveTo(centerX + size * 0.2, centerY - size * 0.3)
        ctx.quadraticCurveTo(centerX + size * 0.3, centerY - size * 0.4, centerX + size * 0.25, centerY - size * 0.25)
        // Snout
        ctx.ellipse(centerX, centerY - size * 0.05, size * 0.12, size * 0.08, 0, 0, Math.PI * 2)
        // Tail (curved)
        ctx.moveTo(centerX + size * 0.35, centerY + size * 0.2)
        ctx.quadraticCurveTo(centerX + size * 0.5, centerY + size * 0.1, centerX + size * 0.45, centerY + size * 0.3)
        // Legs
        ctx.rect(centerX - size * 0.2, centerY + size * 0.45, size * 0.1, size * 0.15)
        ctx.rect(centerX + size * 0.1, centerY + size * 0.45, size * 0.1, size * 0.15)
        break
      
      case 'E': // Elephant - simple elephant outline
        // Body (large oval)
        ctx.ellipse(centerX, centerY + size * 0.1, size * 0.4, size * 0.35, 0, 0, Math.PI * 2)
        // Head (circle)
        ctx.arc(centerX - size * 0.15, centerY - size * 0.1, size * 0.25, 0, Math.PI * 2)
        // Trunk (curved)
        ctx.moveTo(centerX - size * 0.4, centerY - size * 0.1)
        ctx.quadraticCurveTo(centerX - size * 0.5, centerY - size * 0.2, centerX - size * 0.55, centerY - size * 0.15)
        ctx.quadraticCurveTo(centerX - size * 0.6, centerY - size * 0.1, centerX - size * 0.55, centerY - size * 0.05)
        // Ears
        ctx.ellipse(centerX - size * 0.25, centerY - size * 0.2, size * 0.15, size * 0.2, -0.3, 0, Math.PI * 2)
        // Legs
        ctx.rect(centerX - size * 0.25, centerY + size * 0.4, size * 0.12, size * 0.2)
        ctx.rect(centerX + size * 0.1, centerY + size * 0.4, size * 0.12, size * 0.2)
        // Tail
        ctx.moveTo(centerX + size * 0.4, centerY + size * 0.1)
        ctx.quadraticCurveTo(centerX + size * 0.5, centerY + size * 0.15, centerX + size * 0.48, centerY + size * 0.25)
        break
      
      case 'F': // Fish - simple fish outline
        // Body (oval)
        ctx.ellipse(centerX, centerY, size * 0.4, size * 0.25, 0, 0, Math.PI * 2)
        // Tail fin
        ctx.moveTo(centerX - size * 0.4, centerY)
        ctx.lineTo(centerX - size * 0.6, centerY - size * 0.2)
        ctx.lineTo(centerX - size * 0.55, centerY)
        ctx.lineTo(centerX - size * 0.6, centerY + size * 0.2)
        ctx.closePath()
        // Top fin
        ctx.moveTo(centerX, centerY - size * 0.25)
        ctx.quadraticCurveTo(centerX + size * 0.18, centerY - size * 0.4, centerX + size * 0.12, centerY - size * 0.25)
        ctx.closePath()
        // Bottom fin
        ctx.moveTo(centerX, centerY + size * 0.25)
        ctx.quadraticCurveTo(centerX + size * 0.12, centerY + size * 0.35, centerX + size * 0.08, centerY + size * 0.25)
        ctx.closePath()
        break
      
      case 'G': // Goat - simple goat outline
        // Body (oval)
        ctx.ellipse(centerX, centerY + size * 0.15, size * 0.35, size * 0.3, 0, 0, Math.PI * 2)
        // Head (circle)
        ctx.arc(centerX, centerY - size * 0.15, size * 0.25, 0, Math.PI * 2)
        // Horns (curved)
        ctx.moveTo(centerX - size * 0.15, centerY - size * 0.3)
        ctx.quadraticCurveTo(centerX - size * 0.2, centerY - size * 0.45, centerX - size * 0.1, centerY - size * 0.4)
        ctx.moveTo(centerX + size * 0.15, centerY - size * 0.3)
        ctx.quadraticCurveTo(centerX + size * 0.2, centerY - size * 0.45, centerX + size * 0.1, centerY - size * 0.4)
        // Beard
        ctx.moveTo(centerX, centerY - size * 0.05)
        ctx.quadraticCurveTo(centerX, centerY + size * 0.1, centerX - size * 0.1, centerY + size * 0.15)
        ctx.quadraticCurveTo(centerX, centerY + size * 0.2, centerX + size * 0.1, centerY + size * 0.15)
        ctx.quadraticCurveTo(centerX, centerY + size * 0.1, centerX, centerY - size * 0.05)
        // Legs
        ctx.rect(centerX - size * 0.2, centerY + size * 0.4, size * 0.1, size * 0.15)
        ctx.rect(centerX + size * 0.1, centerY + size * 0.4, size * 0.1, size * 0.15)
        break
      
      case 'H': // Horse - simple horse outline
        // Head (oval)
        ctx.ellipse(centerX - size * 0.15, centerY - size * 0.1, size * 0.2, size * 0.18, -0.2, 0, Math.PI * 2)
        // Body (oval)
        ctx.ellipse(centerX + size * 0.1, centerY + size * 0.1, size * 0.35, size * 0.3, 0, 0, Math.PI * 2)
        // Neck
        ctx.moveTo(centerX - size * 0.15, centerY - size * 0.1)
        ctx.quadraticCurveTo(centerX, centerY, centerX + size * 0.1, centerY + size * 0.1)
        // Mane
        ctx.moveTo(centerX - size * 0.05, centerY - size * 0.05)
        ctx.quadraticCurveTo(centerX, centerY - size * 0.2, centerX + size * 0.05, centerY - size * 0.1)
        ctx.quadraticCurveTo(centerX + size * 0.1, centerY - size * 0.25, centerX + size * 0.15, centerY - size * 0.15)
        // Ears
        ctx.moveTo(centerX - size * 0.25, centerY - size * 0.2)
        ctx.lineTo(centerX - size * 0.3, centerY - size * 0.3)
        ctx.lineTo(centerX - size * 0.2, centerY - size * 0.25)
        // Legs
        ctx.rect(centerX - size * 0.05, centerY + size * 0.35, size * 0.08, size * 0.2)
        ctx.rect(centerX + size * 0.2, centerY + size * 0.35, size * 0.08, size * 0.2)
        // Tail
        ctx.moveTo(centerX + size * 0.45, centerY + size * 0.1)
        ctx.quadraticCurveTo(centerX + size * 0.55, centerY + size * 0.05, centerX + size * 0.5, centerY + size * 0.2)
        break
      
      case 'I': // Iguana - simple iguana outline
        // Body (long oval)
        ctx.ellipse(centerX, centerY, size * 0.4, size * 0.2, 0, 0, Math.PI * 2)
        // Head (oval)
        ctx.ellipse(centerX - size * 0.35, centerY, size * 0.18, size * 0.15, 0, 0, Math.PI * 2)
        // Tail (long)
        ctx.moveTo(centerX + size * 0.4, centerY)
        ctx.quadraticCurveTo(centerX + size * 0.5, centerY - size * 0.1, centerX + size * 0.6, centerY)
        ctx.quadraticCurveTo(centerX + size * 0.7, centerY + size * 0.1, centerX + size * 0.65, centerY + size * 0.15)
        // Legs
        ctx.rect(centerX - size * 0.1, centerY + size * 0.15, size * 0.08, size * 0.12)
        ctx.rect(centerX + size * 0.15, centerY + size * 0.15, size * 0.08, size * 0.12)
        // Crest (spikes on back)
        for (let i = 0; i < 5; i++) {
          const x = centerX - size * 0.2 + i * size * 0.15
          ctx.moveTo(x, centerY - size * 0.2)
          ctx.lineTo(x, centerY - size * 0.3)
        }
        break
      
      case 'J': // Jaguar - simple jaguar outline
        // Body (oval)
        ctx.ellipse(centerX, centerY + size * 0.1, size * 0.4, size * 0.3, 0, 0, Math.PI * 2)
        // Head (circle)
        ctx.arc(centerX - size * 0.2, centerY - size * 0.1, size * 0.25, 0, Math.PI * 2)
        // Ears
        ctx.moveTo(centerX - size * 0.3, centerY - size * 0.25)
        ctx.lineTo(centerX - size * 0.35, centerY - size * 0.4)
        ctx.lineTo(centerX - size * 0.25, centerY - size * 0.3)
        ctx.moveTo(centerX - size * 0.1, centerY - size * 0.25)
        ctx.lineTo(centerX - size * 0.15, centerY - size * 0.4)
        ctx.lineTo(centerX - size * 0.05, centerY - size * 0.3)
        // Tail (long and curved)
        ctx.moveTo(centerX + size * 0.4, centerY + size * 0.1)
        ctx.quadraticCurveTo(centerX + size * 0.55, centerY, centerX + size * 0.6, centerY + size * 0.2)
        ctx.quadraticCurveTo(centerX + size * 0.65, centerY + size * 0.35, centerX + size * 0.55, centerY + size * 0.3)
        // Legs
        ctx.rect(centerX - size * 0.15, centerY + size * 0.35, size * 0.1, size * 0.15)
        ctx.rect(centerX + size * 0.2, centerY + size * 0.35, size * 0.1, size * 0.15)
        // Spots (circles)
        ctx.arc(centerX + size * 0.1, centerY + size * 0.15, size * 0.05, 0, Math.PI * 2)
        ctx.arc(centerX + size * 0.25, centerY + size * 0.05, size * 0.05, 0, Math.PI * 2)
        break
      
      case 'K': // Kangaroo - simple kangaroo outline
        // Body (oval)
        ctx.ellipse(centerX, centerY + size * 0.1, size * 0.3, size * 0.35, 0, 0, Math.PI * 2)
        // Head (circle)
        ctx.arc(centerX - size * 0.15, centerY - size * 0.2, size * 0.2, 0, Math.PI * 2)
        // Ears (long ovals)
        ctx.ellipse(centerX - size * 0.25, centerY - size * 0.3, size * 0.08, size * 0.15, -0.3, 0, Math.PI * 2)
        ctx.ellipse(centerX - size * 0.05, centerY - size * 0.3, size * 0.08, size * 0.15, 0.3, 0, Math.PI * 2)
        // Tail (long and thick)
        ctx.moveTo(centerX + size * 0.3, centerY + size * 0.1)
        ctx.quadraticCurveTo(centerX + size * 0.5, centerY + size * 0.05, centerX + size * 0.6, centerY + size * 0.15)
        ctx.quadraticCurveTo(centerX + size * 0.65, centerY + size * 0.3, centerX + size * 0.55, centerY + size * 0.4)
        ctx.quadraticCurveTo(centerX + size * 0.45, centerY + size * 0.35, centerX + size * 0.3, centerY + size * 0.1)
        ctx.closePath()
        // Legs (large)
        ctx.ellipse(centerX - size * 0.1, centerY + size * 0.4, size * 0.12, size * 0.2, 0.2, 0, Math.PI * 2)
        ctx.ellipse(centerX + size * 0.15, centerY + size * 0.4, size * 0.12, size * 0.2, -0.2, 0, Math.PI * 2)
        // Arms
        ctx.ellipse(centerX - size * 0.25, centerY, size * 0.08, size * 0.15, -0.5, 0, Math.PI * 2)
        break
      
      case 'L': // Lion - lion head with mane
        // Head (circle)
        ctx.arc(centerX, centerY, size * 0.35, 0, Math.PI * 2)
        // Mane (spiky circle)
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2
          const innerX = centerX + Math.cos(angle) * size * 0.35
          const innerY = centerY + Math.sin(angle) * size * 0.35
          const outerX = centerX + Math.cos(angle) * size * 0.55
          const outerY = centerY + Math.sin(angle) * size * 0.55
          ctx.moveTo(innerX, innerY)
          ctx.lineTo(outerX, outerY)
        }
        break
      
      case 'M': // Monkey - simple monkey outline
        // Head (circle)
        ctx.arc(centerX, centerY - size * 0.1, size * 0.3, 0, Math.PI * 2)
        // Body (oval)
        ctx.ellipse(centerX, centerY + size * 0.2, size * 0.3, size * 0.35, 0, 0, Math.PI * 2)
        // Ears (circles)
        ctx.arc(centerX - size * 0.25, centerY - size * 0.2, size * 0.12, 0, Math.PI * 2)
        ctx.arc(centerX + size * 0.25, centerY - size * 0.2, size * 0.12, 0, Math.PI * 2)
        // Arms
        ctx.ellipse(centerX - size * 0.35, centerY + size * 0.15, size * 0.1, size * 0.25, -0.3, 0, Math.PI * 2)
        ctx.ellipse(centerX + size * 0.35, centerY + size * 0.15, size * 0.1, size * 0.25, 0.3, 0, Math.PI * 2)
        // Legs
        ctx.ellipse(centerX - size * 0.15, centerY + size * 0.5, size * 0.12, size * 0.15, 0, 0, Math.PI * 2)
        ctx.ellipse(centerX + size * 0.15, centerY + size * 0.5, size * 0.12, size * 0.15, 0, 0, Math.PI * 2)
        // Tail (curved)
        ctx.moveTo(centerX, centerY + size * 0.5)
        ctx.quadraticCurveTo(centerX + size * 0.2, centerY + size * 0.55, centerX + size * 0.3, centerY + size * 0.5)
        ctx.quadraticCurveTo(centerX + size * 0.4, centerY + size * 0.45, centerX + size * 0.35, centerY + size * 0.4)
        break
      
      case 'N': // Notebook - simple notebook outline
        // Cover (rectangle)
        ctx.rect(centerX - size * 0.35, centerY - size * 0.25, size * 0.7, size * 0.5)
        // Binding (left edge)
        ctx.moveTo(centerX - size * 0.35, centerY - size * 0.25)
        ctx.lineTo(centerX - size * 0.35, centerY + size * 0.25)
        // Spiral binding (circles)
        for (let i = 0; i < 5; i++) {
          const y = centerY - size * 0.15 + i * size * 0.075
          ctx.arc(centerX - size * 0.35, y, size * 0.03, 0, Math.PI * 2)
        }
        // Lines (ruled paper)
        for (let i = 0; i < 4; i++) {
          const y = centerY - size * 0.1 + i * size * 0.1
          ctx.moveTo(centerX - size * 0.25, y)
          ctx.lineTo(centerX + size * 0.25, y)
        }
        break
      
      case 'O': // Owl - simple owl outline
        // Body (oval)
        ctx.ellipse(centerX, centerY + size * 0.1, size * 0.35, size * 0.4, 0, 0, Math.PI * 2)
        // Head (circle)
        ctx.arc(centerX, centerY - size * 0.15, size * 0.3, 0, Math.PI * 2)
        // Ears (triangles)
        ctx.moveTo(centerX - size * 0.2, centerY - size * 0.35)
        ctx.lineTo(centerX - size * 0.1, centerY - size * 0.5)
        ctx.lineTo(centerX, centerY - size * 0.4)
        ctx.moveTo(centerX + size * 0.2, centerY - size * 0.35)
        ctx.lineTo(centerX + size * 0.1, centerY - size * 0.5)
        ctx.lineTo(centerX, centerY - size * 0.4)
        // Wings
        ctx.ellipse(centerX - size * 0.25, centerY + size * 0.05, size * 0.15, size * 0.25, -0.2, 0, Math.PI * 2)
        ctx.ellipse(centerX + size * 0.25, centerY + size * 0.05, size * 0.15, size * 0.25, 0.2, 0, Math.PI * 2)
        // Beak (triangle)
        ctx.moveTo(centerX, centerY - size * 0.05)
        ctx.lineTo(centerX - size * 0.08, centerY + size * 0.05)
        ctx.lineTo(centerX + size * 0.08, centerY + size * 0.05)
        ctx.closePath()
        // Feet
        ctx.moveTo(centerX - size * 0.15, centerY + size * 0.45)
        ctx.lineTo(centerX - size * 0.2, centerY + size * 0.55)
        ctx.lineTo(centerX - size * 0.1, centerY + size * 0.55)
        ctx.moveTo(centerX + size * 0.15, centerY + size * 0.45)
        ctx.lineTo(centerX + size * 0.2, centerY + size * 0.55)
        ctx.lineTo(centerX + size * 0.1, centerY + size * 0.55)
        break
      
      case 'P': // Penguin - simple penguin outline
        // Body (oval)
        ctx.ellipse(centerX, centerY + size * 0.1, size * 0.3, size * 0.4, 0, 0, Math.PI * 2)
        // Head (circle)
        ctx.arc(centerX, centerY - size * 0.2, size * 0.25, 0, Math.PI * 2)
        // Belly (white area - just outline)
        ctx.ellipse(centerX, centerY + size * 0.15, size * 0.2, size * 0.3, 0, 0, Math.PI * 2)
        // Beak (triangle)
        ctx.moveTo(centerX, centerY - size * 0.2)
        ctx.lineTo(centerX - size * 0.1, centerY - size * 0.1)
        ctx.lineTo(centerX + size * 0.1, centerY - size * 0.1)
        ctx.closePath()
        // Wings
        ctx.ellipse(centerX - size * 0.25, centerY + size * 0.05, size * 0.12, size * 0.2, -0.3, 0, Math.PI * 2)
        ctx.ellipse(centerX + size * 0.25, centerY + size * 0.05, size * 0.12, size * 0.2, 0.3, 0, Math.PI * 2)
        // Feet
        ctx.moveTo(centerX - size * 0.15, centerY + size * 0.45)
        ctx.lineTo(centerX - size * 0.25, centerY + size * 0.55)
        ctx.lineTo(centerX - size * 0.05, centerY + size * 0.55)
        ctx.moveTo(centerX + size * 0.15, centerY + size * 0.45)
        ctx.lineTo(centerX + size * 0.25, centerY + size * 0.55)
        ctx.lineTo(centerX + size * 0.05, centerY + size * 0.55)
        break
      
      case 'Q': // Queen - queen with crown
        // Head (circle)
        ctx.arc(centerX, centerY - size * 0.1, size * 0.25, 0, Math.PI * 2)
        // Crown
        ctx.moveTo(centerX - size * 0.25, centerY - size * 0.35)
        ctx.lineTo(centerX - size * 0.1, centerY - size * 0.55)
        ctx.lineTo(centerX, centerY - size * 0.4)
        ctx.lineTo(centerX + size * 0.1, centerY - size * 0.55)
        ctx.lineTo(centerX + size * 0.25, centerY - size * 0.35)
        // Body (dress shape)
        ctx.moveTo(centerX - size * 0.2, centerY - size * 0.1)
        ctx.lineTo(centerX - size * 0.3, centerY + size * 0.3)
        ctx.lineTo(centerX + size * 0.3, centerY + size * 0.3)
        ctx.lineTo(centerX + size * 0.2, centerY - size * 0.1)
        break
      
      case 'R': // Rabbit - side view rabbit
        // Body (oval)
        ctx.ellipse(centerX, centerY, size * 0.3, size * 0.4, 0, 0, Math.PI * 2)
        // Head (circle)
        ctx.arc(centerX, centerY - size * 0.3, size * 0.25, 0, Math.PI * 2)
        // Ears (long ovals)
        ctx.ellipse(centerX - size * 0.15, centerY - size * 0.55, size * 0.08, size * 0.3, -0.3, 0, Math.PI * 2)
        ctx.ellipse(centerX + size * 0.15, centerY - size * 0.55, size * 0.08, size * 0.3, 0.3, 0, Math.PI * 2)
        // Tail (fluffy circle)
        ctx.arc(centerX + size * 0.3, centerY + size * 0.25, size * 0.1, 0, Math.PI * 2)
        break
      
      case 'S': // Sun - simple sun outline
        // Center circle
        ctx.arc(centerX, centerY, size * 0.25, 0, Math.PI * 2)
        // Rays (triangular rays)
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2
          const startX = centerX + Math.cos(angle) * size * 0.25
          const startY = centerY + Math.sin(angle) * size * 0.25
          const midX = centerX + Math.cos(angle) * size * 0.4
          const midY = centerY + Math.sin(angle) * size * 0.4
          const endX1 = centerX + Math.cos(angle - 0.2) * size * 0.5
          const endY1 = centerY + Math.sin(angle - 0.2) * size * 0.5
          const endX2 = centerX + Math.cos(angle + 0.2) * size * 0.5
          const endY2 = centerY + Math.sin(angle + 0.2) * size * 0.5
          ctx.moveTo(startX, startY)
          ctx.lineTo(midX, midY)
          ctx.lineTo(endX1, endY1)
          ctx.moveTo(midX, midY)
          ctx.lineTo(endX2, endY2)
        }
        break
      
      case 'T': // Turtle - simple turtle outline
        // Shell (oval)
        ctx.ellipse(centerX, centerY, size * 0.4, size * 0.3, 0, 0, Math.PI * 2)
        // Shell pattern (hexagon-like)
        ctx.moveTo(centerX, centerY - size * 0.3)
        ctx.lineTo(centerX - size * 0.2, centerY - size * 0.15)
        ctx.lineTo(centerX - size * 0.2, centerY + size * 0.15)
        ctx.lineTo(centerX, centerY + size * 0.3)
        ctx.lineTo(centerX + size * 0.2, centerY + size * 0.15)
        ctx.lineTo(centerX + size * 0.2, centerY - size * 0.15)
        ctx.closePath()
        // Head (oval)
        ctx.ellipse(centerX, centerY - size * 0.35, size * 0.15, size * 0.12, 0, 0, Math.PI * 2)
        // Legs
        ctx.ellipse(centerX - size * 0.3, centerY - size * 0.1, size * 0.1, size * 0.15, -0.3, 0, Math.PI * 2)
        ctx.ellipse(centerX + size * 0.3, centerY - size * 0.1, size * 0.1, size * 0.15, 0.3, 0, Math.PI * 2)
        ctx.ellipse(centerX - size * 0.3, centerY + size * 0.1, size * 0.1, size * 0.15, 0.3, 0, Math.PI * 2)
        ctx.ellipse(centerX + size * 0.3, centerY + size * 0.1, size * 0.1, size * 0.15, -0.3, 0, Math.PI * 2)
        // Tail
        ctx.moveTo(centerX, centerY + size * 0.3)
        ctx.quadraticCurveTo(centerX, centerY + size * 0.4, centerX - size * 0.05, centerY + size * 0.45)
        break
      
      case 'U': // Umbrella - simple umbrella outline
        // Canopy (semicircle)
        ctx.arc(centerX, centerY - size * 0.1, size * 0.4, Math.PI, 0, false)
        // Ribs (lines from center to edge)
        for (let i = 0; i < 8; i++) {
          const angle = Math.PI + (i / 7) * Math.PI
          const x = centerX + Math.cos(angle) * size * 0.4
          const y = centerY - size * 0.1 + Math.sin(angle) * size * 0.4
          ctx.moveTo(centerX, centerY - size * 0.1)
          ctx.lineTo(x, y)
        }
        // Handle (curved)
        ctx.moveTo(centerX, centerY - size * 0.1)
        ctx.quadraticCurveTo(centerX, centerY + size * 0.1, centerX - size * 0.1, centerY + size * 0.25)
        ctx.quadraticCurveTo(centerX - size * 0.15, centerY + size * 0.35, centerX - size * 0.1, centerY + size * 0.4)
        break
      
      case 'V': // Vase - simple vase outline
        // Body (oval)
        ctx.ellipse(centerX, centerY + size * 0.1, size * 0.3, size * 0.4, 0, 0, Math.PI * 2)
        // Neck (narrower)
        ctx.ellipse(centerX, centerY - size * 0.2, size * 0.15, size * 0.2, 0, 0, Math.PI * 2)
        // Rim (top)
        ctx.moveTo(centerX - size * 0.15, centerY - size * 0.4)
        ctx.lineTo(centerX + size * 0.15, centerY - size * 0.4)
        // Base (wider)
        ctx.moveTo(centerX - size * 0.3, centerY + size * 0.5)
        ctx.lineTo(centerX + size * 0.3, centerY + size * 0.5)
        // Decorative lines (optional)
        ctx.moveTo(centerX - size * 0.25, centerY + size * 0.2)
        ctx.lineTo(centerX + size * 0.25, centerY + size * 0.2)
        break
      
      case 'W': // Whale - simple whale outline
        // Body (large oval)
        ctx.ellipse(centerX, centerY, size * 0.55, size * 0.3, 0, 0, Math.PI * 2)
        // Tail fin
        ctx.moveTo(centerX - size * 0.55, centerY)
        ctx.lineTo(centerX - size * 0.8, centerY - size * 0.22)
        ctx.lineTo(centerX - size * 0.7, centerY)
        ctx.lineTo(centerX - size * 0.8, centerY + size * 0.22)
        ctx.closePath()
        // Dorsal fin
        ctx.moveTo(centerX + size * 0.25, centerY - size * 0.3)
        ctx.quadraticCurveTo(centerX + size * 0.35, centerY - size * 0.45, centerX + size * 0.3, centerY - size * 0.35)
        ctx.closePath()
        // Spout (simple curve)
        ctx.moveTo(centerX + size * 0.45, centerY - size * 0.3)
        ctx.quadraticCurveTo(centerX + size * 0.5, centerY - size * 0.45, centerX + size * 0.48, centerY - size * 0.4)
        break
      
      case 'X': // Xylophone - musical bars
        // Base
        ctx.rect(centerX - size * 0.4, centerY + size * 0.25, size * 0.8, size * 0.1)
        // Bars (decreasing width)
        for (let i = 0; i < 5; i++) {
          const width = size * (0.28 - i * 0.05)
          const x = centerX - width / 2
          const y = centerY - size * 0.2 + i * size * 0.12
          ctx.rect(x, y, width, size * 0.08)
        }
        break
      
      case 'Y': // Yak - simple yak outline
        // Body (oval)
        ctx.ellipse(centerX, centerY + size * 0.15, size * 0.4, size * 0.35, 0, 0, Math.PI * 2)
        // Head (circle)
        ctx.arc(centerX, centerY - size * 0.15, size * 0.25, 0, Math.PI * 2)
        // Horns (curved upward)
        ctx.moveTo(centerX - size * 0.15, centerY - size * 0.3)
        ctx.quadraticCurveTo(centerX - size * 0.2, centerY - size * 0.5, centerX - size * 0.1, centerY - size * 0.55)
        ctx.moveTo(centerX + size * 0.15, centerY - size * 0.3)
        ctx.quadraticCurveTo(centerX + size * 0.2, centerY - size * 0.5, centerX + size * 0.1, centerY - size * 0.55)
        // Long hair/fur (on body)
        for (let i = 0; i < 6; i++) {
          const x = centerX - size * 0.3 + i * size * 0.12
          const y1 = centerY + size * 0.05
          const y2 = centerY + size * 0.35
          ctx.moveTo(x, y1)
          ctx.quadraticCurveTo(x + size * 0.05, (y1 + y2) / 2, x, y2)
        }
        // Legs
        ctx.rect(centerX - size * 0.25, centerY + size * 0.45, size * 0.12, size * 0.2)
        ctx.rect(centerX + size * 0.1, centerY + size * 0.45, size * 0.12, size * 0.2)
        break
      
      case 'Z': // Zebra - simple zebra outline
        // Head (oval)
        ctx.ellipse(centerX, centerY - size * 0.08, size * 0.22, size * 0.18, 0, 0, Math.PI * 2)
        // Body (oval)
        ctx.ellipse(centerX, centerY + size * 0.18, size * 0.4, size * 0.22, 0, 0, Math.PI * 2)
        // Stripes (diagonal lines)
        for (let i = 0; i < 5; i++) {
          const x = centerX - size * 0.32 + i * size * 0.16
          const y1 = centerY + size * 0.05
          const y2 = centerY + size * 0.32
          ctx.moveTo(x, y1)
          ctx.lineTo(x + size * 0.07, y2)
        }
        // Mane
        ctx.moveTo(centerX - size * 0.18, centerY - size * 0.08)
        ctx.quadraticCurveTo(centerX - size * 0.22, centerY - size * 0.22, centerX - size * 0.12, centerY - size * 0.12)
        // Ear
        ctx.moveTo(centerX + size * 0.12, centerY - size * 0.18)
        ctx.lineTo(centerX + size * 0.18, centerY - size * 0.28)
        ctx.lineTo(centerX + size * 0.15, centerY - size * 0.22)
        ctx.closePath()
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

    // Improved touch handling for mobile
    if ('touches' in e && e.touches.length > 0) {
      const touch = e.touches[0]
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      }
    } else if ('changedTouches' in e && e.changedTouches.length > 0) {
      // Handle touch end events
      const touch = e.changedTouches[0]
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      }
    } else {
      // TypeScript now knows this is a MouseEvent
      const mouseEvent = e as React.MouseEvent<HTMLCanvasElement>
      return {
        x: (mouseEvent.clientX - rect.left) * scaleX,
        y: (mouseEvent.clientY - rect.top) * scaleY
      }
    }
  }

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement, isWord = false) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { x, y } = getCoordinates(e)
    
    // Get brush size based on selection and device
    const isMobile = window.innerWidth < 768
    const sizeMap = {
      small: isMobile ? 8 : 5,
      medium: isMobile ? 20 : 12,
      large: isMobile ? 35 : 25
    }
    const eraserSizeMap = {
      small: isMobile ? 15 : 10,
      medium: isMobile ? 25 : 18,
      large: isMobile ? 40 : 30
    }
    
    const currentBrushSize = sizeMap[brushSize]
    const currentEraserSize = eraserSizeMap[brushSize]
    
    // Save original alpha
    const originalAlpha = ctx.globalAlpha
    
    if (isErasing) {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.lineWidth = currentEraserSize
    } else {
      // Adjust tool type behavior
      if (toolType === 'pen') {
        ctx.globalCompositeOperation = isWord ? 'source-atop' : 'source-over'
        ctx.lineWidth = currentBrushSize
        ctx.globalAlpha = 1.0
      } else if (toolType === 'marker') {
        ctx.globalCompositeOperation = isWord ? 'source-atop' : 'source-over'
        ctx.lineWidth = currentBrushSize * 1.5
        ctx.globalAlpha = 0.7 // Slightly transparent for marker effect
      } else if (toolType === 'paintbrush') {
        ctx.globalCompositeOperation = isWord ? 'source-atop' : 'source-over'
        ctx.lineWidth = currentBrushSize * 1.2
        ctx.globalAlpha = 0.9
      }
      
      ctx.fillStyle = selectedColor
      ctx.strokeStyle = selectedColor
    }

    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    
    if (isWord) {
      // Only color within the text outline
      ctx.globalCompositeOperation = 'source-atop'
      ctx.fillStyle = selectedColor
      const size = currentBrushSize / 2
      ctx.fillRect(x - size, y - size, size * 2, size * 2)
    } else {
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x, y)
      ctx.stroke()
    }
    
    // Reset alpha
    ctx.globalAlpha = originalAlpha
  }, [selectedColor, isErasing, brushSize, toolType])

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
      
      // Get brush size based on selection and device
      const isMobile = window.innerWidth < 768
      const sizeMap = {
        small: isMobile ? 8 : 5,
        medium: isMobile ? 20 : 12,
        large: isMobile ? 35 : 25
      }
      const eraserSizeMap = {
        small: isMobile ? 15 : 10,
        medium: isMobile ? 25 : 18,
        large: isMobile ? 40 : 30
      }
      
      const currentBrushSize = sizeMap[brushSize]
      const currentEraserSize = eraserSizeMap[brushSize]
      
      if (isErasing) {
        ctx.globalCompositeOperation = 'destination-out'
        ctx.lineWidth = currentEraserSize
      } else {
        // Adjust tool type behavior
        if (toolType === 'pen') {
          ctx.globalCompositeOperation = isWord ? 'source-atop' : 'source-over'
          ctx.lineWidth = currentBrushSize
        } else if (toolType === 'marker') {
          ctx.globalCompositeOperation = isWord ? 'source-atop' : 'source-over'
          ctx.lineWidth = currentBrushSize * 1.5
          ctx.globalAlpha = 0.7 // Slightly transparent for marker effect
        } else if (toolType === 'paintbrush') {
          ctx.globalCompositeOperation = isWord ? 'source-atop' : 'source-over'
          ctx.lineWidth = currentBrushSize * 1.2
          ctx.globalAlpha = 0.9
        }
        
        ctx.fillStyle = selectedColor
        ctx.strokeStyle = selectedColor
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
        
        // Redraw the base image (either from file or canvas)
        if (useImage && imageRef.current) {
          const img = imageRef.current
          const imgAspect = img.width / img.height
          const canvasAspect = canvas.width / canvas.height
          
          let drawWidth = canvas.width
          let drawHeight = canvas.height
          let drawX = 0
          let drawY = 0
          
          if (imgAspect > canvasAspect) {
            drawHeight = canvas.width / imgAspect
            drawY = (canvas.height - drawHeight) / 2
          } else {
            drawWidth = canvas.height * imgAspect
            drawX = (canvas.width - drawWidth) / 2
          }
          
          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
        } else {
          ctx.strokeStyle = '#000000'
          ctx.lineWidth = 4
          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'
          drawOutlineShape(ctx, canvas.width, canvas.height, letter)
        }
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
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Letter and Word Header */}
      <div className="text-center">
        <motion.div
          className="text-6xl sm:text-7xl md:text-8xl font-bold text-gray-700 mb-2 sm:mb-4 cursor-pointer touch-manipulation"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={onLetterClick}
        >
          {letter}
        </motion.div>
        <motion.p
          className="text-2xl sm:text-3xl font-semibold text-gray-600 cursor-pointer touch-manipulation"
          whileHover={{ scale: 1.05 }}
          onClick={onLetterClick}
        >
          {word}
        </motion.p>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLetterClick}
          className="mt-2 min-h-[44px] touch-manipulation"
        >
          <Volume2 className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Listen: {letter} for {word}</span>
          <span className="sm:hidden">Listen</span>
        </Button>
      </div>

      {/* Picture Coloring Area */}
      <div className="relative">
        <h3 className="text-xl md:text-2xl font-bold text-gray-700 mb-3 text-center">
          🎨 Color the Picture
        </h3>
        <div className="relative bg-white rounded-lg border-4 border-gray-300 p-2 md:p-4 mobile-canvas-container">
          <canvas
            ref={canvasRef}
            className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] touch-none cursor-crosshair select-none"
            style={{ 
              touchAction: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              WebkitTouchCallout: 'none',
              maxHeight: '70vh'
            }}
            onMouseDown={(e) => handleMouseDown(e, false)}
            onMouseMove={(e) => handleMouseMove(e, false)}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleTouchStart(e, false)
            }}
            onTouchMove={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleTouchMove(e, false)
            }}
            onTouchEnd={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleTouchEnd(e)
            }}
            onTouchCancel={(e) => {
              e.preventDefault()
              handleMouseUp()
            }}
          />
        </div>
      </div>

      {/* Word Coloring Area */}
      <div className="relative">
        <h3 className="text-xl md:text-2xl font-bold text-gray-700 mb-3 text-center">
          ✏️ Color the Word
        </h3>
        <div className="relative bg-white rounded-lg border-4 border-gray-300 p-2 md:p-4">
          <canvas
            ref={wordCanvasRef}
            className="w-full h-24 sm:h-28 md:h-32 touch-none cursor-crosshair select-none"
            style={{ 
              touchAction: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              WebkitTouchCallout: 'none'
            }}
            onMouseDown={(e) => handleMouseDown(e, true)}
            onMouseMove={(e) => handleMouseMove(e, true)}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleTouchStart(e, true)
            }}
            onTouchMove={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleTouchMove(e, true)
            }}
            onTouchEnd={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleTouchEnd(e)
            }}
            onTouchCancel={(e) => {
              e.preventDefault()
              handleMouseUp()
            }}
          />
        </div>
      </div>

      {/* Color Palette */}
      <div className="bg-white rounded-lg p-3 md:p-4 border-2 border-gray-200">
        <h3 className="text-lg md:text-xl font-bold text-gray-700 mb-3 text-center">
          Color Palette
        </h3>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3 overflow-x-auto pb-2">
          {colorPalette.map((color) => (
            <motion.button
              key={color}
              className={`w-14 h-14 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border-4 transition-all touch-manipulation ${
                selectedColor === color
                  ? 'border-gray-800 scale-110 shadow-lg ring-4 ring-gray-300'
                  : 'border-gray-300'
              }`}
              style={{ 
                backgroundColor: color,
                minWidth: '3.5rem',
                minHeight: '3.5rem'
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setSelectedColor(color)
                setIsErasing(false)
              }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
      </div>

      {/* Pen/Brush Options */}
      <div className="bg-white rounded-lg p-3 md:p-4 border-2 border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg md:text-xl font-bold text-gray-700">
            Pen Options
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowToolOptions(!showToolOptions)}
            className="min-h-[36px] touch-manipulation"
          >
            {showToolOptions ? 'Hide' : 'Show'} Options
          </Button>
        </div>
        
        <AnimatePresence>
          {showToolOptions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 overflow-hidden"
            >
              {/* Tool Type Selection */}
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">Tool Type:</p>
                <div className="grid grid-cols-3 gap-2">
                  <motion.button
                    className={`p-3 rounded-lg border-2 transition-all touch-manipulation ${
                      toolType === 'pen'
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-300 bg-gray-50'
                    }`}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setToolType('pen')
                      setIsErasing(false)
                    }}
                  >
                    <PenTool className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs font-medium">Pen</span>
                  </motion.button>
                  
                  <motion.button
                    className={`p-3 rounded-lg border-2 transition-all touch-manipulation ${
                      toolType === 'marker'
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-300 bg-gray-50'
                    }`}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setToolType('marker')
                      setIsErasing(false)
                    }}
                  >
                    <Highlighter className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs font-medium">Marker</span>
                  </motion.button>
                  
                  <motion.button
                    className={`p-3 rounded-lg border-2 transition-all touch-manipulation ${
                      toolType === 'paintbrush'
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-300 bg-gray-50'
                    }`}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setToolType('paintbrush')
                      setIsErasing(false)
                    }}
                  >
                    <Paintbrush className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs font-medium">Brush</span>
                  </motion.button>
                </div>
              </div>
              
              {/* Brush Size Selection */}
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">Size:</p>
                <div className="flex gap-2">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <motion.button
                      key={size}
                      className={`flex-1 p-3 rounded-lg border-2 transition-all touch-manipulation capitalize ${
                        brushSize === size
                          ? 'border-blue-500 bg-blue-50 shadow-md font-semibold'
                          : 'border-gray-300 bg-gray-50'
                      }`}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setBrushSize(size)}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className={`rounded-full bg-current ${
                            size === 'small' ? 'w-2 h-2' : size === 'medium' ? 'w-4 h-4' : 'w-6 h-6'
                          }`}
                          style={{ color: selectedColor }}
                        />
                        <span className="text-xs">{size}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tools */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        <Button
          variant={isErasing ? 'default' : 'outline'}
          size="lg"
          onClick={() => {
            setIsErasing(!isErasing)
            if (!isErasing) {
              setShowToolOptions(false)
            }
          }}
          className="text-base sm:text-lg px-4 sm:px-6 py-3 min-h-[48px] touch-manipulation flex-1 sm:flex-initial min-w-[120px]"
        >
          <Eraser className="w-5 h-5 sm:mr-2" />
          <span className="hidden sm:inline">Eraser</span>
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          onClick={handleClear}
          className="text-base sm:text-lg px-4 sm:px-6 py-3 min-h-[48px] touch-manipulation flex-1 sm:flex-initial min-w-[120px]"
        >
          <RotateCcw className="w-5 h-5 sm:mr-2" />
          <span className="hidden sm:inline">Clear All</span>
        </Button>
        
        <Button
          variant="default"
          size="lg"
          onClick={handleSave}
          className="text-base sm:text-lg px-4 sm:px-6 py-3 bg-green-500 hover:bg-green-600 min-h-[48px] touch-manipulation flex-1 sm:flex-initial min-w-[120px]"
        >
          <Save className="w-5 h-5 sm:mr-2" />
          <span className="hidden sm:inline">Save</span>
        </Button>
      </div>
    </div>
  )
}
