'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  Upload, 
  Cloud, 
  Database, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  HardDrive,
  Clock,
  Users,
  Activity
} from 'lucide-react'
import { dataBackup } from '@/lib/data-backup'
import { dataPersistence } from '@/lib/data-persistence'

interface DataStats {
  totalChildren: number
  totalSessions: number
  totalProgress: number
  lastBackup: string | null
  storageUsed: number
}

export default function DataManagement() {
  const [stats, setStats] = useState<DataStats>({
    totalChildren: 0,
    totalSessions: 0,
    totalProgress: 0,
    lastBackup: null,
    storageUsed: 0
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)

  useEffect(() => {
    loadStats()
    // Enable auto-save every 5 minutes
    dataBackup.enableAutoSave(5)
  }, [])

  const loadStats = async () => {
    try {
      const dataStats = await dataBackup.getDataStats()
      setStats(dataStats)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleDownloadBackup = async () => {
    setIsLoading(true)
    setMessage(null)
    
    try {
      await dataBackup.downloadBackup()
      setMessage({ type: 'success', text: 'Backup downloaded successfully!' })
      
      // Update last backup time
      localStorage.setItem('last_backup', new Date().toISOString())
      await loadStats()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to download backup. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestoreBackup = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        setIsLoading(true)
        setMessage(null)
        
        try {
          const success = await dataBackup.restoreFromFile(file)
          if (success) {
            setMessage({ type: 'success', text: 'Data restored successfully! Page will reload...' })
            setTimeout(() => window.location.reload(), 2000)
          } else {
            setMessage({ type: 'error', text: 'Failed to restore data. Please check your backup file.' })
          }
        } catch (error) {
          setMessage({ type: 'error', text: 'Failed to restore data. Please try again.' })
        } finally {
          setIsLoading(false)
        }
      }
    }
    input.click()
  }

  const handleSaveNow = async () => {
    setIsLoading(true)
    setMessage(null)
    
    try {
      const success = await dataBackup.saveCurrentUserData()
      if (success) {
        setMessage({ type: 'success', text: 'Data saved successfully!' })
        localStorage.setItem('last_backup', new Date().toISOString())
        await loadStats()
      } else {
        setMessage({ type: 'error', text: 'Failed to save data. Please try again.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save data. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Data Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalChildren}</div>
              <div className="text-sm text-gray-600">Children</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalSessions}</div>
              <div className="text-sm text-gray-600">Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.totalProgress}</div>
              <div className="text-sm text-gray-600">Progress Records</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{formatBytes(stats.storageUsed)}</div>
              <div className="text-sm text-gray-600">Storage Used</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup & Restore */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Data Backup & Restore
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleDownloadBackup}
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Backup
            </Button>
            <Button
              onClick={handleRestoreBackup}
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              <Upload className="w-4 h-4 mr-2" />
              Restore Backup
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Last Backup:</span>
            </div>
            <Badge variant="secondary">
              {formatDate(stats.lastBackup)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Auto-Save Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Auto-Save Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Automatic Data Saving</div>
              <div className="text-sm text-gray-600">Your data is automatically saved every 5 minutes</div>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Active
            </Badge>
          </div>
          
          <Button
            onClick={handleSaveNow}
            disabled={isLoading}
            className="w-full"
            variant="default"
          >
            <HardDrive className="w-4 h-4 mr-2" />
            Save Now
          </Button>
        </CardContent>
      </Card>

      {/* Cloud Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Cloud Backup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Background Sync</div>
              <div className="text-sm text-gray-600">Sync your data in the background</div>
            </div>
            <Button
              onClick={() => dataBackup.enableCloudBackup()}
              variant="outline"
              size="sm"
            >
              <Cloud className="w-4 h-4 mr-1" />
              Enable
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Message Display */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200'
              : message.type === 'error'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : message.type === 'error' ? (
            <AlertTriangle className="w-5 h-5" />
          ) : (
            <Activity className="w-5 h-5" />
          )}
          {message.text}
        </motion.div>
      )}
    </div>
  )
}
