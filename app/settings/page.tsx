'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'
import { Mascot } from '@/components/ui/mascot'
import { 
  ArrowLeft, Settings, Volume2, VolumeX, Music, 
  Palette, Sun, Moon, Monitor, Zap
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/lib/theme-context'
import DataManagement from '@/components/data-management'
import SubscriptionBillingHelp from '@/components/subscription-billing-help'

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [preferences, setPreferences] = useState({
    soundEnabled: true,
    musicEnabled: true,
    difficulty: 'easy' as 'easy' | 'medium' | 'hard'
  })

  useEffect(() => {
    // Load preferences from localStorage
    const savedPrefs = localStorage.getItem('user_preferences')
    if (savedPrefs) {
      try {
        const parsed = JSON.parse(savedPrefs)
        setPreferences({
          soundEnabled: parsed.soundEnabled ?? true,
          musicEnabled: parsed.musicEnabled ?? true,
          difficulty: parsed.difficulty ?? 'easy'
        })
      } catch (error) {
        console.error('Error loading preferences:', error)
      }
    }
  }, [])

  const updatePreference = (key: string, value: any) => {
    const newPreferences = { ...preferences, [key]: value }
    setPreferences(newPreferences)
    
    // Save to localStorage
    localStorage.setItem('user_preferences', JSON.stringify(newPreferences))
    // Also write specific keys other modules can read directly
    if (key === 'soundEnabled') localStorage.setItem('audio_sound_enabled', String(value))
    if (key === 'musicEnabled') localStorage.setItem('audio_music_enabled', String(value))
    if (key === 'difficulty') localStorage.setItem('learning_difficulty', String(value))
    // Broadcast change for listeners
    try { window.dispatchEvent(new CustomEvent('app:settings-updated', { detail: { key, value, all: newPreferences } })) } catch {}
    
    // Apply audio settings immediately
    if (key === 'soundEnabled') {
      if (value) {
        // Simple audio feedback
        const audio = new Audio('/sounds/click.mp3')
        audio.play().catch(() => {}) // Ignore errors if audio fails
      }
    }
  }

  const testSound = () => {
    try {
      const audio = new Audio('/sounds/success.mp3')
      audio.play().catch(() => {})
    } catch {}
  }

  const testMusic = () => {
    try {
      const audio = new Audio('/sounds/background.mp3')
      audio.loop = true
      audio.volume = 0.6
      audio.play().catch(() => {})
      // Stop playback automatically after 4s
      setTimeout(() => { try { audio.pause(); audio.currentTime = 0 } catch {} }, 4000)
    } catch {}
  }

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 bg-transparent" />
      <div className="absolute inset-0 opacity-[0.35] pointer-events-none" style={{backgroundImage:'radial-gradient(circle at 10% 10%, rgba(99,102,241,0.08) 0 12%, transparent 12%), radial-gradient(circle at 90% 20%, rgba(236,72,153,0.08) 0 12%, transparent 12%), radial-gradient(circle at 30% 80%, rgba(16,185,129,0.08) 0 12%, transparent 12%)'}} />
      <div className="relative">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-md border-b border-white/60 dark:bg-white/5 dark:border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <Mascot emotion="happy" size="medium" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h1>
                  <p className="text-gray-600 dark:text-white/70">Customize your learning experience! ⚙️</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="max-w-5xl mx-auto space-y-10">
          {/* Audio Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-white/70 backdrop-blur-xl border-white/60 dark:bg-white/5 dark:border-white/10 shadow-xl">
              <CardHeader>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Volume2 className="w-6 h-6 text-blue-500" />
                  Audio Settings
                </h2>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sound Effects */}
                <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-gradient-to-br from-white to-slate-50 dark:from-white/5 dark:to-white/5">
                  <div className="flex items-center gap-3">
                    {preferences.soundEnabled ? (
                      <Volume2 className="w-6 h-6 text-green-500" />
                    ) : (
                      <VolumeX className="w-6 h-6 text-gray-400" />
                    )}
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-white">Sound Effects</h3>
                      <p className="text-sm text-gray-600 dark:text-white/70">Play sounds for interactions and feedback</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={testSound}
                      disabled={!preferences.soundEnabled}
                      className="hidden sm:inline-flex"
                    >
                      Test
                    </Button>
                    <button
                      role="switch"
                      aria-checked={preferences.soundEnabled}
                      aria-label="Toggle sound effects"
                      onClick={() => updatePreference('soundEnabled', !preferences.soundEnabled)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${preferences.soundEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${preferences.soundEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

                {/* Background Music */}
                <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-gradient-to-br from-white to-slate-50 dark:from-white/5 dark:to-white/5">
                  <div className="flex items-center gap-3">
                    {preferences.musicEnabled ? (
                      <Music className="w-6 h-6 text-purple-500" />
                    ) : (
                      <Music className="w-6 h-6 text-gray-400" />
                    )}
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-white">Background Music</h3>
                      <p className="text-sm text-gray-600 dark:text-white/70">Play gentle music while learning</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={testMusic}
                      disabled={!preferences.musicEnabled}
                      className="hidden sm:inline-flex"
                    >
                      Test
                    </Button>
                    <button
                      role="switch"
                      aria-checked={preferences.musicEnabled}
                      aria-label="Toggle background music"
                      onClick={() => updatePreference('musicEnabled', !preferences.musicEnabled)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${preferences.musicEnabled ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${preferences.musicEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Learning Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/70 backdrop-blur-xl border-white/60 dark:bg-white/5 dark:border-white/10 shadow-xl">
              <CardHeader>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Zap className="w-6 h-6 text-yellow-500" />
                  Learning Settings
                </h2>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Difficulty Level */}
                <div className="p-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-gradient-to-br from-white to-slate-50 dark:from-white/5 dark:to-white/5">
                  <h3 className="font-bold text-gray-800 dark:text-white mb-3">Difficulty Level</h3>
                  <p className="text-sm text-gray-600 dark:text-white/70 mb-4">Choose how challenging the activities should be</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { value: 'easy', label: 'Easy', emoji: '🌱', description: 'Perfect for beginners', activeColor: 'bg-green-500 hover:bg-green-600 text-white border-green-500' },
                      { value: 'medium', label: 'Medium', emoji: '⚡', description: 'Balanced challenge', activeColor: 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500' },
                      { value: 'hard', label: 'Hard', emoji: '🔥', description: 'For advanced learners', activeColor: 'bg-red-500 hover:bg-red-600 text-white border-red-500' }
                    ].map((level) => (
                      <button
                        key={level.value}
                        onClick={() => updatePreference('difficulty', level.value)}
                        aria-pressed={preferences.difficulty === level.value}
                        className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all duration-200 ${
                          preferences.difficulty === level.value
                            ? `${level.activeColor} shadow-md scale-[1.02]`
                            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-white/5 text-gray-700 dark:text-white hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <div className="text-center">
                          <span className="text-lg">{level.emoji}</span>
                          <div className="font-bold text-sm mt-1">{level.label}</div>
                          <div className="text-xs opacity-80">{level.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Theme Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/70 backdrop-blur-xl border-white/60 dark:bg-white/5 dark:border-white/10 shadow-xl">
              <CardHeader>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Palette className="w-6 h-6 text-pink-500" />
                  Appearance
                </h2>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Theme Selection */}
                <div className="p-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-gradient-to-br from-white to-slate-50 dark:from-white/5 dark:to-white/5">
                  <h3 className="font-bold text-gray-800 dark:text-white mb-3">Theme</h3>
                  <p className="text-sm text-gray-600 dark:text-white/70 mb-4">Choose your preferred color scheme</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { value: 'light', label: 'Light', icon: Sun, description: 'Bright and cheerful' },
                      { value: 'dark', label: 'Dark', icon: Moon, description: 'Easy on the eyes' },
                      { value: 'auto', label: 'Auto', icon: Monitor, description: 'Follows system' }
                    ].map((themeOption) => (
                      <Button
                        key={themeOption.value}
                        variant={theme === themeOption.value ? "default" : "outline"}
                        onClick={() => setTheme(themeOption.value as any)}
                        className="flex-1 h-auto py-4"
                        aria-pressed={theme === themeOption.value}
                      >
                        <div className="text-center">
                          <themeOption.icon className="w-5 h-5 mx-auto mb-1" />
                          <div className="font-bold">{themeOption.label}</div>
                          <div className="text-xs opacity-80">{themeOption.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Subscription & billing (cancel / support) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <SubscriptionBillingHelp />
          </motion.div>

          {/* Data Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/70 backdrop-blur-xl border border-blue-100 dark:bg-white/5 dark:border-white/10 shadow-xl">
              <CardHeader>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Settings className="w-6 h-6 text-blue-500" />
                  Data Management
                </h2>
                <p className="text-gray-600 dark:text-white/70">Manage your learning data, backups, and storage</p>
              </CardHeader>
              <CardContent>
                <DataManagement />
              </CardContent>
            </Card>
          </motion.div>

          {/* Reset Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/70 backdrop-blur-xl border border-red-100 dark:bg-white/5 dark:border-white/10 shadow-xl">
              <CardHeader>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Settings className="w-6 h-6 text-red-500" />
                  Reset Settings
                </h2>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-2xl border border-red-100 dark:border-white/10 bg-gradient-to-br from-white to-red-50 dark:from-white/5 dark:to-white/5">
                  <h3 className="font-bold text-gray-800 dark:text-white mb-2">Reset to Defaults</h3>
                  <p className="text-sm text-gray-600 dark:text-white/70 mb-4">
                    This will reset all your settings to their default values
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const defaultPrefs = {
                        soundEnabled: true,
                        musicEnabled: true,
                        difficulty: 'easy' as const
                      }
                      setPreferences(defaultPrefs)
                      setTheme('light')
                      localStorage.setItem('user_preferences', JSON.stringify({...defaultPrefs, theme: 'light'}))
                      // Simple audio feedback
                      const audio = new Audio('/sounds/click.mp3')
                      audio.play().catch(() => {}) // Ignore errors if audio fails
                    }}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    Reset Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      </div>
    </div>
  )
}
