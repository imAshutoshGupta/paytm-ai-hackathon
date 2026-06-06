'use client'

import { useChurn } from '@/context/ChurnContext'
import { useToast } from '@/components/Toast'
import { Cpu, Loader2, Sparkles } from 'lucide-react'

function timeAgo(ts: number): string {
  const mins = Math.round((Date.now() - ts) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  return `${Math.round(hrs / 24)} days ago`
}

export default function ChurnEngineBanner() {
  const { hasRun, lastRun, running, runEngine, metrics, engine, engineInfo } = useChurn()
  const toast = useToast()

  async function run() {
    const flagged = await runEngine()
    toast.show(`AI analysed ${metrics.totalCustomers} customers — ${flagged} need attention`)
  }

  const aiBadge = engine !== 'heuristic'

  return (
    <div className="card flex flex-col gap-3 border-l-2 border-l-brand p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand-dark">
          {running ? <Loader2 size={18} className="animate-spin" /> : <Cpu size={18} />}
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-2 font-semibold text-navy">
            AI Churn Engine
            <span className="inline-flex items-center gap-1 rounded-full bg-canvas px-2 py-0.5 text-2xs font-medium text-muted">
              <Sparkles size={11} className="text-brand" />
              {aiBadge ? 'Powered by Paytm Inference' : 'Heuristic scoring'}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted">
            {running
              ? `Sending ${metrics.totalCustomers} customers to the LLM for scoring…`
              : hasRun && lastRun
              ? engineInfo
                ? <>Scored <span className="font-medium text-slate">{engineInfo.analysed}</span> customers via <span className="font-medium text-slate">{engineInfo.model}</span> in {(engineInfo.durationMs / 1000).toFixed(1)}s · {timeAgo(lastRun)}</>
                : `Last run ${timeAgo(lastRun)} · ${metrics.atRisk} flagged at risk`
              : 'Not run yet — the AI reads each customer’s visit pattern to predict who is slipping away'}
          </p>
        </div>
      </div>
      <button onClick={run} disabled={running} className="btn btn-md btn-blue flex-shrink-0">
        {running ? <><Loader2 size={16} className="animate-spin" /> Analysing…</> : <><Cpu size={16} /> Run AI Engine</>}
      </button>
    </div>
  )
}
