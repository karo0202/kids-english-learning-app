// Data backup and recovery service
import { dataPersistence } from './data-persistence'
import { getUserSession } from './simple-auth'

export class DataBackupService {
  private static instance: DataBackupService

  static getInstance(): DataBackupService {
    if (!DataBackupService.instance) {
      DataBackupService.instance = new DataBackupService()
    }
    return DataBackupService.instance
  }

  // Auto-save user data periodically
  async enableAutoSave(intervalMinutes: number = 5): Promise<void> {
    if (typeof window === 'undefined') return

    setInterval(async () => {
      try {
        const user = getUserSession()
        if (user) {
          await this.saveCurrentUserData()
          console.log('Auto-save completed')
        }
      } catch (error) {
        console.error('Auto-save failed:', error)
      }
    }, intervalMinutes * 60 * 1000)
  }

  // Save all current user data
  async saveCurrentUserData(): Promise<boolean> {
    try {
      const user = getUserSession()
      if (!user) return false

      // Get all data from localStorage
      const children = this.getChildrenFromStorage()
      const progress = this.getProgressFromStorage()
      const sessions = this.getSessionsFromStorage()

      // Save to persistence layer
      await dataPersistence.saveUser({
        id: user.id,
        email: user.email,
        name: user.name,
        accountType: user.accountType as 'parent' | 'child',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        preferences: this.getUserPreferences()
      })

      // Save children
      for (const child of children) {
        await dataPersistence.saveChild(child)
      }

      // Save progress
      for (const [childId, childProgress] of Object.entries(progress)) {
        await dataPersistence.saveProgress(childProgress)
      }

      // Save recent sessions
      const recentSessions = sessions.slice(-50) // Keep last 50 sessions
      for (const session of recentSessions) {
        await dataPersistence.saveSession(session)
      }

      return true
    } catch (error) {
      console.error('Failed to save current user data:', error)
      return false
    }
  }

  // Create downloadable backup
  async createBackup(): Promise<Blob> {
    try {
      const user = getUserSession()
      if (!user) throw new Error('No user session found')

      const exportData = await dataPersistence.exportUserData(user.id)
      const blob = new Blob([exportData], { type: 'application/json' })
      
      return blob
    } catch (error) {
      console.error('Failed to create backup:', error)
      throw error
    }
  }

  // Download backup file
  async downloadBackup(): Promise<void> {
    try {
      const blob = await this.createBackup()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `kids-english-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download backup:', error)
      throw error
    }
  }

  // Restore from backup file
  async restoreFromFile(file: File): Promise<boolean> {
    try {
      const text = await file.text()
      const success = await dataPersistence.importUserData(text)
      
      if (success) {
        // Refresh the page to reload all data
        window.location.reload()
      }
      
      return success
    } catch (error) {
      console.error('Failed to restore from file:', error)
      return false
    }
  }

  // Cloud backup (using browser storage APIs)
  async enableCloudBackup(): Promise<boolean> {
    try {
      if (!('serviceWorker' in navigator) || !('sync' in window.ServiceWorkerRegistration.prototype)) {
        console.warn('Cloud backup not supported in this browser')
        return false
      }

      // Register for background sync
      const registration = await navigator.serviceWorker.ready
      if ('sync' in registration) {
        await (registration as any).sync.register('cloud-backup')
      }
      
      return true
    } catch (error) {
      console.error('Failed to enable cloud backup:', error)
      return false
    }
  }

  // Get data statistics
  async getDataStats(): Promise<{
    totalChildren: number
    totalSessions: number
    totalProgress: number
    lastBackup: string | null
    storageUsed: number
  }> {
    try {
      const user = getUserSession()
      if (!user) return {
        totalChildren: 0,
        totalSessions: 0,
        totalProgress: 0,
        lastBackup: null,
        storageUsed: 0
      }

      const children = await dataPersistence.getChildren(user.id)
      const sessions = await dataPersistence.getSessions(user.id, 1000)
      
      let totalProgress = 0
      for (const child of children) {
        const progress = await dataPersistence.getProgress(child.id)
        if (progress) totalProgress++
      }

      // Calculate storage usage
      const storageUsed = this.calculateStorageUsage()

      return {
        totalChildren: children.length,
        totalSessions: sessions.length,
        totalProgress,
        lastBackup: localStorage.getItem('last_backup') || null,
        storageUsed
      }
    } catch (error) {
      console.error('Failed to get data stats:', error)
      return {
        totalChildren: 0,
        totalSessions: 0,
        totalProgress: 0,
        lastBackup: null,
        storageUsed: 0
      }
    }
  }

  // Helper methods
  private getChildrenFromStorage(): any[] {
    if (typeof window === 'undefined') return []
    try {
      return JSON.parse(localStorage.getItem('children') || '[]')
    } catch {
      return []
    }
  }

  private getProgressFromStorage(): { [key: string]: any } {
    if (typeof window === 'undefined') return {}
    try {
      return JSON.parse(localStorage.getItem('progress') || '{}')
    } catch {
      return {}
    }
  }

  private getSessionsFromStorage(): any[] {
    if (typeof window === 'undefined') return []
    try {
      return JSON.parse(localStorage.getItem('learning_sessions') || '[]')
    } catch {
      return []
    }
  }

  private getUserPreferences(): any {
    if (typeof window === 'undefined') return {}
    try {
      return JSON.parse(localStorage.getItem('user_preferences') || '{}')
    } catch {
      return {}
    }
  }

  private calculateStorageUsage(): number {
    if (typeof window === 'undefined') return 0
    
    let total = 0
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length
      }
    }
    
    return total
  }
}

// Export singleton instance
export const dataBackup = DataBackupService.getInstance()
