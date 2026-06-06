import { NextRequest, NextResponse } from 'next/server'
import { isMockMode, connectDB } from '@/lib/mongodb'
import { Users, CustomerStore } from '@/lib/mockstore'
import { scoreChurnAI, getInferenceModel, ChurnFeature } from '@/lib/paytm'

const DAY = 86400000

interface CustRow {
  id: string
  transactionCount: number
  averageTransactionValue: number
  transactionDaysAgo: number[]
}

function avgGap(daysAgo: number[]): number {
  if (daysAgo.length < 2) return 30
  const s = [...daysAgo].sort((a, b) => a - b)
  let t = 0
  for (let i = 1; i < s.length; i++) t += s[i] - s[i - 1]
  return Math.max(t / (s.length - 1), 1)
}

async function loadCustomers(merchantId: string): Promise<{ rows: CustRow[]; businessType: string }> {
  if (isMockMode()) {
    const merchant = Users.findById(merchantId)
    const rows = CustomerStore.findByMerchant(merchantId).map((c) => ({
      id: c._id,
      transactionCount: c.transactionCount,
      averageTransactionValue: c.averageTransactionValue,
      transactionDaysAgo: c.transactionDaysAgo,
    }))
    return { rows, businessType: merchant?.businessType || 'shop' }
  }
  await connectDB()
  const [User, Customer] = await Promise.all([
    import('@/models/User').then((m) => m.default),
    import('@/models/Customer').then((m) => m.default),
  ])
  const [merchant, docs] = await Promise.all([
    User.findById(merchantId),
    Customer.find({ merchantId }),
  ])
  const now = Date.now()
  const rows = docs.map((c) => ({
    id: c._id.toString(),
    transactionCount: c.transactionCount,
    averageTransactionValue: c.averageTransactionValue,
    transactionDaysAgo: (c.transactionDates || [])
      .map((d) => Math.max(0, Math.round((now - new Date(d).getTime()) / DAY)))
      .sort((a, b) => a - b),
  }))
  return { rows, businessType: merchant?.businessType || 'shop' }
}

export async function POST(req: NextRequest) {
  const { merchantId } = await req.json()
  if (!merchantId) return NextResponse.json({ error: 'merchantId required' }, { status: 400 })

  try {
    const { rows, businessType } = await loadCustomers(merchantId)

    const features: ChurnFeature[] = rows.map((c) => ({
      id: c.id,
      visits: c.transactionCount,
      recencyDays: c.transactionDaysAgo.length ? Math.min(...c.transactionDaysAgo) : 999,
      avgGapDays: Math.round(avgGap(c.transactionDaysAgo)),
      avgSpend: c.averageTransactionValue,
    }))

    const verdicts = await scoreChurnAI(features, businessType)

    if (!verdicts) {
      // No AI key — let the client use its heuristic fallback.
      return NextResponse.json({ engine: 'heuristic', verdicts: null })
    }
    return NextResponse.json({
      engine: 'ai',
      model: getInferenceModel(),
      provider: 'Paytm Inference',
      analysed: verdicts.length,
      verdicts,
    })
  } catch (err) {
    console.error('churn engine error:', err)
    return NextResponse.json({ engine: 'heuristic', verdicts: null })
  }
}
