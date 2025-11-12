'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ProgressRing } from '@/components/ui/progress-ring'
import { 
  ArrowLeft, User, TrendingUp, Calendar, Settings, 
  Clock, Star, Trophy, Target, BookOpen, Gamepad2,
  PenTool, Award, BarChart3, Users, Download,
  Lock, Unlock, Timer, Shield, FileText, MessageSquare,
  AlertCircle, CheckCircle, XCircle, Play, Edit, Plus,
  Volume2, VolumeX, Bell, BellOff, Sparkles, Gift,
  Activity, Zap, BookMarked, Mic, Puzzle, Lightbulb
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getUserSession } from '@/lib/simple-auth'
import { getChildren, Child, updateChild, addChild, deleteChild, subscribeToChildren } from '@/lib/children'
import { parentAnalytics, ChildAnalytics } from '@/lib/parent-analytics'
import { progressManager } from '@/lib/progress'
import { getAgeGroupConfigByAge } from '@/lib/age-utils'

interface ParentControls {
  timeLimit: number
  moduleLocks: {
    speaking: boolean
    writing: boolean
    games: boolean
    reading: boolean
    puzzle: boolean
  }
  contentFilter: 'all' | 'safe' | 'educational'
  breakReminders: boolean
  progressSharing: boolean
  soundEnabled: boolean
  musicEnabled: boolean
  notifications: boolean
  difficulty: 'auto' | 'easy' | 'medium' | 'hard'
}

interface ParentTip {
  id: string
  title: string
  content: string
  category: 'writing' | 'vocabulary' | 'pronunciation' | 'general'
  date: string
}

export default function EnhancedParentDashboard() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [analytics, setAnalytics] = useState<ChildAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week')
  const [showAddChild, setShowAddChild] = useState(false)
  const [editingChild, setEditingChild] = useState<Child | null>(null)
  
  const [parentControls, setParentControls] = useState<ParentControls>({
    timeLimit: 60,
    moduleLocks: {
      speaking: false,
      writing: false,
      games: false,
      reading: false,
      puzzle: false
    },
    contentFilter: 'all',
    breakReminders: true,
    progressSharing: true,
    soundEnabled: true,
    musicEnabled: true,
    notifications: true,
    difficulty: 'auto'
  })

  const [newChildData, setNewChildData] = useState({ name: '', age: '' })
  const [parentTips] = useState<ParentTip[]>([
    {
      id: '1',
      title: 'Practice Letter Tracing Daily',
      content: 'Encourage your child to trace letters for 10-15 minutes daily. Start with easier letters like C, O, and I, then progress to more complex ones.',
      category: 'writing',
      date: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Use New Words in Conversation',
      content: 'When your child learns a new word, try using it in daily conversations. This reinforces learning and helps with retention.',
      category: 'vocabulary',
      date: new Date().toISOString()
    },
    {
      id: '3',
      title: 'Celebrate Small Wins',
      content: 'Acknowledge every achievement, no matter how small. Positive reinforcement motivates continued learning.',
      category: 'general',
      date: new Date().toISOString()
    }
  ])

useEffect(() => {
  const currentUser = getUserSession()
  if (currentUser) {
    setSession({ user: currentUser })
    loadParentControls()
  } else {
    router.push('/login')
  }
}, [router])

useEffect(() => {
  if (!session?.user?.id) return

  let mounted = true
  setLoading(true)

  ;(async () => {
    const initialChildren = await getChildren(session.user.id)
    if (!mounted) return

    setChildren(initialChildren)
    setSelectedChild(prev => {
      if (prev && initialChildren.some(child => child.id === prev.id)) {
        return prev
      }
      return initialChildren[0] ?? null
    })
    setLoading(false)
  })()

  const unsubscribe = subscribeToChildren(session.user.id, updatedChildren => {
    setChildren(updatedChildren)
    setSelectedChild(prev => {
      if (prev && updatedChildren.some(child => child.id === prev.id)) {
        return prev
      }
      return updatedChildren[0] ?? null
    })
  })

  return () => {
    mounted = false
    unsubscribe?.()
  }
}, [session?.user?.id])

useEffect(() => {
  if (!session?.user?.id || !selectedChild) {
    setAnalytics(null)
    return
  }

  return parentAnalytics.subscribe(session.user.id, selectedChild.id, data => {
    setAnalytics(data)
  })
}, [session?.user?.id, selectedChild])

  const loadParentControls = () => {
    const saved = localStorage.getItem('parent_controls')
    if (saved) {
      try {
        const controls = JSON.parse(saved)
        setParentControls(prev => ({ ...prev, ...controls }))
      } catch (error) {
        console.error('Error loading parent controls:', error)
      }
    }
  }

  const updateParentControls = (updates: Partial<ParentControls>) => {
    const newControls = { ...parentControls, ...updates }
    setParentControls(newControls)
    localStorage.setItem('parent_controls', JSON.stringify(newControls))
  }

// Letter accuracy data
const letterAccuracyData = useMemo(() => {
  if (!analytics) return []

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  return letters.map(letter => {
    const data = analytics.letterTracing[letter]
    return {
      letter,
      accuracy: data ? data.averageAccuracy : 0,
      attempts: data ? data.attempts : 0,
      successRate: data && data.attempts > 0 ? (data.successfulAttempts / data.attempts) * 100 : 0,
      averageTime: data ? data.averageTime : 0,
      difficulty: data ? data.difficulty : 'medium',
    }
  })
}, [analytics])

const strugglingLetters = useMemo(() => {
  return letterAccuracyData.filter(l => l.accuracy < 60 && l.attempts >= 3).map(l => l.letter)
}, [letterAccuracyData])

// Weekly usage data
const weeklyUsage = useMemo(() => {
  if (!analytics) return []
  const today = new Date()
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  return analytics.dailyUsage
    .filter(day => new Date(day.date) >= weekAgo)
    .sort((a, b) => a.date.localeCompare(b.date))
}, [analytics])

  // Module progress
  const moduleProgress = useMemo(() => {
    if (!analytics || !selectedChild) return { writing: 0, vocabulary: 0, grammar: 0, time: 0 }
    
    const progress = progressManager.loadProgress(selectedChild.id)
    const totalActivities = analytics.activityLogs.length
    const writingActivities = analytics.activityLogs.filter(a => a.module === 'writing').length
    const speakingActivities = analytics.activityLogs.filter(a => a.module === 'speaking').length
    
    const totalMinutes = analytics.dailyUsage.reduce((sum, day) => sum + day.totalMinutes, 0)
    
    return {
      writing: totalActivities > 0 ? (writingActivities / totalActivities) * 100 : 0,
      vocabulary: analytics.wordsLearned.length,
      grammar: totalActivities > 0 ? (speakingActivities / totalActivities) * 100 : 0,
      time: totalMinutes
    }
  }, [analytics, selectedChild])

  // Generate PDF Report
  const generatePDFReport = () => {
    if (!selectedChild || !analytics) return

    const reportData = {
      childName: selectedChild.name,
      age: selectedChild.age,
      reportDate: new Date().toLocaleDateString(),
      letterAccuracy: letterAccuracyData.filter(l => l.attempts > 0),
      wordsLearned: analytics.wordsLearned.length,
      totalActivities: analytics.activityLogs.length,
      achievements: analytics.achievements.length,
      weeklyProgress: weeklyUsage,
      strugglingLetters,
      moduleProgress
    }

    // Create a simple text-based report (can be enhanced with jsPDF later)
    const reportText = `
KIDS ENGLISH LEARNING - PROGRESS REPORT
========================================

Child: ${reportData.childName}
Age: ${reportData.age}
Report Date: ${reportData.reportDate}

OVERALL PROGRESS
----------------
Total Activities Completed: ${reportData.totalActivities}
Words Learned: ${reportData.wordsLearned}
Achievements Earned: ${reportData.achievements}

LETTER TRACING PROGRESS
------------------------
${reportData.letterAccuracy.length > 0 
  ? reportData.letterAccuracy.map(l => 
      `${l.letter}: ${l.accuracy.toFixed(1)}% accuracy (${l.attempts} attempts)`
    ).join('\n')
  : 'No letter tracing data yet'}

AREAS NEEDING PRACTICE
----------------------
${reportData.strugglingLetters.length > 0
  ? `Letters: ${reportData.strugglingLetters.join(', ')}`
  : 'Great job! No areas need extra practice.'}

WEEKLY ACTIVITY
---------------
${reportData.weeklyProgress.map(day => 
  `${day.date}: ${day.totalMinutes} minutes`
).join('\n')}

RECOMMENDATIONS
---------------
${reportData.strugglingLetters.length > 0
  ? `Focus on practicing: ${reportData.strugglingLetters.join(', ')}`
  : 'Continue the excellent work!'}
    `.trim()

    // Download as text file (can be enhanced to PDF)
    const blob = new Blob([reportText], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedChild.name}_Progress_Report_${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Add child handler
const handleAddChild = async () => {
  if (!session?.user || !newChildData.name || !newChildData.age) return

  const age = parseInt(newChildData.age)
  if (isNaN(age) || age < 3 || age > 12) {
    alert('Please enter a valid age between 3 and 12')
    return
  }

  const newChild = await addChild(session.user.id, newChildData.name, age)
  setSelectedChild(newChild)
  setNewChildData({ name: '', age: '' })
  setShowAddChild(false)
}

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const getAgeGroupName = (age: number) => {
    if (age >= 3 && age <= 5) return 'Little Learner (3-5)'
    if (age >= 6 && age <= 8) return 'Word Builder (6-8)'
    if (age >= 9 && age <= 12) return 'Language Master (9-12)'
    return 'Learning Adventure'
  }

  const formatLastActive = (timestamp: string) => {
    if (!timestamp) return 'Never'
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-800 truncate">Parent Dashboard</h1>
                <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">Monitor and guide your child's learning journey</p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddChild(true)}
                className="text-xs sm:text-sm"
              >
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Add Child</span>
                <span className="sm:hidden">Add</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/settings')}
                className="p-2 sm:px-3"
              >
                <Settings className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Child Profile Cards */}
        {children.length > 0 && (
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Your Children
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {children.map((child) => {
                const analyticsForChild = session?.user?.id
                  ? parentAnalytics.getCachedAnalytics(session.user.id, child.id)
                  : parentAnalytics.getCachedAnalytics(child.parentId, child.id)
                const progress = progressManager.loadProgress(child.id)
                
                return (
                  <motion.div
                    key={child.id}
                    onClick={() => setSelectedChild(child)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      selectedChild?.id === child.id 
                        ? 'bg-gradient-to-br from-blue-100 to-purple-100 border-blue-400 shadow-lg' 
                        : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {child.name[0]}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">{child.name}</h3>
                          <p className="text-sm text-gray-600">{getAgeGroupName(child.age)}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingChild(child)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div>
                        <div className="font-bold text-blue-600">{progress?.level || 1}</div>
                        <div className="text-xs text-gray-500">Level</div>
                      </div>
                      <div>
                        <div className="font-bold text-green-600">{analyticsForChild.wordsLearned.length}</div>
                        <div className="text-xs text-gray-500">Words</div>
                      </div>
                      <div>
                        <div className="font-bold text-purple-600">{analyticsForChild.achievements.length}</div>
                        <div className="text-xs text-gray-500">Badges</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Last active:</span>
                        <span className="font-semibold">{formatLastActive(analyticsForChild.lastActive)}</span>
                      </div>
                      {analyticsForChild.lastActivity && (
                        <div className="text-xs text-gray-500 mt-1 truncate">
                          {analyticsForChild.lastActivity}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {selectedChild && analytics && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-2">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 min-w-max sm:min-w-0">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="writing" className="flex items-center gap-2">
                <PenTool className="w-4 h-4" />
                <span className="hidden sm:inline">Writing</span>
              </TabsTrigger>
              <TabsTrigger value="vocabulary" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Vocabulary</span>
              </TabsTrigger>
              <TabsTrigger value="journey" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Journey</span>
              </TabsTrigger>
              <TabsTrigger value="usage" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Usage</span>
              </TabsTrigger>
              <TabsTrigger value="controls" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Controls</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Reports</span>
              </TabsTrigger>
            </TabsList>
            </div>

            {/* 1. Overview Dashboard */}
            <TabsContent value="overview" className="space-y-6">
              {/* Key Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="text-center border-2 border-blue-200">
                    <CardContent className="p-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Trophy className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">{progressManager.loadProgress(selectedChild.id)?.level || 1}</h3>
                      <p className="text-xs text-gray-600">Current Level</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="text-center border-2 border-green-200">
                    <CardContent className="p-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Star className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">{analytics.wordsLearned.length}</h3>
                      <p className="text-xs text-gray-600">Words Learned</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="text-center border-2 border-purple-200">
                    <CardContent className="p-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">{analytics.activityLogs.length}</h3>
                      <p className="text-xs text-gray-600">Activities Done</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="text-center border-2 border-yellow-200">
                    <CardContent className="p-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">{Math.round(moduleProgress.time)}m</h3>
                      <p className="text-xs text-gray-600">Total Time</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Progress Overview Graphs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Progress by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <PenTool className="w-4 h-4 text-green-500" />
                            <span className="font-medium">Writing</span>
                          </div>
                          <span className="text-sm text-gray-600">{moduleProgress.writing.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <motion.div 
                            className="bg-green-500 h-3 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${moduleProgress.writing}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-blue-500" />
                            <span className="font-medium">Vocabulary</span>
                          </div>
                          <span className="text-sm text-gray-600">{moduleProgress.vocabulary} words</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <motion.div 
                            className="bg-blue-500 h-3 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (moduleProgress.vocabulary / 100) * 100)}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Mic className="w-4 h-4 text-purple-500" />
                            <span className="font-medium">Grammar/Phonics</span>
                          </div>
                          <span className="text-sm text-gray-600">{moduleProgress.grammar.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <motion.div 
                            className="bg-purple-500 h-3 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${moduleProgress.grammar}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Achievements Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-500" />
                      Achievements Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Total Achievements</span>
                        <span className="text-2xl font-bold text-yellow-600">{analytics.achievements.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Stars Earned</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {analytics.activityLogs.reduce((sum, log) => sum + log.score, 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Milestones</span>
                        <span className="text-2xl font-bold text-purple-600">
                          {Math.floor(analytics.activityLogs.length / 10)}
                        </span>
                      </div>
                      
                      {analytics.achievements.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Recent Achievements:</p>
                          <div className="space-y-2">
                            {analytics.achievements.slice(0, 3).map((achievement) => (
                              <div key={achievement.id} className="flex items-center gap-2 text-sm">
                                <span className="text-xl">{achievement.icon}</span>
                                <div>
                                  <div className="font-medium">{achievement.name}</div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(achievement.earnedAt).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Last Active Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Last Active</span>
                      <span className="font-semibold">{formatLastActive(analytics.lastActive)}</span>
                    </div>
                    {analytics.lastActivity && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Last Activity</span>
                        <span className="font-semibold text-blue-600">{analytics.lastActivity}</span>
                      </div>
                    )}
                    {analytics.activityLogs.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Recent Activities:</p>
                        <div className="space-y-2">
                          {analytics.activityLogs.slice(0, 5).map((log) => (
                            <div key={log.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                              <div className="flex items-center gap-2">
                                {log.module === 'writing' && <PenTool className="w-4 h-4 text-green-500" />}
                                {log.module === 'speaking' && <Mic className="w-4 h-4 text-blue-500" />}
                                {log.module === 'reading' && <BookOpen className="w-4 h-4 text-purple-500" />}
                                {log.module === 'games' && <Gamepad2 className="w-4 h-4 text-pink-500" />}
                                {log.module === 'puzzle' && <Puzzle className="w-4 h-4 text-orange-500" />}
                                <span>{log.activity}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-gray-500">{log.score}%</span>
                                <span className="text-xs text-gray-400">
                                  {formatLastActive(log.timestamp)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 2. Writing & Tracing Analytics */}
            <TabsContent value="writing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PenTool className="w-5 h-5 text-green-500" />
                    Letter Accuracy Chart
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-13 gap-2">
                    {letterAccuracyData.map((letterData) => {
                      const accuracy = letterData.accuracy
                      const color = accuracy >= 80 ? 'bg-green-500' : accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      
                      return (
                        <motion.div
                          key={letterData.letter}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-center"
                        >
                          <div className="relative">
                            <div className={`w-full h-20 ${color} rounded-lg flex items-center justify-center text-white font-bold text-lg mb-1`}
                                 style={{ opacity: letterData.attempts > 0 ? 0.8 + (accuracy / 100) * 0.2 : 0.3 }}>
                              {letterData.letter}
                            </div>
                            {letterData.attempts > 0 && (
                              <div className="text-xs font-semibold mt-1">
                                {accuracy.toFixed(0)}%
                              </div>
                            )}
                            {letterData.attempts === 0 && (
                              <div className="text-xs text-gray-400">Not tried</div>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Difficulty Map */}
              {strugglingLetters.length > 0 && (
                <Card className="border-2 border-yellow-300 bg-yellow-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-800">
                      <AlertCircle className="w-5 h-5" />
                      Areas Needing Practice
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">
                      Your child struggles with these letters: <strong>{strugglingLetters.join(', ')}</strong>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {strugglingLetters.map(letter => {
                        const data = letterAccuracyData.find(l => l.letter === letter)
                        return (
                          <div key={letter} className="px-4 py-2 bg-red-100 rounded-lg border-2 border-red-300">
                            <div className="font-bold text-red-800">{letter}</div>
                            <div className="text-xs text-red-600">
                              {data?.accuracy.toFixed(0)}% accuracy ({data?.attempts} attempts)
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <p className="text-sm text-gray-600 mt-4">
                      💡 Tip: Encourage extra practice with these letters. Try tracing them together!
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Average Time per Letter */}
              <Card>
                <CardHeader>
                  <CardTitle>Average Time per Letter</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {letterAccuracyData
                      .filter(l => l.attempts > 0)
                      .sort((a, b) => a.averageTime - b.averageTime)
                      .slice(0, 10)
                      .map((letterData) => (
                        <div key={letterData.letter} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center font-bold text-green-700">
                              {letterData.letter}
                            </div>
                            <div>
                              <div className="font-medium">{letterData.letter}</div>
                              <div className="text-xs text-gray-500">
                                {letterData.attempts} attempt{letterData.attempts > 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-800">{letterData.averageTime.toFixed(1)}s</div>
                            <div className="text-xs text-gray-500">avg. time</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 3. Vocabulary & Grammar Progress */}
            <TabsContent value="vocabulary" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    Words Learned ({analytics.wordsLearned.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {analytics.wordsLearned.map((word, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="text-center p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200"
                      >
                        {word.imageUrl && (
                          <img 
                            src={word.imageUrl} 
                            alt={word.word}
                            className="w-16 h-16 mx-auto mb-2 rounded-lg object-cover"
                          />
                        )}
                        <div className="font-bold text-gray-800">{word.word}</div>
                        {word.pronunciationScore !== undefined && (
                          <div className="text-xs text-gray-600 mt-1">
                            {word.pronunciationScore}% pronunciation
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          {word.timesPracticed}x practiced
                        </div>
                      </motion.div>
                    ))}
                    {analytics.wordsLearned.length === 0 && (
                      <div className="col-span-full text-center py-8 text-gray-500">
                        No words learned yet. Start learning to see progress here!
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Pronunciation Scores */}
              {analytics.wordsLearned.filter(w => w.pronunciationScore !== undefined).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mic className="w-5 h-5 text-purple-500" />
                      Pronunciation Scores
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.wordsLearned
                        .filter(w => w.pronunciationScore !== undefined)
                        .sort((a, b) => (b.pronunciationScore || 0) - (a.pronunciationScore || 0))
                        .map((word, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="font-medium">{word.word}</div>
                            <div className="flex items-center gap-3">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    (word.pronunciationScore || 0) >= 80 ? 'bg-green-500' :
                                    (word.pronunciationScore || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${word.pronunciationScore || 0}%` }}
                                />
                              </div>
                              <span className="font-bold w-12 text-right">
                                {word.pronunciationScore}%
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* 4. Learning Journey & Rewards */}
            <TabsContent value="journey" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    Achievements Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.achievements.length > 0 ? (
                    <div className="space-y-4">
                      {analytics.achievements.map((achievement, index) => (
                        <motion.div
                          key={achievement.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
                        >
                          <div className="text-4xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-800">{achievement.name}</h4>
                            <p className="text-sm text-gray-600">{achievement.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Earned: {new Date(achievement.earnedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No achievements earned yet. Keep learning to unlock achievements!
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Progress Over Time */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    Progress Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {weeklyUsage.map((day, index) => {
                      const date = new Date(day.date)
                      const maxMinutes = Math.max(...weeklyUsage.map(d => d.totalMinutes), 1)
                      
                      return (
                        <div key={day.date}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                            <span className="text-sm font-bold text-blue-600">{day.totalMinutes} min</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <motion.div 
                              className="bg-gradient-to-r from-blue-400 to-purple-500 h-3 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${(day.totalMinutes / maxMinutes) * 100}%` }}
                              transition={{ delay: index * 0.1, duration: 0.5 }}
                            />
                          </div>
                          <div className="flex gap-2 mt-1 text-xs text-gray-500">
                            <span>Writing: {day.activitiesByModule.writing}</span>
                            <span>Speaking: {day.activitiesByModule.speaking}</span>
                            <span>Reading: {day.activitiesByModule.reading}</span>
                            <span>Games: {day.activitiesByModule.games}</span>
                            <span>Puzzle: {day.activitiesByModule.puzzle}</span>
                          </div>
                        </div>
                      )
                    })}
                    {weeklyUsage.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No activity data for this week yet.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 5. Time & Usage Insights */}
            <TabsContent value="usage" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      Daily Activity Chart
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {weeklyUsage.map((day) => {
                        const date = new Date(day.date)
                        return (
                          <div key={day.date} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 w-24">
                              {date.toLocaleDateString('en-US', { weekday: 'short' })}
                            </span>
                            <div className="flex-1 mx-4">
                              <div className="w-full bg-gray-200 rounded-full h-4">
                                <div 
                                  className="bg-gradient-to-r from-blue-400 to-purple-500 h-4 rounded-full"
                                  style={{ width: `${(day.totalMinutes / 60) * 100}%` }}
                                />
                              </div>
                            </div>
                            <span className="text-sm font-semibold w-16 text-right">
                              {day.totalMinutes}m
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gamepad2 className="w-5 h-5 text-purple-500" />
                      Feature Usage Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(
                        weeklyUsage.reduce((acc, day) => {
                          Object.entries(day.activitiesByModule).forEach(([module, count]) => {
                            acc[module] = (acc[module] || 0) + count
                          })
                          return acc
                        }, {} as Record<string, number>)
                      ).map(([module, count]) => {
                        const total = Object.values(
                          weeklyUsage.reduce((acc, day) => {
                            Object.entries(day.activitiesByModule).forEach(([m, c]) => {
                              acc[m] = (acc[m] || 0) + c
                            })
                            return acc
                          }, {} as Record<string, number>)
                        ).reduce((sum, val) => sum + val, 0)
                        
                        const percentage = total > 0 ? (count / total) * 100 : 0
                        const icons = {
                          writing: <PenTool className="w-4 h-4" />,
                          speaking: <Mic className="w-4 h-4" />,
                          reading: <BookOpen className="w-4 h-4" />,
                          games: <Gamepad2 className="w-4 h-4" />,
                          puzzle: <Puzzle className="w-4 h-4" />
                        }
                        
                        return (
                          <div key={module}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                {icons[module as keyof typeof icons]}
                                <span className="font-medium capitalize">{module}</span>
                              </div>
                              <span className="text-sm text-gray-600">{count} activities</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-purple-500 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Parental Time Limits */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="w-5 h-5 text-orange-500" />
                    Time Management Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="timeLimit">Daily Time Limit (minutes)</Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      value={parentControls.timeLimit}
                      onChange={(e) => updateParentControls({ timeLimit: parseInt(e.target.value) || 0 })}
                      className="mt-1"
                      min={0}
                      max={300}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Current limit: {parentControls.timeLimit} minutes per day
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Break Reminders</Label>
                      <p className="text-sm text-gray-600">Remind child to take breaks every 20 minutes</p>
                    </div>
                    <Switch
                      checked={parentControls.breakReminders}
                      onCheckedChange={(checked) => updateParentControls({ breakReminders: checked })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 6. Customization & Parental Controls */}
            <TabsContent value="controls" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Child Profile Management */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-500" />
                      Child Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={selectedChild.name}
                        onChange={async (e) => {
                          if (session?.user && selectedChild) {
                            const updated = await updateChild(session.user.id, selectedChild.id, { name: e.target.value })
                            if (updated) {
                              setSelectedChild(updated)
                            }
                          }
                        }}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Age</Label>
                      <Input
                        type="number"
                        value={selectedChild.age}
                        onChange={async (e) => {
                          if (session?.user && selectedChild) {
                            const age = parseInt(e.target.value)
                            if (!isNaN(age) && age >= 3 && age <= 12) {
                              const updated = await updateChild(session.user.id, selectedChild.id, { age })
                              if (updated) {
                                setSelectedChild(updated)
                              }
                            }
                          }
                        }}
                        className="mt-1"
                        min={3}
                        max={12}
                      />
                    </div>
                    <div>
                      <Label>Difficulty Level</Label>
                      <select
                        value={parentControls.difficulty}
                        onChange={(e) => updateParentControls({ difficulty: e.target.value as any })}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="auto">Auto (Based on Age)</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                {/* Module Locks */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-red-500" />
                      Module Access Control
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(parentControls.moduleLocks).map(([module, isLocked]) => {
                      const icons = {
                        speaking: <Mic className="w-4 h-4" />,
                        writing: <PenTool className="w-4 h-4" />,
                        games: <Gamepad2 className="w-4 h-4" />,
                        reading: <BookOpen className="w-4 h-4" />,
                        puzzle: <Puzzle className="w-4 h-4" />
                      }
                      
                      return (
                        <div key={module} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isLocked ? <Lock className="w-4 h-4 text-red-500" /> : <Unlock className="w-4 h-4 text-green-500" />}
                            {icons[module as keyof typeof icons]}
                            <span className="capitalize font-medium">{module}</span>
                          </div>
                          <Switch
                            checked={!isLocked}
                            onCheckedChange={(checked) => 
                              updateParentControls({ 
                                moduleLocks: { 
                                  ...parentControls.moduleLocks, 
                                  [module]: !checked 
                                } 
                              })
                            }
                          />
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>

                {/* Audio Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Volume2 className="w-5 h-5 text-green-500" />
                      Audio Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Sound Effects</Label>
                        <p className="text-sm text-gray-600">Enable sound effects during activities</p>
                      </div>
                      <Switch
                        checked={parentControls.soundEnabled}
                        onCheckedChange={(checked) => updateParentControls({ soundEnabled: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Background Music</Label>
                        <p className="text-sm text-gray-600">Enable background music</p>
                      </div>
                      <Switch
                        checked={parentControls.musicEnabled}
                        onCheckedChange={(checked) => updateParentControls({ musicEnabled: checked })}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Notifications */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-yellow-500" />
                      Progress Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Milestone Alerts</Label>
                        <p className="text-sm text-gray-600">Get notified when child completes milestones</p>
                      </div>
                      <Switch
                        checked={parentControls.notifications}
                        onCheckedChange={(checked) => updateParentControls({ notifications: checked })}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Content Filter */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-500" />
                      Content Filter
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { value: 'all', label: 'All Content', description: 'No restrictions' },
                        { value: 'safe', label: 'Safe Mode', description: 'Age-appropriate content only' },
                        { value: 'educational', label: 'Educational Only', description: 'Learning-focused content' }
                      ].map((filter) => (
                        <div key={filter.value} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id={filter.value}
                            name="contentFilter"
                            value={filter.value}
                            checked={parentControls.contentFilter === filter.value}
                            onChange={(e) => updateParentControls({ contentFilter: e.target.value as any })}
                            className="w-4 h-4"
                          />
                          <div>
                            <Label htmlFor={filter.value} className="font-medium cursor-pointer">{filter.label}</Label>
                            <p className="text-sm text-gray-600">{filter.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 7. Reports & Communication */}
            <TabsContent value="reports" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Downloadable Reports */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-500" />
                      Progress Reports
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button onClick={generatePDFReport} className="w-full" size="lg">
                      <Download className="w-4 h-4 mr-2" />
                      Download Progress Report (PDF)
                    </Button>
                    <div className="text-sm text-gray-600 space-y-2">
                      <p>📊 Weekly Summary Report</p>
                      <p>📈 Letter Tracing Analytics</p>
                      <p>📚 Vocabulary Progress</p>
                      <p>🎯 Achievement Summary</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Message Center */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-blue-500" />
                      Learning Tips & Messages
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {parentTips.map((tip) => (
                        <div key={tip.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-start gap-2">
                            <Lightbulb className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-gray-800">{tip.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{tip.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Parent Tips Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    Home Learning Activities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        title: 'Letter Practice Game',
                        description: 'Write letters on paper and have your child trace them with their finger. Make it fun by using colorful markers!',
                        category: 'writing'
                      },
                      {
                        title: 'Word Hunt',
                        description: 'Go around the house and find objects that start with letters your child is learning. "B" for book, "C" for cup!',
                        category: 'vocabulary'
                      },
                      {
                        title: 'Story Time',
                        description: 'Read together and point out words your child has learned. Ask them to identify familiar letters and sounds.',
                        category: 'reading'
                      },
                      {
                        title: 'Pronunciation Practice',
                        description: 'Practice saying words together. Make it a game by taking turns and giving each other points for clear pronunciation.',
                        category: 'pronunciation'
                      }
                    ].map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200"
                      >
                        <h4 className="font-bold text-gray-800 mb-2">{activity.title}</h4>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Add Child Modal */}
        <AnimatePresence>
          {showAddChild && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowAddChild(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-6 max-w-md w-full"
              >
                <h3 className="text-xl font-bold mb-4">Add New Child</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="childName">Child's Name</Label>
                    <Input
                      id="childName"
                      value={newChildData.name}
                      onChange={(e) => setNewChildData(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1"
                      placeholder="Enter name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="childAge">Age</Label>
                    <Input
                      id="childAge"
                      type="number"
                      value={newChildData.age}
                      onChange={(e) => setNewChildData(prev => ({ ...prev, age: e.target.value }))}
                      className="mt-1"
                      placeholder="3-12"
                      min={3}
                      max={12}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleAddChild} className="flex-1">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Child
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddChild(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {children.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Children Added Yet</h3>
              <p className="text-gray-600 mb-6">Add your first child to start tracking their learning progress!</p>
              <Button onClick={() => setShowAddChild(true)} size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Child
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

