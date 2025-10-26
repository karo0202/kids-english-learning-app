'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, Clock, Target, Star, BookOpen, 
  Mic, PenTool, Gamepad2, Trophy, Calendar,
  Download, Share2, BarChart3
} from 'lucide-react'

interface ChildProgress {
  id: string
  name: string
  totalScore: number
  completedActivities: number
  streak: number
  lastActive: string
  achievements: string[]
  moduleProgress: {
    speaking: number
    writing: number
    reading: number
    games: number
  }
}

export default function ParentAnalytics() {
  const [children, setChildren] = useState<ChildProgress[]>([])
  const [selectedChild, setSelectedChild] = useState<string>('')
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week')

  useEffect(() => {
    // Mock data - in real app, this would come from API
    const mockChildren: ChildProgress[] = [
      {
        id: 'child_1',
        name: 'Emma',
        totalScore: 1250,
        completedActivities: 45,
        streak: 7,
        lastActive: '2 hours ago',
        achievements: ['First Words', 'Perfect Week', 'Reading Star'],
        moduleProgress: {
          speaking: 85,
          writing: 70,
          reading: 90,
          games: 95
        }
      },
      {
        id: 'child_2',
        name: 'Liam',
        totalScore: 980,
        completedActivities: 32,
        streak: 3,
        lastActive: '1 day ago',
        achievements: ['Letter Master', 'Game Champion'],
        moduleProgress: {
          speaking: 60,
          writing: 85,
          reading: 75,
          games: 100
        }
      }
    ]
    setChildren(mockChildren)
    if (mockChildren.length > 0) {
      setSelectedChild(mockChildren[0].id)
    }
  }, [])

  const currentChild = children.find(child => child.id === selectedChild)

  const exportReport = () => {
    if (!currentChild) return
    
    const report = {
      childName: currentChild.name,
      generatedAt: new Date().toISOString(),
      totalScore: currentChild.totalScore,
      completedActivities: currentChild.completedActivities,
      streak: currentChild.streak,
      moduleProgress: currentChild.moduleProgress,
      achievements: currentChild.achievements
    }
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentChild.name}-progress-report.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (children.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="text-center p-8">
            <CardContent>
              <BookOpen className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No Children Added Yet</h2>
              <p className="text-gray-600 mb-6">Add a child to start tracking their learning progress.</p>
              <Button onClick={() => window.location.href = '/add-child'}>
                Add First Child
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Learning Analytics</h1>
            <p className="text-gray-600">Track your children's progress and achievements</p>
          </div>
          
          <div className="flex gap-3 mt-4 md:mt-0">
            <Button variant="outline" onClick={exportReport}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Child Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Child</label>
          <div className="flex gap-2">
            {children.map(child => (
              <Button
                key={child.id}
                variant={selectedChild === child.id ? 'default' : 'outline'}
                onClick={() => setSelectedChild(child.id)}
                className="flex items-center gap-2"
              >
                <Star className="w-4 h-4" />
                {child.name}
              </Button>
            ))}
          </div>
        </div>

        {currentChild && (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Total Score</p>
                        <p className="text-3xl font-bold">{currentChild.totalScore}</p>
                      </div>
                      <Trophy className="w-8 h-8 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">Activities</p>
                        <p className="text-3xl font-bold">{currentChild.completedActivities}</p>
                      </div>
                      <Target className="w-8 h-8 text-green-200" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm">Streak</p>
                        <p className="text-3xl font-bold">{currentChild.streak} days</p>
                      </div>
                      <Calendar className="w-8 h-8 text-orange-200" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm">Last Active</p>
                        <p className="text-lg font-bold">{currentChild.lastActive}</p>
                      </div>
                      <Clock className="w-8 h-8 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Module Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Module Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(currentChild.moduleProgress).map(([module, progress]) => {
                      const icons = {
                        speaking: <Mic className="w-5 h-5" />,
                        writing: <PenTool className="w-5 h-5" />,
                        reading: <BookOpen className="w-5 h-5" />,
                        games: <Gamepad2 className="w-5 h-5" />
                      }
                      
                      return (
                        <div key={module} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {icons[module as keyof typeof icons]}
                              <span className="font-medium capitalize">{module}</span>
                            </div>
                            <span className="text-sm text-gray-600">{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {currentChild.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                        <Trophy className="w-6 h-6 text-yellow-500" />
                        <span className="font-medium text-gray-800">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}
