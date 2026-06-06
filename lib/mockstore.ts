/**
 * In-memory datastore seeded from mock JSON files.
 * Used when MONGODB_URI is not set (no real database needed for demo).
 */

import kiranaRaw from '../mock/kirana.json'
import tuitionRaw from '../mock/tuition.json'
import tailorRaw from '../mock/tailor.json'

let idSeq = 1
function uid() { return `mock_${++idSeq}_${Math.floor(Math.random() * 9999)}` }
function daysAgo(n: number) { return new Date(Date.now() - n * 86400000) }

export interface MUser {
  _id: string; phone: string; name: string; businessName: string
  businessType: 'kirana' | 'tuition' | 'tailor'; language: 'en' | 'hi' | 'mr'
  createdAt: Date; updatedAt: Date
}
export interface MUdhaar {
  _id: string; userId: string; customerName: string; amount: number
  amountPaid: number; note: string; status: 'pending' | 'partial' | 'paid'
  dueDate?: Date; createdAt: Date; updatedAt: Date
}
export interface MBillItem { name: string; quantity: number; unit: string; price: number }
export interface MBill {
  _id: string; userId: string; vendorName: string; items: MBillItem[]
  totalAmount: number; status: 'paid' | 'unpaid'; billDate: Date
  imageUrl?: string; rawText?: string; createdAt: Date; updatedAt: Date
}
export interface MInventory {
  _id: string; userId: string; itemName: string; quantity: number
  unit: string; reorderThreshold: number; lastUpdated: Date; createdAt: Date; updatedAt: Date
}
export interface MTransaction {
  _id: string; userId: string; type: 'sale' | 'expense'; amount: number
  description: string; category: string; paymentMode: 'cash' | 'upi' | 'credit'
  createdAt: Date; updatedAt: Date
}

interface Store {
  users: MUser[]
  udhaar: MUdhaar[]
  bills: MBill[]
  inventory: MInventory[]
  transactions: MTransaction[]
}

let store: Store | null = null

function buildStore(): Store {
  const s: Store = { users: [], udhaar: [], bills: [], inventory: [], transactions: [] }
  const datasets = [kiranaRaw, tuitionRaw, tailorRaw]
  const userIds = ['mock_u1', 'mock_u2', 'mock_u3']

  datasets.forEach((mock, idx) => {
    const userId = userIds[idx]
    const u = mock.user as { phone: string; name: string; businessName: string; businessType: string; language: string }
    s.users.push({
      _id: userId,
      phone: u.phone,
      name: u.name,
      businessName: u.businessName,
      businessType: u.businessType as MUser['businessType'],
      language: u.language as MUser['language'],
      createdAt: daysAgo(60),
      updatedAt: daysAgo(1),
    })

    type RawUdhaar = { customerName: string; amount: number; amountPaid: number; note: string; status: string; daysAgo: number }
    ;(mock.udhaar as RawUdhaar[]).forEach((e) => {
      s.udhaar.push({
        _id: uid(), userId,
        customerName: e.customerName, amount: e.amount, amountPaid: e.amountPaid,
        note: e.note, status: e.status as MUdhaar['status'],
        createdAt: daysAgo(e.daysAgo), updatedAt: daysAgo(e.daysAgo),
      })
    })

    type RawBillItem = { name: string; quantity: number; unit: string; price: number }
    type RawBill = { vendorName: string; items: RawBillItem[]; totalAmount: number; status: string; daysAgo: number }
    ;(mock.bills as RawBill[]).forEach((b) => {
      s.bills.push({
        _id: uid(), userId,
        vendorName: b.vendorName, items: b.items, totalAmount: b.totalAmount,
        status: b.status as MBill['status'],
        billDate: daysAgo(b.daysAgo), createdAt: daysAgo(b.daysAgo), updatedAt: daysAgo(b.daysAgo),
      })
    })

    type RawInv = { itemName: string; quantity: number; unit: string; reorderThreshold: number }
    ;(mock.inventory as RawInv[]).forEach((i) => {
      s.inventory.push({
        _id: uid(), userId,
        itemName: i.itemName, quantity: i.quantity, unit: i.unit,
        reorderThreshold: i.reorderThreshold,
        lastUpdated: daysAgo(1), createdAt: daysAgo(30), updatedAt: daysAgo(1),
      })
    })

    type RawTx = { type: string; amount: number; description: string; category: string; paymentMode: string; daysAgo: number }
    ;(mock.transactions as RawTx[]).forEach((t) => {
      s.transactions.push({
        _id: uid(), userId,
        type: t.type as MTransaction['type'], amount: t.amount,
        description: t.description, category: t.category,
        paymentMode: t.paymentMode as MTransaction['paymentMode'],
        createdAt: daysAgo(t.daysAgo), updatedAt: daysAgo(t.daysAgo),
      })
    })
  })

  return s
}

function getStore(): Store {
  if (!store) store = buildStore()
  return store
}

// ─── Users ────────────────────────────────────────────────────────────────────

export const Users = {
  findOne(query: Partial<MUser>): MUser | null {
    const s = getStore()
    return s.users.find((u) =>
      Object.entries(query).every(([k, v]) => (u as unknown as Record<string, unknown>)[k] === v),
    ) ?? null
  },
  findById(id: string): MUser | null {
    return getStore().users.find((u) => u._id === id) ?? null
  },
  create(data: Omit<MUser, '_id' | 'createdAt' | 'updatedAt'>): MUser {
    const u: MUser = { _id: uid(), ...data, createdAt: new Date(), updatedAt: new Date() }
    getStore().users.push(u)
    return u
  },
  update(id: string, patch: Partial<MUser>): MUser | null {
    const s = getStore()
    const idx = s.users.findIndex((u) => u._id === id)
    if (idx === -1) return null
    s.users[idx] = { ...s.users[idx], ...patch, updatedAt: new Date() }
    return s.users[idx]
  },
  all(): MUser[] { return getStore().users },
}

// ─── Udhaar ───────────────────────────────────────────────────────────────────

export const UdhaarStore = {
  find(userId: string, opts?: { search?: string; status?: string }): MUdhaar[] {
    let rows = getStore().udhaar.filter((u) => u.userId === userId)
    if (opts?.status && opts.status !== 'all') rows = rows.filter((u) => u.status === opts.status)
    if (opts?.search) {
      const q = opts.search.toLowerCase()
      rows = rows.filter((u) => u.customerName.toLowerCase().includes(q))
    }
    return rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  },
  findById(id: string): MUdhaar | null {
    return getStore().udhaar.find((u) => u._id === id) ?? null
  },
  create(data: Omit<MUdhaar, '_id' | 'createdAt' | 'updatedAt'>): MUdhaar {
    const row: MUdhaar = { _id: uid(), ...data, createdAt: new Date(), updatedAt: new Date() }
    getStore().udhaar.push(row)
    return row
  },
  update(id: string, patch: Partial<MUdhaar>): MUdhaar | null {
    const s = getStore()
    const idx = s.udhaar.findIndex((u) => u._id === id)
    if (idx === -1) return null
    s.udhaar[idx] = { ...s.udhaar[idx], ...patch, updatedAt: new Date() }
    return s.udhaar[idx]
  },
  delete(id: string): void {
    const s = getStore()
    s.udhaar = s.udhaar.filter((u) => u._id !== id)
  },
}

// ─── Bills ────────────────────────────────────────────────────────────────────

export const BillStore = {
  find(userId: string): MBill[] {
    return getStore().bills
      .filter((b) => b.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  },
  findById(id: string): MBill | null {
    return getStore().bills.find((b) => b._id === id) ?? null
  },
  findUnpaid(userId: string): MBill[] {
    return getStore().bills.filter((b) => b.userId === userId && b.status === 'unpaid')
  },
  create(data: Omit<MBill, '_id' | 'createdAt' | 'updatedAt'>): MBill {
    const row: MBill = { _id: uid(), ...data, createdAt: new Date(), updatedAt: new Date() }
    getStore().bills.push(row)
    return row
  },
  update(id: string, patch: Partial<MBill>): MBill | null {
    const s = getStore()
    const idx = s.bills.findIndex((b) => b._id === id)
    if (idx === -1) return null
    s.bills[idx] = { ...s.bills[idx], ...patch, updatedAt: new Date() }
    return s.bills[idx]
  },
  delete(id: string): void {
    const s = getStore()
    s.bills = s.bills.filter((b) => b._id !== id)
  },
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export const InventoryStore = {
  find(userId: string): MInventory[] {
    return getStore().inventory
      .filter((i) => i.userId === userId)
      .sort((a, b) => a.itemName.localeCompare(b.itemName))
  },
  findById(id: string): MInventory | null {
    return getStore().inventory.find((i) => i._id === id) ?? null
  },
  create(data: Omit<MInventory, '_id' | 'createdAt' | 'updatedAt'>): MInventory {
    const row: MInventory = { _id: uid(), ...data, createdAt: new Date(), updatedAt: new Date() }
    getStore().inventory.push(row)
    return row
  },
  update(id: string, patch: Partial<MInventory>): MInventory | null {
    const s = getStore()
    const idx = s.inventory.findIndex((i) => i._id === id)
    if (idx === -1) return null
    s.inventory[idx] = { ...s.inventory[idx], ...patch, updatedAt: new Date() }
    return s.inventory[idx]
  },
  delete(id: string): void {
    const s = getStore()
    s.inventory = s.inventory.filter((i) => i._id !== id)
  },
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export const TransactionStore = {
  find(userId: string, limit = 30): MTransaction[] {
    return getStore().transactions
      .filter((t) => t.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
  },
  create(data: Omit<MTransaction, '_id' | 'createdAt' | 'updatedAt'>): MTransaction {
    const row: MTransaction = { _id: uid(), ...data, createdAt: new Date(), updatedAt: new Date() }
    getStore().transactions.push(row)
    return row
  },
  count(userId: string): number {
    return getStore().transactions.filter((t) => t.userId === userId).length
  },
}

// ─── Seed / Clear ─────────────────────────────────────────────────────────────

export function resetStore() {
  store = buildStore()
}

export function clearStore() {
  store = { users: [], udhaar: [], bills: [], inventory: [], transactions: [] }
}
