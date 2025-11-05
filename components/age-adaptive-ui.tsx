'use client'

import { ReactNode } from 'react'
import { AgeGroup, getAgeGroupConfig, getButtonSizeClass, getUIComplexityClass } from '@/lib/age-utils'
import { cn } from '@/lib/utils'

interface AgeAdaptiveContainerProps {
  ageGroup: AgeGroup
  children: ReactNode
  className?: string
}

/**
 * Container that adapts UI complexity based on age group
 */
export function AgeAdaptiveContainer({ ageGroup, children, className }: AgeAdaptiveContainerProps) {
  const config = getAgeGroupConfig(ageGroup)
  const complexityClass = getUIComplexityClass(ageGroup)
  
  return (
    <div className={cn(
      complexityClass,
      className,
      {
        'age-simple': config.uiComplexity === 'simple',
        'age-moderate': config.uiComplexity === 'moderate',
        'age-advanced': config.uiComplexity === 'advanced'
      }
    )}>
      {children}
    </div>
  )
}

interface AgeAdaptiveButtonProps {
  ageGroup: AgeGroup
  children: ReactNode
  className?: string
  [key: string]: any
}

/**
 * Button that adapts size based on age group
 */
export function AgeAdaptiveButton({ ageGroup, children, className, ...props }: AgeAdaptiveButtonProps) {
  const sizeClass = getButtonSizeClass(ageGroup)
  
  return (
    <button
      className={cn(sizeClass, className)}
      {...props}
    >
      {children}
    </button>
  )
}

interface AgeGroupBadgeProps {
  ageGroup: AgeGroup
  className?: string
}

/**
 * Displays age group badge
 */
export function AgeGroupBadge({ ageGroup, className }: AgeGroupBadgeProps) {
  const config = getAgeGroupConfig(ageGroup)
  
  const badgeStyles = {
    [AgeGroup.AGE_3_5]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    [AgeGroup.AGE_6_8]: 'bg-green-100 text-green-800 border-green-300',
    [AgeGroup.AGE_9_12]: 'bg-purple-100 text-purple-800 border-purple-300'
  }
  
  return (
    <span className={cn(
      'px-3 py-1 rounded-full text-xs font-semibold border',
      badgeStyles[ageGroup],
      className
    )}>
      {config.name}
    </span>
  )
}

