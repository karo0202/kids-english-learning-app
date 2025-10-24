'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'

// Debounce hook for performance
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Throttle hook for performance
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now())
  
  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args)
        lastRun.current = Date.now()
      }
    }) as T,
    [callback, delay]
  )
}

// Memoized search hook
export function useSearch<T>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[],
  debounceMs: number = 300
) {
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs)
  
  const filteredItems = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return items
    
    const term = debouncedSearchTerm.toLowerCase()
    return items.filter(item =>
      searchFields.some(field => {
        const value = item[field]
        return typeof value === 'string' && value.toLowerCase().includes(term)
      })
    )
  }, [items, debouncedSearchTerm, searchFields])
  
  return filteredItems
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0)
  const startTime = useRef(Date.now())
  
  useEffect(() => {
    renderCount.current += 1
    const renderTime = Date.now() - startTime.current
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} rendered ${renderCount.current} times in ${renderTime}ms`)
    }
    
    startTime.current = Date.now()
  })
  
  return {
    renderCount: renderCount.current,
    reset: () => {
      renderCount.current = 0
      startTime.current = Date.now()
    }
  }
}

// Image preloading hook
export function useImagePreload(urls: string[]) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())
  
  useEffect(() => {
    const loadImage = (url: string) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          setLoadedImages(prev => new Set([...prev, url]))
          resolve()
        }
        img.onerror = () => {
          setFailedImages(prev => new Set([...prev, url]))
          reject()
        }
        img.src = url
      })
    }
    
    const loadAllImages = async () => {
      const promises = urls.map(url => 
        loadImage(url).catch(() => {
          // Handle failed images gracefully
          console.warn(`Failed to preload image: ${url}`)
        })
      )
      
      await Promise.allSettled(promises)
    }
    
    loadAllImages()
  }, [urls])
  
  return {
    loadedImages,
    failedImages,
    isLoaded: (url: string) => loadedImages.has(url),
    isFailed: (url: string) => failedImages.has(url),
    allLoaded: loadedImages.size === urls.length
  }
}

// Memory usage monitoring
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize?: number
    totalJSHeapSize?: number
    jsHeapSizeLimit?: number
  }>({})
  
  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        })
      }
    }
    
    updateMemoryInfo()
    const interval = setInterval(updateMemoryInfo, 5000)
    
    return () => clearInterval(interval)
  }, [])
  
  return memoryInfo
}

