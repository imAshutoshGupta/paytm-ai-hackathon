import { NextRequest, NextResponse } from 'next/server'
import { speechToText } from '@/lib/sarvam'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audio = formData.get('audio') as File | null

    if (!audio) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    const arrayBuffer = await audio.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const transcript = await speechToText(buffer, audio.type || 'audio/webm')

    return NextResponse.json({ transcript })
  } catch (err) {
    console.error('STT error:', err)
    return NextResponse.json({ error: 'Speech to text failed' }, { status: 500 })
  }
}
