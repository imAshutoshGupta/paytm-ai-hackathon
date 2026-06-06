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
  const { hasRun, lastRun, running, runEngine, metrics } = useChurn()
  const toast = useToast()

  async function run() {
    const flagged = await runEngine()
    toast.show(`Engine complete — ${flagged} customers need attention`)
  }

  return (
    <div className="card flex flex-col gap-3 border-l-2 border-l-brand p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand-dark">
          <Cpu size={18} />
        </span>
        <div>
          <div className="flex items-center gap-2 font-semibold text-navy">
            AI Engine
            <span className="inline-flex items-center gap-1 rounded-full bg-canvas px-2 py-0.5 text-2xs font-medium text-muted">
              <Sparkles size={11} className="text-brand" /> Sarvam AI × Paytm Inference
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted">
            {hasRun && lastRun
              ? `Last run ${timeAgo(lastRun)} · ${metrics.atRisk} customers flagged at risk`
              : 'Not run yet — analyse customer payment patterns to find who is slipping away'}
          </p>
        </div>
      </div>
      <button onClick={run} disabled={running} className="btn btn-md btn-blue flex-shrink-0">
        {running ? <><Loader2 size={16} className="animate-spin" /> Scoring…</> : <><Cpu size={16} /> Run AI Engine</>}
      </button>
    </div>
  )
}
