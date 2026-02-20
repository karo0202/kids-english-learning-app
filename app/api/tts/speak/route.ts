/**
 * Server-side Text-to-Speech API route
 * Securely handles Google Cloud TTS without exposing API key to client
 */
import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_TTS_API_KEY = process.env.GOOGLE_TTS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_TTS_API_KEY

export async function POST(request: NextRequest) {
  try {
    const { 
      text, 
      rate = 0.9, 
      pitch = 2, 
      voice = 'child-friendly', 
      language = 'en-US',
      slowMode = false 
    } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    // If no API key, return error (client will fallback to Web Speech API)
    if (!GOOGLE_TTS_API_KEY) {
      return NextResponse.json(
        { error: 'Google TTS not configured', fallback: true },
        { status: 503 }
      )
    }

    // Select voice - DEFAULT TO CLEAREST VOICE
    const voiceMap: Record<string, string> = {
      'child-friendly': 'en-US-Neural2-F',
      clear: 'en-US-Standard-E', // CLEAREST VOICE
      friendly: 'en-US-Neural2-D',
      natural: 'en-US-Neural2-J',
      slow: 'en-US-Standard-E', // Use clear voice for slow mode
      fast: 'en-US-Neural2-D',
    }

    // Default to 'clear' for maximum clarity
    const voiceName = voiceMap[voice] || voiceMap['clear']
    
    // Adjust rate for slow mode and clarity
    let finalRate = rate
    if (slowMode) {
      finalRate = 0.5 // Very slow for difficult words
    } else if (voice === 'slow') {
      finalRate = Math.min(rate, 0.6)
    } else if (voice === 'fast') {
      finalRate = Math.max(rate, 1.0)
    } else if (voice === 'clear' || !voice || voice === 'child-friendly') {
      // For clear voice, use slower rate for better clarity
      finalRate = Math.min(rate || 0.75, 0.8)
    }

    // Call Google Cloud TTS API
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: language,
            name: voiceName,
            ssmlGender: 'FEMALE',
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: finalRate,
            pitch: Math.max(pitch, 0.5), // Lower pitch for clarity (min 0.5)
            volumeGainDb: 2, // Slightly louder for clarity
            effectsProfileId: ['headphone-class-device'], // Optimized for clarity
          },
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Google TTS API error:', response.status, errorText)
      return NextResponse.json(
        { error: 'TTS service error', fallback: true },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      audioContent: data.audioContent,
      mimeType: 'audio/mp3',
    })
  } catch (error: any) {
    console.error('TTS API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate speech', fallback: true, details: error.message },
      { status: 500 }
    )
  }
}
