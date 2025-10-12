// Enhanced challenge manager that works with database and user-specific challenges
export interface DailyChallenge {
  id: string
  name: string
  description: string
  type: string
  target: number
  current: number
  reward: number
  completed: boolean
  date: string
  completedAt?: string
}

export class ChallengeManager {
  private static instance: ChallengeManager

  private constructor() {}

  static getInstance(): ChallengeManager {
    if (!ChallengeManager.instance) {
      ChallengeManager.instance = new ChallengeManager()
    }
    return ChallengeManager.instance
  }

  // Fetch daily challenges for a specific child
  async getDailyChallenges(childId: string): Promise<DailyChallenge[]> {
    try {
      const response = await fetch(`/api/challenges?childId=${childId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch challenges')
      }
      const data = await response.json()
      return data.challenges || []
    } catch (error) {
      console.error('Error fetching daily challenges:', error)
      return []
    }
  }

  // Generate new daily challenges for a child
  async generateDailyChallenges(childId: string): Promise<DailyChallenge[]> {
    try {
      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ childId }),
      })
      if (!response.ok) {
        throw new Error('Failed to generate challenges')
      }
      const data = await response.json()
      return data.challenges || []
    } catch (error) {
      console.error('Error generating daily challenges:', error)
      return []
    }
  }

  // Update challenge progress
  async updateChallengeProgress(
    challengeId: string,
    progress: number,
    completed: boolean = false
  ): Promise<DailyChallenge | null> {
    try {
      const response = await fetch('/api/challenges', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengeId,
          progress,
          completed,
        }),
      })
      if (!response.ok) {
        throw new Error('Failed to update challenge progress')
      }
      const data = await response.json()
      return data.challenge || null
    } catch (error) {
      console.error('Error updating challenge progress:', error)
      return null
    }
  }

  // Get or create daily challenges for a child
  async getOrCreateDailyChallenges(childId: string): Promise<DailyChallenge[]> {
    try {
      // First, try to get existing challenges
      let challenges = await this.getDailyChallenges(childId)
      
      // If no challenges exist for today, generate new ones
      if (challenges.length === 0) {
        challenges = await this.generateDailyChallenges(childId)
      }
      
      return challenges
    } catch (error) {
      console.error('Error getting or creating daily challenges:', error)
      return []
    }
  }

  // Update progress for a specific activity type
  async updateActivityProgress(
    childId: string,
    activityType: string,
    amount: number = 1
  ): Promise<void> {
    try {
      const challenges = await this.getDailyChallenges(childId)
      
      for (const challenge of challenges) {
        if (challenge.type === activityType && !challenge.completed) {
          const newProgress = Math.min(challenge.current + amount, challenge.target)
          const isCompleted = newProgress >= challenge.target
          
          await this.updateChallengeProgress(challenge.id, newProgress, isCompleted)
        }
      }
    } catch (error) {
      console.error('Error updating activity progress:', error)
    }
  }

  // Get challenge completion rate for a child
  getCompletionRate(challenges: DailyChallenge[]): number {
    if (challenges.length === 0) return 0
    
    const completed = challenges.filter(c => c.completed).length
    return (completed / challenges.length) * 100
  }

  // Get total rewards earned today
  getTotalRewards(challenges: DailyChallenge[]): number {
    return challenges
      .filter(c => c.completed)
      .reduce((total, challenge) => total + challenge.reward, 0)
  }

  // Get progress summary
  getProgressSummary(challenges: DailyChallenge[]) {
    const total = challenges.length
    const completed = challenges.filter(c => c.completed).length
    const inProgress = challenges.filter(c => !c.completed && c.current > 0).length
    const notStarted = challenges.filter(c => !c.completed && c.current === 0).length
    
    return {
      total,
      completed,
      inProgress,
      notStarted,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      totalRewards: this.getTotalRewards(challenges)
    }
  }
}

export const challengeManager = ChallengeManager.getInstance()
