// Learning path recommendation and management system
export interface LearningPathStep {
  id: string
  module: string
  activity: string
  estimatedTime: number
  prerequisites: string[]
  learningObjectives: string[]
  difficulty: number
  learningStyle: string[]
}

export interface LearningPath {
  id: string
  name: string
  description: string
  category: 'foundational' | 'skill_building' | 'mastery' | 'remedial'
  targetAge: string
  estimatedDuration: number
  steps: LearningPathStep[]
  prerequisites: string[]
  learningOutcomes: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export interface PathProgress {
  childId: string
  pathId: string
  currentStep: number
  completedSteps: string[]
  startedAt: string
  lastActivity: string
  estimatedCompletion: string
  progressPercentage: number
}

export interface PathRecommendation {
  pathId: string
  reason: string
  confidence: number
  estimatedBenefit: number
  timeToComplete: number
  prerequisites: string[]
}

class LearningPathManager {
  private paths: LearningPath[] = []
  private progress: Map<string, PathProgress> = new Map()

  constructor() {
    this.initializeLearningPaths()
  }

  private initializeLearningPaths(): void {
    this.paths = [
      {
        id: 'foundational_english',
        name: 'English Foundations',
        description: 'Build basic English vocabulary and pronunciation skills',
        category: 'foundational',
        targetAge: '3-5',
        estimatedDuration: 120,
        difficulty: 'beginner',
        prerequisites: [],
        learningOutcomes: [
          'Recognize basic English words',
          'Pronounce simple words correctly',
          'Understand basic vocabulary'
        ],
        steps: [
          {
            id: 'basic_vocabulary',
            module: 'speaking',
            activity: 'word_pronunciation',
            estimatedTime: 30,
            prerequisites: [],
            learningObjectives: ['Learn 20 basic words'],
            difficulty: 1,
            learningStyle: ['visual', 'auditory']
          },
          {
            id: 'color_recognition',
            module: 'speaking',
            activity: 'color_pronunciation',
            estimatedTime: 20,
            prerequisites: ['basic_vocabulary'],
            learningObjectives: ['Identify and name colors'],
            difficulty: 1,
            learningStyle: ['visual']
          },
          {
            id: 'animal_sounds',
            module: 'speaking',
            activity: 'animal_pronunciation',
            estimatedTime: 25,
            prerequisites: ['basic_vocabulary'],
            learningObjectives: ['Learn animal names and sounds'],
            difficulty: 2,
            learningStyle: ['auditory', 'visual']
          }
        ]
      },
      {
        id: 'reading_adventure',
        name: 'Reading Adventure',
        description: 'Develop reading skills through interactive stories',
        category: 'skill_building',
        targetAge: '4-6',
        estimatedDuration: 90,
        difficulty: 'intermediate',
        prerequisites: ['basic_vocabulary'],
        learningOutcomes: [
          'Read simple sentences',
          'Understand story structure',
          'Improve reading fluency'
        ],
        steps: [
          {
            id: 'letter_recognition',
            module: 'reading',
            activity: 'letter_matching',
            estimatedTime: 20,
            prerequisites: [],
            learningObjectives: ['Recognize all letters'],
            difficulty: 2,
            learningStyle: ['visual', 'kinesthetic']
          },
          {
            id: 'word_formation',
            module: 'reading',
            activity: 'word_building',
            estimatedTime: 30,
            prerequisites: ['letter_recognition'],
            learningObjectives: ['Form simple words'],
            difficulty: 2,
            learningStyle: ['kinesthetic', 'visual']
          },
          {
            id: 'story_reading',
            module: 'reading',
            activity: 'interactive_story',
            estimatedTime: 40,
            prerequisites: ['word_formation'],
            learningObjectives: ['Read complete stories'],
            difficulty: 3,
            learningStyle: ['visual', 'auditory']
          }
        ]
      },
      {
        id: 'writing_mastery',
        name: 'Writing Mastery',
        description: 'Master writing skills through guided practice',
        category: 'mastery',
        targetAge: '5-7',
        estimatedDuration: 150,
        difficulty: 'advanced',
        prerequisites: ['basic_vocabulary', 'letter_recognition'],
        learningOutcomes: [
          'Write complete sentences',
          'Use proper grammar',
          'Express ideas in writing'
        ],
        steps: [
          {
            id: 'letter_writing',
            module: 'writing',
            activity: 'letter_tracing',
            estimatedTime: 30,
            prerequisites: [],
            learningObjectives: ['Write all letters correctly'],
            difficulty: 2,
            learningStyle: ['kinesthetic']
          },
          {
            id: 'word_writing',
            module: 'writing',
            activity: 'word_formation',
            estimatedTime: 40,
            prerequisites: ['letter_writing'],
            learningObjectives: ['Write simple words'],
            difficulty: 3,
            learningStyle: ['kinesthetic', 'visual']
          },
          {
            id: 'sentence_writing',
            module: 'writing',
            activity: 'sentence_construction',
            estimatedTime: 50,
            prerequisites: ['word_writing'],
            learningObjectives: ['Write complete sentences'],
            difficulty: 4,
            learningStyle: ['kinesthetic', 'visual']
          },
          {
            id: 'story_writing',
            module: 'writing',
            activity: 'creative_writing',
            estimatedTime: 30,
            prerequisites: ['sentence_writing'],
            learningObjectives: ['Write short stories'],
            difficulty: 5,
            learningStyle: ['kinesthetic', 'visual']
          }
        ]
      },
      {
        id: 'game_based_learning',
        name: 'Game-Based Learning',
        description: 'Learn through interactive games and activities',
        category: 'skill_building',
        targetAge: '3-6',
        estimatedDuration: 60,
        difficulty: 'beginner',
        prerequisites: [],
        learningOutcomes: [
          'Engage with learning through play',
          'Develop problem-solving skills',
          'Build confidence in English'
        ],
        steps: [
          {
            id: 'memory_games',
            module: 'games',
            activity: 'word_memory',
            estimatedTime: 20,
            prerequisites: [],
            learningObjectives: ['Improve memory and word recognition'],
            difficulty: 1,
            learningStyle: ['visual', 'kinesthetic']
          },
          {
            id: 'quiz_challenges',
            module: 'games',
            activity: 'vocabulary_quiz',
            estimatedTime: 25,
            prerequisites: ['memory_games'],
            learningObjectives: ['Test vocabulary knowledge'],
            difficulty: 2,
            learningStyle: ['visual', 'auditory']
          },
          {
            id: 'interactive_puzzles',
            module: 'games',
            activity: 'word_puzzle',
            estimatedTime: 15,
            prerequisites: ['quiz_challenges'],
            learningObjectives: ['Solve word puzzles'],
            difficulty: 2,
            learningStyle: ['kinesthetic', 'visual']
          }
        ]
      }
    ]
  }

  // Get all available learning paths
  getAllPaths(): LearningPath[] {
    return this.paths
  }

  // Get paths filtered by criteria
  getFilteredPaths(filters: {
    difficulty?: string
    category?: string
    targetAge?: string
    maxDuration?: number
  }): LearningPath[] {
    return this.paths.filter(path => {
      if (filters.difficulty && path.difficulty !== filters.difficulty) return false
      if (filters.category && path.category !== filters.category) return false
      if (filters.targetAge && path.targetAge !== filters.targetAge) return false
      if (filters.maxDuration && path.estimatedDuration > filters.maxDuration) return false
      return true
    })
  }

  // Get personalized path recommendations
  getPersonalizedRecommendations(childId: string, profile: any): PathRecommendation[] {
    const recommendations: PathRecommendation[] = []
    
    // Analyze child's profile and performance
    const childAge = this.getChildAge(childId)
    const childDifficulty = this.getChildDifficulty(childId)
    const childInterests = this.getChildInterests(childId)
    const completedPaths = this.getCompletedPaths(childId)

    // Find suitable paths
    const suitablePaths = this.paths.filter(path => {
      // Check age appropriateness
      if (childAge && !this.isAgeAppropriate(path.targetAge, childAge)) return false
      
      // Check difficulty match
      if (childDifficulty && !this.isDifficultyAppropriate(path.difficulty, childDifficulty)) return false
      
      // Check prerequisites
      if (!this.hasPrerequisites(path.prerequisites, completedPaths)) return false
      
      return true
    })

    // Score and rank recommendations
    for (const path of suitablePaths) {
      const score = this.calculateRecommendationScore(path, childId, profile)
      if (score > 0.3) { // Minimum confidence threshold
        recommendations.push({
          pathId: path.id,
          reason: this.generateRecommendationReason(path, childId, profile),
          confidence: score,
          estimatedBenefit: this.estimateBenefit(path, childId),
          timeToComplete: path.estimatedDuration,
          prerequisites: path.prerequisites
        })
      }
    }

    // Sort by confidence and return top recommendations
    return recommendations.sort((a, b) => b.confidence - a.confidence).slice(0, 5)
  }

  // Start a learning path
  startPath(childId: string, pathId: string): PathProgress {
    const path = this.paths.find(p => p.id === pathId)
    if (!path) throw new Error('Learning path not found')

    const progress: PathProgress = {
      childId,
      pathId,
      currentStep: 0,
      completedSteps: [],
      startedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      estimatedCompletion: this.calculateEstimatedCompletion(path),
      progressPercentage: 0
    }

    this.progress.set(`${childId}_${pathId}`, progress)
    this.saveProgress(progress)
    return progress
  }

  // Complete a step in the path
  completeStep(childId: string, pathId: string, stepId: string): void {
    const progress = this.getProgress(childId, pathId)
    if (!progress) return

    if (!progress.completedSteps.includes(stepId)) {
      progress.completedSteps.push(stepId)
      progress.currentStep = Math.min(progress.currentStep + 1, this.getPath(pathId)?.steps.length || 0)
      progress.lastActivity = new Date().toISOString()
      progress.progressPercentage = (progress.completedSteps.length / (this.getPath(pathId)?.steps.length || 1)) * 100

      this.progress.set(`${childId}_${pathId}`, progress)
      this.saveProgress(progress)
    }
  }

  // Get current progress for a path
  getProgress(childId: string, pathId: string): PathProgress | null {
    return this.progress.get(`${childId}_${pathId}`) || this.loadProgress(childId, pathId)
  }

  // Get all progress for a child
  getChildProgress(childId: string): PathProgress[] {
    const allProgress: PathProgress[] = []
    for (const [key, progress] of this.progress.entries()) {
      if (progress.childId === childId) {
        allProgress.push(progress)
      }
    }
    return allProgress
  }

  // Get next recommended step
  getNextStep(childId: string, pathId: string): LearningPathStep | null {
    const progress = this.getProgress(childId, pathId)
    const path = this.getPath(pathId)
    if (!progress || !path) return null

    if (progress.currentStep < path.steps.length) {
      return path.steps[progress.currentStep]
    }
    return null
  }

  // Helper methods
  private getPath(pathId: string): LearningPath | null {
    return this.paths.find(p => p.id === pathId) || null
  }

  private getChildAge(childId: string): number | null {
    // This would typically come from the child's profile
    // For now, return a default age
    return 5
  }

  private getChildDifficulty(childId: string): string | null {
    // This would come from the child's learning profile
    return 'beginner'
  }

  private getChildInterests(childId: string): string[] {
    // This would come from the child's profile
    return ['animals', 'colors', 'stories']
  }

  private getCompletedPaths(childId: string): string[] {
    const progress = this.getChildProgress(childId)
    return progress.filter(p => p.progressPercentage === 100).map(p => p.pathId)
  }

  private isAgeAppropriate(targetAge: string, childAge: number): boolean {
    const [min, max] = targetAge.split('-').map(Number)
    return childAge >= min && childAge <= max
  }

  private isDifficultyAppropriate(pathDifficulty: string, childDifficulty: string): boolean {
    const difficultyOrder = ['beginner', 'intermediate', 'advanced']
    const pathIndex = difficultyOrder.indexOf(pathDifficulty)
    const childIndex = difficultyOrder.indexOf(childDifficulty)
    return pathIndex <= childIndex + 1 // Allow one level up
  }

  private hasPrerequisites(prerequisites: string[], completedPaths: string[]): boolean {
    return prerequisites.every(prereq => completedPaths.includes(prereq))
  }

  private calculateRecommendationScore(path: LearningPath, childId: string, profile: any): number {
    let score = 0.5 // Base score

    // Age appropriateness
    const childAge = this.getChildAge(childId)
    if (childAge && this.isAgeAppropriate(path.targetAge, childAge)) {
      score += 0.2
    }

    // Difficulty match
    const childDifficulty = this.getChildDifficulty(childId)
    if (childDifficulty && this.isDifficultyAppropriate(path.difficulty, childDifficulty)) {
      score += 0.2
    }

    // Interest alignment (if we had interest data)
    score += 0.1

    return Math.min(1, score)
  }

  private generateRecommendationReason(path: LearningPath, childId: string, profile: any): string {
    const reasons = []
    
    if (path.category === 'foundational') {
      reasons.push('Builds essential English skills')
    } else if (path.category === 'skill_building') {
      reasons.push('Develops specific language abilities')
    } else if (path.category === 'mastery') {
      reasons.push('Advanced skills for confident learners')
    }

    if (path.estimatedDuration < 60) {
      reasons.push('Quick and engaging activities')
    }

    return reasons.join(', ')
  }

  private estimateBenefit(path: LearningPath, childId: string): number {
    // Simple benefit estimation based on path characteristics
    let benefit = 0.5

    if (path.category === 'foundational') benefit += 0.3
    if (path.difficulty === 'beginner') benefit += 0.2
    if (path.estimatedDuration < 90) benefit += 0.1

    return Math.min(1, benefit)
  }

  private calculateEstimatedCompletion(path: LearningPath): string {
    const completionDate = new Date()
    completionDate.setMinutes(completionDate.getMinutes() + path.estimatedDuration)
    return completionDate.toISOString()
  }

  // Persistence methods
  private saveProgress(progress: PathProgress): void {
    localStorage.setItem(`path_progress_${progress.childId}_${progress.pathId}`, JSON.stringify(progress))
  }

  private loadProgress(childId: string, pathId: string): PathProgress | null {
    const stored = localStorage.getItem(`path_progress_${childId}_${pathId}`)
    if (stored) {
      const progress = JSON.parse(stored) as PathProgress
      this.progress.set(`${childId}_${pathId}`, progress)
      return progress
    }
    return null
  }
}

// Export singleton instance
export const learningPathManager = new LearningPathManager()
