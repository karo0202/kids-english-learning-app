'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export interface CalendarProps {
  className?: string
  selected?: Date
  onSelect?: (date: Date | undefined) => void
}

function Calendar({ className, selected, onSelect, ...props }: CalendarProps) {
  return (
    <div className={cn('p-3', className)} {...props}>
      <div className="text-center text-sm text-gray-500">
        Calendar component temporarily simplified for performance optimization
      </div>
    </div>
  )
}

export { Calendar }