'use client'

import { useState, useEffect, useCallback } from 'react'
import { useApp } from '@/context/AppContext'
import { t, formatAmount, formatDate } from '@/lib/i18n'
import {
  Database, Trash2, RefreshCw, CheckCircle, XCircle,
  Users, Activity, Loader2, ChevronDown, ChevronUp,
} from 'lucide-react'
import clsx from 'clsx'

interface MerchantRow {
  id: string; name: string; phone: string; businessName: string
  businessType: string; totalDues: number; totalBills: number
  transactionCount: number; createdAt: string
}

interface APIHealth { mongodb: boolean; paytm: boolean; sarvam: boolean }

export default function AdminPage() {
  const { language } = useApp()
  const [merchants, setMerchants] = useState<MerchantRow[]>([])
  const [health, setHealth] = useState<APIHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [activeTab, setActiveTab] = useState<'merchants' | 'demo'>('merchants')
  const [sortField, setSortField] = useState<keyof MerchantRow>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [search, setSearch] = useState('')
  const [seedResult, setSeedResult] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const [ov, hc] = await Promise.all([
      fetch('/api/admin?action=overview').then((r) => r.json()),
      fetch('/api/admin?action=health').then((r) => r.json()),
    ])
    setMerchants(ov.users || [])
    setHealth(hc)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function seedData() {
    setSeeding(true); setSeedResult('')
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'seed' }),
    })
    const data = await res.json()
    setSeeding(false)
    setSeedResult(res.ok ? `Seeded: ${Object.keys(data.results || {}).join(', ')}` : data.error)
    load()
  }

  async function clearData() {
    if (!confirm('Clear ALL data? This cannot be undone.')) return
    setClearing(true)
    await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clear' }),
    })
    setClearing(false)
    load()
  }

  function toggleSort(field: keyof MerchantRow) {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }

  const filtered = merchants
    .filter((m) =>
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.businessName.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search),
    )
    .sort((a, b) => {
      const av = a[sortField]; const bv = b[sortField]
      const cmp = typeof av === 'number' && typeof bv === 'number'
        ? av - bv : String(av).localeCompare(String(bv))
      return sortDir === 'asc' ? cmp : -cmp
    })

  const SortIcon = ({ field }: { field: keyof MerchantRow }) =>
    sortField === field ? (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('admin.title', language)}</h1>
        <button onClick={load} className="rounded-md p-2 text-subtle hover:bg-line-soft hover:text-ink transition-colors">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* API Health */}
      {health && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: 'mongodb', label: 'MongoDB', ok: health.mongodb },
            { key: 'paytm', label: 'Paytm AI', ok: health.paytm },
            { key: 'sarvam', label: 'Sarvam', ok: health.sarvam },
          ].map(({ key, label, ok }) => (
            <div key={key} className={clsx(
              'card flex items-center gap-2 p-3',
              ok ? 'border-success/30 bg-success-soft' : 'border-danger/30 bg-danger-soft',
            )}>
              {ok
                ? <CheckCircle size={16} className="text-success" />
                : <XCircle size={16} className="text-danger" />}
              <span className="text-sm text-ink">{label}</span>
              <span className={clsx('ml-auto text-xs', ok ? 'text-success' : 'text-danger')}>
                {ok ? '✓ OK' : '✗ OFF'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setActiveTab('merchants')}
          className={clsx('flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors',
            activeTab === 'merchants' ? 'bg-ink text-white' : 'border border-line bg-surface text-muted hover:text-ink')}>
          <Users size={14} />
          {t('admin.merchants', language)}
        </button>
        <button onClick={() => setActiveTab('demo')}
          className={clsx('flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors',
            activeTab === 'demo' ? 'bg-ink text-white' : 'border border-line bg-surface text-muted hover:text-ink')}>
          <Activity size={14} />
          {t('admin.demoControl', language)}
        </button>
      </div>

      {/* Merchants Tab */}
      {activeTab === 'merchants' && (
        <div className="space-y-3">
          <input className="input" type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, business, phone..." />

          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-line-soft animate-pulse" />)}
            </div>
          ) : !filtered.length ? (
            <p className="text-center py-8 text-subtle">{t('common.noData', language)}</p>
          ) : (
            <div className="card overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line">
                    {[
                      { label: 'Name', field: 'name' as keyof MerchantRow },
                      { label: 'Business', field: 'businessName' as keyof MerchantRow },
                      { label: 'Type', field: 'businessType' as keyof MerchantRow },
                      { label: 'Dues', field: 'totalDues' as keyof MerchantRow },
                      { label: 'Bills', field: 'totalBills' as keyof MerchantRow },
                      { label: 'Txns', field: 'transactionCount' as keyof MerchantRow },
                    ].map(({ label, field }) => (
                      <th key={field} onClick={() => toggleSort(field)}
                        className="px-4 py-3 text-left text-xs text-subtle cursor-pointer hover:text-ink transition-colors">
                        <span className="flex items-center gap-1">{label} <SortIcon field={field} /></span>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-left text-xs text-subtle">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr key={m.id} className="border-b border-line hover:bg-line-soft transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink text-sm">{m.name}</p>
                        <p className="text-xs text-subtle">{m.phone}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">{m.businessName}</td>
                      <td className="px-4 py-3">
                        <span className="chip chip-accent">
                          {m.businessType}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-warning text-sm">{formatAmount(m.totalDues)}</td>
                      <td className="px-4 py-3 text-sm text-muted">{formatAmount(m.totalBills)}</td>
                      <td className="px-4 py-3 text-sm text-muted">{m.transactionCount}</td>
                      <td className="px-4 py-3 text-xs text-subtle">{formatDate(m.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Demo Control Tab */}
      {activeTab === 'demo' && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="card p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Database size={18} className="text-accent" />
                <h3 className="font-semibold tracking-tight text-ink">{t('admin.seedData', language)}</h3>
              </div>
              <p className="text-sm text-muted">
                Loads realistic demo data for all 3 business types (Kirana, Tuition, Tailor).
                Creates users 9999999001, 9999999002, 9999999003.
              </p>
              {seedResult && (
                <p className="text-xs rounded-lg bg-success-soft text-success px-3 py-2">{seedResult}</p>
              )}
              <button onClick={seedData} disabled={seeding}
                className="btn btn-md btn-primary w-full">
                {seeding ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
                {seeding ? 'Seeding...' : t('admin.seedData', language)}
              </button>
            </div>

            <div className="card p-5 space-y-3 border-danger/20">
              <div className="flex items-center gap-2">
                <Trash2 size={18} className="text-danger" />
                <h3 className="font-semibold tracking-tight text-ink">{t('admin.clearData', language)}</h3>
              </div>
              <p className="text-sm text-muted">
                Removes ALL users, dues, bills, inventory and transactions from the database.
                Use only for demo reset.
              </p>
              <button onClick={clearData} disabled={clearing}
                className="btn btn-md btn-danger w-full">
                {clearing ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                {clearing ? 'Clearing...' : t('admin.clearData', language)}
              </button>
            </div>
          </div>

          {/* Demo login shortcuts */}
          <div className="card p-5 space-y-3">
            <h3 className="font-semibold tracking-tight text-ink">Demo Login Credentials</h3>
            <p className="text-sm text-muted mb-3">Use OTP: <span className="text-accent font-semibold">1234</span></p>
            <div className="grid gap-2">
              {[
                { phone: '9999999001', name: 'Ramesh Gupta', type: 'Kirana' },
                { phone: '9999999002', name: 'Sunita Patil', type: 'Tuition' },
                { phone: '9999999003', name: 'Abdul Rashid', type: 'Tailor' },
              ].map((u) => (
                <div key={u.phone} className="flex items-center justify-between p-3 rounded-lg border border-line bg-surface">
                  <div>
                    <p className="text-sm text-ink">{u.name}</p>
                    <p className="text-xs text-subtle">{u.phone} · {u.type}</p>
                  </div>
                  <span className="chip chip-accent">OTP: 1234</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
