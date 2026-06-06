/**
 * Generates a realistic, churn-varied set of customers for a merchant that has
 * no Paytm transaction history yet (e.g. a freshly-registered demo account).
 *
 * Customers are drawn from several "personas" so the churn engine produces a
 * natural spread of Active / Medium / High risk across 100+ records.
 */

const FIRST = [
  'Aarav', 'Diya', 'Vivaan', 'Ananya', 'Aditya', 'Ishita', 'Kabir', 'Saanvi',
  'Reyansh', 'Myra', 'Arjun', 'Aadhya', 'Vihaan', 'Anika', 'Krishna', 'Riya',
  'Dhruv', 'Pari', 'Atharv', 'Sara', 'Rohan', 'Neha', 'Karan', 'Pooja',
  'Sameer', 'Tanvi', 'Imran', 'Kavya', 'Rahul', 'Simran', 'Akash', 'Pallavi',
  'Farhan', 'Meera', 'Nikhil', 'Divya', 'Sanjay', 'Priya', 'Manish', 'Sneha',
  'Vikram', 'Ritu', 'Aditi', 'Yash', 'Sakshi', 'Harsh', 'Tara', 'Dev',
]

const LAST = [
  'Sharma', 'Patel', 'Reddy', 'Iyer', 'Nair', 'Gupta', 'Singh', 'Joshi',
  'Mehta', 'Desai', 'Kulkarni', 'Rao', 'Shah', 'Verma', 'Pillai', 'Bansal',
  'Agarwal', 'Malhotra', 'Menon', 'Khan', 'Kapoor', 'Chopra', 'Bose', 'Das',
]

type Persona = (rand: () => number) => number[]

// Each persona returns a list of "days ago" visit timestamps.
const PERSONAS: { weight: number; build: Persona }[] = [
  // Loyal & active — short gaps, very recent
  { weight: 3, build: (r) => seq(1 + Math.floor(r() * 4), 4 + Math.floor(r() * 4), 7 + Math.floor(r() * 4)) },
  // Regular & active — weekly-ish, recent
  { weight: 3, build: (r) => seq(2 + Math.floor(r() * 6), 8 + Math.floor(r() * 6), 5 + Math.floor(r() * 3)) },
  // Occasional but on-cadence — fortnightly, fine
  { weight: 2, build: (r) => seq(6 + Math.floor(r() * 6), 16 + Math.floor(r() * 8), 4 + Math.floor(r() * 2)) },
  // Slipping (medium) — moderate gap, a bit overdue (~1.2–1.5×), decent history
  { weight: 4, build: (r) => slipping(10 + Math.floor(r() * 7), 1.2 + r() * 0.35, 4 + Math.floor(r() * 2)) },
  // Cooling (medium→high edge) — longer gap, mildly overdue
  { weight: 2, build: (r) => slipping(14 + Math.floor(r() * 8), 1.3 + r() * 0.4, 3 + Math.floor(r() * 2)) },
  // High risk — used to be regular, now long absent
  { weight: 3, build: (r) => slipping(7 + Math.floor(r() * 7), 2.4 + r() * 1.2, 3 + Math.floor(r() * 3)) },
  // Lost — sparse visits, gone for months
  { weight: 2, build: (r) => slipping(15 + Math.floor(r() * 12), 2.6 + r() * 1.4, 2 + Math.floor(r() * 2)) },
  // New & active — only a couple of recent visits
  { weight: 1, build: (r) => seq(1 + Math.floor(r() * 5), 10 + Math.floor(r() * 8), 2 + Math.floor(r() * 2)) },
]

/** Evenly-spaced visits: most recent `start` days ago, then every ~`gap` days, `count` visits. */
function seq(start: number, gap: number, count: number): number[] {
  const out: number[] = []
  for (let i = 0; i < count; i++) out.push(start + i * gap)
  return out
}

/** A customer whose cadence was `gap` but whose last visit is `overdue`× that gap ago. */
function slipping(gap: number, overdue: number, count: number): number[] {
  const start = Math.round(gap * overdue)
  return seq(start, gap, count)
}

export interface GeneratedCustomer {
  name: string
  phone: string
  lastTransactionAmount: number
  averageTransactionValue: number
  transactionDaysAgo: number[]
}

function makeNamePool(n: number, rand: () => number): string[] {
  const set = new Set<string>()
  const combos: string[] = []
  for (const f of FIRST) for (const l of LAST) combos.push(`${f} ${l}`)
  // shuffle
  for (let i = combos.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[combos[i], combos[j]] = [combos[j], combos[i]]
  }
  for (const c of combos) {
    if (set.size >= n) break
    set.add(c)
  }
  return [...set]
}

// weighted persona index list
const PERSONA_BAG: number[] = PERSONAS.flatMap((p, i) => Array(p.weight).fill(i))

export function buildSampleCustomers(count = 110): GeneratedCustomer[] {
  const rand = Math.random
  const names = makeNamePool(count, rand)

  return names.map((name) => {
    const persona = PERSONAS[PERSONA_BAG[Math.floor(rand() * PERSONA_BAG.length)]]
    const transactionDaysAgo = persona.build(rand).sort((a, b) => a - b)
    const avg = 100 + Math.floor(rand() * 2200)
    const last = Math.max(50, Math.round(avg + (rand() - 0.5) * avg * 0.5))
    const phone = `${[9, 8, 7][Math.floor(rand() * 3)]}${String(100000000 + Math.floor(rand() * 899999999)).slice(0, 9)}`
    return {
      name,
      phone,
      lastTransactionAmount: last,
      averageTransactionValue: avg,
      transactionDaysAgo,
    }
  })
}
