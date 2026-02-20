/**
 * Server-side Text-to-Speech API route
 * Securely handles Google Cloud TTS without exposing API key to client
 */
import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_TTS_API_KEY = process.env.GOOGLE_TTS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_TTS_API_KEY

export async function POST(request: NextRequest) {
  try {
    const { text, rate = 0.9, pitch = 2, voice = 'child-friendly', language = 'en-US' } = await request.json()

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

    // Select voice
    const voiceMap: Record<string, string> = {
      'child-friendly': 'en-US-Neural2-F',
      clear: 'en-US-Standard-E',
      friendly: 'en-US-Neural2-D',
      natural: 'en-US-Neural2-J',
    }

    const voiceName = voiceMap[voice] || voiceMap['child-friendly']

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
            speakingRate: rate,
            pitch: pitch,
            volumeGainDb: 0, // Neutral volume
            effectsProfileId: ['headphone-class-device'],
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
