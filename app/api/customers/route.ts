import { NextRequest, NextResponse } from 'next/server'
import { isMockMode, connectDB } from '@/lib/mongodb'
import { CustomerStore } from '@/lib/mockstore'

const DAY = 86400000

export async function GET(req: NextRequest) {
  const merchantId = req.nextUrl.searchParams.get('merchantId')
  if (!merchantId) return NextResponse.json({ error: 'merchantId required' }, { status: 400 })

  try {
    if (isMockMode()) {
      const rows = CustomerStore.findByMerchant(merchantId).map((c) => ({
        id: c._id,
        name: c.name,
        phone: c.phone,
        transactionCount: c.transactionCount,
        lastTransactionAmount: c.lastTransactionAmount,
        averageTransactionValue: c.averageTransactionValue,
        transactionDaysAgo: c.transactionDaysAgo,
      }))
      return NextResponse.json({ customers: rows })
    }

    await connectDB()
    const Customer = (await import('@/models/Customer')).default
    const docs = await Customer.find({ merchantId })
    const now = Date.now()
    const rows = docs.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      phone: c.phone,
      transactionCount: c.transactionCount,
      lastTransactionAmount: c.lastTransactionAmount,
      averageTransactionValue: c.averageTransactionValue,
      transactionDaysAgo: (c.transactionDates || [])
        .map((d) => Math.max(0, Math.round((now - new Date(d).getTime()) / DAY)))
        .sort((a, b) => a - b),
    }))
    return NextResponse.json({ customers: rows })
  } catch (err) {
    console.error('customers error:', err)
    return NextResponse.json({ error: 'Failed to load customers' }, { status: 500 })
  }
}
