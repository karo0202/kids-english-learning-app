// Age-based learning system utilities

export enum AgeGroup {
  AGE_3_5 = 'AGE_3_5',    // Little Learners (3-5 years)
  AGE_6_8 = 'AGE_6_8',    // Word Builders (6-8 years)
  AGE_9_12 = 'AGE_9_12'   // Language Masters (9-12 years)
}

export interface AgeGroupConfig {
  group: AgeGroup
  name: string
  minAge: number
  maxAge: number
  description: string
  difficultyRange: {
    min: number
    max: number
  }
  sessionDuration: {
    min: number  // minutes
    max: number  // minutes
  }
  uiComplexity: 'simple' | 'moderate' | 'advanced'
}

export const AGE_GROUP_CONFIGS: Record<AgeGroup, AgeGroupConfig> = {
  [AgeGroup.AGE_3_5]: {
    group: AgeGroup.AGE_3_5,
    name: 'Little Learners',
    minAge: 3,
    maxAge: 5,
    description: 'Perfect for preschool and early learners',
    difficultyRange: { min: 1, max: 2 },
    sessionDuration: { min: 5, max: 10 },
    uiComplexity: 'simple'
  },
  [AgeGroup.AGE_6_8]: {
    group: AgeGroup.AGE_6_8,
    name: 'Word Builders',
    minAge: 6,
    maxAge: 8,
    description: 'Ideal for elementary school learners',
    difficultyRange: { min: 2, max: 3 },
    sessionDuration: { min: 15, max: 20 },
    uiComplexity: 'moderate'
  },
  [AgeGroup.AGE_9_12]: {
    group: AgeGroup.AGE_9_12,
    name: 'Language Masters',
    minAge: 9,
    maxAge: 12,
    description: 'Designed for advanced learners',
    difficultyRange: { min: 3, max: 5 },
    sessionDuration: { min: 20, max: 30 },
    uiComplexity: 'advanced'
  }
}

/**
 * Determines the age group from a child's age
 */
export function getAgeGroup(age: number): AgeGroup {
  if (age >= 3 && age <= 5) {
    return AgeGroup.AGE_3_5
  } else if (age >= 6 && age <= 8) {
    return AgeGroup.AGE_6_8
  } else if (age >= 9 && age <= 12) {
    return AgeGroup.AGE_9_12
  }
  
  // Default fallback
  if (age < 3) return AgeGroup.AGE_3_5
  return AgeGroup.AGE_9_12
}

/**
 * Gets the configuration for a specific age group
 */
export function getAgeGroupConfig(ageGroup: AgeGroup): AgeGroupConfig {
  return AGE_GROUP_CONFIGS[ageGroup]
}

/**
 * Gets the configuration for a child's age
 */
export function getAgeGroupConfigByAge(age: number): AgeGroupConfig {
  const ageGroup = getAgeGroup(age)
  return getAgeGroupConfig(ageGroup)
}

/**
 * Checks if a difficulty level is appropriate for an age group
 */
export function isDifficultyAppropriateForAge(
  difficulty: number,
  ageGroup: AgeGroup
): boolean {
  const config = getAgeGroupConfig(ageGroup)
  return difficulty >= config.difficultyRange.min && 
         difficulty <= config.difficultyRange.max
}

/**
 * Checks if content is appropriate for a child's age
 */
export function isContentAppropriateForAge(
  contentAgeGroup: AgeGroup | string,
  childAgeGroup: AgeGroup
): boolean {
  // Only show content from the same age group
  return contentAgeGroup === childAgeGroup
}

/**
 * Filters content by age group
 */
export function filterContentByAgeGroup<T extends { ageGroup?: AgeGroup | string }>(
  content: T[],
  childAgeGroup: AgeGroup
): T[] {
  return content.filter(item => 
    !item.ageGroup || isContentAppropriateForAge(item.ageGroup, childAgeGroup)
  )
}

/**
 * Gets age-appropriate session duration
 */
export function getSessionDuration(ageGroup: AgeGroup): number {
  const config = getAgeGroupConfig(ageGroup)
  // Return average duration
  return Math.round((config.sessionDuration.min + config.sessionDuration.max) / 2)
}

/**
 * Gets UI complexity class for age-based styling
 */
export function getUIComplexityClass(ageGroup: AgeGroup): string {
  const config = getAgeGroupConfig(ageGroup)
  
  switch (config.uiComplexity) {
    case 'simple':
      return 'age-simple' // Extra large buttons, minimal text
    case 'moderate':
      return 'age-moderate' // Medium elements, balanced
    case 'advanced':
      return 'age-advanced' // Sophisticated, detailed
    default:
      return 'age-moderate'
  }
}

/**
 * Gets button size class based on age group
 */
export function getButtonSizeClass(ageGroup: AgeGroup): string {
  const config = getAgeGroupConfig(ageGroup)
  
  switch (config.uiComplexity) {
    case 'simple':
      return 'text-2xl px-8 py-6' // Extra large for 3-5
    case 'moderate':
      return 'text-xl px-6 py-4' // Medium for 6-8
    case 'advanced':
      return 'text-lg px-5 py-3' // Standard for 9-12
    default:
      return 'text-xl px-6 py-4'
  }
}

/**
 * Gets mascot emotion based on age group
 */
export function getAgeGroupMascotEmotion(ageGroup: AgeGroup): string {
  switch (ageGroup) {
    case AgeGroup.AGE_3_5:
      return 'celebrating' // Friendly, encouraging
    case AgeGroup.AGE_6_8:
      return 'excited' // Energetic, achievement-focused
    case AgeGroup.AGE_9_12:
      return 'confident' // Sophisticated, mentor-style
    default:
      return 'happy'
  }
}

