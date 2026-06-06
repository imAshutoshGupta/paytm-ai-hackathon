'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { useChurn } from '@/context/ChurnContext'
import { useToast } from '@/components/Toast'
import { APP_NAME } from '@/lib/brand'
import {
  Database, Cpu, Mic2, CheckCircle2, XCircle, RefreshCw, Trash2, Loader2, Users,
} from 'lucide-react'
import clsx from 'clsx'

interface Health { mongodb: boolean; paytm: boolean; sarvam: boolean; mockMode: boolean }

export default function SettingsPage() {
  const { merchant, hydrated } = useApp()
  const { refresh } = useChurn()
  const toast = useToast()
  const router = useRouter()
  const [health, setHealth] = useState<Health | null>(null)
  const [seeding, setSeeding] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [populating, setPopulating] = useState(false)

  useEffect(() => {
    if (hydrated && !merchant) router.replace('/')
  }, [hydrated, merchant, router])

  const loadHealth = useCallback(async () => {
    const h = await fetch('/api/admin?action=health').then((r) => r.json())
    setHealth(h)
  }, [])

  useEffect(() => { loadHealth() }, [loadHealth])

  async function seed() {
    setSeeding(true)
    await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'seed' }) })
    setSeeding(false)
    await refresh()
    toast.show('Demo data seeded')
  }

  async function clear() {
    setClearing(true)
    await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'clear' }) })
    setClearing(false)
    await refresh()
    toast.show('All data cleared')
  }

  async function populate() {
    if (!merchant) return
    setPopulating(true)
    const res = await fetch('/api/admin', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'populate', merchantId: merchant.id }),
    })
    const data = await res.json()
    setPopulating(false)
    await refresh()
    toast.show(`Added ${data.count ?? 0} sample customers`)
  }

  if (!merchant) return null

  const services = [
    { key: 'mongodb', label: 'MongoDB', icon: Database, live: health?.mongodb, note: 'Customer & merchant data' },
    { key: 'paytm', label: 'Paytm Inference', icon: Cpu, live: health?.paytm, note: 'AI win-back messages' },
    { key: 'sarvam', label: 'Sarvam AI', icon: Mic2, live: health?.sarvam, note: 'Voice-note generation' },
  ]

  return (
    <div className="space-y-5 py-2">
      <div>
        <h1 className="text-xl font-bold text-navy">Settings</h1>
        <p className="text-sm text-muted">{APP_NAME} configuration & demo controls</p>
      </div>

      {/* API health */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-navy">Service Health</h2>
          <button onClick={loadHealth} className="btn btn-sm btn-ghost"><RefreshCw size={13} /> Refresh</button>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {services.map((s) => (
            <div key={s.key} className="card flex items-center gap-3 p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-canvas text-navy"><s.icon size={17} /></span>
              <div className="flex-1">
                <div className="text-sm font-semibold text-navy">{s.label}</div>
                <div className="text-2xs text-muted">{s.note}</div>
              </div>
              {health == null ? <Loader2 size={16} className="animate-spin text-muted" />
                : s.live ? <CheckCircle2 size={18} className="text-success" />
                : <XCircle size={18} className="text-muted" />}
            </div>
          ))}
        </div>
        {health?.mockMode && (
          <p className="mt-2 text-2xs text-muted">
            Running in demo mode — data served from in-memory store. Set MONGODB_URI in .env.local for persistence.
          </p>
        )}
      </div>

      {/* Your account — populate the logged-in merchant */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-navy">Your Account</h2>
        <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-navy">{merchant.businessName || merchant.name}</div>
            <div className="text-2xs text-muted">
              {merchant.phone} · No Paytm transaction history yet? Generate sample customers to try the engine.
            </div>
          </div>
          <button onClick={populate} disabled={populating} className="btn btn-md btn-blue flex-shrink-0">
            {populating ? <Loader2 size={16} className="animate-spin" /> : <Users size={16} />} Generate Sample Customers
          </button>
        </div>
      </div>

      {/* Demo controls */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-navy">Demo Data</h2>
        <div className="card flex flex-col gap-3 p-4 sm:flex-row">
          <button onClick={seed} disabled={seeding} className="btn btn-md btn-blue flex-1">
            {seeding ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />} Seed Demo Data
          </button>
          <button onClick={clear} disabled={clearing}
            className={clsx('btn btn-md flex-1 border', 'btn-outline text-danger')}>
            {clearing ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Clear All Data
          </button>
        </div>
        <p className="mt-2 text-2xs text-muted">Before demoing: Clear → Seed for a clean, predictable state.</p>
      </div>

      {/* Demo credentials */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-navy">Demo Logins</h2>
        <div className="card divide-y divide-line">
          {[
            { phone: '9999999001', name: 'Ramesh Sharma', biz: 'Sharma Kirana Store' },
            { phone: '9999999002', name: 'Farah Khan', biz: 'Glow Unisex Salon' },
          ].map((m) => (
            <div key={m.phone} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <div className="font-medium text-navy">{m.name}</div>
                <div className="text-2xs text-muted">{m.biz}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-navy">{m.phone}</div>
                <div className="text-2xs text-muted">OTP 1234</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
