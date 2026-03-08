// Progress persistence and user data management
import { dataPersistence } from './data-persistence'

export type ProgressModule = 'writing' | 'reading' | 'speaking' | 'games' | 'puzzle' | 'grammar'

export interface ModuleStats {
  writing: number
  reading: number
  speaking: number
  games: number
  puzzle: number
  grammar: number
}

export interface UserProgress {
  userId: string
  totalScore: number
  completedActivities: number
  currentStreak: number
  longestStreak: number
  lastActivityDate: string
  achievements: string[]
  level: number
  xp: number
  coins: number
  unlockedContent: string[]
  /** Per-module activity count (and optional score) for parent progress view */
  moduleStats?: ModuleStats
  preferences: {
    soundEnabled: boolean
    musicEnabled: boolean
    difficulty: 'easy' | 'medium' | 'hard'
    theme: 'light' | 'dark' | 'auto'
  }
}

export interface ActivityProgress {
  activityId: string
  moduleType: 'speaking' | 'writing' | 'reading' | 'games'
  completed: boolean
  score: number
  attempts: number
  bestScore: number
  lastPlayed: string
  timeSpent: number
}

export class ProgressManager {
  private static instance: ProgressManager
  private progress: UserProgress | null = null
  private activities: Map<string, ActivityProgress> = new Map()

  private constructor() {}

  static getInstance(): ProgressManager {
    if (!ProgressManager.instance) {
      ProgressManager.instance = new ProgressManager()
    }
    return ProgressManager.instance
  }

  // Initialize progress for new user
  initializeProgress(userId: string): UserProgress {
    const progress: UserProgress = {
      userId,
      totalScore: 0,
      completedActivities: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: new Date().toISOString().split('T')[0],
      achievements: [],
      level: 1,
      xp: 0,
      coins: 100,
      unlockedContent: ['basic_letters', 'basic_words'],
      moduleStats: { writing: 0, reading: 0, speaking: 0, games: 0, puzzle: 0, grammar: 0 },
      preferences: {
        soundEnabled: true,
        musicEnabled: true,
        difficulty: 'easy',
        theme: 'light'
      }
    }

    this.progress = progress
    this.saveProgress()
    return progress
  }

  // Load progress from localStorage
  loadProgress(userId: string): UserProgress | null {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(`progress_${userId}`)
        if (saved) {
          const parsed = JSON.parse(saved) as UserProgress
          if (!parsed.moduleStats) {
            parsed.moduleStats = { writing: 0, reading: 0, speaking: 0, games: 0, puzzle: 0, grammar: 0 }
          }
          this.progress = parsed
          return this.progress
        }
      }
    } catch (error) {
      console.error('Error loading progress:', error)
    }
    return null
  }

  // Save progress to localStorage and persistence layer
  saveProgress(): void {
    if (this.progress && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`progress_${this.progress.userId}`, JSON.stringify(this.progress))
        const ms = this.progress.moduleStats ?? { writing: 0, reading: 0, speaking: 0, games: 0, puzzle: 0, grammar: 0 }
        // Also save to persistence layer
        dataPersistence.saveProgress({
          childId: this.progress.userId,
          totalScore: this.progress.totalScore,
          completedActivities: [], // Convert to array format
          currentLevel: this.progress.level,
          xp: this.progress.xp,
          coins: this.progress.coins,
          achievements: this.progress.achievements,
          streaks: {
            current: this.progress.currentStreak,
            longest: this.progress.longestStreak,
            lastActivity: this.progress.lastActivityDate
          },
          learningStats: {
            speaking: ms.speaking,
            reading: ms.reading,
            writing: ms.writing,
            games: ms.games
          },
          lastUpdated: new Date().toISOString()
        }).catch(error => {
          console.warn('Failed to save progress to persistence layer:', error)
        })
      } catch (error) {
        console.error('Error saving progress:', error)
      }
    }
  }

  // Update streak
  updateStreak(): void {
    if (!this.progress) return

    const today = new Date().toISOString().split('T')[0]
    const lastDate = this.progress.lastActivityDate

    if (lastDate === today) {
      // Already played today
      return
    }

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    if (lastDate === yesterdayStr) {
      // Consecutive day
      this.progress.currentStreak++
    } else if (lastDate !== today) {
      // Streak broken
      this.progress.currentStreak = 1
    }

    this.progress.longestStreak = Math.max(this.progress.longestStreak, this.progress.currentStreak)
    this.progress.lastActivityDate = today
    this.saveProgress()
  }

  // Record progress in a specific module (for parent progress view). Call when child completes an activity.
  addModuleProgress(module: ProgressModule, activitiesCount: number = 1): void {
    if (!this.progress) return
    if (!this.progress.moduleStats) {
      this.progress.moduleStats = { writing: 0, reading: 0, speaking: 0, games: 0, puzzle: 0, grammar: 0 }
    }
    this.progress.moduleStats[module] = (this.progress.moduleStats[module] ?? 0) + activitiesCount
    this.saveProgress()
  }

  // Add score and XP
  addScore(points: number, xpGained: number = 0): { leveledUp: boolean; newLevel: number } | void {
    if (!this.progress) return

    this.progress.totalScore += points
    this.progress.xp += xpGained

    // Check for level up
    const xpNeeded = this.progress.level * 100
    if (this.progress.xp >= xpNeeded) {
      this.progress.level++
      this.progress.coins += 50 // Bonus coins for leveling up
      this.saveProgress()
      return { leveledUp: true, newLevel: this.progress.level }
    }

    this.saveProgress()
  }

  // Complete activity
  completeActivity(activityId: string, moduleType: 'speaking' | 'writing' | 'reading' | 'games', score: number, timeSpent: number): void {
    if (!this.progress) return

    const existing = this.activities.get(activityId)
    const activity: ActivityProgress = {
      activityId,
      moduleType,
      completed: true,
      score,
      attempts: (existing?.attempts || 0) + 1,
      bestScore: Math.max(existing?.bestScore || 0, score),
      lastPlayed: new Date().toISOString(),
      timeSpent: (existing?.timeSpent || 0) + timeSpent
    }

    this.activities.set(activityId, activity)
    this.progress.completedActivities++
    this.updateStreak()

    // Check for achievements
    this.checkAchievements()

    this.saveProgress()
  }

  // Check and unlock achievements
  private checkAchievements(): string[] {
    if (!this.progress) return []

    const achievements = this.progress.achievements
    const newAchievements: string[] = []

    // First activity achievement
    if (this.progress.completedActivities === 1 && !achievements.includes('first_activity')) {
      newAchievements.push('first_activity')
    }

    // Streak achievements
    if (this.progress.currentStreak >= 7 && !achievements.includes('week_streak')) {
      newAchievements.push('week_streak')
    }

    // Score achievements
    if (this.progress.totalScore >= 1000 && !achievements.includes('score_master')) {
      newAchievements.push('score_master')
    }

    // Level achievements
    if (this.progress.level >= 5 && !achievements.includes('level_explorer')) {
      newAchievements.push('level_explorer')
    }

    // Add new achievements
    achievements.push(...newAchievements)
    this.progress.achievements = [...new Set(achievements)]

    return newAchievements
  }

  // Get current progress
  getProgress(): UserProgress | null {
    return this.progress
  }

  /** Read progress for a specific child without switching current user (for parent dashboard). */
  getProgressForChild(childId: string): UserProgress | null {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(`progress_${childId}`)
        if (saved) {
          const parsed = JSON.parse(saved) as UserProgress
          if (!parsed.moduleStats) {
            parsed.moduleStats = { writing: 0, reading: 0, speaking: 0, games: 0, puzzle: 0, grammar: 0 }
          }
          return parsed
        }
      }
    } catch (error) {
      console.error('Error reading progress for child:', error)
    }
    return null
  }

  // Get activity progress
  getActivityProgress(activityId: string): ActivityProgress | null {
    return this.activities.get(activityId) || null
  }

  // Update preferences
  updatePreferences(preferences: Partial<UserProgress['preferences']>): void {
    if (!this.progress) return

    this.progress.preferences = { ...this.progress.preferences, ...preferences }
    this.saveProgress()
  }
}

export const progressManager = ProgressManager.getInstance()
