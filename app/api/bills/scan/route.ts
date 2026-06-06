import { NextRequest, NextResponse } from 'next/server'
import { isMockMode, connectDB } from '@/lib/mongodb'
import { BillStore } from '@/lib/mockstore'
import { analyzeImage } from '@/lib/paytm'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { userId, base64Image } = body
  if (!userId || !base64Image) return NextResponse.json({ error: 'userId and base64Image required' }, { status: 400 })

  try {
    const prompt = `Analyze this bill/invoice image. Return JSON: { "vendorName": "...", "billDate": "DD/MM/YYYY", "items": [{ "name": "...", "quantity": number, "unit": "...", "price": number }], "totalAmount": number }. All text in English.`
    const rawResponse = await analyzeImage(base64Image, prompt)

    let parsed: { vendorName: string; items: { name: string; quantity: number; unit: string; price: number }[]; totalAmount: number } = { vendorName: 'Unknown Vendor', items: [], totalAmount: 0 }
    try {
      const m = rawResponse.match(/\{[\s\S]*\}/)
      if (m) parsed = JSON.parse(m[0])
    } catch {}

    const billData = {
      userId,
      vendorName: parsed.vendorName || 'Unknown Vendor',
      items: (parsed.items || []).map((i) => ({ name: i.name || '', quantity: Number(i.quantity) || 0, unit: i.unit || 'pcs', price: Number(i.price) || 0 })),
      totalAmount: Number(parsed.totalAmount) || 0,
      status: 'unpaid' as const,
      billDate: new Date(),
      rawText: rawResponse,
    }

    if (isMockMode()) {
      const bill = BillStore.create(billData)
      return NextResponse.json({ bill, parsed })
    }

    await connectDB()
    const Bill = (await import('@/models/Bill')).default
    const bill = await Bill.create(billData)
    return NextResponse.json({ bill, parsed })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Bill scanning failed' }, { status: 500 })
  }
}
