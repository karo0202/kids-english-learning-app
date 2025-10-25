// Comprehensive data persistence system for user data
export interface UserData {
  id: string
  email: string
  name: string
  accountType: 'parent' | 'child'
  createdAt: string
  lastLogin: string
  preferences: UserPreferences
}

export interface UserPreferences {
  soundEnabled: boolean
  musicEnabled: boolean
  difficulty: 'easy' | 'medium' | 'hard'
  theme: 'light' | 'dark' | 'auto'
  language: string
  notifications: boolean
  weeklyReports: boolean
}

export interface ChildData {
  id: string
  name: string
  age: number
  ageGroup: string
  parentId: string
  avatar?: string
  createdAt: string
  lastActivity: string
}

export interface ProgressData {
  childId: string
  totalScore: number
  completedActivities: string[]
  currentLevel: number
  xp: number
  coins: number
  achievements: string[]
  streaks: {
    current: number
    longest: number
    lastActivity: string
  }
  learningStats: {
    speaking: number
    reading: number
    writing: number
    games: number
  }
  lastUpdated: string
}

export interface LearningSession {
  id: string
  childId: string
  module: 'speaking' | 'reading' | 'writing' | 'games'
  activity: string
  score: number
  duration: number
  completed: boolean
  timestamp: string
}

export class DataPersistenceManager {
  private static instance: DataPersistenceManager
  private apiEndpoint: string
  private fallbackToLocal: boolean

  constructor() {
    this.apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT || '/api'
    this.fallbackToLocal = true
  }

  static getInstance(): DataPersistenceManager {
    if (!DataPersistenceManager.instance) {
      DataPersistenceManager.instance = new DataPersistenceManager()
    }
    return DataPersistenceManager.instance
  }

  // User Data Management
  async saveUser(userData: UserData): Promise<boolean> {
    try {
      // Try to save to server first
      if (this.apiEndpoint !== '/api') {
        const response = await fetch(`${this.apiEndpoint}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        })
        if (response.ok) return true
      }
    } catch (error) {
      console.warn('Server save failed, using localStorage:', error)
    }

    // Fallback to localStorage
    if (this.fallbackToLocal && typeof window !== 'undefined') {
      try {
        const users = this.getLocalUsers()
        const existingIndex = users.findIndex(u => u.id === userData.id)
        
        if (existingIndex >= 0) {
          users[existingIndex] = userData
        } else {
          users.push(userData)
        }
        
        localStorage.setItem('app_users', JSON.stringify(users))
        return true
      } catch (error) {
        console.error('Failed to save user data:', error)
        return false
      }
    }

    return false
  }

  async getUser(userId: string): Promise<UserData | null> {
    try {
      // Try server first
      if (this.apiEndpoint !== '/api') {
        const response = await fetch(`${this.apiEndpoint}/users/${userId}`)
        if (response.ok) {
          return await response.json()
        }
      }
    } catch (error) {
      console.warn('Server fetch failed, using localStorage:', error)
    }

    // Fallback to localStorage
    if (this.fallbackToLocal && typeof window !== 'undefined') {
      const users = this.getLocalUsers()
      return users.find(u => u.id === userId) || null
    }

    return null
  }

  // Child Data Management
  async saveChild(childData: ChildData): Promise<boolean> {
    try {
      // Try server first
      if (this.apiEndpoint !== '/api') {
        const response = await fetch(`${this.apiEndpoint}/children`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(childData)
        })
        if (response.ok) return true
      }
    } catch (error) {
      console.warn('Server save failed, using localStorage:', error)
    }

    // Fallback to localStorage
    if (this.fallbackToLocal && typeof window !== 'undefined') {
      try {
        const children = this.getLocalChildren()
        const existingIndex = children.findIndex(c => c.id === childData.id)
        
        if (existingIndex >= 0) {
          children[existingIndex] = childData
        } else {
          children.push(childData)
        }
        
        localStorage.setItem('app_children', JSON.stringify(children))
        return true
      } catch (error) {
        console.error('Failed to save child data:', error)
        return false
      }
    }

    return false
  }

  async getChildren(parentId: string): Promise<ChildData[]> {
    try {
      // Try server first
      if (this.apiEndpoint !== '/api') {
        const response = await fetch(`${this.apiEndpoint}/children?parentId=${parentId}`)
        if (response.ok) {
          return await response.json()
        }
      }
    } catch (error) {
      console.warn('Server fetch failed, using localStorage:', error)
    }

    // Fallback to localStorage
    if (this.fallbackToLocal && typeof window !== 'undefined') {
      const children = this.getLocalChildren()
      return children.filter(c => c.parentId === parentId)
    }

    return []
  }

  // Progress Data Management
  async saveProgress(progressData: ProgressData): Promise<boolean> {
    try {
      // Try server first
      if (this.apiEndpoint !== '/api') {
        const response = await fetch(`${this.apiEndpoint}/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(progressData)
        })
        if (response.ok) return true
      }
    } catch (error) {
      console.warn('Server save failed, using localStorage:', error)
    }

    // Fallback to localStorage
    if (this.fallbackToLocal && typeof window !== 'undefined') {
      try {
        const progress = this.getLocalProgress()
        progress[progressData.childId] = progressData
        localStorage.setItem('app_progress', JSON.stringify(progress))
        return true
      } catch (error) {
        console.error('Failed to save progress data:', error)
        return false
      }
    }

    return false
  }

  async getProgress(childId: string): Promise<ProgressData | null> {
    try {
      // Try server first
      if (this.apiEndpoint !== '/api') {
        const response = await fetch(`${this.apiEndpoint}/progress/${childId}`)
        if (response.ok) {
          return await response.json()
        }
      }
    } catch (error) {
      console.warn('Server fetch failed, using localStorage:', error)
    }

    // Fallback to localStorage
    if (this.fallbackToLocal && typeof window !== 'undefined') {
      const progress = this.getLocalProgress()
      return progress[childId] || null
    }

    return null
  }

  // Learning Session Management
  async saveSession(sessionData: LearningSession): Promise<boolean> {
    try {
      // Try server first
      if (this.apiEndpoint !== '/api') {
        const response = await fetch(`${this.apiEndpoint}/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sessionData)
        })
        if (response.ok) return true
      }
    } catch (error) {
      console.warn('Server save failed, using localStorage:', error)
    }

    // Fallback to localStorage
    if (this.fallbackToLocal && typeof window !== 'undefined') {
      try {
        const sessions = this.getLocalSessions()
        sessions.push(sessionData)
        
        // Keep only last 100 sessions to prevent storage bloat
        if (sessions.length > 100) {
          sessions.splice(0, sessions.length - 100)
        }
        
        localStorage.setItem('app_sessions', JSON.stringify(sessions))
        return true
      } catch (error) {
        console.error('Failed to save session data:', error)
        return false
      }
    }

    return false
  }

  async getSessions(childId: string, limit: number = 50): Promise<LearningSession[]> {
    try {
      // Try server first
      if (this.apiEndpoint !== '/api') {
        const response = await fetch(`${this.apiEndpoint}/sessions?childId=${childId}&limit=${limit}`)
        if (response.ok) {
          return await response.json()
        }
      }
    } catch (error) {
      console.warn('Server fetch failed, using localStorage:', error)
    }

    // Fallback to localStorage
    if (this.fallbackToLocal && typeof window !== 'undefined') {
      const sessions = this.getLocalSessions()
      return sessions
        .filter(s => s.childId === childId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit)
    }

    return []
  }

  // Data Export/Import
  async exportUserData(userId: string): Promise<string> {
    const user = await this.getUser(userId)
    const children = await this.getChildren(userId)
    const allProgress: { [childId: string]: ProgressData } = {}
    const allSessions: LearningSession[] = []

    for (const child of children) {
      const progress = await this.getProgress(child.id)
      if (progress) allProgress[child.id] = progress

      const sessions = await this.getSessions(child.id, 1000)
      allSessions.push(...sessions)
    }

    const exportData = {
      user,
      children,
      progress: allProgress,
      sessions: allSessions,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }

    return JSON.stringify(exportData, null, 2)
  }

  async importUserData(data: string): Promise<boolean> {
    try {
      const importData = JSON.parse(data)
      
      // Validate data structure
      if (!importData.user || !importData.children) {
        throw new Error('Invalid data format')
      }

      // Save user
      await this.saveUser(importData.user)

      // Save children
      for (const child of importData.children) {
        await this.saveChild(child)
      }

      // Save progress
      if (importData.progress) {
        for (const [childId, progress] of Object.entries(importData.progress)) {
          await this.saveProgress(progress as ProgressData)
        }
      }

      // Save sessions
      if (importData.sessions) {
        for (const session of importData.sessions) {
          await this.saveSession(session)
        }
      }

      return true
    } catch (error) {
      console.error('Failed to import user data:', error)
      return false
    }
  }

  // Local storage helpers
  private getLocalUsers(): UserData[] {
    if (typeof window === 'undefined') return []
    try {
      return JSON.parse(localStorage.getItem('app_users') || '[]')
    } catch {
      return []
    }
  }

  private getLocalChildren(): ChildData[] {
    if (typeof window === 'undefined') return []
    try {
      return JSON.parse(localStorage.getItem('app_children') || '[]')
    } catch {
      return []
    }
  }

  private getLocalProgress(): { [childId: string]: ProgressData } {
    if (typeof window === 'undefined') return {}
    try {
      return JSON.parse(localStorage.getItem('app_progress') || '{}')
    } catch {
      return {}
    }
  }

  private getLocalSessions(): LearningSession[] {
    if (typeof window === 'undefined') return []
    try {
      return JSON.parse(localStorage.getItem('app_sessions') || '[]')
    } catch {
      return []
    }
  }

  // Data cleanup
  async cleanupOldData(daysToKeep: number = 30): Promise<void> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    if (typeof window !== 'undefined') {
      try {
        const sessions = this.getLocalSessions()
        const filteredSessions = sessions.filter(
          session => new Date(session.timestamp) > cutoffDate
        )
        localStorage.setItem('app_sessions', JSON.stringify(filteredSessions))
      } catch (error) {
        console.error('Failed to cleanup old data:', error)
      }
    }
  }
}

// Export singleton instance
export const dataPersistence = DataPersistenceManager.getInstance()
