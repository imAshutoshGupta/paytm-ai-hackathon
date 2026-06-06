import * as dotenv from 'dotenv'
dotenv.config({ path: '.env' })

import mongoose from 'mongoose'
import User from '../models/User'
import Customer from '../models/Customer'

const data = require('../mock/merchants.json')

type RawCustomer = {
  name: string
  phone: string
  lastTransactionAmount: number
  averageTransactionValue: number
  transactionDaysAgo: number[]
}
type RawMerchant = {
  phone: string
  name: string
  businessName: string
  businessType: string
  customers: RawCustomer[]
}

async function seed() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI not set in .env.local')

  await mongoose.connect(uri, { dbName: 'churnguard' })
  console.log('Connected to MongoDB')

  const now = Date.now()

  for (const m of data.merchants as RawMerchant[]) {
    console.log(`\nSeeding merchant ${m.phone} (${m.businessType})...`)

    let merchant = await User.findOne({ phone: m.phone })
    if (!merchant) {
      merchant = await User.create({
        phone: m.phone,
        name: m.name,
        businessName: m.businessName,
        businessType: m.businessType,
      })
      console.log(`  ✓ Created merchant: ${merchant.name}`)
    } else {
      console.log(`  ✓ Merchant exists: ${merchant.name}`)
    }

    const merchantId = merchant._id.toString()
    await Customer.deleteMany({ merchantId })

    for (const c of m.customers) {
      const transactionDates = [...c.transactionDaysAgo]
        .sort((a, b) => b - a)
        .map((d) => new Date(now - d * 86400000))
      await Customer.create({
        merchantId,
        name: c.name,
        phone: c.phone,
        transactionCount: c.transactionDaysAgo.length,
        lastTransactionAmount: c.lastTransactionAmount,
        averageTransactionValue: c.averageTransactionValue,
        transactionDates,
      })
    }
    console.log(`  ✓ Seeded ${m.customers.length} customers`)
  }

  await mongoose.disconnect()
  console.log('\n✅ Seeding complete!')
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
