'use client'

import { useEffect } from 'react'

/**
 * Hook to optimize touch interactions on mobile devices
 * Prevents double-tap zoom and improves touch responsiveness
 */
export function useTouchOptimization() {
  useEffect(() => {
    // Prevent double-tap zoom on iOS
    let lastTouchEnd = 0
    const preventDoubleTapZoom = (e: TouchEvent) => {
      const now = Date.now()
      if (now - lastTouchEnd <= 300) {
        e.preventDefault()
      }
      lastTouchEnd = now
    }

    document.addEventListener('touchend', preventDoubleTapZoom, { passive: false })

    // Add touch-action CSS property to improve touch responsiveness
    const style = document.createElement('style')
    style.textContent = `
      button, a, [role="button"] {
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.removeEventListener('touchend', preventDoubleTapZoom)
      document.head.removeChild(style)
    }
  }, [])
}

