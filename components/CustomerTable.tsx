'use client'

import { ScoredCustomer, maskName, maskPhone, lastVisitedLabel } from '@/lib/churn'
import { Send, Check } from 'lucide-react'
import clsx from 'clsx'

const AVATAR_TONES = [
  'bg-brand-tint text-brand-dark',
  'bg-amber-soft text-amber-dark',
  'bg-success-soft text-success',
  'bg-canvas text-navy',
]
function avatarTone(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return AVATAR_TONES[h % AVATAR_TONES.length]
}
function initials(name: string) {
  const p = name.trim().split(/\s+/)
  return (p[0][0] + (p[1]?.[0] ?? '')).toUpperCase()
}

function ChurnCell({ c, hasRun }: { c: ScoredCustomer; hasRun: boolean }) {
  if (!hasRun) return <span className="text-muted">—</span>
  const tone = c.churnPct >= 70 ? 'bg-danger' : c.churnPct >= 45 ? 'bg-amber' : 'bg-success'
  const text = c.churnPct >= 70 ? 'text-danger' : c.churnPct >= 45 ? 'text-amber-dark' : 'text-success'
  return (
    <div className="flex items-center justify-end gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-canvas">
        <div className={clsx('h-full rounded-full', tone)} style={{ width: `${c.churnPct}%` }} />
      </div>
      <span className={clsx('w-9 text-right text-xs font-bold tabular-nums', text)}>{c.churnPct}%</span>
    </div>
  )
}

function StatusPill({ c, sent, hasRun }: { c: ScoredCustomer; sent: boolean; hasRun: boolean }) {
  if (sent) return <span className="pill pill-sent">Win-back Sent</span>
  if (!hasRun) return <span className="pill bg-canvas text-muted">Unscored</span>
  if (c.risk === 'high') return <span className="pill pill-high">High Risk</span>
  if (c.risk === 'medium') return <span className="pill pill-medium">Medium Risk</span>
  return <span className="pill pill-active">Active</span>
}

export default function CustomerTable({
  customers, sent, hasRun, onWinBack,
}: {
  customers: ScoredCustomer[]
  sent: Record<string, number>
  hasRun: boolean
  onWinBack: (c: ScoredCustomer) => void
}) {
  if (!customers.length) {
    return (
      <div className="card p-12 text-center text-sm text-muted">
        No customers match. Go to Settings → Your Account → Generate Sample Customers.
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-canvas/70 text-2xs uppercase tracking-wider text-muted">
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 text-center font-semibold">Payments</th>
              <th className="px-4 py-3 text-right font-semibold">Last Paid</th>
              <th className="px-4 py-3 font-semibold">Last Visited</th>
              <th className="px-4 py-3 text-right font-semibold">Churn Risk</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => {
              const isSent = !!sent[c.id]
              const actionable = hasRun && c.risk !== 'active' && !isSent
              return (
                <tr key={c.id} className="border-b border-line/60 transition-colors last:border-0 hover:bg-canvas/50">
                  {/* Customer */}
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <span className={clsx('flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-2xs font-bold', avatarTone(c.name))}>
                        {initials(c.name)}
                      </span>
                      <div className="leading-tight">
                        <div className="font-medium text-navy">{maskName(c.name)}</div>
                        <div className="text-2xs text-muted">{maskPhone(c.phone)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-center tabular-nums text-slate">{c.transactionCount}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium text-navy">₹{c.lastTransactionAmount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-2.5 text-slate">{lastVisitedLabel(c.recencyDays)}</td>
                  <td className="px-4 py-2.5"><ChurnCell c={c} hasRun={hasRun} /></td>
                  <td className="px-4 py-2.5"><StatusPill c={c} sent={isSent} hasRun={hasRun} /></td>
                  <td className="px-4 py-2.5 text-right">
                    {isSent ? (
                      <span className="inline-flex items-center gap-1 text-2xs font-medium text-brand-dark">
                        <Check size={13} /> Sent
                      </span>
                    ) : (
                      <button onClick={() => onWinBack(c)} disabled={!actionable}
                        className={clsx('btn btn-sm', actionable ? 'btn-amber' : 'btn-outline opacity-40')}>
                        <Send size={13} /> Win-Back
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
