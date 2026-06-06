import { NextRequest, NextResponse } from 'next/server'
import { isMockMode, connectDB } from '@/lib/mongodb'
import { Users, UdhaarStore, BillStore, InventoryStore } from '@/lib/mockstore'
import { generateMorningBriefing, BusinessContext } from '@/lib/paytm'

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  const language = req.nextUrl.searchParams.get('language') || 'en'
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  try {
    let ownerName = '', businessName = '', businessType = ''
    let totalDues = 0, pendingBillsAmount = 0, lowStockItems: string[] = []

    if (isMockMode()) {
      const user = Users.findById(userId)
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
      ownerName = user.name; businessName = user.businessName; businessType = user.businessType
      const udhaars = UdhaarStore.find(userId).filter((u) => u.status !== 'paid')
      const bills = BillStore.findUnpaid(userId)
      const inventory = InventoryStore.find(userId)
      totalDues = udhaars.reduce((s, u) => s + (u.amount - u.amountPaid), 0)
      pendingBillsAmount = bills.reduce((s, b) => s + b.totalAmount, 0)
      lowStockItems = inventory.filter((i) => i.quantity <= i.reorderThreshold).map((i) => i.itemName)
    } else {
      await connectDB()
      const [User, Udhaar, Bill, Inventory] = await Promise.all([
        import('@/models/User').then((m) => m.default),
        import('@/models/Udhaar').then((m) => m.default),
        import('@/models/Bill').then((m) => m.default),
        import('@/models/Inventory').then((m) => m.default),
      ])
      const [user, udhaars, bills, inventory] = await Promise.all([
        User.findById(userId),
        Udhaar.find({ userId, status: { $ne: 'paid' } }),
        Bill.find({ userId, status: 'unpaid' }),
        Inventory.find({ userId }),
      ])
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
      ownerName = user.name; businessName = user.businessName; businessType = user.businessType
      totalDues = udhaars.reduce((s, u) => s + (u.amount - u.amountPaid), 0)
      pendingBillsAmount = bills.reduce((s, b) => s + b.totalAmount, 0)
      lowStockItems = inventory.filter((i: { quantity: number; reorderThreshold: number; itemName: string }) => i.quantity <= i.reorderThreshold).map((i: { itemName: string }) => i.itemName)
    }

    const context: BusinessContext = { businessType, businessName, ownerName, totalDues, lowStockItems, pendingBillsAmount }
    const briefing = await generateMorningBriefing(context, language)
    return NextResponse.json({ briefing })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to generate briefing' }, { status: 500 })
  }
}
