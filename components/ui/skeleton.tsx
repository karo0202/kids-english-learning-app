import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  variant?: 'default' | 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  animate?: boolean
}

export default function Skeleton({ 
  className, 
  variant = 'default',
  width,
  height,
  animate = true
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700'
  const animateClass = animate ? 'animate-pulse' : ''
  
  const variantClasses = {
    default: 'rounded',
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-none'
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animateClass,
        className
      )}
      style={style}
      aria-hidden="true"
    />
  )
}
