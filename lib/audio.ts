// Audio feedback system for enhanced user experience
export class AudioManager {
  private static instance: AudioManager
  private audioContext: AudioContext | null = null
  private sounds: Map<string, AudioBuffer> = new Map()

  private constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager()
    }
    return AudioManager.instance
  }

  // Generate success sound
  playSuccess() {
    this.playTone(523.25, 0.1, 'sine') // C5
    setTimeout(() => this.playTone(659.25, 0.1, 'sine'), 100) // E5
    setTimeout(() => this.playTone(783.99, 0.2, 'sine'), 200) // G5
  }

  // Generate error sound
  playError() {
    this.playTone(200, 0.3, 'sawtooth')
  }

  // Generate click sound
  playClick() {
    this.playTone(800, 0.05, 'square')
  }

  // Generate level up sound
  playLevelUp() {
    this.playTone(523.25, 0.1, 'sine') // C5
    setTimeout(() => this.playTone(659.25, 0.1, 'sine'), 100) // E5
    setTimeout(() => this.playTone(783.99, 0.1, 'sine'), 200) // G5
    setTimeout(() => this.playTone(1046.50, 0.3, 'sine'), 300) // C6
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.frequency.value = frequency
    oscillator.type = type

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + duration)
  }

  // Play background music
  playBackgroundMusic() {
    if (!this.audioContext) return
    
    const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25] // C major scale
    let noteIndex = 0

    const playNote = () => {
      if (noteIndex < notes.length) {
        this.playTone(notes[noteIndex], 0.5, 'sine')
        noteIndex++
        setTimeout(playNote, 600)
      }
    }

    playNote()
  }
}

export const audioManager = AudioManager.getInstance()
