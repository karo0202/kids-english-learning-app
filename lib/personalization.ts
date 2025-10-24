// Personalization system for adaptive learning
export interface LearningProfile {
  id: string
  childId: string
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed'
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced'
  strengths: string[]
  weaknesses: string[]
  interests: string[]
  preferredPace: 'slow' | 'medium' | 'fast'
  attentionSpan: number // in minutes
  lastUpdated: string
}

export interface LearningPath {
  id: string
  name: string
  description: string
  modules: string[]
  estimatedDuration: number // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  prerequisites: string[]
  learningStyle: string[]
}

export interface AdaptiveContent {
  id: string
  type: 'word' | 'story' | 'game' | 'exercise'
  difficulty: number // 1-5 scale
  learningStyle: string[]
  tags: string[]
  content: any
  successRate?: number
  averageTime?: number
}

export interface PerformanceMetrics {
  accuracy: number
  speed: number
  engagement: number
  retention: number
  confidence: number
}

export interface AdaptiveRecommendation {
  type: 'content' | 'difficulty' | 'path' | 'break'
  priority: 'high' | 'medium' | 'low'
  reason: string
  action: string
  estimatedImpact: number
}

class PersonalizationManager {
  private profiles: Map<string, LearningProfile> = new Map()
  private learningPaths: LearningPath[] = []
  private adaptiveContent: AdaptiveContent[] = []
  private performanceHistory: Map<string, PerformanceMetrics[]> = new Map()

  constructor() {
    this.initializeLearningPaths()
    this.initializeAdaptiveContent()
  }

  // Initialize predefined learning paths
  private initializeLearningPaths(): void {
    this.learningPaths = [
      {
        id: 'beginner_visual',
        name: 'Visual Learning Path',
        description: 'Perfect for children who learn best through images and visual cues',
        modules: ['speaking', 'reading'],
        estimatedDuration: 30,
        difficulty: 'beginner',
        prerequisites: [],
        learningStyle: ['visual']
      },
      {
        id: 'intermediate_auditory',
        name: 'Sound & Speech Path',
        description: 'Focus on pronunciation and listening skills',
        modules: ['speaking', 'games'],
        estimatedDuration: 45,
        difficulty: 'intermediate',
        prerequisites: ['basic_vocabulary'],
        learningStyle: ['auditory']
      },
      {
        id: 'advanced_kinesthetic',
        name: 'Hands-On Learning',
        description: 'Interactive activities and writing practice',
        modules: ['writing', 'games'],
        estimatedDuration: 60,
        difficulty: 'advanced',
        prerequisites: ['intermediate_reading'],
        learningStyle: ['kinesthetic']
      },
      {
        id: 'mixed_comprehensive',
        name: 'Complete Learning Journey',
        description: 'Balanced approach covering all learning styles',
        modules: ['speaking', 'reading', 'writing', 'games'],
        estimatedDuration: 90,
        difficulty: 'intermediate',
        prerequisites: ['basic_english'],
        learningStyle: ['visual', 'auditory', 'kinesthetic']
      }
    ]
  }

  // Initialize adaptive content
  private initializeAdaptiveContent(): void {
    this.adaptiveContent = [
      // Visual content
      {
        id: 'visual_animals',
        type: 'word',
        difficulty: 1,
        learningStyle: ['visual'],
        tags: ['animals', 'colors', 'basic'],
        content: { category: 'animals', visualCues: true }
      },
      {
        id: 'visual_stories',
        type: 'story',
        difficulty: 2,
        learningStyle: ['visual'],
        tags: ['storytelling', 'imagination'],
        content: { illustrations: true, interactive: true }
      },
      // Auditory content
      {
        id: 'auditory_pronunciation',
        type: 'exercise',
        difficulty: 2,
        learningStyle: ['auditory'],
        tags: ['pronunciation', 'speech'],
        content: { audio: true, repetition: true }
      },
      // Kinesthetic content
      {
        id: 'kinesthetic_writing',
        type: 'exercise',
        difficulty: 3,
        learningStyle: ['kinesthetic'],
        tags: ['writing', 'motor_skills'],
        content: { tracing: true, interactive: true }
      }
    ]
  }

  // Create or update learning profile
  createProfile(childId: string, initialData: Partial<LearningProfile>): LearningProfile {
    const profile: LearningProfile = {
      id: `profile_${childId}`,
      childId,
      learningStyle: 'mixed',
      difficultyLevel: 'beginner',
      strengths: [],
      weaknesses: [],
      interests: [],
      preferredPace: 'medium',
      attentionSpan: 15,
      lastUpdated: new Date().toISOString(),
      ...initialData
    }

    this.profiles.set(childId, profile)
    this.saveProfile(profile)
    return profile
  }

  // Get learning profile
  getProfile(childId: string): LearningProfile | null {
    return this.profiles.get(childId) || this.loadProfile(childId)
  }

  // Update profile based on performance
  updateProfile(childId: string, performance: PerformanceMetrics): void {
    const profile = this.getProfile(childId)
    if (!profile) return

    // Analyze performance patterns
    const history = this.performanceHistory.get(childId) || []
    history.push(performance)
    this.performanceHistory.set(childId, history)

    // Update learning style based on performance
    if (performance.engagement > 0.8) {
      // High engagement - current approach is working
      profile.learningStyle = this.refineLearningStyle(profile.learningStyle, performance)
    } else {
      // Low engagement - try different approach
      profile.learningStyle = this.suggestAlternativeLearningStyle(profile.learningStyle)
    }

    // Update difficulty level
    if (performance.accuracy > 0.9 && performance.speed > 0.7) {
      profile.difficultyLevel = this.increaseDifficulty(profile.difficultyLevel)
    } else if (performance.accuracy < 0.6) {
      profile.difficultyLevel = this.decreaseDifficulty(profile.difficultyLevel)
    }

    // Update strengths and weaknesses
    profile.strengths = this.identifyStrengths(history)
    profile.weaknesses = this.identifyWeaknesses(history)

    profile.lastUpdated = new Date().toISOString()
    this.profiles.set(childId, profile)
    this.saveProfile(profile)
  }

  // Get personalized learning path
  getPersonalizedPath(childId: string): LearningPath | null {
    const profile = this.getProfile(childId)
    if (!profile) return null

    // Find best matching path
    const matchingPaths = this.learningPaths.filter(path => 
      path.difficulty === profile.difficultyLevel &&
      path.learningStyle.some(style => profile.learningStyle.includes(style))
    )

    if (matchingPaths.length === 0) {
      // Fallback to mixed comprehensive path
      return this.learningPaths.find(path => path.id === 'mixed_comprehensive') || null
    }

    // Return the best match
    return matchingPaths[0]
  }

  // Get adaptive content recommendations
  getAdaptiveContent(childId: string, moduleType: string): AdaptiveContent[] {
    const profile = this.getProfile(childId)
    if (!profile) return []

    return this.adaptiveContent.filter(content => 
      content.learningStyle.some(style => profile.learningStyle.includes(style)) &&
      this.isAppropriateDifficulty(content.difficulty, profile.difficultyLevel) &&
      content.tags.some(tag => profile.interests.includes(tag))
    )
  }

  // Get personalized recommendations
  getRecommendations(childId: string): AdaptiveRecommendation[] {
    const profile = this.getProfile(childId)
    if (!profile) return []

    const recommendations: AdaptiveRecommendation[] = []
    const history = this.performanceHistory.get(childId) || []

    // Analyze recent performance
    const recentPerformance = history.slice(-5)
    const avgAccuracy = recentPerformance.reduce((sum, p) => sum + p.accuracy, 0) / recentPerformance.length
    const avgEngagement = recentPerformance.reduce((sum, p) => sum + p.engagement, 0) / recentPerformance.length

    // Generate recommendations based on performance
    if (avgAccuracy > 0.9) {
      recommendations.push({
        type: 'difficulty',
        priority: 'high',
        reason: 'High accuracy suggests ready for more challenging content',
        action: 'Increase difficulty level',
        estimatedImpact: 0.8
      })
    }

    if (avgEngagement < 0.6) {
      recommendations.push({
        type: 'content',
        priority: 'high',
        reason: 'Low engagement suggests content mismatch',
        action: 'Try different learning style or content type',
        estimatedImpact: 0.9
      })
    }

    if (profile.attentionSpan < 10) {
      recommendations.push({
        type: 'break',
        priority: 'medium',
        reason: 'Short attention span detected',
        action: 'Take a break or try shorter activities',
        estimatedImpact: 0.7
      })
    }

    return recommendations
  }

  // Helper methods
  private refineLearningStyle(currentStyle: string, performance: PerformanceMetrics): 'visual' | 'auditory' | 'kinesthetic' | 'mixed' {
    // Keep current style if performing well
    return currentStyle as 'visual' | 'auditory' | 'kinesthetic' | 'mixed'
  }

  private suggestAlternativeLearningStyle(currentStyle: string): 'visual' | 'auditory' | 'kinesthetic' | 'mixed' {
    const allStyles: ('visual' | 'auditory' | 'kinesthetic' | 'mixed')[] = ['visual', 'auditory', 'kinesthetic', 'mixed']
    const alternatives = allStyles.filter(style => style !== currentStyle)
    return alternatives[Math.floor(Math.random() * alternatives.length)] || 'mixed'
  }

  private increaseDifficulty(current: string): 'beginner' | 'intermediate' | 'advanced' {
    const levels: ('beginner' | 'intermediate' | 'advanced')[] = ['beginner', 'intermediate', 'advanced']
    const currentIndex = levels.indexOf(current as any)
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : current as 'beginner' | 'intermediate' | 'advanced'
  }

  private decreaseDifficulty(current: string): 'beginner' | 'intermediate' | 'advanced' {
    const levels: ('beginner' | 'intermediate' | 'advanced')[] = ['beginner', 'intermediate', 'advanced']
    const currentIndex = levels.indexOf(current as any)
    return currentIndex > 0 ? levels[currentIndex - 1] : current as 'beginner' | 'intermediate' | 'advanced'
  }

  private isAppropriateDifficulty(contentDifficulty: number, userLevel: string): boolean {
    const levelMap = { beginner: 1, intermediate: 3, advanced: 5 }
    const userDifficulty = levelMap[userLevel as keyof typeof levelMap]
    return Math.abs(contentDifficulty - userDifficulty) <= 1
  }

  private identifyStrengths(history: PerformanceMetrics[]): string[] {
    const strengths: string[] = []
    const avgAccuracy = history.reduce((sum, p) => sum + p.accuracy, 0) / history.length
    const avgSpeed = history.reduce((sum, p) => sum + p.speed, 0) / history.length

    if (avgAccuracy > 0.8) strengths.push('accuracy')
    if (avgSpeed > 0.7) strengths.push('speed')
    if (history.some(p => p.engagement > 0.8)) strengths.push('engagement')

    return strengths
  }

  private identifyWeaknesses(history: PerformanceMetrics[]): string[] {
    const weaknesses: string[] = []
    const avgAccuracy = history.reduce((sum, p) => sum + p.accuracy, 0) / history.length
    const avgRetention = history.reduce((sum, p) => sum + p.retention, 0) / history.length

    if (avgAccuracy < 0.6) weaknesses.push('accuracy')
    if (avgRetention < 0.5) weaknesses.push('retention')

    return weaknesses
  }

  // Persistence methods
  private saveProfile(profile: LearningProfile): void {
    localStorage.setItem(`learning_profile_${profile.childId}`, JSON.stringify(profile))
  }

  private loadProfile(childId: string): LearningProfile | null {
    const stored = localStorage.getItem(`learning_profile_${childId}`)
    if (stored) {
      const profile = JSON.parse(stored) as LearningProfile
      this.profiles.set(childId, profile)
      return profile
    }
    return null
  }
}

// Export singleton instance
export const personalizationManager = new PersonalizationManager()
