'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { useChurn } from '@/context/ChurnContext'
import { ScoredCustomer, maskName, maskPhone, lastVisitedLabel } from '@/lib/churn'
import ChurnEngineBanner from '@/components/ChurnEngineBanner'
import WinBackModal from '@/components/WinBackModal'
import { Send, Check, AlertTriangle, PartyPopper } from 'lucide-react'
import clsx from 'clsx'

export default function WinBackPage() {
  const { merchant, hydrated } = useApp()
  const { scored, sent, hasRun } = useChurn()
  const router = useRouter()
  const [modal, setModal] = useState<ScoredCustomer | null>(null)

  useEffect(() => {
    if (hydrated && !merchant) router.replace('/')
  }, [hydrated, merchant, router])

  if (!merchant) return null

  const queue = scored.filter((c) => hasRun && c.risk !== 'active' && !sent[c.id])

  return (
    <div className="space-y-5 py-2">
      <div>
        <h1 className="text-xl font-bold text-navy">Win-Back</h1>
        <p className="text-sm text-muted">AI-generated re-engagement messages for slipping customers</p>
      </div>

      <ChurnEngineBanner />

      {!hasRun ? (
        <div className="card p-10 text-center text-sm text-muted">
          Run the churn engine to see which customers need winning back.
        </div>
      ) : queue.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 p-10 text-center">
          <PartyPopper size={28} className="text-success" />
          <p className="text-sm font-medium text-navy">No customers at risk right now</p>
          <p className="text-xs text-muted">Everyone is active or already contacted.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {queue.map((c) => (
            <div key={c.id} className="card flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-navy">{maskName(c.name)}</div>
                  <div className="text-2xs text-muted">{maskPhone(c.phone)}</div>
                </div>
                <span className={clsx('pill', c.risk === 'high' ? 'pill-high' : 'pill-medium')}>
                  <AlertTriangle size={11} /> {c.churnPct}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted">
                <span>Last visit</span>
                <span className="font-medium text-slate">{lastVisitedLabel(c.recencyDays)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted">
                <span>Avg. spend</span>
                <span className="font-medium text-slate">₹{c.averageTransactionValue.toLocaleString('en-IN')}</span>
              </div>
              <button onClick={() => setModal(c)} className="btn btn-sm btn-amber mt-1">
                <Send size={13} /> Generate Win-Back
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Already contacted */}
      {hasRun && Object.keys(sent).length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-navy">Already contacted</h2>
          <div className="flex flex-wrap gap-2">
            {scored.filter((c) => sent[c.id]).map((c) => (
              <span key={c.id} className="inline-flex items-center gap-1.5 rounded-full bg-brand-tint px-3 py-1.5 text-xs font-medium text-brand-dark">
                <Check size={12} /> {maskName(c.name)}
              </span>
            ))}
          </div>
        </div>
      )}

      {modal && <WinBackModal customer={modal} onClose={() => setModal(null)} />}
    </div>
  )
}
