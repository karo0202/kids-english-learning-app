
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProgressRing } from '@/components/ui/progress-ring'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { 
  ArrowLeft, User, TrendingUp, Calendar, Settings, 
  Clock, Star, Trophy, Target, BookOpen, Gamepad2,
  PenTool, Award, BarChart3, Users, Download,
  Lock, Unlock, Timer, Shield, FileText
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

interface Child {
  id: string
  name: string
  age: number
  level: number
  xp: number
  coins: number
  totalActivities: number
  weeklyProgress: number[]
  achievements: number
  badges: number
  lastActivity: string
  ageGroup?: string
}

interface ParentControls {
  timeLimit: number // minutes per day
  moduleLocks: {
    speaking: boolean
    writing: boolean
    games: boolean
    reading: boolean
  }
  contentFilter: 'all' | 'safe' | 'educational'
  breakReminders: boolean
  progressSharing: boolean
}

export default function ParentDashboard() {
  const router = useRouter()
  const { data: session } = useSession() || {}
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [loading, setLoading] = useState(true)
  const [parentControls, setParentControls] = useState<ParentControls>({
    timeLimit: 60,
    moduleLocks: {
      speaking: false,
      writing: false,
      games: false,
      reading: false
    },
    contentFilter: 'all',
    breakReminders: true,
    progressSharing: true
  })

  useEffect(() => {
    fetchChildren()
    loadParentControls()
  }, [])

  const loadParentControls = () => {
    const saved = localStorage.getItem('parent_controls')
    if (saved) {
      try {
        setParentControls(JSON.parse(saved))
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

  const exportProgressCSV = () => {
    if (!selectedChild) return

    const csvData = [
      ['Date', 'Activity', 'Module', 'Score', 'Time Spent', 'XP Gained'],
      ...selectedChild.weeklyProgress.map((time, index) => [
        new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        'Learning Activity',
        'Mixed',
        Math.floor(Math.random() * 30) + 70,
        `${time} minutes`,
        Math.floor(time / 5)
      ])
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedChild.name}_progress_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const fetchChildren = async () => {
    try {
      const response = await fetch('/api/children')
      if (response.ok) {
        const data = await response.json()
        // Transform data for dashboard
        const transformedChildren = data.map((child: any) => ({
          ...child,
          totalActivities: child.progress?.length || 0,
          weeklyProgress: [12, 19, 15, 22, 18, 25, 20], // Mock weekly data
          achievements: child.achievements?.length || 0,
          badges: child.badges?.length || 0,
          lastActivity: child.progress?.[0]?.createdAt || new Date().toISOString()
        }))
        setChildren(transformedChildren)
        if (transformedChildren.length > 0) {
          setSelectedChild(transformedChildren[0])
        }
      }
    } catch (error) {
      console.error('Error fetching children:', error)
    } finally {
      setLoading(false)
    }
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

  const getAgeGroupName = (ageGroup: string) => {
    switch (ageGroup) {
      case 'AGE_3_5': return 'Little Learner (3-5)'
      case 'AGE_6_8': return 'Word Builder (6-8)'
      case 'AGE_9_12': return 'Language Master (9-12)'
      default: return 'Learning Adventure'
    }
  }

  const weeklyStats = {
    totalTime: 156, // minutes
    activitiesCompleted: 28,
    newWordsLearned: 45,
    streakDays: 5
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Learning
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Parent Dashboard</h1>
                <p className="text-gray-600">Monitor your child's learning progress</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <p className="text-sm text-gray-600">Signed in as</p>
                <p className="font-semibold text-gray-800">{session?.user?.name}</p>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/settings')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Child Selector */}
        {children.length > 1 && (
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Select Child to Monitor</h2>
            <div className="flex flex-wrap gap-4">
              {children.map((child) => (
                <motion.button
                  key={child.id}
                  onClick={() => setSelectedChild(child)}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    selectedChild?.id === child.id 
                      ? 'bg-blue-100 border-blue-400' 
                      : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {child.name[0]}
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-gray-800">{child.name}</h3>
                      <p className="text-sm text-gray-600">{getAgeGroupName(child.ageGroup)}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {selectedChild && (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 max-w-3xl">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Progress
              </TabsTrigger>
              <TabsTrigger value="activities" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Activities
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                Achievements
              </TabsTrigger>
              <TabsTrigger value="controls" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Controls
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Key Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="text-center">
                    <CardContent className="p-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trophy className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">{selectedChild.level}</h3>
                      <p className="text-gray-600">Current Level</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="text-center">
                    <CardContent className="p-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Star className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">{selectedChild.xp}</h3>
                      <p className="text-gray-600">XP Points</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="text-center">
                    <CardContent className="p-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Target className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">{selectedChild.totalActivities}</h3>
                      <p className="text-gray-600">Activities Done</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="text-center">
                    <CardContent className="p-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">{weeklyStats.totalTime}m</h3>
                      <p className="text-gray-600">This Week</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Progress Ring */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Overall Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <ProgressRing 
                        progress={75}
                        size={150}
                        color="#8B5CF6"
                        className="mx-auto mb-6"
                      >
                        <div className="text-center">
                          <div className="text-3xl font-bold text-purple-600">75%</div>
                          <div className="text-sm text-gray-500">Complete</div>
                        </div>
                      </ProgressRing>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-lg font-bold text-blue-600">{selectedChild.achievements}</div>
                          <div className="text-xs text-gray-500">Achievements</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-green-600">{selectedChild.badges}</div>
                          <div className="text-xs text-gray-500">Badges</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-yellow-600">{weeklyStats.streakDays}</div>
                          <div className="text-xs text-gray-500">Day Streak</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Weekly Activity */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Weekly Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
                          <div key={day} className="flex items-center justify-between">
                            <span className="text-gray-600 text-sm">{day}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <motion.div 
                                  className="h-full bg-gradient-to-r from-blue-400 to-purple-500"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(selectedChild.weeklyProgress[index] / 30) * 100}%` }}
                                  transition={{ delay: 0.8 + (index * 0.1), duration: 0.5 }}
                                />
                              </div>
                              <span className="text-sm font-semibold text-gray-800 w-8">
                                {selectedChild.weeklyProgress[index]}m
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            {/* Progress Tab */}
            <TabsContent value="progress" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PenTool className="w-5 h-5 text-green-500" />
                      Writing & Spelling
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProgressRing progress={82} size={100} color="#10B981">
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-600">82%</div>
                      </div>
                    </ProgressRing>
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Letter Tracing</span>
                        <span className="font-semibold">Excellent</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Word Building</span>
                        <span className="font-semibold">Good</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Spelling</span>
                        <span className="font-semibold">Improving</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gamepad2 className="w-5 h-5 text-purple-500" />
                      Educational Games
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProgressRing progress={68} size={100} color="#8B5CF6">
                      <div className="text-center">
                        <div className="text-xl font-bold text-purple-600">68%</div>
                      </div>
                    </ProgressRing>
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Memory Match</span>
                        <span className="font-semibold">Great</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quiz Arena</span>
                        <span className="font-semibold">Good</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Word Hunt</span>
                        <span className="font-semibold">Fair</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-500" />
                      Speaking Practice
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProgressRing progress={75} size={100} color="#3B82F6">
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-600">75%</div>
                      </div>
                    </ProgressRing>
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pronunciation</span>
                        <span className="font-semibold">Excellent</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vocabulary</span>
                        <span className="font-semibold">Good</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fluency</span>
                        <span className="font-semibold">Developing</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Activities Tab */}
            <TabsContent value="activities" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'Letter Tracing - Letter A', module: 'Writing', time: '2 hours ago', score: 85, color: 'green' },
                      { name: 'Memory Match Game', module: 'Games', time: '4 hours ago', score: 92, color: 'purple' },
                      { name: 'Pronunciation Practice', module: 'Speaking', time: '1 day ago', score: 78, color: 'blue' },
                      { name: 'Word Builder', module: 'Writing', time: '1 day ago', score: 88, color: 'green' },
                      { name: 'Quiz Arena', module: 'Games', time: '2 days ago', score: 95, color: 'purple' }
                    ].map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full bg-${activity.color}-500`}></div>
                          <div>
                            <h4 className="font-semibold text-gray-800">{activity.name}</h4>
                            <p className="text-sm text-gray-600">{activity.module} • {activity.time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-800">{activity.score}%</div>
                          <div className="text-sm text-gray-500">Score</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: 'First Steps', description: 'Completed first activity', icon: '👶', earned: true },
                  { name: 'Word Master', description: 'Learned 50 new words', icon: '📚', earned: true },
                  { name: 'Speaking Star', description: 'Perfect pronunciation 10 times', icon: '🎤', earned: true },
                  { name: 'Game Champion', description: 'Won 25 games', icon: '🏆', earned: false },
                  { name: 'Streak Master', description: '7 days in a row', icon: '🔥', earned: false },
                  { name: 'Creative Writer', description: 'Completed 10 creative tasks', icon: '✍️', earned: false }
                ].map((achievement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`${achievement.earned ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
                      <CardContent className="p-6 text-center">
                        <div className={`text-4xl mb-3 ${!achievement.earned ? 'grayscale opacity-50' : ''}`}>
                          {achievement.icon}
                        </div>
                        <h3 className={`font-bold mb-2 ${achievement.earned ? 'text-gray-800' : 'text-gray-500'}`}>
                          {achievement.name}
                        </h3>
                        <p className={`text-sm ${achievement.earned ? 'text-gray-600' : 'text-gray-400'}`}>
                          {achievement.description}
                        </p>
                        {achievement.earned && (
                          <div className="mt-3 text-xs text-green-600 font-semibold">
                            ✅ Earned
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Parent Controls Tab */}
            <TabsContent value="controls" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Time Limits */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Timer className="w-5 h-5 text-orange-500" />
                      Time Management
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
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Break Reminders</Label>
                        <p className="text-sm text-gray-600">Remind child to take breaks</p>
                      </div>
                      <Switch
                        checked={parentControls.breakReminders}
                        onCheckedChange={(checked) => updateParentControls({ breakReminders: checked })}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Module Locks */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-red-500" />
                      Module Access
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(parentControls.moduleLocks).map(([module, isLocked]) => (
                      <div key={module} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isLocked ? <Lock className="w-4 h-4 text-red-500" /> : <Unlock className="w-4 h-4 text-green-500" />}
                          <span className="capitalize">{module}</span>
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
                    ))}
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
                            <Label htmlFor={filter.value} className="font-medium">{filter.label}</Label>
                            <p className="text-sm text-gray-600">{filter.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Export & Sharing */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-500" />
                      Data & Sharing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button onClick={exportProgressCSV} className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Export Progress as CSV
                    </Button>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Progress Sharing</Label>
                        <p className="text-sm text-gray-600">Share progress with teachers</p>
                      </div>
                      <Switch
                        checked={parentControls.progressSharing}
                        onCheckedChange={(checked) => updateParentControls({ progressSharing: checked })}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
