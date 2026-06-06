'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { useApp } from './AppContext'
import { scoreCustomers, riskFromPct, ScoredCustomer, CustomerInput } from '@/lib/churn'

type EngineType = 'ai' | 'heuristic'
interface Verdict { churnPct: number; reason: string }
export interface EngineInfo { model: string; provider: string; analysed: number; durationMs: number }

interface ChurnContextValue {
  loading: boolean
  hasRun: boolean
  lastRun: number | null
  running: boolean
  engine: EngineType | null
  engineInfo: EngineInfo | null
  scored: ScoredCustomer[]
  sent: Record<string, number>
  metrics: {
    totalCustomers: number
    atRisk: number
    avgRecency: number
    sentCount: number
  }
  runEngine: () => Promise<number>
  markSent: (id: string) => void
  refresh: () => void
}

const ChurnContext = createContext<ChurnContextValue | null>(null)

export function ChurnProvider({ children }: { children: React.ReactNode }) {
  const { merchant } = useApp()
  const [customers, setCustomers] = useState<CustomerInput[]>([])
  const [loading, setLoading] = useState(false)
  const [running, setRunning] = useState(false)
  const [hasRun, setHasRun] = useState(false)
  const [lastRun, setLastRun] = useState<number | null>(null)
  const [engine, setEngine] = useState<EngineType | null>(null)
  const [engineInfo, setEngineInfo] = useState<EngineInfo | null>(null)
  const [verdicts, setVerdicts] = useState<Record<string, Verdict>>({})
  const [sent, setSent] = useState<Record<string, number>>({})

  const scoresKey = merchant ? `cg_scores_${merchant.id}` : ''
  const sentKey = merchant ? `cg_sent_${merchant.id}` : ''

  const refresh = useCallback(async () => {
    if (!merchant) return
    setLoading(true)
    try {
      const res = await fetch(`/api/customers?merchantId=${merchant.id}`)
      const data = await res.json()
      setCustomers(data.customers || [])
    } catch {
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }, [merchant])

  useEffect(() => {
    if (!merchant) {
      setCustomers([]); setHasRun(false); setLastRun(null); setVerdicts({}); setEngine(null); setEngineInfo(null); setSent({})
      return
    }
    refresh()
    try {
      const raw = localStorage.getItem(scoresKey)
      if (raw) {
        const saved = JSON.parse(raw) as { lastRun: number; engine: EngineType; engineInfo: EngineInfo | null; verdicts: Record<string, Verdict> }
        setVerdicts(saved.verdicts || {})
        setEngine(saved.engine || null)
        setEngineInfo(saved.engineInfo || null)
        setLastRun(saved.lastRun || null)
        setHasRun(true)
      } else {
        setVerdicts({}); setEngine(null); setEngineInfo(null); setLastRun(null); setHasRun(false)
      }
      const s = localStorage.getItem(sentKey)
      setSent(s ? JSON.parse(s) : {})
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchant])

  // Local feature computation + heuristic fallback score.
  const base = useMemo(() => scoreCustomers(customers), [customers])

  // Merge AI verdicts (when present) onto the locally-computed features.
  const scored = useMemo(() => {
    const merged = base.map((b) => {
      const v = verdicts[b.id]
      if (!v) return b
      return { ...b, churnPct: v.churnPct, risk: riskFromPct(v.churnPct), reason: v.reason }
    })
    return merged.sort((a, b) => b.churnPct - a.churnPct)
  }, [base, verdicts])

  const runEngine = useCallback(async () => {
    if (!merchant) return 0
    setRunning(true)
    const nextVerdicts: Record<string, Verdict> = {}
    let eng: EngineType = 'heuristic'
    let info: EngineInfo | null = null
    const startedAt = Date.now()
    try {
      const res = await fetch('/api/churn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId: merchant.id }),
      })
      const data = await res.json()
      if (data.engine === 'ai' && Array.isArray(data.verdicts) && data.verdicts.length) {
        eng = 'ai'
        for (const v of data.verdicts) nextVerdicts[v.id] = { churnPct: v.churnPct, reason: v.reason }
        info = {
          model: data.model || 'llama-3.3-70b-versatile',
          provider: data.provider || 'Paytm Inference',
          analysed: data.analysed || data.verdicts.length,
          durationMs: Date.now() - startedAt,
        }
      }
    } catch {
      // network failed — fall back to the heuristic below
    }

    // Fill any customer the AI didn't score (or all of them, if AI was unavailable)
    // with the deterministic heuristic so every row always has a score.
    for (const b of base) {
      if (!nextVerdicts[b.id]) nextVerdicts[b.id] = { churnPct: b.churnPct, reason: '' }
    }

    const now = Date.now()
    setVerdicts(nextVerdicts)
    setEngine(eng)
    setEngineInfo(info)
    setLastRun(now)
    setHasRun(true)
    try { localStorage.setItem(scoresKey, JSON.stringify({ lastRun: now, engine: eng, engineInfo: info, verdicts: nextVerdicts })) } catch {}
    setRunning(false)

    return Object.values(nextVerdicts).filter((v) => riskFromPct(v.churnPct) !== 'active').length
  }, [merchant, base, scoresKey])

  const markSent = useCallback((id: string) => {
    setSent((prev) => {
      const next = { ...prev, [id]: Date.now() }
      try { localStorage.setItem(sentKey, JSON.stringify(next)) } catch {}
      return next
    })
  }, [sentKey])

  const atRisk = hasRun ? scored.filter((c) => c.risk !== 'active').length : 0
  const avgRecency = customers.length
    ? Math.round(base.reduce((s, c) => s + c.recencyDays, 0) / base.length)
    : 0

  const value: ChurnContextValue = {
    loading,
    hasRun,
    lastRun,
    running,
    engine,
    engineInfo,
    scored,
    sent,
    metrics: {
      totalCustomers: customers.length,
      atRisk,
      avgRecency,
      sentCount: Object.keys(sent).length,
    },
    runEngine,
    markSent,
    refresh,
  }

  return <ChurnContext.Provider value={value}>{children}</ChurnContext.Provider>
}

export function useChurn() {
  const ctx = useContext(ChurnContext)
  if (!ctx) throw new Error('useChurn must be used within ChurnProvider')
  return ctx
}
