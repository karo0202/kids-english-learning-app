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
  {
    id: 'ten_activities',
    title: 'Getting Started',
    hint: 'Complete 10 activities',
    iconKey: 'sparkles' as const,
  },
  {
    id: 'fifty_activities',
    title: 'Super Learner',
    hint: 'Complete 50 activities',
    iconKey: 'medal' as const,
  },
  {
    id: 'reading_fan',
    title: 'Bookworm',
    hint: 'Complete 5 reading activities',
    iconKey: 'sparkles' as const,
  },
  {
    id: 'writing_pro',
    title: 'Writing Pro',
    hint: 'Complete 10 writing activities',
    iconKey: 'sparkles' as const,
  },
  {
    id: 'grammar_hero',
    title: 'Grammar Hero',
    hint: 'Complete 10 grammar topics',
    iconKey: 'medal' as const,
  },
  {
    id: 'game_master',
    title: 'Game Master',
    hint: 'Complete 10 game activities',
    iconKey: 'map' as const,
  },
  {
    id: 'two_week_streak',
    title: 'Dedicated Learner',
    hint: 'Practice 14 days in a row',
    iconKey: 'flame' as const,
  },
  {
    id: 'high_scorer',
    title: 'High Scorer',
    hint: 'Reach 5,000 total points',
    iconKey: 'medal' as const,
  },
] as const

export type BadgeIconKey = (typeof BADGE_DEFINITIONS)[number]['iconKey']

export function isBadgeUnlocked(progress: UserProgress | null, badgeId: string): boolean {
  return Boolean(progress?.achievements?.includes(badgeId))
}

/** Short progress line for locked badge tiles. */
export function badgeProgressLabel(progress: UserProgress | null, badgeId: string): string {
  if (!progress) return 'Start learning to unlock'
  const ms = progress.moduleStats
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
    case 'ten_activities':
      return `${Math.min(progress.completedActivities, 10)}/10 activities`
    case 'fifty_activities':
      return `${Math.min(progress.completedActivities, 50)}/50 activities`
    case 'reading_fan':
      return `${Math.min(ms?.reading ?? 0, 5)}/5 reading`
    case 'writing_pro':
      return `${Math.min(ms?.writing ?? 0, 10)}/10 writing`
    case 'grammar_hero':
      return `${Math.min(ms?.grammar ?? 0, 10)}/10 grammar`
    case 'game_master':
      return `${Math.min(ms?.games ?? 0, 10)}/10 games`
    case 'two_week_streak':
      return progress.currentStreak >= 14
        ? 'Unlocked'
        : `${Math.min(progress.currentStreak, 14)}/14 streak days`
    case 'high_scorer':
      return `${Math.min(progress.totalScore, 5000)}/5000 points`
    default:
      return ''
  }
}
