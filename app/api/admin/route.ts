import { NextRequest, NextResponse } from 'next/server'
import { isMockMode, connectDB } from '@/lib/mongodb'
import { Users, CustomerStore, resetStore, clearStore } from '@/lib/mockstore'
import { buildSampleCustomers } from '@/lib/sampleCustomers'

type RawCustomer = {
  name: string; phone: string
  lastTransactionAmount: number; averageTransactionValue: number
  transactionDaysAgo: number[]
}
type RawMerchant = {
  phone: string; name: string; businessName: string; businessType: string
  customers: RawCustomer[]
}

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
      const merchants = Users.all().map((m) => ({
        id: m._id, name: m.name, phone: m.phone,
        businessName: m.businessName, businessType: m.businessType,
        customerCount: CustomerStore.count(m._id),
      }))
      return NextResponse.json({ merchants, mockMode: true })
    }
    await connectDB()
    const [User, Customer] = await Promise.all([
      import('@/models/User').then((m) => m.default),
      import('@/models/Customer').then((m) => m.default),
    ])
    const merchants = await User.find({}).sort({ createdAt: -1 })
    const overview = await Promise.all(merchants.map(async (m) => ({
      id: m._id.toString(), name: m.name, phone: m.phone,
      businessName: m.businessName, businessType: m.businessType,
      customerCount: await Customer.countDocuments({ merchantId: m._id.toString() }),
    })))
    return NextResponse.json({ merchants: overview })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

export async function POST(req: NextRequest) {
  const { action, merchantId } = await req.json()

  if (action === 'populate') {
    if (!merchantId) return NextResponse.json({ error: 'merchantId required' }, { status: 400 })
    const sample = buildSampleCustomers(110)
    const now = Date.now()

    if (isMockMode()) {
      const n = CustomerStore.replaceForMerchant(merchantId, sample.map((c) => ({
        name: c.name, phone: c.phone,
        transactionCount: c.transactionDaysAgo.length,
        lastTransactionAmount: c.lastTransactionAmount,
        averageTransactionValue: c.averageTransactionValue,
        transactionDaysAgo: c.transactionDaysAgo,
      })))
      return NextResponse.json({ success: true, count: n, mockMode: true })
    }

    await connectDB()
    const Customer = (await import('@/models/Customer')).default
    await Customer.deleteMany({ merchantId })
    for (const c of sample) {
      const transactionDates = [...c.transactionDaysAgo].sort((a, b) => b - a).map((d) => new Date(now - d * 86400000))
      await Customer.create({
        merchantId, name: c.name, phone: c.phone,
        transactionCount: c.transactionDaysAgo.length,
        lastTransactionAmount: c.lastTransactionAmount,
        averageTransactionValue: c.averageTransactionValue,
        transactionDates,
      })
    }
    return NextResponse.json({ success: true, count: sample.length })
  }

  if (action === 'seed') {
    if (isMockMode()) {
      resetStore()
      return NextResponse.json({ success: true, mockMode: true })
    }
    await connectDB()
    const data = (await import('@/mock/merchants.json')).default as { merchants: RawMerchant[] }
    const [User, Customer] = await Promise.all([
      import('@/models/User').then((m) => m.default),
      import('@/models/Customer').then((m) => m.default),
    ])
    const now = Date.now()
    for (const m of data.merchants) {
      let merchant = await User.findOne({ phone: m.phone })
      if (!merchant) merchant = await User.create({ phone: m.phone, name: m.name, businessName: m.businessName, businessType: m.businessType })
      const merchantId = merchant._id.toString()
      await Customer.deleteMany({ merchantId })
      for (const c of m.customers) {
        const transactionDates = [...c.transactionDaysAgo].sort((a, b) => b - a).map((d) => new Date(now - d * 86400000))
        await Customer.create({
          merchantId, name: c.name, phone: c.phone,
          transactionCount: c.transactionDaysAgo.length,
          lastTransactionAmount: c.lastTransactionAmount,
          averageTransactionValue: c.averageTransactionValue,
          transactionDates,
        })
      }
    }
    return NextResponse.json({ success: true })
  }

  if (action === 'clear') {
    if (isMockMode()) {
      clearStore()
      return NextResponse.json({ success: true, mockMode: true })
    }
    await connectDB()
    const [User, Customer] = await Promise.all([
      import('@/models/User').then((m) => m.default),
      import('@/models/Customer').then((m) => m.default),
    ])
    await Promise.all([User.deleteMany({}), Customer.deleteMany({})])
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
