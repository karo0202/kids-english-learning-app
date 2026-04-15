/**
 * Maps each age band to its own learning track (primary) vs optional extras (secondary).
 * Every ModuleId appears exactly once per age group across primary ∪ secondary.
 */
import { AgeGroup } from './age-utils'
import type { ModuleId } from './subscription'

export interface AgeGroupModuleSplit {
  /** Shown first — matches marketing: Little Learners / Word Builders / Language Masters */
  primary: ModuleId[]
  /** Still available; de-emphasized under "More activities" */
  secondary: ModuleId[]
}

const SPLIT: Record<AgeGroup, AgeGroupModuleSplit> = {
  [AgeGroup.AGE_3_5]: {
    primary: ['alphabet-coloring', 'games', 'reading', 'counting', 'writing'],
    secondary: ['speaking', 'grammar', 'puzzle', 'challenges'],
  },
  [AgeGroup.AGE_6_8]: {
    primary: ['reading', 'counting', 'writing', 'games', 'speaking', 'grammar'],
    secondary: ['puzzle', 'alphabet-coloring', 'challenges'],
  },
  [AgeGroup.AGE_9_12]: {
    primary: ['reading', 'grammar', 'puzzle', 'writing', 'speaking', 'challenges'],
    secondary: ['games', 'counting', 'alphabet-coloring'],
  },
}

export function getModulesForAgeGroup(ageGroup: AgeGroup | string | undefined): AgeGroupModuleSplit {
  const g = ageGroup as AgeGroup
  if (g && SPLIT[g]) return SPLIT[g]
  return SPLIT[AgeGroup.AGE_6_8]
}

export function getAgeTrackLabel(ageGroup: AgeGroup | string | undefined): string {
  switch (ageGroup as AgeGroup) {
    case AgeGroup.AGE_3_5:
      return 'Ages 3–5 · Little Learners'
    case AgeGroup.AGE_6_8:
      return 'Ages 6–8 · Word Builders'
    case AgeGroup.AGE_9_12:
      return 'Ages 9–12 · Language Masters'
    default:
      return 'Learning modules'
  }
}
