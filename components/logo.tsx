'use client'

import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
}

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
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

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} flex-shrink-0`}>
        <Image
          src="/logo.jpg"
          alt="Kids English Learning"
          width={size === 'sm' ? 32 : size === 'md' ? 48 : size === 'lg' ? 64 : 96}
          height={size === 'sm' ? 32 : size === 'md' ? 48 : size === 'lg' ? 64 : 96}
          className="w-full h-full object-contain"
          priority
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold text-orange-600 ${textSizes[size]}`}>KIDS</span>
          <span className={`font-bold text-blue-700 ${textSizes[size]}`}>ENGLISH</span>
        </div>
      )}
    </div>
  )
}
