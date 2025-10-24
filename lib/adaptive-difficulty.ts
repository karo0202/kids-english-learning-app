// Adaptive difficulty system for personalized learning
export interface DifficultyLevel {
  level: number // 1-5 scale
  name: string
  description: string
  characteristics: string[]
  contentModifiers: {
    timeLimit?: number
    hints?: number
    attempts?: number
    complexity?: number
  }
}

export interface PerformanceSnapshot {
  timestamp: string
  module: string
  activity: string
  accuracy: number
  speed: number
  engagement: number
  timeSpent: number
  attempts: number
  hintsUsed: number
}

export interface AdaptiveSettings {
  childId: string
  currentDifficulty: number
  performanceHistory: PerformanceSnapshot[]
  learningCurve: number
  adjustmentSensitivity: number
  lastAdjustment: string
}

class AdaptiveDifficultyManager {
  private settings: Map<string, AdaptiveSettings> = new Map()
  private difficultyLevels: DifficultyLevel[] = []

  constructor() {
    this.initializeDifficultyLevels()
  }

  private initializeDifficultyLevels(): void {
    this.difficultyLevels = [
      {
        level: 1,
        name: 'Very Easy',
        description: 'Perfect for beginners with lots of support',
        characteristics: ['unlimited attempts', 'many hints', 'slow pace', 'visual cues'],
        contentModifiers: {
          timeLimit: 0, // No time limit
          hints: 5,
          attempts: 10,
          complexity: 0.3
        }
      },
      {
        level: 2,
        name: 'Easy',
        description: 'Good for building confidence',
        characteristics: ['multiple attempts', 'some hints', 'moderate pace'],
        contentModifiers: {
          timeLimit: 60,
          hints: 3,
          attempts: 5,
          complexity: 0.5
        }
      },
      {
        level: 3,
        name: 'Medium',
        description: 'Balanced challenge for steady progress',
        characteristics: ['limited attempts', 'few hints', 'normal pace'],
        contentModifiers: {
          timeLimit: 45,
          hints: 2,
          attempts: 3,
          complexity: 0.7
        }
      },
      {
        level: 4,
        name: 'Hard',
        description: 'Challenging for advanced learners',
        characteristics: ['strict attempts', 'minimal hints', 'fast pace'],
        contentModifiers: {
          timeLimit: 30,
          hints: 1,
          attempts: 2,
          complexity: 0.9
        }
      },
      {
        level: 5,
        name: 'Expert',
        description: 'Maximum challenge for mastery',
        characteristics: ['no hints', 'single attempt', 'very fast pace'],
        contentModifiers: {
          timeLimit: 20,
          hints: 0,
          attempts: 1,
          complexity: 1.0
        }
      }
    ]
  }

  // Initialize adaptive settings for a child
  initializeSettings(childId: string): AdaptiveSettings {
    const settings: AdaptiveSettings = {
      childId,
      currentDifficulty: 2, // Start with easy
      performanceHistory: [],
      learningCurve: 0.1, // Conservative adjustment
      adjustmentSensitivity: 0.7,
      lastAdjustment: new Date().toISOString()
    }

    this.settings.set(childId, settings)
    this.saveSettings(settings)
    return settings
  }

  // Get current difficulty settings
  getSettings(childId: string): AdaptiveSettings {
    return this.settings.get(childId) || this.loadSettings(childId) || this.initializeSettings(childId)
  }

  // Record performance and adjust difficulty
  recordPerformance(childId: string, snapshot: PerformanceSnapshot): void {
    const settings = this.getSettings(childId)
    
    // Add to performance history
    settings.performanceHistory.push(snapshot)
    
    // Keep only recent history (last 20 activities)
    if (settings.performanceHistory.length > 20) {
      settings.performanceHistory = settings.performanceHistory.slice(-20)
    }

    // Analyze performance and adjust difficulty
    const newDifficulty = this.calculateOptimalDifficulty(settings)
    
    if (newDifficulty !== settings.currentDifficulty) {
      settings.currentDifficulty = newDifficulty
      settings.lastAdjustment = new Date().toISOString()
      
      // Save updated settings
      this.settings.set(childId, settings)
      this.saveSettings(settings)
    }
  }

  // Calculate optimal difficulty based on performance
  private calculateOptimalDifficulty(settings: AdaptiveSettings): number {
    const recent = settings.performanceHistory.slice(-5) // Last 5 activities
    if (recent.length === 0) return settings.currentDifficulty

    // Calculate performance metrics
    const avgAccuracy = recent.reduce((sum, p) => sum + p.accuracy, 0) / recent.length
    const avgSpeed = recent.reduce((sum, p) => sum + p.speed, 0) / recent.length
    const avgEngagement = recent.reduce((sum, p) => sum + p.engagement, 0) / recent.length
    const avgAttempts = recent.reduce((sum, p) => sum + p.attempts, 0) / recent.length

    let adjustment = 0

    // Accuracy-based adjustment
    if (avgAccuracy > 0.9) {
      adjustment += 0.5 // Increase difficulty
    } else if (avgAccuracy < 0.6) {
      adjustment -= 0.5 // Decrease difficulty
    }

    // Speed-based adjustment
    if (avgSpeed > 0.8) {
      adjustment += 0.3
    } else if (avgSpeed < 0.4) {
      adjustment -= 0.3
    }

    // Engagement-based adjustment
    if (avgEngagement < 0.5) {
      adjustment -= 0.4 // Too hard, decrease
    } else if (avgEngagement > 0.9) {
      adjustment += 0.2 // Very engaged, can handle more
    }

    // Attempts-based adjustment
    if (avgAttempts > 4) {
      adjustment -= 0.3 // Too many attempts, too hard
    } else if (avgAttempts < 1.5) {
      adjustment += 0.2 // Very few attempts, might be too easy
    }

    // Apply sensitivity and learning curve
    const finalAdjustment = adjustment * settings.adjustmentSensitivity * settings.learningCurve
    const newDifficulty = Math.max(1, Math.min(5, settings.currentDifficulty + finalAdjustment))

    return Math.round(newDifficulty)
  }

  // Get current difficulty level
  getCurrentDifficultyLevel(childId: string): DifficultyLevel {
    const settings = this.getSettings(childId)
    return this.difficultyLevels.find(level => level.level === settings.currentDifficulty) || this.difficultyLevels[1]
  }

  // Get content modifiers for current difficulty
  getContentModifiers(childId: string): DifficultyLevel['contentModifiers'] {
    const difficultyLevel = this.getCurrentDifficultyLevel(childId)
    return difficultyLevel.contentModifiers
  }

  // Get personalized content based on difficulty
  getPersonalizedContent(childId: string, baseContent: any): any {
    const modifiers = this.getContentModifiers(childId)
    const settings = this.getSettings(childId)

    // Apply difficulty modifiers to content
    const personalizedContent = {
      ...baseContent,
      timeLimit: modifiers.timeLimit,
      maxAttempts: modifiers.attempts,
      maxHints: modifiers.hints,
      complexity: modifiers.complexity,
      adaptiveSettings: {
        currentDifficulty: settings.currentDifficulty,
        learningCurve: settings.learningCurve,
        lastAdjustment: settings.lastAdjustment
      }
    }

    return personalizedContent
  }

  // Get difficulty progression insights
  getDifficultyInsights(childId: string): {
    currentLevel: number
    progression: number
    recommendations: string[]
    nextMilestone: string
  } {
    const settings = this.getSettings(childId)
    const recent = settings.performanceHistory.slice(-10)
    
    const progression = this.calculateProgression(settings)
    const recommendations = this.generateRecommendations(settings, recent)
    const nextMilestone = this.getNextMilestone(settings.currentDifficulty)

    return {
      currentLevel: settings.currentDifficulty,
      progression,
      recommendations,
      nextMilestone
    }
  }

  private calculateProgression(settings: AdaptiveSettings): number {
    const history = settings.performanceHistory
    if (history.length < 3) return 0

    const recent = history.slice(-3)
    const older = history.slice(-6, -3)
    
    if (older.length === 0) return 0

    const recentAvg = recent.reduce((sum, p) => sum + p.accuracy, 0) / recent.length
    const olderAvg = older.reduce((sum, p) => sum + p.accuracy, 0) / older.length

    return Math.max(0, Math.min(1, (recentAvg - olderAvg) * 2))
  }

  private generateRecommendations(settings: AdaptiveSettings, recent: PerformanceSnapshot[]): string[] {
    const recommendations: string[] = []
    const avgAccuracy = recent.reduce((sum, p) => sum + p.accuracy, 0) / recent.length
    const avgEngagement = recent.reduce((sum, p) => sum + p.engagement, 0) / recent.length

    if (avgAccuracy > 0.9 && settings.currentDifficulty < 5) {
      recommendations.push("Great job! You're ready for more challenging content.")
    }

    if (avgEngagement < 0.6) {
      recommendations.push("Let's try a different approach to keep you engaged.")
    }

    if (recent.some(p => p.attempts > 5)) {
      recommendations.push("Take your time and think through each step carefully.")
    }

    return recommendations
  }

  private getNextMilestone(currentLevel: number): string {
    const milestones = {
      1: "Master the basics and move to Easy level",
      2: "Build confidence and advance to Medium level", 
      3: "Challenge yourself with Hard level content",
      4: "Push your limits with Expert level",
      5: "You've mastered all levels! Keep practicing to maintain your skills."
    }
    
    return milestones[currentLevel as keyof typeof milestones] || "Continue your learning journey!"
  }

  // Reset difficulty for a fresh start
  resetDifficulty(childId: string): void {
    const settings = this.getSettings(childId)
    settings.currentDifficulty = 2
    settings.performanceHistory = []
    settings.lastAdjustment = new Date().toISOString()
    
    this.settings.set(childId, settings)
    this.saveSettings(settings)
  }

  // Persistence methods
  private saveSettings(settings: AdaptiveSettings): void {
    localStorage.setItem(`adaptive_settings_${settings.childId}`, JSON.stringify(settings))
  }

  private loadSettings(childId: string): AdaptiveSettings | null {
    const stored = localStorage.getItem(`adaptive_settings_${childId}`)
    if (stored) {
      const settings = JSON.parse(stored) as AdaptiveSettings
      this.settings.set(childId, settings)
      return settings
    }
    return null
  }
}

// Export singleton instance
export const adaptiveDifficultyManager = new AdaptiveDifficultyManager()
