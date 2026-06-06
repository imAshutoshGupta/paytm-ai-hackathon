import { NextRequest, NextResponse } from 'next/server'
import { isMockMode, connectDB } from '@/lib/mongodb'
import { Users, UdhaarStore, BillStore, InventoryStore, TransactionStore } from '@/lib/mockstore'
import { chatWithContext, Message, BusinessContext } from '@/lib/paytm'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { userId, messages, language = 'en' } = body
  if (!userId || !messages) return NextResponse.json({ error: 'userId and messages required' }, { status: 400 })

  try {
    let ownerName = '', businessName = '', businessType = ''
    let totalDues = 0, pendingBillsAmount = 0
    let lowStockItems: string[] = [], recentActivity: string[] = []

    if (isMockMode()) {
      const user = Users.findById(userId)
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
      ownerName = user.name; businessName = user.businessName; businessType = user.businessType

      const udhaars = UdhaarStore.find(userId).filter((u) => u.status !== 'paid')
      const bills = BillStore.findUnpaid(userId)
      const inventory = InventoryStore.find(userId)
      const transactions = TransactionStore.find(userId, 30)

      totalDues = udhaars.reduce((s, u) => s + (u.amount - u.amountPaid), 0)
      pendingBillsAmount = bills.reduce((s, b) => s + b.totalAmount, 0)
      lowStockItems = inventory.filter((i) => i.quantity <= i.reorderThreshold).map((i) => i.itemName)
      recentActivity = [
        ...udhaars.slice(0, 3).map((u) => `Due: ${u.customerName} owes ₹${u.amount - u.amountPaid}`),
        ...transactions.slice(0, 3).map((t) => `${t.type}: ₹${t.amount} — ${t.description}`),
      ]
    } else {
      await connectDB()
      const [User, Udhaar, Bill, Inventory, Transaction] = await Promise.all([
        import('@/models/User').then((m) => m.default),
        import('@/models/Udhaar').then((m) => m.default),
        import('@/models/Bill').then((m) => m.default),
        import('@/models/Inventory').then((m) => m.default),
        import('@/models/Transaction').then((m) => m.default),
      ])
      const [user, udhaars, bills, inventory, transactions] = await Promise.all([
        User.findById(userId),
        Udhaar.find({ userId, status: { $ne: 'paid' } }).limit(20),
        Bill.find({ userId, status: 'unpaid' }).limit(10),
        Inventory.find({ userId }),
        Transaction.find({ userId }).sort({ createdAt: -1 }).limit(30),
      ])
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
      ownerName = user.name; businessName = user.businessName; businessType = user.businessType
      totalDues = udhaars.reduce((s: number, u: { amount: number; amountPaid: number }) => s + (u.amount - u.amountPaid), 0)
      pendingBillsAmount = bills.reduce((s: number, b: { totalAmount: number }) => s + b.totalAmount, 0)
      lowStockItems = inventory.filter((i: { quantity: number; reorderThreshold: number }) => i.quantity <= i.reorderThreshold).map((i: { itemName: string }) => i.itemName)
      recentActivity = [
        ...udhaars.slice(0, 3).map((u: { customerName: string; amount: number; amountPaid: number }) => `Due: ${u.customerName} owes ₹${u.amount - u.amountPaid}`),
        ...transactions.slice(0, 3).map((t: { type: string; amount: number; description: string }) => `${t.type}: ₹${t.amount} — ${t.description}`),
      ]
    }

    const context: BusinessContext = { businessType, businessName, ownerName, totalDues, lowStockItems, pendingBillsAmount, recentActivity }
    const typedMessages: Message[] = messages.map((m: { role: string; content: string }) => ({ role: m.role as 'user' | 'assistant', content: m.content }))
    const reply = await chatWithContext(typedMessages, context, language)
    return NextResponse.json({ reply })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to process query' }, { status: 500 })
  }
}
