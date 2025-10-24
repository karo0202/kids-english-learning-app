'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Clock, 
  Star, 
  BookOpen, 
  Award,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Lightbulb
} from 'lucide-react'
import { personalizationManager } from '@/lib/personalization'
import { adaptiveDifficultyManager } from '@/lib/adaptive-difficulty'
import { learningPathManager } from '@/lib/learning-paths'
import type { LearningProfile, AdaptiveRecommendation } from '@/lib/personalization'
import type { PathRecommendation } from '@/lib/learning-paths'

interface PersonalizationDashboardProps {
  childId: string
  onPathSelect?: (pathId: string) => void
}

export default function PersonalizationDashboard({ 
  childId, 
  onPathSelect 
}: PersonalizationDashboardProps) {
  const [profile, setProfile] = useState<LearningProfile | null>(null)
  const [recommendations, setRecommendations] = useState<AdaptiveRecommendation[]>([])
  const [pathRecommendations, setPathRecommendations] = useState<PathRecommendation[]>([])
  const [difficultyInsights, setDifficultyInsights] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPersonalizationData()
  }, [childId])

  const loadPersonalizationData = async () => {
    try {
      setLoading(true)
      
      // Load learning profile
      const learningProfile = personalizationManager.getProfile(childId)
      if (!learningProfile) {
        // Create initial profile
        const newProfile = personalizationManager.createProfile(childId, {
          learningStyle: 'mixed',
          difficultyLevel: 'beginner',
          interests: ['animals', 'colors', 'stories'],
          preferredPace: 'medium',
          attentionSpan: 15
        })
        setProfile(newProfile)
      } else {
        setProfile(learningProfile)
      }

      // Load recommendations
      const adaptiveRecs = personalizationManager.getRecommendations(childId)
      setRecommendations(adaptiveRecs)

      // Load path recommendations
      const pathRecs = learningPathManager.getPersonalizedRecommendations(childId, profile)
      setPathRecommendations(pathRecs)

      // Load difficulty insights
      const insights = adaptiveDifficultyManager.getDifficultyInsights(childId)
      setDifficultyInsights(insights)

    } catch (error) {
      console.error('Error loading personalization data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartPath = (pathId: string) => {
    learningPathManager.startPath(childId, pathId)
    onPathSelect?.(pathId)
  }

  const getLearningStyleIcon = (style: string) => {
    switch (style) {
      case 'visual': return '👁️'
      case 'auditory': return '👂'
      case 'kinesthetic': return '✋'
      default: return '🧠'
    }
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-green-600 bg-green-100'
      case 'intermediate': return 'text-yellow-600 bg-yellow-100'
      case 'advanced': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading personalization data...</span>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Personalized Learning Dashboard
        </h1>
        <p className="text-gray-600">
          AI-powered recommendations tailored to your child's learning style
        </p>
      </motion.div>

      {/* Learning Profile Card */}
      {profile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
        >
          <div className="flex items-center mb-4">
            <Brain className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Learning Profile</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">
                  {getLearningStyleIcon(profile.learningStyle)}
                </span>
                <span className="font-medium text-gray-900">Learning Style</span>
              </div>
              <p className="text-sm text-gray-600 capitalize">{profile.learningStyle}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Target className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-medium text-gray-900">Difficulty Level</span>
              </div>
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(profile.difficultyLevel)}`}>
                {profile.difficultyLevel}
              </span>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 text-purple-600 mr-2" />
                <span className="font-medium text-gray-900">Attention Span</span>
              </div>
              <p className="text-sm text-gray-600">{profile.attentionSpan} minutes</p>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <TrendingUp className="h-5 w-5 text-orange-600 mr-2" />
                <span className="font-medium text-gray-900">Learning Pace</span>
              </div>
              <p className="text-sm text-gray-600 capitalize">{profile.preferredPace}</p>
            </div>
          </div>

          {/* Strengths and Weaknesses */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                Strengths
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.strengths.length > 0 ? (
                  profile.strengths.map((strength, index) => (
                    <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      {strength}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">Building strengths...</span>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 text-orange-600 mr-2" />
                Areas to Improve
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.weaknesses.length > 0 ? (
                  profile.weaknesses.map((weakness, index) => (
                    <span key={index} className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                      {weakness}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">Great progress!</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Difficulty Insights */}
      {difficultyInsights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
        >
          <div className="flex items-center mb-4">
            <TrendingUp className="h-6 w-6 text-purple-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Difficulty Insights</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                Level {difficultyInsights.currentLevel}
              </div>
              <div className="text-sm text-gray-600">Current Difficulty</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {Math.round(difficultyInsights.progression * 100)}%
              </div>
              <div className="text-sm text-gray-600">Progress Rate</div>
            </div>

            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600 mb-1">
                {difficultyInsights.nextMilestone}
              </div>
              <div className="text-sm text-gray-600">Next Milestone</div>
            </div>
          </div>

          {difficultyInsights.recommendations.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium text-gray-900 mb-2">Recommendations</h3>
              <ul className="space-y-1">
                {difficultyInsights.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center">
                    <Lightbulb className="h-4 w-4 text-yellow-500 mr-2" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}

      {/* Adaptive Recommendations */}
      {recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
        >
          <div className="flex items-center mb-4">
            <Lightbulb className="h-6 w-6 text-yellow-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">AI Recommendations</h2>
          </div>

          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-start p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0 mr-3">
                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(rec.priority).split(' ')[0]}`}></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 capitalize">{rec.type} Recommendation</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(rec.priority)}`}>
                      {rec.priority} priority
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{rec.reason}</p>
                  <p className="text-xs text-gray-500">Action: {rec.action}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Learning Path Recommendations */}
      {pathRecommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
        >
          <div className="flex items-center mb-4">
            <BookOpen className="h-6 w-6 text-indigo-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Recommended Learning Paths</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pathRecommendations.map((path, index) => (
              <motion.div
                key={path.pathId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleStartPath(path.pathId)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {learningPathManager.getAllPaths().find(p => p.id === path.pathId)?.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {learningPathManager.getAllPaths().find(p => p.id === path.pathId)?.description}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    {path.timeToComplete} min
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-gray-600">
                      {Math.round(path.confidence * 100)}% match
                    </span>
                  </div>
                </div>

                <div className="mt-2">
                  <div className="text-xs text-gray-500 mb-1">Why this path?</div>
                  <p className="text-xs text-gray-600">{path.reason}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!profile && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Personalization Data Yet
          </h3>
          <p className="text-gray-600 mb-4">
            Start learning to build your personalized profile and get AI recommendations!
          </p>
          <button className="btn-primary-kid">
            Start Learning Journey
          </button>
        </motion.div>
      )}
    </div>
  )
}
