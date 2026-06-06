import { NextRequest, NextResponse } from 'next/server'
import { generateWinBack, WinBackLanguage } from '@/lib/paytm'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      customerName, merchantName, businessName, businessType,
      lastAmount = 0, recencyDays = 0, language = 'hinglish',
    } = body

    if (!customerName || !merchantName) {
      return NextResponse.json({ error: 'customerName and merchantName required' }, { status: 400 })
    }

    const message = await generateWinBack({
      customerName,
      merchantName,
      businessName: businessName || merchantName,
      businessType: businessType || 'shop',
      lastAmount: Number(lastAmount),
      recencyDays: Number(recencyDays),
      language: (language as WinBackLanguage) || 'hinglish',
    })

    return NextResponse.json({ message })
  } catch (err) {
    console.error('winback error:', err)
    return NextResponse.json({ error: 'Failed to generate message' }, { status: 500 })
  }
}
