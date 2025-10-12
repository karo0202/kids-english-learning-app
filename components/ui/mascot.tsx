
'use client'

import { motion } from 'framer-motion'
import { Star, Heart, Sparkles } from 'lucide-react'

interface MascotProps {
  emotion?: 'happy' | 'excited' | 'thinking' | 'celebrating'
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export function Mascot({ emotion = 'happy', size = 'medium', className = '' }: MascotProps) {
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  }

  const animations = {
    happy: {
      y: [0, -5, 0],
      transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' }
    },
    excited: {
      rotate: [0, 5, -5, 0],
      scale: [1, 1.05, 1],
      transition: { repeat: Infinity, duration: 1, ease: 'easeInOut' }
    },
    thinking: {
      rotate: [0, 3, -3, 0],
      transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' }
    },
    celebrating: {
      y: [0, -10, 0],
      rotate: [0, 10, -10, 0],
      transition: { repeat: Infinity, duration: 0.8, ease: 'easeInOut' }
    }
  }

  return (
    <motion.div 
      className={`${sizeClasses[size]} ${className} relative`}
      animate={animations[emotion]}
    >
      {/* Main mascot body - cute owl-like character */}
      <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center relative shadow-lg">
        
        {/* Eyes */}
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
          <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-black rounded-full"></div>
          </div>
          <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-black rounded-full"></div>
          </div>
        </div>

        {/* Beak */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-orange-400 rounded-full"></div>

        {/* Wings */}
        <div className="absolute left-1 top-1/2 transform -translate-y-1/2 w-4 h-6 bg-purple-500 rounded-full opacity-80"></div>
        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 w-4 h-6 bg-purple-500 rounded-full opacity-80"></div>

        {/* Emotion-specific elements */}
        {emotion === 'celebrating' && (
          <>
            <motion.div
              className="absolute -top-2 -left-2"
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.2, 1] 
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 1.5,
                ease: 'easeInOut' 
              }}
            >
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
            </motion.div>
            <motion.div
              className="absolute -top-2 -right-2"
              animate={{ 
                rotate: [360, 0],
                scale: [1, 1.3, 1] 
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 1.2,
                ease: 'easeInOut' 
              }}
            >
              <Heart className="w-3 h-3 text-pink-400 fill-current" />
            </motion.div>
          </>
        )}

        {emotion === 'excited' && (
          <motion.div
            className="absolute -top-3 left-1/2 transform -translate-x-1/2"
            animate={{ 
              y: [0, -5, 0],
              opacity: [0.8, 1, 0.8] 
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 1,
              ease: 'easeInOut' 
            }}
          >
            <Sparkles className="w-4 h-4 text-yellow-300 fill-current" />
          </motion.div>
        )}
      </div>

      {/* Shadow */}
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-2 bg-gray-300 rounded-full opacity-30 blur-sm"></div>
    </motion.div>
  )
}
