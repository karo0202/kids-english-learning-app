'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PerformanceMonitorProps {
  show?: boolean
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

export default function PerformanceMonitor({ 
  show = process.env.NODE_ENV === 'development',
  position = 'top-right'
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState({
    fps: 0,
    memory: 0,
    renderTime: 0,
    loadTime: 0
  })

  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!show) return

    let frameCount = 0
    let lastTime = performance.now()
    let animationId: number

    const measurePerformance = () => {
      frameCount++
      const currentTime = performance.now()
      
      if (currentTime - lastTime >= 1000) {
        setMetrics(prev => ({
          ...prev,
          fps: Math.round((frameCount * 1000) / (currentTime - lastTime))
        }))
        frameCount = 0
        lastTime = currentTime
      }

      // Memory usage
      if ('memory' in performance) {
        const memory = (performance as any).memory
        setMetrics(prev => ({
          ...prev,
          memory: Math.round(memory.usedJSHeapSize / 1024 / 1024) // MB
        }))
      }

      animationId = requestAnimationFrame(measurePerformance)
    }

    // Load time
    const loadTime = performance.now()
    setMetrics(prev => ({
      ...prev,
      loadTime: Math.round(loadTime)
    }))

    measurePerformance()

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [show])

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  }

  if (!show) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className={`fixed ${positionClasses[position]} z-50 bg-black/80 text-white p-3 rounded-lg text-xs font-mono backdrop-blur-sm`}
        >
          <div className="space-y-1">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold">Performance</span>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            <div>FPS: {metrics.fps}</div>
            <div>Memory: {metrics.memory}MB</div>
            <div>Load: {metrics.loadTime}ms</div>
            <div className="text-gray-400 text-xs">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </motion.div>
      )}
      
      {!isVisible && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setIsVisible(true)}
          className={`fixed ${positionClasses[position]} z-50 bg-blue-600 text-white p-2 rounded-full text-xs hover:bg-blue-700 transition-colors`}
        >
          📊
        </motion.button>
      )}
    </AnimatePresence>
  )
}

