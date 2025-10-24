'use client'

import { Suspense, lazy, ComponentType } from 'react'
import { motion } from 'framer-motion'

interface LazyModuleProps {
  moduleName: string
  fallback?: React.ReactNode
}

// Lazy load modules
const SpeakingModule = lazy(() => import('../learning/speaking-module'))
const WritingModule = lazy(() => import('../learning/writing-module'))
const ReadingModule = lazy(() => import('../learning/reading-module'))
const GamesModule = lazy(() => import('../learning/games-module'))

const moduleMap: Record<string, ComponentType> = {
  'speaking': SpeakingModule,
  'writing': WritingModule,
  'reading': ReadingModule,
  'games': GamesModule
}

const LoadingFallback = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center"
  >
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600 text-lg">Loading learning module...</p>
    </div>
  </motion.div>
)

export default function LazyModule({ moduleName, fallback = <LoadingFallback /> }: LazyModuleProps) {
  const ModuleComponent = moduleMap[moduleName]
  
  if (!ModuleComponent) {
    return <div>Module not found</div>
  }

  return (
    <Suspense fallback={fallback}>
      <ModuleComponent />
    </Suspense>
  )
}

