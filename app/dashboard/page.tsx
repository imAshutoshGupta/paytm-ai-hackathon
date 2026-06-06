'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useApp } from '@/context/AppContext'
import { t, formatAmount, formatDate, getBusinessLabel } from '@/lib/i18n'
import SummaryCard from '@/components/SummaryCard'
import {
  IndianRupee, AlertCircle, FileText, Package,
  Plus, Camera, MessageCircle, Sparkles, ArrowRight,
} from 'lucide-react'

interface DashboardData {
  todayIncome: number
  totalDues: number
  pendingBillsAmount: number
  lowStockCount: number
  recentActivity: { type: string; description: string; amount: number; date: string }[]
  briefing: string
}

export default function DashboardPage() {
  const { user, language } = useApp()
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [briefingLoading, setBriefingLoading] = useState(false)

  const loadDashboard = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [udhaarRes, billsRes, invRes, txRes] = await Promise.all([
        fetch(`/api/udhaar?userId=${user.id}`),
        fetch(`/api/bills?userId=${user.id}`),
        fetch(`/api/inventory?userId=${user.id}`),
        fetch(`/api/admin?action=overview`),
      ])

      const [udhaarData, billsData, invData] = await Promise.all([
        udhaarRes.json(),
        billsRes.json(),
        invRes.json(),
      ])

      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)

      const totalDues = (udhaarData.entries || [])
        .filter((u: { status: string }) => u.status !== 'paid')
        .reduce((s: number, u: { amount: number; amountPaid: number }) => s + (u.amount - u.amountPaid), 0)

      const pendingBillsAmount = (billsData.bills || [])
        .filter((b: { status: string }) => b.status === 'unpaid')
        .reduce((s: number, b: { totalAmount: number }) => s + b.totalAmount, 0)

      const lowStockCount = (invData.items || []).filter(
        (i: { quantity: number; reorderThreshold: number }) => i.quantity <= i.reorderThreshold,
      ).length

      const recentActivity = [
        ...(udhaarData.entries || []).slice(0, 3).map((u: { customerName: string; amount: number; amountPaid: number; createdAt: string }) => ({
          type: 'udhaar',
          description: `${u.customerName} — due ₹${u.amount - u.amountPaid}`,
          amount: u.amount - u.amountPaid,
          date: u.createdAt,
        })),
        ...(billsData.bills || []).slice(0, 2).map((b: { vendorName: string; totalAmount: number; createdAt: string }) => ({
          type: 'bill',
          description: `Bill: ${b.vendorName}`,
          amount: b.totalAmount,
          date: b.createdAt,
        })),
      ].slice(0, 5)

      setData({ todayIncome: 0, totalDues, pendingBillsAmount, lowStockCount, recentActivity, briefing: '' })
    } finally {
      setLoading(false)
    }
  }, [user])

  async function loadBriefing() {
    if (!user) return
    setBriefingLoading(true)
    try {
      const res = await fetch(`/api/briefing?userId=${user.id}&language=${language}`)
      const d = await res.json()
      setData((prev) => prev ? { ...prev, briefing: d.briefing || '' } : prev)
    } finally {
      setBriefingLoading(false)
    }
  }

  useEffect(() => {
    if (!user) { router.push('/'); return }
    loadDashboard()
  }, [user, router, loadDashboard])

  function getGreeting() {
    const h = new Date().getHours()
    if (h < 12) return t('dash.greeting.morning', language)
    if (h < 17) return t('dash.greeting.afternoon', language)
    return t('dash.greeting.evening', language)
  }

  const quickActions = [
    { label: t('dash.addDue', language), href: '/udhaar', icon: Plus },
    { label: t('dash.scanBill', language), href: '/bills', icon: Camera },
    { label: t('dash.askHisaab', language), href: '/ask', icon: MessageCircle },
    { label: t('nav.stock', language), href: '/inventory', icon: Package },
  ]

  if (!user) return null

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      {/* Greeting */}
      <div className="animate-fade-in">
        <p className="text-sm text-muted">{getGreeting()},</p>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{user.name}!</h1>
        <p className="mt-0.5 text-xs text-subtle">{user.businessName}</p>
      </div>

      {/* Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-line-soft" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <SummaryCard title={t('dash.totalDues', language)} value={formatAmount(data?.totalDues || 0)}
            icon={IndianRupee} color="warning" delay={0} subtitle={getBusinessLabel('nav.dues', user.businessType, language)} />
          <SummaryCard title={t('dash.pendingBills', language)} value={formatAmount(data?.pendingBillsAmount || 0)}
            icon={FileText} color="accent" delay={100} />
          <SummaryCard title={t('dash.lowStock', language)} value={String(data?.lowStockCount || 0)}
            icon={Package} color={data?.lowStockCount ? 'danger' : 'success'} delay={200}
            subtitle={getBusinessLabel('inv.title', user.businessType, language)} />
          <SummaryCard title="Today's Date" value={formatDate(new Date())}
            icon={AlertCircle} color="neutral" delay={300} />
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <p className="mb-3 text-xs uppercase tracking-wider text-subtle">Quick Actions</p>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map(({ label, href, icon: Icon }) => (
            <Link key={href} href={href}
              className="card card-hover flex items-center gap-3 p-4">
              <Icon size={18} strokeWidth={1.75} className="text-muted" />
              <span className="text-sm font-medium text-ink">{label}</span>
              <ArrowRight size={14} className="ml-auto text-subtle" />
            </Link>
          ))}
        </div>
      </div>

      {/* AI Briefing */}
      <div className="card border-accent/30 bg-accent-soft p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-accent" />
            <span className="text-sm font-semibold text-ink">{t('dash.aiMorningBrief', language)}</span>
          </div>
          {!data?.briefing && (
            <button onClick={loadBriefing} disabled={briefingLoading}
              className="btn btn-sm btn-outline">
              {briefingLoading ? 'Generating...' : 'Generate'}
            </button>
          )}
        </div>
        {briefingLoading ? (
          <div className="space-y-2">
            <div className="h-3 w-full animate-pulse rounded bg-line-soft" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-line-soft" />
            <div className="h-3 w-3/4 animate-pulse rounded bg-line-soft" />
          </div>
        ) : data?.briefing ? (
          <p className="text-sm leading-relaxed text-muted">{data.briefing}</p>
        ) : (
          <p className="text-sm italic text-subtle">
            Tap "Generate" for your personalized AI business briefing
          </p>
        )}
      </div>

      {/* Recent Activity */}
      <div>
        <p className="mb-3 text-xs uppercase tracking-wider text-subtle">
          {t('dash.recentActivity', language)}
        </p>
        {!data?.recentActivity?.length ? (
          <p className="py-4 text-center text-sm text-subtle">{t('dash.noActivity', language)}</p>
        ) : (
          <div className="space-y-2">
            {data.recentActivity.map((item, i) => (
              <div key={i} className="card flex items-center justify-between p-3 opacity-0 animate-fade-up"
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'forwards' }}>
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full border border-line ${item.type === 'udhaar' ? 'text-warning' : 'text-muted'}`}>
                    {item.type === 'udhaar' ? <IndianRupee size={14} /> : <FileText size={14} />}
                  </div>
                  <span className="text-sm text-ink">{item.description}</span>
                </div>
                <span className="text-xs text-subtle">{formatDate(item.date)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
