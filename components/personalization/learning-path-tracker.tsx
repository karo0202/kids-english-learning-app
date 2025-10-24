'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Target, 
  TrendingUp,
  Play,
  Pause,
  RotateCcw,
  Award,
  Star
} from 'lucide-react'
import { learningPathManager } from '@/lib/learning-paths'
import type { LearningPath, PathProgress, LearningPathStep } from '@/lib/learning-paths'

interface LearningPathTrackerProps {
  childId: string
  pathId?: string
  onStepComplete?: (stepId: string) => void
  onPathComplete?: (pathId: string) => void
}

export default function LearningPathTracker({ 
  childId, 
  pathId,
  onStepComplete,
  onPathComplete 
}: LearningPathTrackerProps) {
  const [currentPath, setCurrentPath] = useState<LearningPath | null>(null)
  const [progress, setProgress] = useState<PathProgress | null>(null)
  const [currentStep, setCurrentStep] = useState<LearningPathStep | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0)

  useEffect(() => {
    if (pathId) {
      loadPathData(pathId)
    } else {
      loadActivePaths()
    }
  }, [childId, pathId])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isActive) {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isActive])

  const loadPathData = (targetPathId: string) => {
    const path = learningPathManager.getAllPaths().find(p => p.id === targetPathId)
    if (path) {
      setCurrentPath(path)
      
      const pathProgress = learningPathManager.getProgress(childId, targetPathId)
      setProgress(pathProgress)
      
      if (pathProgress) {
        const nextStep = learningPathManager.getNextStep(childId, targetPathId)
        setCurrentStep(nextStep)
      }
    }
  }

  const loadActivePaths = () => {
    const allProgress = learningPathManager.getChildProgress(childId)
    const activeProgress = allProgress.find(p => p.progressPercentage < 100)
    
    if (activeProgress) {
      loadPathData(activeProgress.pathId)
    }
  }

  const startPath = () => {
    if (currentPath) {
      const newProgress = learningPathManager.startPath(childId, currentPath.id)
      setProgress(newProgress)
      setCurrentStep(currentPath.steps[0])
      setIsActive(true)
    }
  }

  const completeCurrentStep = () => {
    if (currentStep && currentPath) {
      learningPathManager.completeStep(childId, currentPath.id, currentStep.id)
      
      // Update local state
      const updatedProgress = learningPathManager.getProgress(childId, currentPath.id)
      setProgress(updatedProgress)
      
      // Get next step
      const nextStep = learningPathManager.getNextStep(childId, currentPath.id)
      setCurrentStep(nextStep)
      
      // Check if path is complete
      if (updatedProgress?.progressPercentage === 100) {
        setIsActive(false)
        onPathComplete?.(currentPath.id)
      }
      
      onStepComplete?.(currentStep.id)
    }
  }

  const pausePath = () => {
    setIsActive(false)
  }

  const resumePath = () => {
    setIsActive(true)
  }

  const resetPath = () => {
    if (currentPath) {
      learningPathManager.startPath(childId, currentPath.id)
      loadPathData(currentPath.id)
      setTimeSpent(0)
      setIsActive(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStepStatus = (stepId: string) => {
    if (!progress) return 'pending'
    if (progress.completedSteps.includes(stepId)) return 'completed'
    if (currentStep?.id === stepId) return 'current'
    return 'pending'
  }

  const getStepIcon = (stepId: string) => {
    const status = getStepStatus(stepId)
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'current':
        return <Play className="h-5 w-5 text-blue-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStepColor = (stepId: string) => {
    const status = getStepStatus(stepId)
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200'
      case 'current':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  if (!currentPath) {
    return (
      <div className="text-center py-8">
        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Active Learning Path
        </h3>
        <p className="text-gray-600 mb-4">
          Choose a learning path to start your personalized journey!
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Path Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentPath.name}
            </h2>
            <p className="text-gray-600 mb-4">
              {currentPath.description}
            </p>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {currentPath.estimatedDuration} minutes
              </div>
              <div className="flex items-center">
                <Target className="h-4 w-4 mr-1" />
                {currentPath.difficulty}
              </div>
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-1" />
                {currentPath.steps.length} steps
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {progress?.progressPercentage || 0}%
            </div>
            <div className="text-sm text-gray-600">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <motion.div
            className="bg-blue-600 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress?.progressPercentage || 0}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3">
          {!progress ? (
            <button
              onClick={startPath}
              className="btn-primary-kid flex items-center"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Path
            </button>
          ) : (
            <>
              {isActive ? (
                <button
                  onClick={pausePath}
                  className="btn-secondary-kid flex items-center"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </button>
              ) : (
                <button
                  onClick={resumePath}
                  className="btn-primary-kid flex items-center"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </button>
              )}
              
              <button
                onClick={resetPath}
                className="btn-outline-kid flex items-center"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </button>
            </>
          )}
          
          {isActive && (
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-1" />
              {formatTime(timeSpent)}
            </div>
          )}
        </div>
      </motion.div>

      {/* Current Step */}
      {currentStep && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200"
        >
          <div className="flex items-center mb-4">
            <Play className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-xl font-semibold text-gray-900">Current Step</h3>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-blue-900 mb-2">
              {currentStep.activity.replace(/_/g, ' ').toUpperCase()}
            </h4>
            <p className="text-blue-800 mb-3">
              {currentStep.learningObjectives.join(', ')}
            </p>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-blue-700">
                <Clock className="h-4 w-4 mr-1" />
                {currentStep.estimatedTime} minutes
              </div>
              <div className="flex items-center text-blue-700">
                <Target className="h-4 w-4 mr-1" />
                Level {currentStep.difficulty}
              </div>
            </div>
          </div>
          
          <button
            onClick={completeCurrentStep}
            className="btn-primary-kid w-full"
          >
            Complete Step
          </button>
        </motion.div>
      )}

      {/* Path Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
      >
        <div className="flex items-center mb-4">
          <BookOpen className="h-6 w-6 text-indigo-600 mr-2" />
          <h3 className="text-xl font-semibold text-gray-900">Learning Steps</h3>
        </div>
        
        <div className="space-y-3">
          {currentPath.steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className={`rounded-lg p-4 border-2 ${getStepColor(step.id)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getStepIcon(step.id)}
                  <div className="ml-3">
                    <h4 className="font-medium text-gray-900">
                      Step {index + 1}: {step.activity.replace(/_/g, ' ').toUpperCase()}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {step.learningObjectives.join(', ')}
                    </p>
                  </div>
                </div>
                
                <div className="text-right text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {step.estimatedTime}min
                  </div>
                  <div className="flex items-center">
                    <Target className="h-4 w-4 mr-1" />
                    Level {step.difficulty}
                  </div>
                </div>
              </div>
              
              {step.prerequisites.length > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  Prerequisites: {step.prerequisites.join(', ')}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Learning Outcomes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
      >
        <div className="flex items-center mb-4">
          <Award className="h-6 w-6 text-yellow-600 mr-2" />
          <h3 className="text-xl font-semibold text-gray-900">Learning Outcomes</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentPath.learningOutcomes.map((outcome, index) => (
            <div key={index} className="flex items-start">
              <Star className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
              <span className="text-gray-700">{outcome}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
