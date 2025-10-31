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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-purple-200 dark:border-purple-800 mx-auto mb-4"></div>
            <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-purple-500 dark:border-purple-400 absolute top-0 left-1/2 -translate-x-1/2"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">Loading your dashboard...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-violet-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md border-b border-purple-100/50 dark:border-white/10 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div 
                className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-violet-500 flex items-center justify-center shadow-lg animate-glow"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="text-2xl">🎓</span>
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-pink-400">Kids English Learning</h1>
                <p className="text-gray-600 dark:text-white/70">Welcome back, {user?.name || 'Parent'}! ✨</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => router.push('/settings')}
                className="hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-xl"
              >
                <Settings className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                className="hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Children Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Your Children</h2>
            <Button 
              onClick={() => setIsAddingChild(true)}
              className="btn-primary-kid"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Child
            </Button>
          </div>

          {isAddingChild && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="card-kid mb-6 p-6">
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
                    className="btn-primary-kid"
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
                    className="border-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          )}

          {children.length === 0 && !isAddingChild ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="card-kid text-center py-12">
                <CardContent>
                  <motion.div 
                    className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-violet-500 flex items-center justify-center shadow-lg"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <User className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No children added yet</h3>
                  <p className="text-gray-600 dark:text-white/70 mb-6">Add your first child to start their learning journey!</p>
                  <Button 
                    onClick={() => setIsAddingChild(true)}
                    className="btn-primary-kid"
                  >
                    Add Your First Child
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : children.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {children.map((child, index) => (
                <motion.div
                  key={child.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="card-kid relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-pink-500/0 to-violet-500/0 group-hover:from-purple-500/10 group-hover:via-pink-500/10 group-hover:to-violet-500/10 transition-all duration-500"></div>
                    <CardContent className="p-6 relative">
                      <div className="text-center">
                        <motion.div 
                          className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-400 via-purple-400 to-violet-500 flex items-center justify-center shadow-lg"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <span className="text-2xl">👶</span>
                        </motion.div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">{child.name}</h3>
                        <p className="text-gray-600 dark:text-white/70 mb-4">{child.age} years old</p>
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1 btn-primary-kid"
                            onClick={() => router.push('/learning')}
                          >
                            Start Learning
                          </Button>
                          <Button 
                            variant="outline"
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 border-red-200 rounded-xl"
                            onClick={() => handleDeleteChild(child.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Learning Modules */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">Learning Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card className="card-kid cursor-pointer group relative overflow-hidden" onClick={() => router.push('/learning/reading')}>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-600/0 group-hover:from-blue-500/10 group-hover:to-blue-600/10 transition-all duration-500"></div>
                <CardContent className="p-6 text-center relative">
                  <motion.div 
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <BookOpen className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Reading</h3>
                  <p className="text-gray-600 dark:text-white/70 text-sm">Stories and vocabulary</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card className="card-kid cursor-pointer group relative overflow-hidden" onClick={() => router.push('/learning/writing')}>
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-emerald-600/0 group-hover:from-green-500/10 group-hover:to-emerald-600/10 transition-all duration-500"></div>
                <CardContent className="p-6 text-center relative">
                  <motion.div 
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <PenTool className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Writing</h3>
                  <p className="text-gray-600 dark:text-white/70 text-sm">Letter tracing and spelling</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card className="card-kid cursor-pointer group relative overflow-hidden" onClick={() => router.push('/learning/speaking')}>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-600/0 group-hover:from-purple-500/10 group-hover:to-pink-600/10 transition-all duration-500"></div>
                <CardContent className="p-6 text-center relative">
                  <motion.div 
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center shadow-lg"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Mic className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Speaking</h3>
                  <p className="text-gray-600 dark:text-white/70 text-sm">Pronunciation practice</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card className="card-kid cursor-pointer group relative overflow-hidden" onClick={() => router.push('/learning/games')}>
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-rose-600/0 group-hover:from-pink-500/10 group-hover:to-rose-600/10 transition-all duration-500"></div>
                <CardContent className="p-6 text-center relative">
                  <motion.div 
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center shadow-lg"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Gamepad2 className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Games</h3>
                  <p className="text-gray-600 dark:text-white/70 text-sm">Interactive learning games</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Card className="card-kid text-center py-6 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-600/0 group-hover:from-blue-500/10 group-hover:to-cyan-600/10 transition-all duration-500"></div>
                <CardContent className="relative">
                  <motion.div 
                    className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                  >
                    <span className="text-2xl">📚</span>
                  </motion.div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">12</h3>
                  <p className="text-gray-600 dark:text-white/70 font-medium">Lessons Completed</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Card className="card-kid text-center py-6 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-emerald-600/0 group-hover:from-green-500/10 group-hover:to-emerald-600/10 transition-all duration-500"></div>
                <CardContent className="relative">
                  <motion.div 
                    className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  >
                    <span className="text-2xl">🏆</span>
                  </motion.div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">5</h3>
                  <p className="text-gray-600 dark:text-white/70 font-medium">Achievements</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Card className="card-kid text-center py-6 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-600/0 group-hover:from-purple-500/10 group-hover:to-pink-600/10 transition-all duration-500"></div>
                <CardContent className="relative">
                  <motion.div 
                    className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  >
                    <span className="text-2xl">🔥</span>
                  </motion.div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">7</h3>
                  <p className="text-gray-600 dark:text-white/70 font-medium">Day Streak</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}