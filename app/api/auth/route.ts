import { NextRequest, NextResponse } from 'next/server'
import { isMockMode, connectDB } from '@/lib/mongodb'
import { Users } from '@/lib/mockstore'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action, phone, otp, name, businessName, businessType, language } = body

  if (action === 'send-otp') {
    if (!phone || phone.length < 10) return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    return NextResponse.json({ success: true })
  }

  if (action === 'verify-otp') {
    if (otp !== '1234') return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 })
    return NextResponse.json({ success: true })
  }

  if (action === 'register') {
    if (!phone || !name || !businessName || !businessType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (isMockMode()) {
      let user = Users.findOne({ phone })
      if (!user) {
        user = Users.create({ phone, name, businessName, businessType, language: language || 'en' })
      } else {
        user = Users.update(user._id, { name, businessName, businessType, language: language || user.language }) ?? user
      }
      return NextResponse.json({ success: true, user: { id: user._id, phone: user.phone, name: user.name, businessName: user.businessName, businessType: user.businessType, language: user.language } })
    }

    await connectDB()
    const User = (await import('@/models/User')).default
    let user = await User.findOne({ phone })
    if (!user) {
      user = await User.create({ phone, name, businessName, businessType, language: language || 'en' })
    } else {
      user.name = name; user.businessName = businessName; user.businessType = businessType
      if (language) user.language = language
      await user.save()
    }
    return NextResponse.json({ success: true, user: { id: user._id.toString(), phone: user.phone, name: user.name, businessName: user.businessName, businessType: user.businessType, language: user.language } })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
