'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  Target, 
  BookOpen, 
  TrendingUp,
  Settings,
  User
} from 'lucide-react'
import PersonalizationDashboard from '@/components/personalization/personalization-dashboard'
import LearningPathTracker from '@/components/personalization/learning-path-tracker'
import AdaptiveContent from '@/components/personalization/adaptive-content'

export default function PersonalizationPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'paths' | 'adaptive'>('dashboard')
  const [selectedChild, setSelectedChild] = useState('child_1') // Mock child ID

  const tabs = [
    {
      id: 'dashboard',
      name: 'Learning Profile',
      icon: Brain,
      description: 'View personalized learning insights'
    },
    {
      id: 'paths',
      name: 'Learning Paths',
      icon: BookOpen,
      description: 'Track progress through learning paths'
    },
    {
      id: 'adaptive',
      name: 'Adaptive Content',
      icon: Target,
      description: 'Experience personalized content'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                Personalized Learning
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-2" />
                Child Profile
              </div>
              <Settings className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'dashboard' && (
            <PersonalizationDashboard 
              childId={selectedChild}
              onPathSelect={(pathId) => {
                setActiveTab('paths')
                // You could pass the pathId to the tracker component
              }}
            />
          )}
          
          {activeTab === 'paths' && (
            <LearningPathTracker 
              childId={selectedChild}
              onStepComplete={(stepId) => {
                console.log('Step completed:', stepId)
              }}
              onPathComplete={(pathId) => {
                console.log('Path completed:', pathId)
              }}
            />
          )}
          
          {activeTab === 'adaptive' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Adaptive Content Demo
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Experience how content adapts to your child's learning style, 
                  difficulty level, and performance in real-time.
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Speaking Module
                  </h3>
                  <AdaptiveContent
                    childId={selectedChild}
                    moduleType="speaking"
                    baseContent={{
                      id: 'speaking_demo',
                      type: 'pronunciation',
                      words: ['cat', 'dog', 'bird', 'fish']
                    }}
                    onPerformanceUpdate={(metrics) => {
                      console.log('Speaking performance:', metrics)
                    }}
                  />
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Reading Module
                  </h3>
                  <AdaptiveContent
                    childId={selectedChild}
                    moduleType="reading"
                    baseContent={{
                      id: 'reading_demo',
                      type: 'story',
                      title: 'The Little Cat',
                      content: 'Once upon a time, there was a little cat...'
                    }}
                    onPerformanceUpdate={(metrics) => {
                      console.log('Reading performance:', metrics)
                    }}
                  />
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Writing Module
                  </h3>
                  <AdaptiveContent
                    childId={selectedChild}
                    moduleType="writing"
                    baseContent={{
                      id: 'writing_demo',
                      type: 'letter_tracing',
                      letters: ['A', 'B', 'C', 'D']
                    }}
                    onPerformanceUpdate={(metrics) => {
                      console.log('Writing performance:', metrics)
                    }}
                  />
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Games Module
                  </h3>
                  <AdaptiveContent
                    childId={selectedChild}
                    moduleType="games"
                    baseContent={{
                      id: 'games_demo',
                      type: 'memory_game',
                      cards: ['apple', 'banana', 'orange', 'grape']
                    }}
                    onPerformanceUpdate={(metrics) => {
                      console.log('Games performance:', metrics)
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
