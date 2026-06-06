'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { t, formatAmount, getBusinessLabel } from '@/lib/i18n'
import UdhaarList from '@/components/UdhaarList'
import MicButton from '@/components/MicButton'
import { Plus, Search, X, Copy, Check } from 'lucide-react'
import clsx from 'clsx'

interface UdhaarEntry {
  _id: string
  customerName: string
  amount: number
  amountPaid: number
  note: string
  status: 'pending' | 'partial' | 'paid'
  createdAt: string
}

export default function UdhaarPage() {
  const { user, language } = useApp()
  const router = useRouter()
  const [entries, setEntries] = useState<UdhaarEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'partial' | 'paid'>('all')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ customerName: '', amount: '', note: '' })
  const [saving, setSaving] = useState(false)
  const [reminderModal, setReminderModal] = useState<{ msg: string; name: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [voiceProcessing, setVoiceProcessing] = useState(false)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const res = await fetch(`/api/udhaar?userId=${user.id}&search=${encodeURIComponent(search)}`)
    const data = await res.json()
    setEntries(data.entries || [])
    setLoading(false)
  }, [user, search])

  useEffect(() => { if (!user) { router.push('/'); return }; load() }, [user, router, load])

  const filtered = entries.filter((e) => filter === 'all' || e.status === filter)
  const totalDue = filtered
    .filter((e) => e.status !== 'paid')
    .reduce((s, e) => s + (e.amount - e.amountPaid), 0)

  async function addEntry() {
    if (!user || !form.customerName || !form.amount) return
    setSaving(true)
    await fetch('/api/udhaar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, ...form, amount: Number(form.amount) }),
    })
    setSaving(false)
    setForm({ customerName: '', amount: '', note: '' })
    setShowAdd(false)
    load()
  }

  async function markPaid(id: string) {
    await fetch('/api/udhaar', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'mark-paid' }),
    })
    load()
  }

  async function generateReminder(id: string, name: string, amount: number) {
    if (!user) return
    const days = Math.floor(
      (Date.now() - new Date(entries.find((e) => e._id === id)?.createdAt || '').getTime()) / 86400000,
    )
    const res = await fetch('/api/reminder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, customerName: name, amount, daysOverdue: days, language }),
    })
    const data = await res.json()
    setReminderModal({ msg: data.message, name })
  }

  async function handleVoiceTranscript(text: string) {
    if (!user) return
    setTranscript(text)
    setVoiceProcessing(true)
    const res = await fetch('/api/udhaar/voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, transcript: text }),
    })
    const data = await res.json()
    setVoiceProcessing(false)
    if (res.ok && data.entry) {
      setTranscript('')
      load()
    } else {
      setForm({ customerName: data.extracted?.name || '', amount: data.extracted?.amount?.toString() || '', note: text })
      setShowAdd(true)
      setTranscript('')
    }
  }

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {getBusinessLabel('udhaar.title', user.businessType, language)}
          </h1>
          <p className="text-sm text-muted">{t('udhaar.totalDue', language)}: {formatAmount(totalDue)}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn btn-md btn-primary">
          <Plus size={16} strokeWidth={1.75} />
          {t('udhaar.addNew', language)}
        </button>
      </div>

      {/* Voice Input */}
      <div className="card flex items-center gap-4 p-4">
        <MicButton onTranscript={handleVoiceTranscript} language={language} />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted">{t('udhaar.voiceHint', language)}</p>
          {transcript && <p className="text-xs text-accent mt-1 truncate">"{transcript}"</p>}
          {voiceProcessing && <p className="text-xs text-subtle mt-1">{t('common.loading', language)}</p>}
        </div>
      </div>

      {/* Search + Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search size={14} strokeWidth={1.75} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={t('udhaar.search', language)}
            className="pl-8 pr-8" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-ink">
            <X size={14} strokeWidth={1.75} />
          </button>}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['all', 'pending', 'partial', 'paid'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={clsx('flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                filter === f ? 'bg-ink text-white' : 'border border-line bg-surface text-muted hover:text-ink')}>
              {f === 'all' ? t('common.all', language) : t(`udhaar.status.${f}`, language)}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-line-soft animate-pulse" />
          ))}
        </div>
      ) : (
        <UdhaarList entries={filtered} onMarkPaid={markPaid} onReminder={generateReminder} />
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center px-4 pb-4 md:pb-0 bg-ink/40 backdrop-blur-sm">
          <div className="card w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold tracking-tight text-ink">{t('udhaar.addNew', language)}</h3>
              <button onClick={() => setShowAdd(false)} className="text-subtle hover:text-ink">
                <X size={20} strokeWidth={1.75} />
              </button>
            </div>
            <div>
              <label className="label">
                {getBusinessLabel('udhaar.customerName', user.businessType, language)}
              </label>
              <input type="text" value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                placeholder="Ramesh Kumar" />
            </div>
            <div>
              <label className="label">{t('udhaar.amount', language)}</label>
              <input type="number" value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="500" />
            </div>
            <div>
              <label className="label">{t('udhaar.note', language)}</label>
              <input type="text" value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="Atta, dal..." />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowAdd(false)} className="btn btn-md btn-outline flex-1">
                {t('common.cancel', language)}
              </button>
              <button onClick={addEntry} disabled={saving} className="btn btn-md btn-primary flex-1">
                {saving ? t('common.loading', language) : t('common.save', language)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      {reminderModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center px-4 pb-4 md:pb-0 bg-ink/40 backdrop-blur-sm">
          <div className="card w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold tracking-tight text-ink">
                Reminder for {reminderModal.name}
              </h3>
              <button onClick={() => setReminderModal(null)} className="text-subtle hover:text-ink">
                <X size={20} strokeWidth={1.75} />
              </button>
            </div>
            <div className="rounded-lg border border-line bg-line-soft p-4 text-sm text-ink">
              <p className="leading-relaxed whitespace-pre-wrap">
                {reminderModal.msg}
              </p>
            </div>
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(reminderModal.msg)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
              className="btn btn-md btn-outline w-full">
              {copied ? <Check size={16} strokeWidth={1.75} /> : <Copy size={16} strokeWidth={1.75} />}
              {copied ? t('common.copied', language) : 'Copy to WhatsApp'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
