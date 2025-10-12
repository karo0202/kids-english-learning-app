'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getUserSession } from '@/lib/simple-auth'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { 
  Mic, PenTool, Gamepad2, BookOpen, ArrowLeft, Star, Trophy
} from 'lucide-react'

export default function LearningPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [children, setChildren] = useState<any[]>([])
  const [selectedChild, setSelectedChild] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = getUserSession()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)
    
    // Load children from localStorage
    const storedChildren = JSON.parse(localStorage.getItem('children') || '[]')
    setChildren(storedChildren)
    
    if (storedChildren.length > 0) {
      setSelectedChild(storedChildren[0])
    }
    
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (children.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-3xl">👶</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Children Added</h2>
            <p className="text-gray-600 mb-6">Please add a child first to start learning!</p>
            <Button 
              onClick={() => router.push('/add-child')}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Add Your First Child
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Learning Center</h1>
                <p className="text-gray-600">Welcome, {selectedChild?.name || 'Student'}!</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full">
                <Star className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">100 XP</span>
              </div>
              <div className="flex items-center gap-1 bg-blue-100 px-3 py-1 rounded-full">
                <Trophy className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Level 1</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Child Selector */}
        {children.length > 1 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Child</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {children.map((child) => (
                <Button
                  key={child.id}
                  variant={selectedChild?.id === child.id ? "default" : "outline"}
                  onClick={() => setSelectedChild(child)}
                  className="whitespace-nowrap"
                >
                  {child.name} ({child.age} years old)
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Learning Modules */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Choose Your Learning Adventure!</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
                onClick={() => router.push('/learning/reading')}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-500 flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">📚 Reading</h3>
                  <p className="text-gray-600 mb-4">Stories, vocabulary, and comprehension</p>
                  <div className="text-sm text-blue-600 font-medium">Start Reading →</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all bg-gradient-to-br from-green-50 to-green-100 border-green-200"
                onClick={() => router.push('/learning/writing')}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500 flex items-center justify-center">
                    <PenTool className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">✏️ Writing</h3>
                  <p className="text-gray-600 mb-4">Letter tracing and spelling practice</p>
                  <div className="text-sm text-green-600 font-medium">Start Writing →</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
                onClick={() => router.push('/learning/speaking')}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-500 flex items-center justify-center">
                    <Mic className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">🎤 Speaking</h3>
                  <p className="text-gray-600 mb-4">Pronunciation and conversation</p>
                  <div className="text-sm text-purple-600 font-medium">Start Speaking →</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200"
                onClick={() => router.push('/learning/games')}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-pink-500 flex items-center justify-center">
                    <Gamepad2 className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">🎮 Games</h3>
                  <p className="text-gray-600 mb-4">Fun interactive learning games</p>
                  <div className="text-sm text-pink-600 font-medium">Start Playing →</div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Today's Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-600">Lessons Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">New Words Learned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">Minutes Learning</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
