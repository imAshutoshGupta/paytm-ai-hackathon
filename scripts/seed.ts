import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import mongoose from 'mongoose'
import User from '../models/User'
import Udhaar from '../models/Udhaar'
import Bill from '../models/Bill'
import Inventory from '../models/Inventory'
import Transaction from '../models/Transaction'

const kiranaData = require('../mock/kirana.json')
const tuitionData = require('../mock/tuition.json')
const tailorData = require('../mock/tailor.json')

async function seed() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI not set in .env.local')

  await mongoose.connect(uri, { dbName: 'hisaab' })
  console.log('Connected to MongoDB')

  const mockDatasets = [kiranaData, tuitionData, tailorData]

  for (const mock of mockDatasets) {
    const userData = mock.user
    console.log(`\nSeeding ${userData.phone} (${userData.businessType})...`)

    let user = await User.findOne({ phone: userData.phone })
    if (!user) {
      user = await User.create(userData)
      console.log(`  ✓ Created user: ${user.name}`)
    } else {
      console.log(`  ✓ User exists: ${user.name}`)
    }
    const userId = user._id.toString()

    await Promise.all([
      Udhaar.deleteMany({ userId }),
      Bill.deleteMany({ userId }),
      Inventory.deleteMany({ userId }),
      Transaction.deleteMany({ userId }),
    ])
    console.log('  ✓ Cleared old data')

    const now = Date.now()

    for (const u of mock.udhaar) {
      await Udhaar.create({
        userId,
        customerName: u.customerName,
        amount: u.amount,
        amountPaid: u.amountPaid,
        note: u.note,
        status: u.status,
        createdAt: new Date(now - u.daysAgo * 86400000),
        updatedAt: new Date(now - u.daysAgo * 86400000),
      })
    }
    console.log(`  ✓ Seeded ${mock.udhaar.length} udhaar entries`)

    for (const b of mock.bills) {
      await Bill.create({
        userId,
        vendorName: b.vendorName,
        items: b.items,
        totalAmount: b.totalAmount,
        status: b.status,
        billDate: new Date(now - b.daysAgo * 86400000),
        createdAt: new Date(now - b.daysAgo * 86400000),
      })
    }
    console.log(`  ✓ Seeded ${mock.bills.length} bills`)

    for (const i of mock.inventory) {
      await Inventory.create({ userId, ...i })
    }
    console.log(`  ✓ Seeded ${mock.inventory.length} inventory items`)

    for (const tx of mock.transactions) {
      await Transaction.create({
        userId,
        type: tx.type,
        amount: tx.amount,
        description: tx.description,
        category: tx.category,
        paymentMode: tx.paymentMode,
        createdAt: new Date(now - tx.daysAgo * 86400000),
      })
    }
    console.log(`  ✓ Seeded ${mock.transactions.length} transactions`)
  }

  await mongoose.disconnect()
  console.log('\n✅ Seeding complete!')
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
