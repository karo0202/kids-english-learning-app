'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { 
  Volume2, Play, RotateCcw, Gauge, 
  VolumeX, Sparkles, Zap, Settings
} from 'lucide-react'
import { premiumTTS } from '@/lib/premium-tts'

interface VoiceControlsProps {
  onVoiceChange?: (voice: string) => void
  onSpeedChange?: (speed: string) => void
  testText?: string
  className?: string
}

export default function VoiceControls({
  onVoiceChange,
  onSpeedChange,
  testText = "Hello! This is how I sound.",
  className = ''
}: VoiceControlsProps) {
  const [selectedVoice, setSelectedVoice] = useState<'child-friendly' | 'clear' | 'friendly' | 'natural'>('child-friendly')
  const [speed, setSpeed] = useState<'very-slow' | 'slow' | 'normal' | 'fast' | 'very-fast'>('normal')
  const [volume, setVolume] = useState(0.9)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    // Load available voices
    const loadVoices = () => {
      premiumTTS.loadVoices()
      const voices = premiumTTS.getAvailableVoices()
      setAvailableVoices(voices)
    }

    loadVoices()
    // Voices may load asynchronously
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [])

  const voices = [
    { id: 'child-friendly', name: 'Child-Friendly', icon: '👶', description: 'Natural and friendly' },
    { id: 'clear', name: 'Clear', icon: '🎯', description: 'Very clear pronunciation' },
    { id: 'friendly', name: 'Friendly', icon: '😊', description: 'Warm and engaging' },
    { id: 'natural', name: 'Natural', icon: '✨', description: 'Most natural sounding' },
  ]

  const speeds = [
    { id: 'very-slow', name: 'Very Slow', rate: 0.4 },
    { id: 'slow', name: 'Slow', rate: 0.6 },
    { id: 'normal', name: 'Normal', rate: 0.85 },
    { id: 'fast', name: 'Fast', rate: 1.0 },
    { id: 'very-fast', name: 'Very Fast', rate: 1.2 },
  ]

  const handleVoiceSelect = async (voiceId: string) => {
    setSelectedVoice(voiceId as any)
    onVoiceChange?.(voiceId)
    
    // Test the voice
    setIsSpeaking(true)
    await premiumTTS.speak(testText, {
      voice: voiceId as any,
      volume,
      rate: speeds.find(s => s.id === speed)?.rate || 0.85,
    })
    setIsSpeaking(false)
  }

  const handleSpeedChange = async (speedId: string) => {
    setSpeed(speedId as any)
    onSpeedChange?.(speedId)
    
    // Test the speed
    setIsSpeaking(true)
    await premiumTTS.speakWithSpeed(testText, speedId as any, {
      voice: selectedVoice,
      volume,
    })
    setIsSpeaking(false)
  }

  const handleTest = async () => {
    setIsSpeaking(true)
    await premiumTTS.speak(testText, {
      voice: selectedVoice,
      volume,
      rate: speeds.find(s => s.id === speed)?.rate || 0.85,
    })
    setIsSpeaking(false)
  }

  const handleRepeat = async () => {
    setIsSpeaking(true)
    try {
      await premiumTTS.repeat({
        voice: selectedVoice,
        volume,
        rate: speeds.find(s => s.id === speed)?.rate || 0.85,
      })
    } catch (error) {
      // If no previous text, just speak test text
      await handleTest()
    }
    setIsSpeaking(false)
  }

  const handleSlowMode = async () => {
    setIsSpeaking(true)
    await premiumTTS.speakSlow(testText, {
      voice: selectedVoice,
      volume,
    })
    setIsSpeaking(false)
  }

  return (
    <Card className={`bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-800 dark:to-purple-900/20 border-purple-200 dark:border-purple-800 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Volume2 className="w-5 h-5 text-purple-600" />
          Voice Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Voice Selection */}
        <div>
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">
            Voice Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {voices.map((voice) => (
              <motion.button
                key={voice.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleVoiceSelect(voice.id)}
                className={`p-3 rounded-xl border-2 transition-all text-left ${
                  selectedVoice === voice.id
                    ? 'border-purple-500 bg-purple-100 dark:bg-purple-900/30 shadow-md'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{voice.icon}</span>
                  <span className="font-semibold text-sm">{voice.name}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{voice.description}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Speed Control */}
        <div>
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block flex items-center gap-2">
            <Gauge className="w-4 h-4" />
            Speaking Speed
          </label>
          <div className="space-y-2">
            <Slider
              value={[speeds.findIndex(s => s.id === speed)]}
              onValueChange={(value) => handleSpeedChange(speeds[value[0]]?.id || 'normal')}
              max={speeds.length - 1}
              min={0}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              {speeds.map((s) => (
                <span
                  key={s.id}
                  className={speed === s.id ? 'font-bold text-purple-600' : ''}
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Volume Control */}
        <div>
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            Volume
          </label>
          <div className="space-y-2">
            <Slider
              value={[volume]}
              onValueChange={(value) => setVolume(value[0])}
              max={1}
              min={0}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>0%</span>
              <span className="font-bold">{Math.round(volume * 100)}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button
            onClick={handleTest}
            disabled={isSpeaking}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            <Play className="w-4 h-4 mr-2" />
            {isSpeaking ? 'Speaking...' : 'Test Voice'}
          </Button>
          <Button
            onClick={handleRepeat}
            disabled={isSpeaking}
            variant="outline"
            className="border-purple-300 hover:bg-purple-50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Repeat
          </Button>
        </div>

        {/* Quick Actions */}
        <div>
          <Button
            onClick={handleSlowMode}
            disabled={isSpeaking}
            variant="outline"
            className="w-full border-blue-300 hover:bg-blue-50"
          >
            <Zap className="w-4 h-4 mr-2" />
            Slow Mode (For Difficult Words)
          </Button>
        </div>

        {/* Voice Quality Indicator */}
        {premiumTTS.isGoogleTTSEnabled() && (
          <div className="pt-2 border-t border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
              <Sparkles className="w-3 h-3" />
              <span>Premium voice quality enabled</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
