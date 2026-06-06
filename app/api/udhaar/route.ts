import { NextRequest, NextResponse } from 'next/server'
import { isMockMode, connectDB } from '@/lib/mongodb'
import { UdhaarStore } from '@/lib/mockstore'

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  const search = req.nextUrl.searchParams.get('search') || ''
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  if (isMockMode()) {
    const entries = UdhaarStore.find(userId, { search })
    return NextResponse.json({ entries })
  }

  await connectDB()
  const Udhaar = (await import('@/models/Udhaar')).default
  const query: Record<string, unknown> = { userId }
  if (search) query.customerName = { $regex: search, $options: 'i' }
  const entries = await Udhaar.find(query).sort({ createdAt: -1 })
  return NextResponse.json({ entries })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { userId, customerName, amount, note, dueDate } = body
  if (!userId || !customerName || !amount) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  if (isMockMode()) {
    const entry = UdhaarStore.create({ userId, customerName, amount: Number(amount), amountPaid: 0, note: note || '', status: 'pending', dueDate: dueDate ? new Date(dueDate) : undefined })
    return NextResponse.json({ entry })
  }

  await connectDB()
  const Udhaar = (await import('@/models/Udhaar')).default
  const entry = await Udhaar.create({ userId, customerName, amount: Number(amount), amountPaid: 0, note: note || '', status: 'pending', dueDate: dueDate ? new Date(dueDate) : undefined })
  return NextResponse.json({ entry })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, action, amountPaid } = body
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  if (isMockMode()) {
    const entry = UdhaarStore.findById(id)
    if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (action === 'mark-paid') {
      const updated = UdhaarStore.update(id, { amountPaid: entry.amount, status: 'paid' })
      return NextResponse.json({ entry: updated })
    }
    if (action === 'partial' && amountPaid !== undefined) {
      const paid = Math.min(Number(amountPaid), entry.amount)
      const updated = UdhaarStore.update(id, { amountPaid: paid, status: paid >= entry.amount ? 'paid' : 'partial' })
      return NextResponse.json({ entry: updated })
    }
    return NextResponse.json({ entry })
  }

  await connectDB()
  const Udhaar = (await import('@/models/Udhaar')).default
  const entry = await Udhaar.findById(id)
  if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (action === 'mark-paid') { entry.amountPaid = entry.amount; entry.status = 'paid' }
  else if (action === 'partial' && amountPaid !== undefined) {
    entry.amountPaid = Math.min(Number(amountPaid), entry.amount)
    entry.status = entry.amountPaid >= entry.amount ? 'paid' : 'partial'
  }
  await entry.save()
  return NextResponse.json({ entry })
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  if (isMockMode()) { UdhaarStore.delete(id); return NextResponse.json({ success: true }) }

  await connectDB()
  const Udhaar = (await import('@/models/Udhaar')).default
  await Udhaar.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
}
