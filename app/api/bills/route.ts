import { NextRequest, NextResponse } from 'next/server'
import { isMockMode, connectDB } from '@/lib/mongodb'
import { BillStore } from '@/lib/mockstore'
import { generateText } from '@/lib/paytm'

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  const query = req.nextUrl.searchParams.get('query')
  const language = req.nextUrl.searchParams.get('language') || 'en'
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  if (isMockMode()) {
    const bills = BillStore.find(userId)
    if (query) {
      const summary = bills.map((b) => `${b.vendorName}: ₹${b.totalAmount} (${b.status})`).join('\n')
      const langStr = language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English'
      const answer = await generateText(`Bills:\n${summary}\n\nAnswer in ${langStr}: "${query}"`, undefined, language)
      return NextResponse.json({ bills, answer })
    }
    return NextResponse.json({ bills })
  }

  await connectDB()
  const Bill = (await import('@/models/Bill')).default
  const bills = await Bill.find({ userId }).sort({ createdAt: -1 })
  if (query) {
    const summary = bills.map((b) => `${b.vendorName}: ₹${b.totalAmount} (${b.status})`).join('\n')
    const langStr = language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English'
    const answer = await generateText(`Bills:\n${summary}\n\nAnswer in ${langStr}: "${query}"`, undefined, language)
    return NextResponse.json({ bills, answer })
  }
  return NextResponse.json({ bills })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, status } = body
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  if (isMockMode()) {
    const bill = BillStore.update(id, { status })
    if (!bill) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ bill })
  }

  await connectDB()
  const Bill = (await import('@/models/Bill')).default
  const bill = await Bill.findByIdAndUpdate(id, { status }, { new: true })
  if (!bill) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ bill })
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  if (isMockMode()) { BillStore.delete(id); return NextResponse.json({ success: true }) }

  await connectDB()
  const Bill = (await import('@/models/Bill')).default
  await Bill.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
}
