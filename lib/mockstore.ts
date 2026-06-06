/**
 * In-memory datastore seeded from mock/merchants.json.
 * Used when MONGODB_URI is not set (no real database needed for demo).
 *
 * IDs are deterministic (mock_m1, cust_m1_0, ...) so that churn results and
 * win-back state stored in localStorage stay valid across page reloads.
 */

import raw from '../mock/merchants.json'

export interface MMerchant {
  _id: string
  phone: string
  name: string
  businessName: string
  businessType: string
}

export interface MCustomer {
  _id: string
  merchantId: string
  name: string
  phone: string
  transactionCount: number
  lastTransactionAmount: number
  averageTransactionValue: number
  transactionDaysAgo: number[]
}

interface Store {
  merchants: MMerchant[]
  customers: MCustomer[]
}

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

let idSeq = 1000
function uid() { return `gen_${++idSeq}` }

let store: Store | null = null

function buildStore(): Store {
  const s: Store = { merchants: [], customers: [] }
  ;(raw.merchants as RawMerchant[]).forEach((m, mi) => {
    const merchantId = `mock_m${mi + 1}`
    s.merchants.push({
      _id: merchantId,
      phone: m.phone,
      name: m.name,
      businessName: m.businessName,
      businessType: m.businessType,
    })
    m.customers.forEach((c, ci) => {
      s.customers.push({
        _id: `cust_m${mi + 1}_${ci}`,
        merchantId,
        name: c.name,
        phone: c.phone,
        transactionCount: c.transactionDaysAgo.length,
        lastTransactionAmount: c.lastTransactionAmount,
        averageTransactionValue: c.averageTransactionValue,
        transactionDaysAgo: c.transactionDaysAgo,
      })
    })
  })
  return s
}

function getStore(): Store {
  if (!store) store = buildStore()
  return store
}

// ─── Merchants (users) ──────────────────────────────────────────────────────

export const Users = {
  findOne(query: Partial<MMerchant>): MMerchant | null {
    const s = getStore()
    return s.merchants.find((u) =>
      Object.entries(query).every(([k, v]) => (u as unknown as Record<string, unknown>)[k] === v),
    ) ?? null
  },
  findById(id: string): MMerchant | null {
    return getStore().merchants.find((u) => u._id === id) ?? null
  },
  create(data: Omit<MMerchant, '_id'>): MMerchant {
    const u: MMerchant = { _id: uid(), ...data }
    getStore().merchants.push(u)
    return u
  },
  all(): MMerchant[] { return getStore().merchants },
}

// ─── Customers ──────────────────────────────────────────────────────────────

export const CustomerStore = {
  findByMerchant(merchantId: string): MCustomer[] {
    return getStore().customers.filter((c) => c.merchantId === merchantId)
  },
  count(merchantId: string): number {
    return getStore().customers.filter((c) => c.merchantId === merchantId).length
  },
  create(data: Omit<MCustomer, '_id'>): MCustomer {
    const row: MCustomer = { _id: uid(), ...data }
    getStore().customers.push(row)
    return row
  },
  replaceForMerchant(merchantId: string, rows: Omit<MCustomer, '_id' | 'merchantId'>[]): number {
    const s = getStore()
    s.customers = s.customers.filter((c) => c.merchantId !== merchantId)
    rows.forEach((r) => s.customers.push({ _id: uid(), merchantId, ...r }))
    return rows.length
  },
}

// ─── Seed / Clear ─────────────────────────────────────────────────────────────

export function resetStore() { store = buildStore() }
export function clearStore() { store = { merchants: [], customers: [] } }
