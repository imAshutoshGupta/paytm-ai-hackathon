import { NextRequest, NextResponse } from 'next/server'
import { isMockMode, connectDB } from '@/lib/mongodb'
import { InventoryStore } from '@/lib/mockstore'
import { generateText } from '@/lib/paytm'

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  const language = req.nextUrl.searchParams.get('language') || 'en'
  const getSuggestion = req.nextUrl.searchParams.get('suggestion') === 'true'
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  if (isMockMode()) {
    const items = InventoryStore.find(userId)
    if (getSuggestion && items.length) {
      const low = items.filter((i) => i.quantity <= i.reorderThreshold)
      const langStr = language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English'
      const list = items.map((i) => `${i.itemName}: ${i.quantity} ${i.unit} (min ${i.reorderThreshold})`).join('\n')
      const suggestion = await generateText(`Inventory:\n${list}\n\nBrief stock insight in ${langStr} (2-3 sentences). Mention ${low.length} low-stock items.`, undefined, language)
      return NextResponse.json({ items, suggestion })
    }
    return NextResponse.json({ items })
  }

  await connectDB()
  const Inventory = (await import('@/models/Inventory')).default
  const items = await Inventory.find({ userId }).sort({ itemName: 1 })
  if (getSuggestion && items.length) {
    const langStr = language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English'
    const list = items.map((i) => `${i.itemName}: ${i.quantity} ${i.unit} (min ${i.reorderThreshold})`).join('\n')
    const suggestion = await generateText(`Inventory:\n${list}\n\nBrief stock insight in ${langStr} (2-3 sentences).`, undefined, language)
    return NextResponse.json({ items, suggestion })
  }
  return NextResponse.json({ items })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { userId, itemName, quantity, unit, reorderThreshold } = body
  if (!userId || !itemName) return NextResponse.json({ error: 'userId and itemName required' }, { status: 400 })

  if (isMockMode()) {
    const item = InventoryStore.create({ userId, itemName, quantity: Number(quantity) || 0, unit: unit || 'pcs', reorderThreshold: Number(reorderThreshold) || 5, lastUpdated: new Date() })
    return NextResponse.json({ item })
  }

  await connectDB()
  const Inventory = (await import('@/models/Inventory')).default
  const item = await Inventory.create({ userId, itemName, quantity: Number(quantity) || 0, unit: unit || 'pcs', reorderThreshold: Number(reorderThreshold) || 5, lastUpdated: new Date() })
  return NextResponse.json({ item })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, quantity } = body
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  if (isMockMode()) {
    const item = InventoryStore.update(id, { quantity: Number(quantity), lastUpdated: new Date() })
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ item })
  }

  await connectDB()
  const Inventory = (await import('@/models/Inventory')).default
  const item = await Inventory.findByIdAndUpdate(id, { quantity: Number(quantity), lastUpdated: new Date() }, { new: true })
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ item })
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  if (isMockMode()) { InventoryStore.delete(id); return NextResponse.json({ success: true }) }

  await connectDB()
  const Inventory = (await import('@/models/Inventory')).default
  await Inventory.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
}
