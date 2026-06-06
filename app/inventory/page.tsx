'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { t, getBusinessLabel } from '@/lib/i18n'
import InventoryItem from '@/components/InventoryItem'
import { Plus, Sparkles, X, AlertTriangle } from 'lucide-react'

interface Item {
  _id: string
  itemName: string
  quantity: number
  unit: string
  reorderThreshold: number
}

export default function InventoryPage() {
  const { user, language } = useApp()
  const router = useRouter()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [suggestion, setSuggestion] = useState('')
  const [suggestionLoading, setSuggestionLoading] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ itemName: '', quantity: '', unit: 'kg', reorderThreshold: '5' })
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState<'all' | 'low'>('all')

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const res = await fetch(`/api/inventory?userId=${user.id}`)
    const data = await res.json()
    setItems(data.items || [])
    setLoading(false)
  }, [user])

  useEffect(() => { if (!user) { router.push('/'); return }; load() }, [user, router, load])

  async function getAISuggestion() {
    if (!user) return
    setSuggestionLoading(true)
    const res = await fetch(`/api/inventory?userId=${user.id}&suggestion=true&language=${language}`)
    const data = await res.json()
    setSuggestion(data.suggestion || '')
    setSuggestionLoading(false)
  }

  async function addItem() {
    if (!user || !form.itemName) return
    setSaving(true)
    await fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        itemName: form.itemName,
        quantity: Number(form.quantity),
        unit: form.unit,
        reorderThreshold: Number(form.reorderThreshold),
      }),
    })
    setSaving(false)
    setForm({ itemName: '', quantity: '', unit: 'kg', reorderThreshold: '5' })
    setShowAdd(false)
    load()
  }

  async function updateQuantity(id: string, quantity: number) {
    await fetch('/api/inventory', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, quantity }),
    })
    load()
  }

  const lowItems = items.filter((i) => i.quantity <= i.reorderThreshold)
  const displayed = filter === 'low' ? lowItems : items

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {getBusinessLabel('inv.title', user.businessType, language)}
          </h1>
          {lowItems.length > 0 && (
            <p className="text-sm text-warning flex items-center gap-1 mt-0.5">
              <AlertTriangle size={12} strokeWidth={1.75} />
              {lowItems.length} {t('inv.lowStock', language)}
            </p>
          )}
        </div>
        <button onClick={() => setShowAdd(true)} className="btn btn-md btn-primary">
          <Plus size={16} strokeWidth={1.75} />
          {t('inv.addItem', language)}
        </button>
      </div>

      {/* AI Suggestion */}
      <div className="card bg-accent-soft p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles size={14} strokeWidth={1.75} className="text-accent" />
            <span className="text-sm font-semibold tracking-tight text-ink">{t('inv.aiSuggestion', language)}</span>
          </div>
          <button onClick={getAISuggestion} disabled={suggestionLoading} className="btn btn-sm btn-outline">
            {suggestionLoading ? 'Thinking...' : 'Get Insight'}
          </button>
        </div>
        {suggestion ? (
          <p className="text-sm text-muted leading-relaxed">{suggestion}</p>
        ) : (
          <p className="text-sm text-subtle italic">Click "Get Insight" for AI stock analysis</p>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <button onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === 'all' ? 'bg-ink text-white' : 'border border-line bg-surface text-muted'}`}>
          {t('common.all', language)} ({items.length})
        </button>
        <button onClick={() => setFilter('low')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${filter === 'low' ? 'bg-ink text-white' : 'border border-line bg-surface text-muted'}`}>
          <AlertTriangle size={11} strokeWidth={1.75} />
          {t('inv.lowStock', language)} ({lowItems.length})
        </button>
      </div>

      {/* Items */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-line-soft animate-pulse" />)}
        </div>
      ) : !displayed.length ? (
        <div className="text-center py-12 text-subtle">{t('common.noData', language)}</div>
      ) : (
        <div className="card divide-y divide-line">
          {displayed.map((item) => (
            <InventoryItem key={item._id} {...item} onUpdate={updateQuantity} />
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center px-4 pb-4 md:pb-0 bg-ink/40 backdrop-blur-sm">
          <div className="card w-full max-w-md p-6 space-y-4 rounded-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold tracking-tight text-ink">{t('inv.addItem', language)}</h3>
              <button onClick={() => setShowAdd(false)} className="text-subtle hover:text-ink">
                <X size={20} strokeWidth={1.75} />
              </button>
            </div>
            <div>
              <label className="label">{t('inv.itemName', language)}</label>
              <input type="text" value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} placeholder="Atta" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">{t('inv.quantity', language)}</label>
                <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="10" />
              </div>
              <div>
                <label className="label">{t('inv.unit', language)}</label>
                <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                  <option value="kg">kg</option>
                  <option value="pkt">pkt</option>
                  <option value="ltr">ltr</option>
                  <option value="pcs">pcs</option>
                  <option value="meter">meter</option>
                  <option value="spool">spool</option>
                  <option value="set">set</option>
                  <option value="box">box</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">{t('inv.threshold', language)}</label>
              <input type="number" value={form.reorderThreshold} onChange={(e) => setForm({ ...form, reorderThreshold: e.target.value })} placeholder="5" />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowAdd(false)} className="btn btn-md btn-outline flex-1">
                {t('common.cancel', language)}
              </button>
              <button onClick={addItem} disabled={saving} className="btn btn-md btn-primary flex-1">
                {saving ? t('common.loading', language) : t('common.save', language)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
