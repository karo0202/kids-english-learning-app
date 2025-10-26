'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { 
  Volume2, VolumeX, Music, Zap, Mic, 
  Settings, Play, Pause, RotateCcw
} from 'lucide-react'
import { audioManager, AudioSettings } from '@/lib/audio-manager'

interface AudioSettingsProps {
  isOpen: boolean
  onClose: () => void
}

export default function AudioSettings({ isOpen, onClose }: AudioSettingsProps) {
  const [settings, setSettings] = useState<AudioSettings>(audioManager.getSettings())
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setSettings(audioManager.getSettings())
    }
  }, [isOpen])

  const handleSettingChange = (key: keyof AudioSettings, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    audioManager.updateSettings({ [key]: value })
  }

  const handleVolumeChange = (key: 'masterVolume' | 'musicVolume' | 'effectsVolume' | 'voiceVolume', value: number[]) => {
    handleSettingChange(key, value[0])
  }

  const testSound = async (soundName: string) => {
    await audioManager.playSound(soundName)
  }

  const testBackgroundMusic = async () => {
    if (isPlaying) {
      audioManager.stopBackgroundMusic()
      setIsPlaying(false)
    } else {
      await audioManager.playBackgroundMusic('default')
      setIsPlaying(true)
    }
  }

  const resetToDefaults = () => {
    const defaultSettings = {
      masterVolume: 0.7,
      musicVolume: 0.5,
      effectsVolume: 0.8,
      voiceVolume: 0.9,
      backgroundMusicEnabled: true,
      soundEffectsEnabled: true,
      voiceEnabled: true
    }
    setSettings(defaultSettings)
    audioManager.updateSettings(defaultSettings)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Settings className="w-6 h-6 text-blue-500" />
                <CardTitle className="text-xl font-bold text-gray-800">
                  Audio Settings
                </CardTitle>
              </div>
              <p className="text-gray-600 text-sm">
                Customize your learning experience
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Master Volume */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-700">Master Volume</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {Math.round(settings.masterVolume * 100)}%
                  </span>
                </div>
                <Slider
                  value={[settings.masterVolume]}
                  onValueChange={(value) => handleVolumeChange('masterVolume', value)}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Background Music */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Music className="w-5 h-5 text-purple-500" />
                    <span className="font-medium text-gray-700">Background Music</span>
                  </div>
                  <Switch
                    checked={settings.backgroundMusicEnabled}
                    onCheckedChange={(checked) => handleSettingChange('backgroundMusicEnabled', checked)}
                  />
                </div>
                
                {settings.backgroundMusicEnabled && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Music Volume</span>
                      <span className="text-sm text-gray-500">
                        {Math.round(settings.musicVolume * 100)}%
                      </span>
                    </div>
                    <Slider
                      value={[settings.musicVolume]}
                      onValueChange={(value) => handleVolumeChange('musicVolume', value)}
                      max={1}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={testBackgroundMusic}
                      className="w-full"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Stop Music
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Test Music
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Sound Effects */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <span className="font-medium text-gray-700">Sound Effects</span>
                  </div>
                  <Switch
                    checked={settings.soundEffectsEnabled}
                    onCheckedChange={(checked) => handleSettingChange('soundEffectsEnabled', checked)}
                  />
                </div>
                
                {settings.soundEffectsEnabled && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Effects Volume</span>
                      <span className="text-sm text-gray-500">
                        {Math.round(settings.effectsVolume * 100)}%
                      </span>
                    </div>
                    <Slider
                      value={[settings.effectsVolume]}
                      onValueChange={(value) => handleVolumeChange('effectsVolume', value)}
                      max={1}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                    
                    {/* Sound Effect Tests */}
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testSound('success')}
                        className="text-xs"
                      >
                        Test Success
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testSound('error')}
                        className="text-xs"
                      >
                        Test Error
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testSound('correct')}
                        className="text-xs"
                      >
                        Test Correct
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testSound('achievement')}
                        className="text-xs"
                      >
                        Test Achievement
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Voice Settings */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mic className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-gray-700">Voice & Speech</span>
                  </div>
                  <Switch
                    checked={settings.voiceEnabled}
                    onCheckedChange={(checked) => handleSettingChange('voiceEnabled', checked)}
                  />
                </div>
                
                {settings.voiceEnabled && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Voice Volume</span>
                      <span className="text-sm text-gray-500">
                        {Math.round(settings.voiceVolume * 100)}%
                      </span>
                    </div>
                    <Slider
                      value={[settings.voiceVolume]}
                      onValueChange={(value) => handleVolumeChange('voiceVolume', value)}
                      max={1}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => audioManager.speak("Hello! This is how I sound.")}
                      className="w-full"
                    >
                      Test Voice
                    </Button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={resetToDefaults}
                  className="flex-1"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button
                  onClick={onClose}
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                >
                  Done
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
