// Daily challenges and adaptive difficulty system
export interface DailyChallenge {
  id: string
  title: string
  description: string
  type: 'speaking' | 'writing' | 'reading' | 'games' | 'puzzle'
  target: number
  current: number
  reward: number
  difficulty: 'easy' | 'medium' | 'hard'
  completed: boolean
  expiresAt: string
}

export interface AdaptiveSettings {
  currentDifficulty: 'easy' | 'medium' | 'hard'
  performanceHistory: number[]
  lastAdjustment: string
  autoAdjust: boolean
}

export class ChallengeManager {
  private static instance: ChallengeManager
  private challenges: DailyChallenge[] = []
  private adaptiveSettings: AdaptiveSettings = {
    currentDifficulty: 'easy',
    performanceHistory: [],
    lastAdjustment: new Date().toISOString(),
    autoAdjust: true
  }

  private constructor() {
    this.loadChallenges()
    this.loadAdaptiveSettings()
  }

  static getInstance(): ChallengeManager {
    if (!ChallengeManager.instance) {
      ChallengeManager.instance = new ChallengeManager()
    }
    return ChallengeManager.instance
  }

  // Generate daily challenges
  generateDailyChallenges(): DailyChallenge[] {
    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const expiresAt = tomorrow.toISOString()

    const baseChallenges: Omit<DailyChallenge, 'id' | 'current' | 'completed' | 'expiresAt'>[] = [
      {
        title: 'Word Master',
        description: 'Complete 5 word building activities',
        type: 'writing',
        target: 5,
        reward: 50,
        difficulty: 'easy'
      },
      {
        title: 'Speaking Star',
        description: 'Practice pronunciation for 10 minutes',
        type: 'speaking',
        target: 10,
        reward: 75,
        difficulty: 'medium'
      },
      {
        title: 'Reading Explorer',
        description: 'Read 3 book pages',
        type: 'reading',
        target: 3,
        reward: 60,
        difficulty: 'easy'
      },
      {
        title: 'Game Champion',
        description: 'Win 3 educational games',
        type: 'games',
        target: 3,
        reward: 80,
        difficulty: 'medium'
      },
      {
        title: 'Letter Artist',
        description: 'Trace 10 letters perfectly',
        type: 'writing',
        target: 10,
        reward: 40,
        difficulty: 'easy'
      },
      {
        title: 'Puzzle Master',
        description: 'Solve 5 puzzles',
        type: 'puzzle',
        target: 5,
        reward: 70,
        difficulty: 'medium'
      }
    ]

    this.challenges = baseChallenges.map((challenge, index) => ({
      ...challenge,
      id: `daily_${today}_${index}`,
      current: 0,
      completed: false,
      expiresAt
    }))

    this.saveChallenges()
    return this.challenges
  }

  // Update challenge progress
  updateChallengeProgress(type: 'speaking' | 'writing' | 'reading' | 'games' | 'puzzle', amount: number = 1): void {
    const today = new Date().toISOString().split('T')[0]
    
    this.challenges.forEach(challenge => {
      if (challenge.type === type && !challenge.completed) {
        challenge.current = Math.min(challenge.current + amount, challenge.target)
        
        if (challenge.current >= challenge.target) {
          challenge.completed = true
          this.awardReward(challenge.reward)
        }
      }
    })

    this.saveChallenges()
  }

  // Award challenge reward
  private awardReward(reward: number): void {
    // This would integrate with the progress manager
    console.log(`Awarded ${reward} points for completing challenge`)
  }

  // Get today's challenges
  getTodaysChallenges(): DailyChallenge[] {
    const today = new Date().toISOString().split('T')[0]
    
    if (this.challenges.length === 0 || this.challenges[0].expiresAt.split('T')[0] !== today) {
      return this.generateDailyChallenges()
    }
    
    return this.challenges
  }

  // Adaptive difficulty adjustment
  adjustDifficulty(performance: number): void {
    if (!this.adaptiveSettings.autoAdjust) return

    this.adaptiveSettings.performanceHistory.push(performance)
    
    // Keep only last 10 performances
    if (this.adaptiveSettings.performanceHistory.length > 10) {
      this.adaptiveSettings.performanceHistory = this.adaptiveSettings.performanceHistory.slice(-10)
    }

    const avgPerformance = this.adaptiveSettings.performanceHistory.reduce((a, b) => a + b, 0) / this.adaptiveSettings.performanceHistory.length
    
    // Adjust difficulty based on average performance
    if (avgPerformance > 0.8 && this.adaptiveSettings.currentDifficulty !== 'hard') {
      this.adaptiveSettings.currentDifficulty = this.getNextDifficulty(this.adaptiveSettings.currentDifficulty)
    } else if (avgPerformance < 0.5 && this.adaptiveSettings.currentDifficulty !== 'easy') {
      this.adaptiveSettings.currentDifficulty = this.getPreviousDifficulty(this.adaptiveSettings.currentDifficulty)
    }

    this.adaptiveSettings.lastAdjustment = new Date().toISOString()
    this.saveAdaptiveSettings()
  }

  private getNextDifficulty(current: string): 'easy' | 'medium' | 'hard' {
    switch (current) {
      case 'easy': return 'medium'
      case 'medium': return 'hard'
      default: return 'hard'
    }
  }

  private getPreviousDifficulty(current: string): 'easy' | 'medium' | 'hard' {
    switch (current) {
      case 'hard': return 'medium'
      case 'medium': return 'easy'
      default: return 'easy'
    }
  }

  // Get current difficulty settings
  getDifficultySettings(): AdaptiveSettings {
    return this.adaptiveSettings
  }

  // Set difficulty manually
  setDifficulty(difficulty: 'easy' | 'medium' | 'hard'): void {
    this.adaptiveSettings.currentDifficulty = difficulty
    this.adaptiveSettings.autoAdjust = false
    this.saveAdaptiveSettings()
  }

  // Reset to auto-adjust
  enableAutoAdjust(): void {
    this.adaptiveSettings.autoAdjust = true
    this.saveAdaptiveSettings()
  }

  // Save/load methods
  private saveChallenges(): void {
    try {
      localStorage.setItem('daily_challenges', JSON.stringify(this.challenges))
    } catch (error) {
      console.error('Error saving challenges:', error)
    }
  }

  private loadChallenges(): void {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('daily_challenges')
        if (saved) {
          this.challenges = JSON.parse(saved)
        }
      }
    } catch (error) {
      console.error('Error loading challenges:', error)
    }
  }

  private saveAdaptiveSettings(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('adaptive_settings', JSON.stringify(this.adaptiveSettings))
      }
    } catch (error) {
      console.error('Error saving adaptive settings:', error)
    }
  }

  private loadAdaptiveSettings(): void {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('adaptive_settings')
        if (saved) {
          this.adaptiveSettings = JSON.parse(saved)
        }
      }
    } catch (error) {
      console.error('Error loading adaptive settings:', error)
    }
  }
}

export const challengeManager = ChallengeManager.getInstance()