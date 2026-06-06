'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useApp } from './AppContext'
import { scoreCustomers, ScoredCustomer, CustomerInput } from '@/lib/churn'

interface ChurnContextValue {
  loading: boolean
  hasRun: boolean
  lastRun: number | null
  running: boolean
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
  const [sent, setSent] = useState<Record<string, number>>({})

  const runKey = merchant ? `cg_run_${merchant.id}` : ''
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
    if (!merchant) { setCustomers([]); setHasRun(false); setLastRun(null); setSent({}); return }
    refresh()
    try {
      const r = localStorage.getItem(runKey)
      if (r) { setLastRun(Number(r)); setHasRun(true) } else { setLastRun(null); setHasRun(false) }
      const s = localStorage.getItem(sentKey)
      setSent(s ? JSON.parse(s) : {})
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchant])

  const scored = scoreCustomers(customers)

  const runEngine = useCallback(async () => {
    setRunning(true)
    // brief delay so the "AI scoring" step is visible in the demo
    await new Promise((r) => setTimeout(r, 900))
    const now = Date.now()
    setLastRun(now)
    setHasRun(true)
    try { localStorage.setItem(runKey, String(now)) } catch {}
    setRunning(false)
    return scored.filter((c) => c.risk !== 'active').length
  }, [runKey, scored])

  const markSent = useCallback((id: string) => {
    setSent((prev) => {
      const next = { ...prev, [id]: Date.now() }
      try { localStorage.setItem(sentKey, JSON.stringify(next)) } catch {}
      return next
    })
  }, [sentKey])

  const atRisk = hasRun ? scored.filter((c) => c.risk !== 'active').length : 0
  const avgRecency = customers.length
    ? Math.round(scored.reduce((s, c) => s + c.recencyDays, 0) / scored.length)
    : 0

  const value: ChurnContextValue = {
    loading,
    hasRun,
    lastRun,
    running,
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
