'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  Target, 
  Clock, 
  Lightbulb, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Eye,
  Ear,
  Hand
} from 'lucide-react'
import { personalizationManager } from '@/lib/personalization'
import { adaptiveDifficultyManager } from '@/lib/adaptive-difficulty'
import type { LearningProfile, PerformanceMetrics } from '@/lib/personalization'

interface AdaptiveContentProps {
  childId: string
  moduleType: 'speaking' | 'reading' | 'writing' | 'games'
  baseContent: any
  onPerformanceUpdate?: (metrics: PerformanceMetrics) => void
}

export default function AdaptiveContent({ 
  childId, 
  moduleType, 
  baseContent,
  onPerformanceUpdate 
}: AdaptiveContentProps) {
  const [profile, setProfile] = useState<LearningProfile | null>(null)
  const [adaptiveSettings, setAdaptiveSettings] = useState<any>(null)
  const [personalizedContent, setPersonalizedContent] = useState<any>(null)
  const [currentDifficulty, setCurrentDifficulty] = useState<number>(2)
  const [performance, setPerformance] = useState<PerformanceMetrics>({
    accuracy: 0,
    speed: 0,
    engagement: 0,
    retention: 0,
    confidence: 0
  })

  useEffect(() => {
    initializeAdaptiveContent()
  }, [childId, moduleType])

  const initializeAdaptiveContent = () => {
    // Get learning profile
    const learningProfile = personalizationManager.getProfile(childId)
    setProfile(learningProfile)

    // Get adaptive settings
    const settings = adaptiveDifficultyManager.getSettings(childId)
    setAdaptiveSettings(settings)
    setCurrentDifficulty(settings.currentDifficulty)

    // Get personalized content
    const personalized = adaptiveDifficultyManager.getPersonalizedContent(childId, baseContent)
    setPersonalizedContent(personalized)
  }

  const updatePerformance = (newMetrics: Partial<PerformanceMetrics>) => {
    const updatedPerformance = { ...performance, ...newMetrics }
    setPerformance(updatedPerformance)

    // Record performance with adaptive difficulty manager
    adaptiveDifficultyManager.recordPerformance(childId, {
      timestamp: new Date().toISOString(),
      module: moduleType,
      activity: baseContent.id || 'unknown',
      accuracy: updatedPerformance.accuracy,
      speed: updatedPerformance.speed,
      engagement: updatedPerformance.engagement,
      timeSpent: 0, // This would be calculated from actual activity
      attempts: 1, // This would be tracked from actual attempts
      hintsUsed: 0 // This would be tracked from actual hints used
    })

    // Update learning profile
    if (profile) {
      personalizationManager.updateProfile(childId, updatedPerformance)
    }

    // Notify parent component
    onPerformanceUpdate?.(updatedPerformance)
  }

  const getLearningStyleIcon = (style: string) => {
    switch (style) {
      case 'visual': return <Eye className="h-4 w-4" />
      case 'auditory': return <Ear className="h-4 w-4" />
      case 'kinesthetic': return <Hand className="h-4 w-4" />
      default: return <Brain className="h-4 w-4" />
    }
  }

  const getDifficultyColor = (level: number) => {
    if (level <= 2) return 'text-green-600 bg-green-100'
    if (level <= 3) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getAdaptiveHints = () => {
    if (!adaptiveSettings) return []

    const hints = []
    
    if (adaptiveSettings.maxHints > 0) {
      hints.push(`You have ${adaptiveSettings.maxHints} hints available`)
    }
    
    if (adaptiveSettings.timeLimit > 0) {
      hints.push(`Time limit: ${adaptiveSettings.timeLimit} seconds`)
    }
    
    if (adaptiveSettings.maxAttempts > 0) {
      hints.push(`You can try ${adaptiveSettings.maxAttempts} times`)
    }

    return hints
  }

  const renderPersonalizedContent = () => {
    if (!personalizedContent) return null

    return (
      <div className="space-y-4">
        {/* Adaptive Settings Display */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 rounded-lg p-4 border border-blue-200"
        >
          <div className="flex items-center mb-2">
            <Target className="h-5 w-5 text-blue-600 mr-2" />
            <span className="font-medium text-blue-900">Adaptive Settings</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(currentDifficulty)}`}>
                Level {currentDifficulty}
              </div>
              <div className="text-gray-600 mt-1">Difficulty</div>
            </div>
            
            {adaptiveSettings?.timeLimit > 0 && (
              <div className="text-center">
                <div className="flex items-center justify-center text-orange-600">
                  <Clock className="h-4 w-4 mr-1" />
                  {adaptiveSettings.timeLimit}s
                </div>
                <div className="text-gray-600 mt-1">Time Limit</div>
              </div>
            )}
            
            {adaptiveSettings?.maxHints > 0 && (
              <div className="text-center">
                <div className="flex items-center justify-center text-purple-600">
                  <Lightbulb className="h-4 w-4 mr-1" />
                  {adaptiveSettings.maxHints}
                </div>
                <div className="text-gray-600 mt-1">Hints</div>
              </div>
            )}
            
            {adaptiveSettings?.maxAttempts > 0 && (
              <div className="text-center">
                <div className="flex items-center justify-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  {adaptiveSettings.maxAttempts}
                </div>
                <div className="text-gray-600 mt-1">Attempts</div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Learning Style Indicators */}
        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-green-50 rounded-lg p-4 border border-green-200"
          >
            <div className="flex items-center mb-2">
              <Brain className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-medium text-green-900">Optimized for Your Learning Style</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm">
                {getLearningStyleIcon(profile.learningStyle)}
                <span className="ml-1 text-gray-700 capitalize">{profile.learningStyle}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Adaptive Hints */}
        {getAdaptiveHints().length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-yellow-50 rounded-lg p-4 border border-yellow-200"
          >
            <div className="flex items-center mb-2">
              <Lightbulb className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="font-medium text-yellow-900">Adaptive Hints</span>
            </div>
            
            <ul className="space-y-1">
              {getAdaptiveHints().map((hint, index) => (
                <li key={index} className="text-sm text-yellow-800 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-2" />
                  {hint}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Performance Tracking */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-purple-50 rounded-lg p-4 border border-purple-200"
        >
          <div className="flex items-center mb-3">
            <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
            <span className="font-medium text-purple-900">Performance Tracking</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-600">
                {Math.round(performance.accuracy * 100)}%
              </div>
              <div className="text-xs text-gray-600">Accuracy</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">
                {Math.round(performance.speed * 100)}%
              </div>
              <div className="text-xs text-gray-600">Speed</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {Math.round(performance.engagement * 100)}%
              </div>
              <div className="text-xs text-gray-600">Engagement</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-orange-600">
                {Math.round(performance.retention * 100)}%
              </div>
              <div className="text-xs text-gray-600">Retention</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-red-600">
                {Math.round(performance.confidence * 100)}%
              </div>
              <div className="text-xs text-gray-600">Confidence</div>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="adaptive-content-wrapper">
      {renderPersonalizedContent()}
      
      {/* Performance Update Controls (for testing) */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-3">Performance Controls (Testing)</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Accuracy</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={performance.accuracy}
              onChange={(e) => updatePerformance({ accuracy: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Speed</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={performance.speed}
              onChange={(e) => updatePerformance({ speed: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Engagement</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={performance.engagement}
              onChange={(e) => updatePerformance({ engagement: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Retention</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={performance.retention}
              onChange={(e) => updatePerformance({ retention: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confidence</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={performance.confidence}
              onChange={(e) => updatePerformance({ confidence: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
