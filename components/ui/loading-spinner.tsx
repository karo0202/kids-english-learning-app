'use client'

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

export default function LoadingSpinner({ size = 'md', className = '', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)} role="status" aria-label="Loading">
      <div
        className={cn(
          'animate-spin rounded-full border-t-transparent border-purple-600 dark:border-purple-400',
          sizeClasses[size]
        )}
        aria-hidden="true"
      />
      {text && (
        <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">{text}</p>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  )
}

