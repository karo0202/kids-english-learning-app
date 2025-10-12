
export interface Child {
  id: string
  name: string
  age: number
  ageGroup: AgeGroup
  level: number
  xp: number
  coins: number
  avatar?: Avatar
  progress?: Progress[]
  achievements?: Achievement[]
  badges?: Badge[]
  dailyChallenges?: DailyChallenge[]
}

export interface Avatar {
  body: string
  face: string
  hair: string
  clothing: string
  accessory: string
}

export interface Progress {
  id: string
  completed: boolean
  score?: number
  timeSpent?: number
  attempts: number
  completedAt?: Date
  activity?: Activity
  module?: LearningModule
}

export interface Activity {
  id: string
  name: string
  type: ActivityType
  ageGroup: AgeGroup
  difficulty: number
  content?: any
  instructions?: string
  points: number
}

export interface LearningModule {
  id: string
  name: string
  type: ModuleType
  ageGroup: AgeGroup
  description?: string
  activities: Activity[]
}

export interface Achievement {
  id: string
  name: string
  description: string
  type: AchievementType
  icon: string
  unlockedAt: Date
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: BadgeCategory
  earnedAt: Date
}

export interface DailyChallenge {
  id: string
  name: string
  description: string
  type: ChallengeType
  target: number
  current: number
  reward: number
  completed: boolean
  date: Date
  completedAt?: Date
}

export interface VocabularyWord {
  id: string
  word: string
  definition: string
  pronunciation?: string
  ageGroup: AgeGroup
  category: string
  imageUrl?: string
  audioUrl?: string
}

export interface Story {
  id: string
  title: string
  content: string
  ageGroup: AgeGroup
  imageUrl?: string
  audioUrl?: string
}

export enum AgeGroup {
  AGE_3_5 = 'AGE_3_5',
  AGE_6_8 = 'AGE_6_8',  
  AGE_9_12 = 'AGE_9_12'
}

export enum ModuleType {
  SPEAKING = 'SPEAKING',
  WRITING_SPELLING = 'WRITING_SPELLING',
  GAMES = 'GAMES'
}

export enum ActivityType {
  PRONUNCIATION = 'PRONUNCIATION',
  ROLE_PLAY = 'ROLE_PLAY',
  SING_SPEAK = 'SING_SPEAK',
  LETTER_TRACING = 'LETTER_TRACING',
  WORD_BUILDER = 'WORD_BUILDER',
  SENTENCE_PUZZLE = 'SENTENCE_PUZZLE',
  CREATIVE_WRITING = 'CREATIVE_WRITING',
  MEMORY_MATCH = 'MEMORY_MATCH',
  STORY_ADVENTURE = 'STORY_ADVENTURE',
  SPELLING_BEE = 'SPELLING_BEE',
  QUIZ_ARENA = 'QUIZ_ARENA',
  WORD_HUNT = 'WORD_HUNT'
}

export enum AchievementType {
  FIRST_ACTIVITY = 'FIRST_ACTIVITY',
  STREAK_MASTER = 'STREAK_MASTER',
  VOCABULARY_EXPERT = 'VOCABULARY_EXPERT',
  PRONUNCIATION_PRO = 'PRONUNCIATION_PRO',
  CREATIVE_WRITER = 'CREATIVE_WRITER',
  GAME_CHAMPION = 'GAME_CHAMPION',
  LEVEL_UP = 'LEVEL_UP'
}

export enum BadgeCategory {
  SPEAKING = 'SPEAKING',
  WRITING = 'WRITING',
  GAMES = 'GAMES',
  PROGRESS = 'PROGRESS',
  SPECIAL = 'SPECIAL'
}

export enum ChallengeType {
  COMPLETE_ACTIVITIES = 'COMPLETE_ACTIVITIES',
  LEARN_WORDS = 'LEARN_WORDS',
  PRACTICE_PRONUNCIATION = 'PRACTICE_PRONUNCIATION',
  PLAY_GAMES = 'PLAY_GAMES',
  CREATIVE_TASKS = 'CREATIVE_TASKS'
}
