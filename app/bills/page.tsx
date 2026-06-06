'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { t, formatAmount } from '@/lib/i18n'
import BillCard from '@/components/BillCard'
import { Upload, Search, Loader2, SendHorizontal } from 'lucide-react'

interface Bill {
  _id: string
  vendorName: string
  items: { name: string; quantity: number; unit: string; price: number }[]
  totalAmount: number
  status: 'paid' | 'unpaid'
  billDate: string
  createdAt: string
}

export default function BillsPage() {
  const { user, language } = useApp()
  const router = useRouter()
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [query, setQuery] = useState('')
  const [answer, setAnswer] = useState('')
  const [querying, setQuerying] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const res = await fetch(`/api/bills?userId=${user.id}`)
    const data = await res.json()
    setBills(data.bills || [])
    setLoading(false)
  }, [user])

  useEffect(() => { if (!user) { router.push('/'); return }; load() }, [user, router, load])

  async function handleFileUpload(file: File) {
    if (!user) return
    setScanning(true)
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(',')[1]
        await fetch('/api/bills/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, base64Image: base64 }),
        })
        load()
        setScanning(false)
      }
      reader.readAsDataURL(file)
    } catch {
      setScanning(false)
    }
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('image/')) handleFileUpload(file)
  }

  async function askQuery() {
    if (!user || !query.trim()) return
    setQuerying(true)
    const res = await fetch(`/api/bills?userId=${user.id}&query=${encodeURIComponent(query)}&language=${language}`)
    const data = await res.json()
    setAnswer(data.answer || 'No answer found')
    setQuerying(false)
  }

  async function markPaid(id: string) {
    await fetch('/api/bills', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'paid' }),
    })
    load()
  }

  const totalUnpaid = bills.filter((b) => b.status === 'unpaid').reduce((s, b) => s + b.totalAmount, 0)

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('bills.title', language)}</h1>
        <p className="text-sm text-muted">Unpaid: {formatAmount(totalUnpaid)}</p>
      </div>

      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
        className="card relative border-2 border-dashed border-line hover:border-accent/50 p-8 text-center cursor-pointer transition-colors">
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} />
        {scanning ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} strokeWidth={1.75} className="text-accent animate-spin" />
            <p className="text-accent text-sm">{t('bills.scanning', language)}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload size={28} strokeWidth={1.75} className="text-subtle" />
            <p className="text-subtle text-sm">{t('bills.dropHere', language)}</p>
            <span className="text-xs text-accent">JPG, PNG, WEBP supported</span>
          </div>
        )}
      </div>

      {/* NL Query */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} strokeWidth={1.75} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && askQuery()}
              placeholder={t('bills.askQuery', language)}
              className="pl-8" />
          </div>
          <button onClick={askQuery} disabled={querying || !query.trim()} className="btn btn-md btn-primary">
            {querying ? <Loader2 size={16} strokeWidth={1.75} className="animate-spin" /> : <SendHorizontal size={16} strokeWidth={1.75} />}
          </button>
        </div>
        {answer && (
          <div className="rounded-lg border border-line bg-line-soft p-3 text-sm text-ink">
            <p>{answer}</p>
          </div>
        )}
      </div>

      {/* Bills List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 rounded-xl bg-line-soft animate-pulse" />)}
        </div>
      ) : !bills.length ? (
        <div className="text-center py-12 text-subtle">
          <Upload size={32} strokeWidth={1.75} className="mx-auto mb-3 text-subtle" />
          <p>{t('common.noData', language)}</p>
          <p className="text-xs mt-1">Upload a bill photo to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bills.map((bill) => (
            <BillCard key={bill._id} {...bill} onMarkPaid={markPaid} />
          ))}
        </div>
      )}
    </div>
  )
}
