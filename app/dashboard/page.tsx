'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { useChurn } from '@/context/ChurnContext'
import MetricCard from '@/components/MetricCard'
import ChurnEngineBanner from '@/components/ChurnEngineBanner'
import CustomerExplorer from '@/components/CustomerExplorer'
import { Users, AlertTriangle, CalendarClock, Send } from 'lucide-react'

export default function DashboardPage() {
  const { merchant, hydrated } = useApp()
  const { metrics, hasRun, loading } = useChurn()
  const router = useRouter()

  useEffect(() => {
    if (hydrated && !merchant) router.replace('/')
  }, [hydrated, merchant, router])

  if (!merchant) return null

  return (
    <div className="space-y-5 py-2">
      <div>
        <h1 className="text-xl font-bold text-navy">Welcome back, {merchant.name.split(' ')[0]}</h1>
        <p className="text-sm text-muted">{merchant.businessName} · Customer retention overview</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Total Customers" value={loading ? '…' : metrics.totalCustomers}
          sub="Unique QR payers" icon={Users} tone="navy" />
        <MetricCard label="At Risk" value={hasRun ? metrics.atRisk : '—'}
          sub={hasRun ? 'Flagged by engine' : 'Run engine to score'} icon={AlertTriangle} tone="danger" />
        <MetricCard label="Avg. Days Since Visit" value={loading ? '…' : metrics.avgRecency}
          sub="Across all customers" icon={CalendarClock} tone="brand" />
        <MetricCard label="Win-Back Sent" value={metrics.sentCount}
          sub="This session" icon={Send} tone="success" />
      </div>

      {/* Engine */}
      <ChurnEngineBanner />

      {/* Table */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-navy">Customers</h2>
        <CustomerExplorer />
      </div>
    </div>
  )
}
