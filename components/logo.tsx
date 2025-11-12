'use client'

import Image from 'next/image'
import { useState } from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
}

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  }

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-4xl'
  }

  const imageSize = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96
  }[size]

  return (
    <div className={`flex items-center gap-3 ${className}`} role="img" aria-label="Kids English Learning Logo">
      <div className={`${sizeClasses[size]} flex-shrink-0 relative`}>
        {imageLoading && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-br from-orange-200 to-blue-200 dark:from-orange-900 dark:to-blue-900 animate-pulse rounded-lg" />
        )}
        {imageError ? (
          <div className={`${sizeClasses[size]} bg-gradient-to-br from-orange-400 to-blue-500 rounded-lg flex items-center justify-center`}>
            <span className="text-white font-bold text-xs">KE</span>
          </div>
        ) : (
          <Image
            src="/icons/logo.jpg"
            alt="Kids English Learning"
            width={imageSize}
            height={imageSize}
            className="w-full h-full object-contain transition-opacity duration-300"
            style={{ opacity: imageLoading ? 0 : 1 }}
            priority
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true)
              setImageLoading(false)
            }}
          />
        )}
      </div>
      {showText && (
        <div className="flex flex-col" aria-hidden="true">
          <span className={`font-bold text-orange-600 dark:text-orange-400 ${textSizes[size]} transition-colors`}>KIDS</span>
          <span className={`font-bold text-blue-700 dark:text-blue-400 ${textSizes[size]} transition-colors`}>ENGLISH</span>
        </div>
      )}
    </div>
  )
}
