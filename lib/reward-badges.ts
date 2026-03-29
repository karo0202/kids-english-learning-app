import type { UserProgress } from './progress'

/** Matches achievement ids emitted by `progressManager.checkAchievements`. */
export const BADGE_DEFINITIONS = [
  {
    id: 'first_activity',
    title: 'First Steps',
    hint: 'Finish one full activity',
    iconKey: 'sparkles' as const,
  },
  {
    id: 'week_streak',
    title: 'Week Warrior',
    hint: 'Practice 7 days in a row',
    iconKey: 'flame' as const,
  },
  {
    id: 'score_master',
    title: 'Score Master',
    hint: 'Reach 1,000 total points',
    iconKey: 'medal' as const,
  },
  {
    id: 'level_explorer',
    title: 'Level Explorer',
    hint: 'Reach level 5',
    iconKey: 'map' as const,
  },
] as const

export type BadgeIconKey = (typeof BADGE_DEFINITIONS)[number]['iconKey']

export function isBadgeUnlocked(progress: UserProgress | null, badgeId: string): boolean {
  return Boolean(progress?.achievements?.includes(badgeId))
}

/** Short progress line for locked badge tiles. */
export function badgeProgressLabel(progress: UserProgress | null, badgeId: string): string {
  if (!progress) return 'Start learning to unlock'
  switch (badgeId) {
    case 'first_activity':
      return progress.completedActivities >= 1
        ? 'Unlocked'
        : `${progress.completedActivities}/1 activity`
    case 'week_streak':
      return progress.currentStreak >= 7
        ? 'Unlocked'
        : `${Math.min(progress.currentStreak, 7)}/7 streak days`
    case 'score_master':
      return `${Math.min(progress.totalScore, 1000)}/1000 points`
    case 'level_explorer':
      return `Level ${progress.level}/5`
    default:
      return ''
  }
}
