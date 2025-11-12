import { getFirestoreClient } from '@/lib/firebase'
import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore'

export interface LetterTracingData {
  letter: string
  attempts: number
  successfulAttempts: number
  averageAccuracy: number
  averageTime: number
  lastAttempted: string
  difficulty: 'easy' | 'medium' | 'hard'
  traceData?: string
}

export interface WordProgress {
  word: string
  learned: boolean
  pronunciationScore?: number
  timesPracticed: number
  lastPracticed: string
  imageUrl?: string
}

export interface ActivityLog {
  id: string
  timestamp: string
  module: 'speaking' | 'writing' | 'reading' | 'games' | 'puzzle'
  activity: string
  score: number
  timeSpent: number
  details?: any
}

export interface AchievementLog {
  id: string
  achievementId: string
  name: string
  description: string
  icon: string
  earnedAt: string
}

export interface DailyUsage {
  date: string
  totalMinutes: number
  activitiesByModule: {
    speaking: number
    writing: number
    reading: number
    games: number
    puzzle: number
  }
}

export interface ChildAnalytics {
  childId: string
  letterTracing: { [letter: string]: LetterTracingData }
  wordsLearned: WordProgress[]
  activityLogs: ActivityLog[]
  achievements: AchievementLog[]
  dailyUsage: DailyUsage[]
  lastActive: string
  lastActivity: string
}

class ParentAnalyticsManager {
  private static instance: ParentAnalyticsManager

  private cache = new Map<string, ChildAnalytics>()
  private subscribers = new Map<string, Set<(analytics: ChildAnalytics) => void>>()
  private firestoreUnsubscribers = new Map<string, Unsubscribe>()

  private constructor() {}

  static getInstance(): ParentAnalyticsManager {
    if (!ParentAnalyticsManager.instance) {
      ParentAnalyticsManager.instance = new ParentAnalyticsManager()
    }
    return ParentAnalyticsManager.instance
  }

  subscribe(parentId: string, childId: string, callback: (analytics: ChildAnalytics) => void): () => void {
    const key = this.getCacheKey(parentId, childId)
    const callbacks = this.subscribers.get(key) ?? new Set()
    callbacks.add(callback)
    this.subscribers.set(key, callbacks)

    callback(this.cloneAnalytics(this.getCachedAnalytics(parentId, childId)))
    this.ensureFirestoreListener(parentId, childId)

    return () => {
      const subs = this.subscribers.get(key)
      if (!subs) return
      subs.delete(callback)
      if (subs.size === 0) {
        this.subscribers.delete(key)
        this.detachFirestoreListener(key)
      }
    }
  }

  getCachedAnalytics(parentId: string, childId: string): ChildAnalytics {
    const key = this.getCacheKey(parentId, childId)

    if (this.cache.has(key)) {
      return this.cloneAnalytics(this.cache.get(key)!)
    }

    const local = this.loadFromLocal(parentId, childId)
    const analytics = local ?? this.createEmptyAnalytics(childId)
    this.cache.set(key, analytics)

    if (typeof window !== 'undefined') {
      void this.refreshFromFirestore(parentId, childId)
    }

    return this.cloneAnalytics(analytics)
  }

  async recordLetterTracing(
    parentId: string,
    childId: string,
    letter: string,
    success: boolean,
    accuracy: number,
    timeSpent: number,
    traceData?: string
  ) {
    const analytics = this.cloneAnalytics(this.getCachedAnalytics(parentId, childId))
    const letterKey = letter.toUpperCase()

    if (!analytics.letterTracing[letterKey]) {
      analytics.letterTracing[letterKey] = {
        letter: letterKey,
        attempts: 0,
        successfulAttempts: 0,
        averageAccuracy: 0,
        averageTime: 0,
        lastAttempted: new Date().toISOString(),
        difficulty: this.getLetterDifficulty(letterKey),
      }
    }

    const letterData = analytics.letterTracing[letterKey]
    letterData.attempts += 1
    if (success) {
      letterData.successfulAttempts += 1
    }

    letterData.averageAccuracy =
      (letterData.averageAccuracy * (letterData.attempts - 1) + accuracy) / letterData.attempts
    letterData.averageTime = (letterData.averageTime * (letterData.attempts - 1) + timeSpent) / letterData.attempts
    letterData.lastAttempted = new Date().toISOString()

    if (traceData) {
      letterData.traceData = traceData
    }

    analytics.lastActive = new Date().toISOString()
    analytics.lastActivity = `Traced letter ${letterKey}`

    this.updateAnalytics(parentId, analytics)
  }

  async recordWordProgress(
    parentId: string,
    childId: string,
    word: string,
    pronunciationScore?: number,
    imageUrl?: string
  ) {
    const analytics = this.cloneAnalytics(this.getCachedAnalytics(parentId, childId))
    const existing = analytics.wordsLearned.find(entry => entry.word === word)

    if (existing) {
      existing.timesPracticed += 1
      existing.lastPracticed = new Date().toISOString()
      if (pronunciationScore !== undefined) {
        existing.pronunciationScore = pronunciationScore
      }
      if (imageUrl) {
        existing.imageUrl = imageUrl
      }
    } else {
      analytics.wordsLearned.push({
        word,
        learned: true,
        pronunciationScore,
        timesPracticed: 1,
        lastPracticed: new Date().toISOString(),
        imageUrl,
      })
    }

    analytics.lastActive = new Date().toISOString()
    analytics.lastActivity = `Learned word: ${word}`

    this.updateAnalytics(parentId, analytics)
  }

  async recordActivity(
    parentId: string,
    childId: string,
    module: 'speaking' | 'writing' | 'reading' | 'games' | 'puzzle',
    activity: string,
    score: number,
    timeSpent: number,
    details?: any
  ) {
    const analytics = this.cloneAnalytics(this.getCachedAnalytics(parentId, childId))

    const log: ActivityLog = {
      id: `activity_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      timestamp: new Date().toISOString(),
      module,
      activity,
      score,
      timeSpent,
      details,
    }

    analytics.activityLogs.unshift(log)
    if (analytics.activityLogs.length > 1000) {
      analytics.activityLogs = analytics.activityLogs.slice(0, 1000)
    }

    const today = new Date().toISOString().split('T')[0]
    let dailyUsage = analytics.dailyUsage.find(entry => entry.date === today)

    if (!dailyUsage) {
      dailyUsage = {
        date: today,
        totalMinutes: 0,
        activitiesByModule: {
          speaking: 0,
          writing: 0,
          reading: 0,
          games: 0,
          puzzle: 0,
        },
      }
      analytics.dailyUsage.unshift(dailyUsage)
      if (analytics.dailyUsage.length > 90) {
        analytics.dailyUsage = analytics.dailyUsage.slice(0, 90)
      }
    }

    dailyUsage.totalMinutes += timeSpent
    dailyUsage.activitiesByModule[module] += 1

    analytics.lastActive = new Date().toISOString()
    analytics.lastActivity = `${activity} (${module})`

    this.updateAnalytics(parentId, analytics)
  }

  async recordAchievement(
    parentId: string,
    childId: string,
    achievementId: string,
    name: string,
    description: string,
    icon: string
  ) {
    const analytics = this.cloneAnalytics(this.getCachedAnalytics(parentId, childId))

    const achievement: AchievementLog = {
      id: `achievement_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      achievementId,
      name,
      description,
      icon,
      earnedAt: new Date().toISOString(),
    }

    analytics.achievements.unshift(achievement)
    analytics.lastActive = new Date().toISOString()
    analytics.lastActivity = `Earned: ${name}`

    this.updateAnalytics(parentId, analytics)
  }

  getStrugglingLetters(parentId: string, childId: string): string[] {
    const analytics = this.getCachedAnalytics(parentId, childId)
    return Object.values(analytics.letterTracing)
      .filter(entry => entry.averageAccuracy < 60 && entry.attempts >= 3)
      .map(entry => entry.letter)
      .sort()
  }

  getWeeklyProgress(parentId: string, childId: string): DailyUsage[] {
    const analytics = this.getCachedAnalytics(parentId, childId)
    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    return analytics.dailyUsage
      .filter(entry => new Date(entry.date) >= weekAgo)
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  private async refreshFromFirestore(parentId: string, childId: string) {
    const firestore = getFirestoreClient()
    if (!firestore) return

    try {
      const docRef = doc(firestore, 'parents', parentId, 'children', childId, 'analytics', 'summary')
      const snapshot = await getDoc(docRef)
      if (snapshot.exists()) {
        const analytics = this.normalizeAnalytics(snapshot.data(), childId)
        this.updateAnalytics(parentId, analytics, { persistToFirestore: false })
      }
    } catch (error) {
      console.error('Failed to refresh analytics from Firestore:', error)
    }
  }

  private ensureFirestoreListener(parentId: string, childId: string) {
    if (typeof window === 'undefined') return

    const key = this.getCacheKey(parentId, childId)
    if (this.firestoreUnsubscribers.has(key)) return

    const firestore = getFirestoreClient()
    if (!firestore) return

    const docRef = doc(firestore, 'parents', parentId, 'children', childId, 'analytics', 'summary')
    const unsubscribe = onSnapshot(
      docRef,
      snapshot => {
        if (!snapshot.exists()) return
        const analytics = this.normalizeAnalytics(snapshot.data(), childId)
        this.updateAnalytics(parentId, analytics, { persistToFirestore: false })
      },
      error => {
        console.error('Analytics snapshot listener error:', error)
      }
    )

    this.firestoreUnsubscribers.set(key, unsubscribe)
  }

  private detachFirestoreListener(key: string) {
    const unsubscribe = this.firestoreUnsubscribers.get(key)
    if (unsubscribe) {
      unsubscribe()
      this.firestoreUnsubscribers.delete(key)
    }
  }

  private updateAnalytics(
    parentId: string,
    analytics: ChildAnalytics,
    options: { persistToFirestore?: boolean } = { persistToFirestore: true }
  ) {
    const key = this.getCacheKey(parentId, analytics.childId)
    const cloned = this.cloneAnalytics(analytics)

    this.cache.set(key, cloned)
    this.persistToLocal(parentId, cloned)
    this.notifySubscribers(key, cloned)

    if (options.persistToFirestore) {
      void this.persistToFirestore(parentId, cloned)
    }
  }

  private async persistToFirestore(parentId: string, analytics: ChildAnalytics) {
    const firestore = getFirestoreClient()
    if (!firestore) return

    try {
      const docRef = doc(firestore, 'parents', parentId, 'children', analytics.childId, 'analytics', 'summary')
      const sanitized = JSON.parse(JSON.stringify(analytics))
      await setDoc(
        docRef,
        {
          ...sanitized,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
    } catch (error) {
      console.error('Failed to persist analytics to Firestore:', error)
    }
  }

  private loadFromLocal(parentId: string, childId: string): ChildAnalytics | null {
    if (typeof window === 'undefined') return null

    try {
      const raw = localStorage.getItem(this.getLocalStorageKey(parentId, childId))
      if (!raw) return null
      return this.normalizeAnalytics(JSON.parse(raw), childId)
    } catch (error) {
      console.error('Failed to load analytics from localStorage:', error)
      return null
    }
  }

  private persistToLocal(parentId: string, analytics: ChildAnalytics) {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(this.getLocalStorageKey(parentId, analytics.childId), JSON.stringify(analytics))
    } catch (error) {
      console.error('Failed to persist analytics locally:', error)
    }
  }

  private notifySubscribers(key: string, analytics: ChildAnalytics) {
    const subscribers = this.subscribers.get(key)
    if (!subscribers) return

    for (const callback of subscribers) {
      try {
        callback(this.cloneAnalytics(analytics))
      } catch (error) {
        console.error('Error notifying analytics subscriber:', error)
      }
    }
  }

  private normalizeAnalytics(data: any, childId: string): ChildAnalytics {
    const letterTracingRaw = data?.letterTracing ?? {}
    const letterTracing: Record<string, LetterTracingData> = {}

    Object.entries(letterTracingRaw).forEach(([letter, raw]) => {
      const entry = raw as Partial<LetterTracingData> & { lastAttempted?: any; difficulty?: any }
      const letterKey = letter.toUpperCase()

      letterTracing[letterKey] = {
        letter: letterKey,
        attempts: Number(entry.attempts ?? 0),
        successfulAttempts: Number(entry.successfulAttempts ?? 0),
        averageAccuracy: Number(entry.averageAccuracy ?? 0),
        averageTime: Number(entry.averageTime ?? 0),
        lastAttempted: this.toISO(entry.lastAttempted),
        difficulty: (entry.difficulty as 'easy' | 'medium' | 'hard') ?? this.getLetterDifficulty(letterKey),
        ...(entry.traceData ? { traceData: entry.traceData } : {}),
      }
    })

    const wordsLearned = Array.isArray(data?.wordsLearned)
      ? data.wordsLearned.map((word: any) => ({
          word: word?.word ?? '',
          learned: word?.learned !== false,
          pronunciationScore:
            word?.pronunciationScore === undefined ? undefined : Number(word.pronunciationScore),
          timesPracticed: Number(word?.timesPracticed ?? 0),
          lastPracticed: this.toISO(word?.lastPracticed),
          ...(word?.imageUrl ? { imageUrl: word.imageUrl } : {}),
        }))
      : []

    const activityLogs = Array.isArray(data?.activityLogs)
      ? data.activityLogs.map((log: any) => ({
          id: log?.id ?? `activity_${Math.random().toString(36).slice(2)}`,
          timestamp: this.toISO(log?.timestamp),
          module: log?.module ?? 'games',
          activity: log?.activity ?? 'Activity',
          score: Number(log?.score ?? 0),
          timeSpent: Number(log?.timeSpent ?? 0),
          details: log?.details,
        }))
      : []

    const achievements = Array.isArray(data?.achievements)
      ? data.achievements.map((achievement: any) => ({
          id: achievement?.id ?? `achievement_${Math.random().toString(36).slice(2)}`,
          achievementId: achievement?.achievementId ?? '',
          name: achievement?.name ?? '',
          description: achievement?.description ?? '',
          icon: achievement?.icon ?? '⭐',
          earnedAt: this.toISO(achievement?.earnedAt),
        }))
      : []

    const dailyUsage = Array.isArray(data?.dailyUsage)
      ? data.dailyUsage.map((usage: any) => ({
          date: typeof usage?.date === 'string' ? usage.date : this.toISO(usage?.date).split('T')[0],
          totalMinutes: Number(usage?.totalMinutes ?? 0),
          activitiesByModule: {
            speaking: Number(usage?.activitiesByModule?.speaking ?? 0),
            writing: Number(usage?.activitiesByModule?.writing ?? 0),
            reading: Number(usage?.activitiesByModule?.reading ?? 0),
            games: Number(usage?.activitiesByModule?.games ?? 0),
            puzzle: Number(usage?.activitiesByModule?.puzzle ?? 0),
          },
        }))
      : []

    return {
      childId,
      letterTracing,
      wordsLearned,
      activityLogs,
      achievements,
      dailyUsage,
      lastActive: this.toISO(data?.lastActive),
      lastActivity: data?.lastActivity ?? '',
    }
  }

  private createEmptyAnalytics(childId: string): ChildAnalytics {
    return {
      childId,
      letterTracing: {},
      wordsLearned: [],
      activityLogs: [],
      achievements: [],
      dailyUsage: [],
      lastActive: new Date().toISOString(),
      lastActivity: '',
    }
  }

  private getLetterDifficulty(letter: string): 'easy' | 'medium' | 'hard' {
    const easy = ['C', 'O', 'I', 'L', 'T', 'V', 'X']
    const hard = ['B', 'G', 'K', 'M', 'N', 'Q', 'R', 'W', 'Y', 'Z']

    if (easy.includes(letter)) return 'easy'
    if (hard.includes(letter)) return 'hard'
    return 'medium'
  }

  private getCacheKey(parentId: string, childId: string) {
    return `${parentId}:${childId}`
  }

  private getLocalStorageKey(parentId: string, childId: string) {
    return `analytics_${parentId}_${childId}`
  }

  private cloneAnalytics(analytics: ChildAnalytics): ChildAnalytics {
    return JSON.parse(JSON.stringify(analytics))
  }

  private toISO(value: any): string {
    if (!value) return new Date().toISOString()
    if (typeof value === 'string') return value
    if (value instanceof Date) return value.toISOString()
    if (typeof value?.toDate === 'function') return value.toDate().toISOString()
    return new Date(value).toISOString()
  }
}

export const parentAnalytics = ParentAnalyticsManager.getInstance()

