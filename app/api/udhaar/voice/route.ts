import { NextRequest, NextResponse } from 'next/server'
import { isMockMode, connectDB } from '@/lib/mongodb'
import { UdhaarStore } from '@/lib/mockstore'
import { extractUdhaarFromText } from '@/lib/paytm'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { userId, transcript } = body
  if (!userId || !transcript) return NextResponse.json({ error: 'userId and transcript required' }, { status: 400 })

  try {
    const extracted = await extractUdhaarFromText(transcript)
    if (!extracted.name || extracted.amount <= 0) {
      return NextResponse.json({ error: 'Could not extract details', extracted }, { status: 422 })
    }

    if (isMockMode()) {
      const entry = UdhaarStore.create({ userId, customerName: extracted.name, amount: extracted.amount, amountPaid: 0, note: extracted.note || transcript, status: 'pending' })
      return NextResponse.json({ entry, extracted })
    }

    await connectDB()
    const Udhaar = (await import('@/models/Udhaar')).default
    const entry = await Udhaar.create({ userId, customerName: extracted.name, amount: extracted.amount, amountPaid: 0, note: extracted.note || transcript, status: 'pending' })
    return NextResponse.json({ entry, extracted })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
