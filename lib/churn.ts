/**
 * Churn scoring engine.
 *
 * Implements the recency/frequency model:
 *   recency_days   = today - last_transaction_date
 *   avg_gap_days   = mean gap between consecutive visits
 *   frequency_score= transaction_count normalised 0..1 over the dataset max
 *
 *   base     = min(recency_days / (avg_gap_days * 2.5), 1.0)
 *   weighted = base * 0.6 + (1 - frequency_score) * 0.4
 *   churn_pct= round(weighted * 100)
 *
 * Thresholds: >=70 HIGH · 45-69 MEDIUM · <45 ACTIVE
 *
 * Pure functions — safe to run on the client or the server.
 */

export type RiskLevel = 'active' | 'medium' | 'high'

export interface CustomerInput {
  id: string
  name: string
  phone: string
  transactionCount: number
  lastTransactionAmount: number
  averageTransactionValue: number
  /** Days-ago integers for each past visit, e.g. [2, 9, 17, 30]. Sorted ascending = most recent first. */
  transactionDaysAgo: number[]
}

export interface ScoredCustomer extends CustomerInput {
  recencyDays: number
  avgGapDays: number
  frequencyScore: number
  churnPct: number
  risk: RiskLevel
  /** AI-generated explanation for the score (empty when scored by the heuristic fallback). */
  reason?: string
}

const DAY = 86400000

export function riskFromPct(pct: number): RiskLevel {
  if (pct >= 70) return 'high'
  if (pct >= 45) return 'medium'
  return 'active'
}

function avgGap(daysAgo: number[]): number {
  if (daysAgo.length < 2) return 30 // not enough history — assume a monthly cadence
  const sorted = [...daysAgo].sort((a, b) => a - b)
  let total = 0
  for (let i = 1; i < sorted.length; i++) total += sorted[i] - sorted[i - 1]
  return Math.max(total / (sorted.length - 1), 1)
}

export function scoreCustomers(customers: CustomerInput[]): ScoredCustomer[] {
  const maxTx = Math.max(1, ...customers.map((c) => c.transactionCount))

  return customers
    .map((c) => {
      const recencyDays = c.transactionDaysAgo.length
        ? Math.min(...c.transactionDaysAgo)
        : 999
      const avgGapDays = avgGap(c.transactionDaysAgo)
      const frequencyScore = c.transactionCount / maxTx

      const base = Math.min(recencyDays / (avgGapDays * 2.5), 1.0)
      const weighted = base * 0.6 + (1 - frequencyScore) * 0.4
      const churnPct = Math.round(weighted * 100)

      return {
        ...c,
        recencyDays,
        avgGapDays: Math.round(avgGapDays),
        frequencyScore,
        churnPct,
        risk: riskFromPct(churnPct),
      }
    })
    .sort((a, b) => b.churnPct - a.churnPct)
}

export function lastVisitedLabel(daysAgo: number): string {
  if (daysAgo <= 0) return 'Today'
  if (daysAgo === 1) return 'Yesterday'
  if (daysAgo < 30) return `${daysAgo} days ago`
  const months = Math.floor(daysAgo / 30)
  return months === 1 ? '1 month ago' : `${months} months ago`
}

export function maskName(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1][0]}.`
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '').slice(-10)
  if (digits.length < 10) return `+91 ${phone}`
  return `+91 ${digits.slice(0, 5)} ****${digits.slice(-2)}`
}

export { DAY }
