import { NextRequest, NextResponse } from 'next/server'
import { isMockMode, connectDB } from '@/lib/mongodb'
import { Users } from '@/lib/mockstore'

interface MerchantLike {
  _id: unknown
  phone: string
  name: string
  businessName: string
  businessType: string
}

function toDTO(m: MerchantLike) {
  return {
    id: String(m._id),
    phone: m.phone,
    name: m.name,
    businessName: m.businessName,
    businessType: m.businessType,
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action, phone, otp, name, businessName, businessType } = body

  if (action === 'send-otp') {
    if (!phone || phone.length < 10) return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    return NextResponse.json({ success: true })
  }

  if (action === 'verify-otp') {
    if (otp !== '1234') return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 })
    if (isMockMode()) {
      const m = Users.findOne({ phone })
      return NextResponse.json({ success: true, merchant: m ? toDTO(m) : null })
    }
    await connectDB()
    const User = (await import('@/models/User')).default
    const m = await User.findOne({ phone })
    return NextResponse.json({ success: true, merchant: m ? toDTO(m as unknown as MerchantLike) : null })
  }

  if (action === 'register') {
    if (!phone || !name) {
      return NextResponse.json({ error: 'Phone and name are required' }, { status: 400 })
    }
    const fields = {
      name,
      businessName: businessName || name,
      businessType: businessType || 'other',
    }

    if (isMockMode()) {
      let m = Users.findOne({ phone })
      if (!m) m = Users.create({ phone, ...fields })
      return NextResponse.json({ success: true, merchant: toDTO(m) })
    }

    await connectDB()
    const User = (await import('@/models/User')).default
    let m = await User.findOne({ phone })
    if (!m) {
      m = await User.create({ phone, ...fields })
    } else {
      m.name = fields.name; m.businessName = fields.businessName; m.businessType = fields.businessType
      await m.save()
    }
    return NextResponse.json({ success: true, merchant: toDTO(m as unknown as MerchantLike) })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
