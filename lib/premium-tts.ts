/**
 * Premium Text-to-Speech Service
 * Uses Google Cloud TTS for best quality voices, falls back to Web Speech API
 * Optimized for kids' English learning with clear, natural pronunciation
 */

export interface TTSOptions {
  rate?: number // 0.1 to 1.0 (default: 0.85 for kids)
  pitch?: number // -20 to 20 semitones (default: 2 for friendly)
  volume?: number // 0.0 to 1.0
  voice?: 'child-friendly' | 'clear' | 'friendly' | 'natural' | 'slow' | 'fast'
  language?: string // Default: 'en-US'
  onStart?: () => void
  onEnd?: () => void
  onError?: (error: Error) => void
  onWordStart?: (word: string, index: number) => void // Word-by-word callback
  highlightWords?: boolean // Enable word highlighting
  slowMode?: boolean // Extra slow for difficult words
}

export interface TTSVoice {
  name: string
  languageCode: string
  ssmlGender: 'MALE' | 'FEMALE' | 'NEUTRAL'
  naturalSampleRateHertz: number
}

class PremiumTTSService {
  private static instance: PremiumTTSService
  private googleTTSEnabled = false
  private currentUtterance: SpeechSynthesisUtterance | null = null
  private audioCache: Map<string, HTMLAudioElement> = new Map()

  private constructor() {
    this.checkGoogleTTSAvailability()
  }

  public static getInstance(): PremiumTTSService {
    if (!PremiumTTSService.instance) {
      PremiumTTSService.instance = new PremiumTTSService()
    }
    return PremiumTTSService.instance
  }

  private checkGoogleTTSAvailability(): void {
    // Check if Google TTS API key is configured
    // We'll check by trying to call the API route, but for now assume it's available
    // The API route will handle the actual check
    this.googleTTSEnabled = true // Always try API route first, it will fallback if not configured
  }

  /**
   * Get the best child-friendly voice for Web Speech API
   */
  private getBestVoice(): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return null
    }

    const voices = speechSynthesis.getVoices()
    if (voices.length === 0) return null

    // Priority order for child-friendly voices
    const preferredNames = [
      'Google UK English Female',
      'Google US English Female',
      'Microsoft Zira - English (United States)',
      'Microsoft Hazel - English (Great Britain)',
      'Samantha', // macOS
      'Karen', // macOS
      'Victoria', // macOS
      'Alex', // macOS
    ]

    // Try to find preferred voice
    for (const name of preferredNames) {
      const voice = voices.find(v => v.name.includes(name))
      if (voice && voice.lang.startsWith('en')) {
        return voice
      }
    }

    // Fallback: Find any English female voice
    const femaleVoice = voices.find(
      v =>
        v.lang.startsWith('en') &&
        (v.name.toLowerCase().includes('female') ||
          v.name.toLowerCase().includes('woman') ||
          v.name.toLowerCase().includes('girl'))
    )

    if (femaleVoice) return femaleVoice

    // Last resort: Any English voice
    return voices.find(v => v.lang.startsWith('en')) || voices[0]
  }

  /**
   * Speak text using Web Speech API with optimized settings
   */
  private speakWithWebAPI(
    text: string,
    options: TTSOptions = {}
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'))
        return
      }

      // Cancel any ongoing speech
      this.stop()

      const utterance = new SpeechSynthesisUtterance(text)
      const voice = this.getBestVoice()

      // Optimized settings for kids' English learning
      // Handle slow mode and voice-specific rates
      let rate = options.rate
      if (options.slowMode) {
        rate = 0.5 // Very slow for difficult words
      } else if (options.voice === 'slow') {
        rate = 0.6
      } else if (options.voice === 'fast') {
        rate = 1.0
      }
      
      utterance.rate = rate ?? 0.85 // Slightly slower for clarity
      utterance.pitch = options.pitch ?? 2 // Slightly higher pitch (friendly)
      utterance.volume = options.volume ?? 0.9
      utterance.lang = options.language || 'en-US'

      // Word-by-word highlighting support
      if (options.highlightWords && options.onWordStart) {
        const words = text.split(/\s+/)
        let currentWordIndex = 0
        
        // Use SSML-like word boundaries (Web Speech API doesn't support SSML, but we can simulate)
        // For now, we'll trigger word callbacks at intervals
        const wordDuration = (utterance.rate ?? 0.85) * 200 // Approximate ms per word
        words.forEach((word, index) => {
          setTimeout(() => {
            options.onWordStart?.(word, index)
          }, index * wordDuration)
        })
      }

      if (voice) {
        utterance.voice = voice
      }

      // Event handlers
      utterance.onstart = () => {
        options.onStart?.()
      }

      utterance.onend = () => {
        this.currentUtterance = null
        options.onEnd?.()
        resolve()
      }

      utterance.onerror = (event) => {
        this.currentUtterance = null
        const error = new Error(`Speech synthesis error: ${event.error}`)
        options.onError?.(error)
        reject(error)
      }

      this.currentUtterance = utterance
      speechSynthesis.speak(utterance)
    })
  }

  /**
   * Speak text using Google Cloud TTS API (premium quality)
   * Uses server-side API route for security
   */
  private async speakWithGoogleTTS(
    text: string,
    options: TTSOptions = {}
  ): Promise<void> {
    // Check cache first
    const cacheKey = `${text}-${options.voice || 'default'}-${options.rate || 0.9}`
    const cached = this.audioCache.get(cacheKey)
    if (cached) {
      options.onStart?.()
      await new Promise<void>((resolve, reject) => {
        cached.onended = () => {
          options.onEnd?.()
          resolve()
        }
        cached.onerror = () => {
          reject(new Error('Audio playback error'))
        }
        cached.currentTime = 0
        cached.volume = options.volume ?? 0.9
        cached.play().catch(reject)
      })
      return
    }

    try {
      // Call our server-side API route (more secure - API key not exposed)
      const response = await fetch('/api/tts/speak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          rate: options.rate ?? 0.9,
          pitch: options.pitch ?? 2,
          voice: options.voice || 'child-friendly',
          language: options.language || 'en-US',
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        if (data.fallback) {
          // API not configured or error - fallback to Web Speech API
          throw new Error('TTS service unavailable, using fallback')
        }
        throw new Error(`TTS API error: ${response.statusText}`)
      }

      const data = await response.json()
      const audioData = data.audioContent

      // Create audio element
      const audio = new Audio(`data:audio/mp3;base64,${audioData}`)
      audio.volume = options.volume ?? 0.9

      // Cache the audio
      this.audioCache.set(cacheKey, audio)

      options.onStart?.()

      await new Promise<void>((resolve, reject) => {
        audio.onended = () => {
          options.onEnd?.()
          resolve()
        }
        audio.onerror = () => {
          reject(new Error('Audio playback error'))
        }
        audio.play().catch(reject)
      })
    } catch (error) {
      console.warn('Google TTS failed, falling back to Web Speech API:', error)
      // Fallback to Web Speech API
      return this.speakWithWebAPI(text, options)
    }
  }

  /**
   * Get Google Cloud TTS voice name based on preference
   */
  private getGoogleVoiceName(preference: string): string {
    const voices: Record<string, string> = {
      'child-friendly': 'en-US-Neural2-F', // Natural, friendly female voice
      clear: 'en-US-Standard-E', // Clear, professional
      friendly: 'en-US-Neural2-D', // Warm, friendly
      natural: 'en-US-Neural2-J', // Very natural sounding
      slow: 'en-US-Neural2-F', // Same as child-friendly but slower rate
      fast: 'en-US-Neural2-D', // Faster rate
    }

    return voices[preference] || voices['child-friendly']
  }

  /**
   * Get available voices for Web Speech API
   */
  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return []
    }
    return speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'))
  }

  /**
   * Get recommended voice for kids
   */
  public getRecommendedVoice(): SpeechSynthesisVoice | null {
    return this.getBestVoice()
  }

  /**
   * Speak text with word-by-word highlighting
   */
  public async speakWithHighlighting(
    text: string,
    onWordStart: (word: string, index: number) => void,
    options: Omit<TTSOptions, 'onWordStart' | 'highlightWords'> = {}
  ): Promise<void> {
    return this.speak(text, {
      ...options,
      highlightWords: true,
      onWordStart,
    })
  }

  /**
   * Speak text in slow mode (for difficult words)
   */
  public async speakSlow(text: string, options: Omit<TTSOptions, 'slowMode'> = {}): Promise<void> {
    return this.speak(text, {
      ...options,
      slowMode: true,
      rate: 0.5,
    })
  }

  /**
   * Speak text with custom speed
   */
  public async speakWithSpeed(
    text: string,
    speed: 'very-slow' | 'slow' | 'normal' | 'fast' | 'very-fast',
    options: Omit<TTSOptions, 'rate'> = {}
  ): Promise<void> {
    const rateMap: Record<string, number> = {
      'very-slow': 0.4,
      'slow': 0.6,
      'normal': 0.85,
      'fast': 1.0,
      'very-fast': 1.2,
    }

    return this.speak(text, {
      ...options,
      rate: rateMap[speed] || 0.85,
    })
  }

  /**
   * Repeat last spoken text
   */
  private lastSpokenText: string = ''
  private lastSpokenOptions: TTSOptions = {}

  public async repeat(options?: Partial<TTSOptions>): Promise<void> {
    if (!this.lastSpokenText) {
      throw new Error('No text to repeat')
    }
    return this.speak(this.lastSpokenText, { ...this.lastSpokenOptions, ...options })
  }

  /**
   * Main speak method - uses best available TTS
   */
  public async speak(text: string, options: TTSOptions = {}): Promise<void> {
    if (!text || text.trim().length === 0) {
      return Promise.resolve()
    }

    // Store for repeat functionality
    this.lastSpokenText = text
    this.lastSpokenOptions = options

    // Use Google TTS if available, otherwise use Web Speech API
    if (this.googleTTSEnabled) {
      try {
        return await this.speakWithGoogleTTS(text, options)
      } catch (error) {
        console.warn('Google TTS failed, using Web Speech API:', error)
      }
    }

    return this.speakWithWebAPI(text, options)
  }

  /**
   * Stop current speech
   */
  public stop(): void {
    if (this.currentUtterance) {
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel()
      }
      this.currentUtterance = null
    }

    // Stop any cached audio
    this.audioCache.forEach(audio => {
      audio.pause()
      audio.currentTime = 0
    })
  }

  /**
   * Check if TTS is available
   */
  public isAvailable(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window
  }

  /**
   * Check if Google TTS is enabled
   */
  public isGoogleTTSEnabled(): boolean {
    return this.googleTTSEnabled
  }

  /**
   * Preload voices (call this after page load)
   */
  public loadVoices(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Voices may not be loaded immediately, trigger loading
      const voices = speechSynthesis.getVoices()
      if (voices.length === 0) {
        speechSynthesis.onvoiceschanged = () => {
          // Voices loaded
        }
      }
    }
  }

  /**
   * Clear audio cache
   */
  public clearCache(): void {
    this.audioCache.forEach(audio => {
      audio.pause()
      audio.src = ''
    })
    this.audioCache.clear()
  }
}

// Export singleton instance
export const premiumTTS = PremiumTTSService.getInstance()

// Convenience function for easy usage
export async function speakText(
  text: string,
  options?: TTSOptions
): Promise<void> {
  return premiumTTS.speak(text, options)
}
