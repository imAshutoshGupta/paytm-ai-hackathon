import { NextRequest, NextResponse } from 'next/server'
import { isMockMode, connectDB } from '@/lib/mongodb'
import { Users, UdhaarStore, BillStore, TransactionStore, resetStore, clearStore } from '@/lib/mockstore'

export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get('action')

  if (action === 'health') {
    return NextResponse.json({
      mongodb: !isMockMode(),
      paytm: !!(process.env.PAYTM_INFERENCE_KEY && process.env.PAYTM_INFERENCE_KEY !== 'placeholder'),
      sarvam: !!(process.env.SARVAM_API_KEY && process.env.SARVAM_API_KEY !== 'placeholder'),
      mockMode: isMockMode(),
    })
  }

  if (action === 'overview') {
    if (isMockMode()) {
      const users = Users.all()
      const overview = users.map((u) => {
        const udhaars = UdhaarStore.find(u._id).filter((d) => d.status !== 'paid')
        const bills = BillStore.find(u._id)
        const txCount = TransactionStore.count(u._id)
        return {
          id: u._id,
          name: u.name, phone: u.phone, businessName: u.businessName,
          businessType: u.businessType,
          totalDues: udhaars.reduce((s, d) => s + (d.amount - d.amountPaid), 0),
          totalBills: bills.reduce((s, b) => s + b.totalAmount, 0),
          transactionCount: txCount,
          createdAt: u.createdAt,
        }
      })
      return NextResponse.json({ users: overview, mockMode: true })
    }

    await connectDB()
    const [User, Udhaar, Bill, Transaction] = await Promise.all([
      import('@/models/User').then((m) => m.default),
      import('@/models/Udhaar').then((m) => m.default),
      import('@/models/Bill').then((m) => m.default),
      import('@/models/Transaction').then((m) => m.default),
    ])
    const users = await User.find({}).sort({ createdAt: -1 })
    const overview = await Promise.all(users.map(async (u) => {
      const [udhaars, bills, txCount] = await Promise.all([
        Udhaar.find({ userId: u._id.toString() }),
        Bill.find({ userId: u._id.toString() }),
        Transaction.countDocuments({ userId: u._id.toString() }),
      ])
      return {
        id: u._id.toString(), name: u.name, phone: u.phone,
        businessName: u.businessName, businessType: u.businessType,
        totalDues: udhaars.filter((d) => d.status !== 'paid').reduce((s, d) => s + (d.amount - d.amountPaid), 0),
        totalBills: bills.reduce((s, b) => s + b.totalAmount, 0),
        transactionCount: txCount, createdAt: u.createdAt,
      }
    }))
    return NextResponse.json({ users: overview })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action } = body

  if (action === 'seed') {
    if (isMockMode()) {
      resetStore()
      return NextResponse.json({ success: true, results: { '9999999001': 'seeded', '9999999002': 'seeded', '9999999003': 'seeded' }, mockMode: true })
    }
    // Real MongoDB seed
    await connectDB()
    const [kiranaData, tuitionData, tailorData] = await Promise.all([
      import('@/mock/kirana.json').then((m) => m.default),
      import('@/mock/tuition.json').then((m) => m.default),
      import('@/mock/tailor.json').then((m) => m.default),
    ])
    const [User, Udhaar, Bill, Inventory, Transaction] = await Promise.all([
      import('@/models/User').then((m) => m.default),
      import('@/models/Udhaar').then((m) => m.default),
      import('@/models/Bill').then((m) => m.default),
      import('@/models/Inventory').then((m) => m.default),
      import('@/models/Transaction').then((m) => m.default),
    ])
    const results: Record<string, string> = {}
    for (const mock of [kiranaData, tuitionData, tailorData] as Array<{ user: { phone: string; name: string; businessName: string; businessType: 'kirana'|'tuition'|'tailor'; language: 'en'|'hi'|'mr' }; udhaar: Array<{ customerName: string; amount: number; amountPaid: number; note: string; status: string; daysAgo: number }>; bills: Array<{ vendorName: string; items: Array<{ name: string; quantity: number; unit: string; price: number }>; totalAmount: number; status: string; daysAgo: number }>; inventory: Array<{ itemName: string; quantity: number; unit: string; reorderThreshold: number }>; transactions: Array<{ type: 'sale'|'expense'; amount: number; description: string; category: string; paymentMode: 'cash'|'upi'|'credit'; daysAgo: number }> }>) {
      let user = await User.findOne({ phone: mock.user.phone })
      if (!user) user = await User.create(mock.user)
      const userId = user._id.toString()
      await Promise.all([Udhaar.deleteMany({ userId }), Bill.deleteMany({ userId }), Inventory.deleteMany({ userId }), Transaction.deleteMany({ userId })])
      const now = Date.now()
      for (const u of mock.udhaar) await Udhaar.create({ userId, customerName: u.customerName, amount: u.amount, amountPaid: u.amountPaid, note: u.note, status: u.status, createdAt: new Date(now - u.daysAgo * 86400000) })
      for (const b of mock.bills) await Bill.create({ userId, vendorName: b.vendorName, items: b.items, totalAmount: b.totalAmount, status: b.status, billDate: new Date(now - b.daysAgo * 86400000), createdAt: new Date(now - b.daysAgo * 86400000) })
      for (const i of mock.inventory) await Inventory.create({ userId, ...i })
      for (const t of mock.transactions) await Transaction.create({ userId, type: t.type, amount: t.amount, description: t.description, category: t.category, paymentMode: t.paymentMode, createdAt: new Date(now - t.daysAgo * 86400000) })
      results[mock.user.phone] = 'seeded'
    }
    return NextResponse.json({ success: true, results })
  }

  if (action === 'clear') {
    if (isMockMode()) {
      clearStore()
      return NextResponse.json({ success: true, mockMode: true })
    }
    await connectDB()
    const [User, Udhaar, Bill, Inventory, Transaction] = await Promise.all([
      import('@/models/User').then((m) => m.default),
      import('@/models/Udhaar').then((m) => m.default),
      import('@/models/Bill').then((m) => m.default),
      import('@/models/Inventory').then((m) => m.default),
      import('@/models/Transaction').then((m) => m.default),
    ])
    await Promise.all([User.deleteMany({}), Udhaar.deleteMany({}), Bill.deleteMany({}), Inventory.deleteMany({}), Transaction.deleteMany({})])
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
