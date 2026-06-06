import { NextRequest, NextResponse } from 'next/server'
import { textToSpeech } from '@/lib/sarvam'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { text, languageCode = 'hi-IN' } = body

  if (!text) {
    return NextResponse.json({ error: 'text required' }, { status: 400 })
  }

  try {
    const audioBuffer = await textToSpeech(text, languageCode)
    const base64 = audioBuffer.toString('base64')
    return NextResponse.json({ audio: base64, mimeType: 'audio/wav' })
  } catch (err) {
    console.error('TTS error:', err)
    return NextResponse.json({ error: 'Text to speech failed' }, { status: 500 })
  }
}
