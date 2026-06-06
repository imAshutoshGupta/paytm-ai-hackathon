import { NextRequest, NextResponse } from 'next/server'
import { isMockMode, connectDB } from '@/lib/mongodb'
import { Users } from '@/lib/mockstore'
import { generateReminder } from '@/lib/paytm'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { userId, customerName, amount, daysOverdue, language = 'en' } = body
  if (!userId || !customerName || !amount) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  try {
    let businessName = ''

    if (isMockMode()) {
      const user = Users.findById(userId)
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
      businessName = user.businessName
    } else {
      await connectDB()
      const User = (await import('@/models/User')).default
      const user = await User.findById(userId)
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
      businessName = user.businessName
    }

    const message = await generateReminder(customerName, amount, daysOverdue || 0, businessName, language)
    return NextResponse.json({ message })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to generate reminder' }, { status: 500 })
  }
}
