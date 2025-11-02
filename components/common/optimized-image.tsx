'use client'

import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  placeholder?: string
  onLoad?: () => void
  onError?: () => void
}

export default function OptimizedImage({
  src,
  alt,
  width = 300,
  height = 300,
  className = '',
  priority = false,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false)

  // Check if src is external URL or local path
  const isExternal = src.startsWith('http://') || src.startsWith('https://')
  
  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  const handleLoad = () => {
    onLoad?.()
  }

  if (hasError) {
    return (
      <div className={`relative overflow-hidden bg-gray-200 flex items-center justify-center ${className}`} style={{ width, height }}>
        <div className="text-center text-gray-500">
          <div className="w-8 h-8 mx-auto mb-2">📷</div>
          <p className="text-sm">Image unavailable</p>
        </div>
      </div>
    )
  }

  // Use Next.js Image for local images or external URLs (with unoptimized flag for external)
  if (isExternal) {
    // For external URLs, Next.js Image requires unoptimized or domain configuration
    return (
      <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="object-cover"
          priority={priority}
          onLoad={handleLoad}
          onError={handleError}
          unoptimized={isExternal} // External images aren't optimized by Next.js by default
        />
      </div>
    )
  }

  // Local images get full Next.js optimization (WebP, AVIF, responsive sizing)
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="object-cover"
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
        quality={85} // Optimize quality for smaller file sizes
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  )
}

