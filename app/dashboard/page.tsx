'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getUserSession, clearUserSession } from '@/lib/simple-auth'
import { getChildren, addChild, deleteChild, Child } from '@/lib/children'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Mic, PenTool, Gamepad2, BookOpen, Settings, LogOut, User, Plus, Trash2
} from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddingChild, setIsAddingChild] = useState(false)
  const [newChildName, setNewChildName] = useState('')
  const [newChildAge, setNewChildAge] = useState<number | ''>('')

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const currentUser = getUserSession()
      if (!currentUser) {
        console.log('No user session found, redirecting to login')
        router.push('/login')
        return
      }
      console.log('User session found:', currentUser)
      setUser(currentUser)
      
      // Load children for this specific user
      const userChildren = getChildren(currentUser.id)
      setChildren(userChildren)
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [router])

  const handleLogout = () => {
    // Use the centralized logout function that preserves children data
    clearUserSession()
    router.push('/')
  }

  const handleAddChild = () => {
    if (user && newChildName && newChildAge) {
      const newChild = addChild(user.id, newChildName, newChildAge as number)
      setChildren(prev => [...prev, newChild])
      setNewChildName('')
      setNewChildAge('')
      setIsAddingChild(false)
    }
  }

  const handleDeleteChild = (childId: string) => {
    if (user && confirm('Are you sure you want to delete this child profile?')) {
      const success = deleteChild(user.id, childId)
      if (success) {
        setChildren(prev => prev.filter(child => child.id !== childId))
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // If no user after loading, show login prompt
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please log in</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to access the dashboard.</p>
          <Button 
            onClick={() => router.push('/login')}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-violet-900">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-50 dark:bg-white/5 dark:border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-2xl">🎓</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Kids English Learning</h1>
                <p className="text-gray-600 dark:text-white/70">Welcome back, {user?.name || 'Parent'}!</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => router.push('/settings')}>
                <Settings className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Children Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Your Children</h2>
            <Button 
              onClick={() => setIsAddingChild(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Child
            </Button>
          </div>

          {isAddingChild && (
            <Card className="mb-6 p-6 dark:bg-white/5 dark:border-white/10">
              <CardContent>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Add New Child</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Child's Name"
                    value={newChildName}
                    onChange={(e) => setNewChildName(e.target.value)}
                    className="text-lg"
                  />
                  <Input
                    type="number"
                    placeholder="Child's Age"
                    value={newChildAge}
                    onChange={(e) => setNewChildAge(parseInt(e.target.value) || '')}
                    className="text-lg"
                    min="3"
                    max="12"
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <Button 
                    onClick={handleAddChild}
                    disabled={!newChildName || !newChildAge}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Add Child
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setIsAddingChild(false)
                      setNewChildName('')
                      setNewChildAge('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {children.length === 0 && !isAddingChild ? (
            <Card className="text-center py-12 dark:bg-white/5 dark:border-white/10">
              <CardContent>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                  <User className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No children added yet</h3>
                <p className="text-gray-600 dark:text-white/70 mb-6">Add your first child to start their learning journey!</p>
                <Button 
                  onClick={() => setIsAddingChild(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Add Your First Child
                </Button>
              </CardContent>
            </Card>
          ) : children.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {children.map((child) => (
                <Card key={child.id} className="hover:shadow-lg transition-shadow relative dark:bg-[#0b1020] dark:border-white/10">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                        <span className="text-2xl">👶</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{child.name}</h3>
                      <p className="text-gray-600 dark:text-white/70">{child.age} years old</p>
                      <div className="flex gap-2 mt-4">
                        <Button 
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                          onClick={() => router.push('/learning')}
                        >
                          Start Learning
                        </Button>
                        <Button 
                          variant="outline"
                          size="icon"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 border-red-200"
                          onClick={() => handleDeleteChild(child.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}
        </div>

        {/* Learning Modules */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Learning Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card className="cursor-pointer hover:shadow-lg transition-all dark:bg-white/5 dark:border-white/10" onClick={() => router.push('/learning/reading')}>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Reading</h3>
                  <p className="text-gray-600 dark:text-white/70 text-sm">Stories and vocabulary</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card className="cursor-pointer hover:shadow-lg transition-all dark:bg-white/5 dark:border-white/10" onClick={() => router.push('/learning/writing')}>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                    <PenTool className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Writing</h3>
                  <p className="text-gray-600 dark:text-white/70 text-sm">Letter tracing and spelling</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card className="cursor-pointer hover:shadow-lg transition-all dark:bg-white/5 dark:border-white/10" onClick={() => router.push('/learning/speaking')}>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                    <Mic className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Speaking</h3>
                  <p className="text-gray-600 dark:text-white/70 text-sm">Pronunciation practice</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card className="cursor-pointer hover:shadow-lg transition-all dark:bg-white/5 dark:border-white/10" onClick={() => router.push('/learning/games')}>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-100 flex items-center justify-center">
                    <Gamepad2 className="w-8 h-8 text-pink-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Games</h3>
                  <p className="text-gray-600 dark:text-white/70 text-sm">Interactive learning games</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center py-6 dark:bg-white/5 dark:border-white/10">
              <CardContent>
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-2xl">📚</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">12</h3>
                <p className="text-gray-600 dark:text-white/70">Lessons Completed</p>
              </CardContent>
            </Card>
            <Card className="text-center py-6 dark:bg-white/5 dark:border-white/10">
              <CardContent>
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">5</h3>
                <p className="text-gray-600 dark:text-white/70">Achievements</p>
              </CardContent>
            </Card>
            <Card className="text-center py-6 dark:bg-white/5 dark:border-white/10">
              <CardContent>
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-2xl">🔥</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">7</h3>
                <p className="text-gray-600 dark:text-white/70">Day Streak</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}