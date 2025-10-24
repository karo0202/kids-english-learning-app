'use client'

import { useEffect } from 'react'

export default function PortraitLock() {
  useEffect(() => {
    // Lock orientation to portrait
    const lockOrientation = () => {
      if (screen.orientation && 'lock' in screen.orientation) {
        (screen.orientation as any).lock('portrait').catch(() => {
          // Fallback if orientation lock fails
          console.log('Orientation lock not supported')
        })
      }
    }

    // Check if device is in landscape and show warning
    const checkOrientation = () => {
      if (window.innerHeight < window.innerWidth) {
        // Device is in landscape
        const warning = document.createElement('div')
        warning.id = 'landscape-warning'
        warning.innerHTML = `
          <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            font-size: 18px;
            text-align: center;
            padding: 20px;
          ">
            <div>
              <div style="font-size: 48px; margin-bottom: 20px;">📱</div>
              <div>Please rotate your device to portrait mode</div>
              <div style="font-size: 14px; margin-top: 10px; opacity: 0.8;">
                For the best learning experience
              </div>
            </div>
          </div>
        `
        document.body.appendChild(warning)
      } else {
        // Device is in portrait, remove warning if exists
        const existingWarning = document.getElementById('landscape-warning')
        if (existingWarning) {
          existingWarning.remove()
        }
      }
    }

    // Initial check
    checkOrientation()
    lockOrientation()

    // Listen for orientation changes
    window.addEventListener('orientationchange', () => {
      setTimeout(checkOrientation, 100) // Small delay to ensure orientation has changed
    })

    window.addEventListener('resize', checkOrientation)

    return () => {
      window.removeEventListener('orientationchange', checkOrientation)
      window.removeEventListener('resize', checkOrientation)
    }
  }, [])

  return null
}
