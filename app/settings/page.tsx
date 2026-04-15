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
import LanguageSwitcher from '@/components/language-switcher'
import { useTranslation } from '@/lib/i18n'

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { t, dir } = useTranslation()
  const [preferences, setPreferences] = useState({
    soundEnabled: true,
    musicEnabled: true,
    difficulty: 'easy' as 'easy' | 'medium' | 'hard'
  })

  useEffect(() => {
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
    
    localStorage.setItem('user_preferences', JSON.stringify(newPreferences))
    if (key === 'soundEnabled') localStorage.setItem('audio_sound_enabled', String(value))
    if (key === 'musicEnabled') localStorage.setItem('audio_music_enabled', String(value))
    if (key === 'difficulty') localStorage.setItem('learning_difficulty', String(value))
    try { window.dispatchEvent(new CustomEvent('app:settings-updated', { detail: { key, value, all: newPreferences } })) } catch {}
    
    if (key === 'soundEnabled') {
      if (value) {
        const audio = new Audio('/sounds/click.mp3')
        audio.play().catch(() => {})
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
                <ArrowLeft className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                {t('back')}
              </Button>
              <div className="flex items-center gap-3">
                <Mascot emotion="happy" size="medium" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('settings')}</h1>
                  <p className="text-gray-600 dark:text-white/70">{t('customizeExperience')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="max-w-5xl mx-auto space-y-10">

          {/* Language Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-white/70 backdrop-blur-xl border-white/60 dark:bg-white/5 dark:border-white/10 shadow-xl">
              <CardHeader>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  🌐
                  {t('language')}
                </h2>
              </CardHeader>
              <CardContent>
                <LanguageSwitcher />
              </CardContent>
            </Card>
          </motion.div>

          {/* Audio Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Card className="bg-white/70 backdrop-blur-xl border-white/60 dark:bg-white/5 dark:border-white/10 shadow-xl">
              <CardHeader>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Volume2 className="w-6 h-6 text-blue-500" />
                  {t('audioSettings')}
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
                      <h3 className="font-bold text-gray-800 dark:text-white">{t('soundEffects')}</h3>
                      <p className="text-sm text-gray-600 dark:text-white/70">{t('soundDesc')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={testSound}
                      disabled={!preferences.soundEnabled}
                    >
                      {t('testSound')}
                    </Button>
                    <Button
                      variant={preferences.soundEnabled ? "default" : "outline"}
                      onClick={() => updatePreference('soundEnabled', !preferences.soundEnabled)}
                    >
                      {preferences.soundEnabled ? t('enabled') : t('disabled')}
                    </Button>
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
                      <h3 className="font-bold text-gray-800 dark:text-white">{t('backgroundMusic')}</h3>
                      <p className="text-sm text-gray-600 dark:text-white/70">{t('musicDesc')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={testMusic}
                      disabled={!preferences.musicEnabled}
                    >
                      {t('testMusic')}
                    </Button>
                    <Button
                      variant={preferences.musicEnabled ? "default" : "outline"}
                      onClick={() => updatePreference('musicEnabled', !preferences.musicEnabled)}
                    >
                      {preferences.musicEnabled ? t('enabled') : t('disabled')}
                    </Button>
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
                  {t('learningSettings')}
                </h2>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-gradient-to-br from-white to-slate-50 dark:from-white/5 dark:to-white/5">
                  <h3 className="font-bold text-gray-800 dark:text-white mb-3">{t('difficultyLevel')}</h3>
                  <p className="text-sm text-gray-600 dark:text-white/70 mb-4">{t('difficultyDesc')}</p>
                  <div className="flex gap-3">
                    {[
                      { value: 'easy', label: t('easy'), description: t('easyDesc') },
                      { value: 'medium', label: t('medium'), description: t('mediumDesc') },
                      { value: 'hard', label: t('hard'), description: t('hardDesc') }
                    ].map((level) => (
                      <Button
                        key={level.value}
                        variant={preferences.difficulty === level.value ? "default" : "outline"}
                        onClick={() => updatePreference('difficulty', level.value)}
                        className="flex-1"
                      >
                        <div className="text-center">
                          <div className="font-bold">{level.label}</div>
                          <div className="text-xs opacity-80">{level.description}</div>
                        </div>
                      </Button>
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
                  {t('appearance')}
                </h2>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-gradient-to-br from-white to-slate-50 dark:from-white/5 dark:to-white/5">
                  <h3 className="font-bold text-gray-800 dark:text-white mb-3">{t('theme')}</h3>
                  <p className="text-sm text-gray-600 dark:text-white/70 mb-4">{t('themeDesc')}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { value: 'light', label: t('light'), icon: Sun, description: t('lightDesc') },
                      { value: 'dark', label: t('dark'), icon: Moon, description: t('darkDesc') },
                      { value: 'auto', label: t('auto'), icon: Monitor, description: t('autoDesc') }
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

          {/* Subscription & billing */}
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
                  {t('dataManagement')}
                </h2>
                <p className="text-gray-600 dark:text-white/70">{t('dataManagementDesc')}</p>
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
                  {t('resetSettings')}
                </h2>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-2xl border border-red-100 dark:border-white/10 bg-gradient-to-br from-white to-red-50 dark:from-white/5 dark:to-white/5">
                  <h3 className="font-bold text-gray-800 dark:text-white mb-2">{t('resetToDefaults')}</h3>
                  <p className="text-sm text-gray-600 dark:text-white/70 mb-4">
                    {t('resetDesc')}
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
                      const audio = new Audio('/sounds/click.mp3')
                      audio.play().catch(() => {})
                    }}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    {t('resetSettings')}
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
