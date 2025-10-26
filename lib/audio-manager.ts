/**
 * Enhanced Audio Manager for Kids English Learning App
 * Handles background music, sound effects, and audio settings
 */

export interface AudioSettings {
  masterVolume: number
  musicVolume: number
  effectsVolume: number
  voiceVolume: number
  backgroundMusicEnabled: boolean
  soundEffectsEnabled: boolean
  voiceEnabled: boolean
}

export interface SoundEffect {
  name: string
  url: string
  volume?: number
}

export class AudioManager {
  private static instance: AudioManager
  private audioContext: AudioContext | null = null
  private backgroundMusic: HTMLAudioElement | null = null
  private soundEffects: Map<string, HTMLAudioElement> = new Map()
  private settings: AudioSettings
  private isInitialized = false

  private constructor() {
    this.settings = this.loadSettings()
    this.initializeAudioContext()
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager()
    }
    return AudioManager.instance
  }

  private loadSettings(): AudioSettings {
    if (typeof window === 'undefined') {
      return {
        masterVolume: 0.7,
        musicVolume: 0.5,
        effectsVolume: 0.8,
        voiceVolume: 0.9,
        backgroundMusicEnabled: true,
        soundEffectsEnabled: true,
        voiceEnabled: true
      }
    }

    const saved = localStorage.getItem('audioSettings')
    if (saved) {
      return { ...this.getDefaultSettings(), ...JSON.parse(saved) }
    }
    return this.getDefaultSettings()
  }

  private getDefaultSettings(): AudioSettings {
    return {
      masterVolume: 0.7,
      musicVolume: 0.5,
      effectsVolume: 0.8,
      voiceVolume: 0.9,
      backgroundMusicEnabled: true,
      soundEffectsEnabled: true,
      voiceEnabled: true
    }
  }

  private saveSettings(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('audioSettings', JSON.stringify(this.settings))
    }
  }

  private async initializeAudioContext(): Promise<void> {
    if (typeof window === 'undefined' || this.isInitialized) return

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      await this.loadSoundEffects()
      this.isInitialized = true
    } catch (error) {
      console.warn('Audio initialization failed:', error)
    }
  }

  private async loadSoundEffects(): Promise<void> {
    const effects: SoundEffect[] = [
      { name: 'success', url: '/sounds/success.mp3', volume: 0.8 },
      { name: 'error', url: '/sounds/error.mp3', volume: 0.6 },
      { name: 'click', url: '/sounds/click.mp3', volume: 0.4 },
      { name: 'levelup', url: '/sounds/levelup.mp3', volume: 0.9 },
      { name: 'achievement', url: '/sounds/achievement.mp3', volume: 0.8 },
      { name: 'correct', url: '/sounds/correct.mp3', volume: 0.7 },
      { name: 'incorrect', url: '/sounds/incorrect.mp3', volume: 0.6 },
      { name: 'page_turn', url: '/sounds/page_turn.mp3', volume: 0.5 },
      { name: 'word_complete', url: '/sounds/word_complete.mp3', volume: 0.7 },
      { name: 'game_start', url: '/sounds/game_start.mp3', volume: 0.8 }
    ]

    for (const effect of effects) {
      try {
        const audio = new Audio(effect.url)
        audio.preload = 'auto'
        audio.volume = (effect.volume || 1) * this.settings.effectsVolume * this.settings.masterVolume
        this.soundEffects.set(effect.name, audio)
      } catch (error) {
        console.warn(`Failed to load sound effect: ${effect.name}`, error)
      }
    }
  }

  public async playSound(effectName: string): Promise<void> {
    if (!this.settings.soundEffectsEnabled || !this.settings.masterVolume) return

    try {
      const audio = this.soundEffects.get(effectName)
      if (audio) {
        // Reset audio to beginning
        audio.currentTime = 0
        audio.volume = this.settings.effectsVolume * this.settings.masterVolume
        
        // Resume audio context if suspended
        if (this.audioContext?.state === 'suspended') {
          await this.audioContext.resume()
        }
        
        await audio.play()
      }
    } catch (error) {
      console.warn(`Failed to play sound effect: ${effectName}`, error)
    }
  }

  public async playBackgroundMusic(track: string = 'default'): Promise<void> {
    if (!this.settings.backgroundMusicEnabled || !this.settings.masterVolume) return

    try {
      // Stop current music
      if (this.backgroundMusic) {
        this.backgroundMusic.pause()
        this.backgroundMusic.currentTime = 0
      }

      // Load new track
      const musicUrl = `/sounds/background/${track}.mp3`
      this.backgroundMusic = new Audio(musicUrl)
      this.backgroundMusic.loop = true
      this.backgroundMusic.volume = this.settings.musicVolume * this.settings.masterVolume
      
      // Resume audio context if suspended
      if (this.audioContext?.state === 'suspended') {
        await this.audioContext.resume()
      }
      
      await this.backgroundMusic.play()
    } catch (error) {
      console.warn('Failed to play background music:', error)
    }
  }

  public stopBackgroundMusic(): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause()
      this.backgroundMusic.currentTime = 0
    }
  }

  public speak(text: string, options: { rate?: number; pitch?: number; voice?: string } = {}): void {
    if (!this.settings.voiceEnabled || !this.settings.masterVolume) return

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = options.rate || 0.8
      utterance.pitch = options.pitch || 1.1
      utterance.volume = this.settings.voiceVolume * this.settings.masterVolume

      // Try to use a child-friendly voice
      const voices = speechSynthesis.getVoices()
      const childVoice = voices.find(voice => 
        voice.name.includes('child') || 
        voice.name.includes('young') ||
        voice.name.includes('female')
      )
      
      if (childVoice) {
        utterance.voice = childVoice
      }

      speechSynthesis.speak(utterance)
    }
  }

  public updateSettings(newSettings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...newSettings }
    this.saveSettings()
    this.updateAudioVolumes()
  }

  public getSettings(): AudioSettings {
    return { ...this.settings }
  }

  private updateAudioVolumes(): void {
    // Update background music volume
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = this.settings.musicVolume * this.settings.masterVolume
    }

    // Update sound effects volumes
    this.soundEffects.forEach(audio => {
      audio.volume = this.settings.effectsVolume * this.settings.masterVolume
    })
  }

  public async resumeAudioContext(): Promise<void> {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume()
    }
  }

  // Convenience methods for common sounds
  public playSuccess(): void {
    this.playSound('success')
  }

  public playError(): void {
    this.playSound('error')
  }

  public playClick(): void {
    this.playSound('click')
  }

  public playLevelUp(): void {
    this.playSound('levelup')
  }

  public playAchievement(): void {
    this.playSound('achievement')
  }

  public playCorrect(): void {
    this.playSound('correct')
  }

  public playIncorrect(): void {
    this.playSound('incorrect')
  }

  public playPageTurn(): void {
    this.playSound('page_turn')
  }

  public playWordComplete(): void {
    this.playSound('word_complete')
  }

  public playGameStart(): void {
    this.playSound('game_start')
  }
}

// Export singleton instance
export const audioManager = AudioManager.getInstance()
