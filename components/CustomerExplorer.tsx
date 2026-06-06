'use client'

import { useState, useEffect, useMemo } from 'react'
import { useChurn } from '@/context/ChurnContext'
import { ScoredCustomer } from '@/lib/churn'
import CustomerTable from '@/components/CustomerTable'
import WinBackModal from '@/components/WinBackModal'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

type Chip = 'all' | 'risk' | 'active' | 'sent'
const chips: { key: Chip; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'risk', label: 'At Risk' },
  { key: 'active', label: 'Active' },
  { key: 'sent', label: 'Win-Back Sent' },
]
const PAGE_SIZES = [10, 25, 50]

export default function CustomerExplorer() {
  const { scored, sent, hasRun } = useChurn()
  const [search, setSearch] = useState('')
  const [chip, setChip] = useState<Chip>('all')
  const [modal, setModal] = useState<ScoredCustomer | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filtered = useMemo(() => scored.filter((c) => {
    if (search) {
      const q = search.toLowerCase()
      if (!c.name.toLowerCase().includes(q) && !c.phone.includes(q)) return false
    }
    if (chip === 'risk') return hasRun && c.risk !== 'active' && !sent[c.id]
    if (chip === 'active') return hasRun && c.risk === 'active'
    if (chip === 'sent') return !!sent[c.id]
    return true
  }), [scored, search, chip, hasRun, sent])

  // reset to first page whenever the result set changes shape
  useEffect(() => { setPage(1) }, [search, chip, pageSize])

  const total = filtered.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const current = Math.min(page, pageCount)
  const start = (current - 1) * pageSize
  const pageRows = filtered.slice(start, start + pageSize)

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or phone…" className="!pl-8" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {chips.map((c) => (
            <button key={c.key} onClick={() => setChip(c.key)}
              className={clsx('flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                chip === c.key ? 'bg-navy text-white' : 'border border-line bg-surface text-muted hover:text-navy')}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <CustomerTable customers={pageRows} sent={sent} hasRun={hasRun} onWinBack={setModal} />

      {/* Footer / pagination */}
      {total > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 px-1 sm:flex-row">
          <div className="flex items-center gap-3 text-2xs text-muted">
            <span>
              Showing <span className="font-semibold text-navy">{start + 1}–{Math.min(start + pageSize, total)}</span> of{' '}
              <span className="font-semibold text-navy">{total}</span>
            </span>
            <span className="flex items-center gap-1">
              Rows:
              {PAGE_SIZES.map((s) => (
                <button key={s} onClick={() => setPageSize(s)}
                  className={clsx('rounded px-1.5 py-0.5 font-medium transition-colors',
                    pageSize === s ? 'bg-navy text-white' : 'text-muted hover:text-navy')}>
                  {s}
                </button>
              ))}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => setPage(current - 1)} disabled={current <= 1}
              className="btn btn-sm btn-outline px-2 disabled:opacity-40">
              <ChevronLeft size={14} />
            </button>
            {pageNumbers(current, pageCount).map((p, i) =>
              p === '…' ? (
                <span key={`e${i}`} className="px-1.5 text-muted">…</span>
              ) : (
                <button key={p} onClick={() => setPage(p as number)}
                  className={clsx('h-7 min-w-7 rounded-md px-2 text-xs font-medium transition-colors',
                    p === current ? 'bg-navy text-white' : 'border border-line bg-surface text-muted hover:text-navy')}>
                  {p}
                </button>
              ),
            )}
            <button onClick={() => setPage(current + 1)} disabled={current >= pageCount}
              className="btn btn-sm btn-outline px-2 disabled:opacity-40">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {modal && <WinBackModal customer={modal} onClose={() => setModal(null)} />}
    </div>
  )
}

/** Compact page list: 1 … 4 5 [6] 7 8 … 12 */
function pageNumbers(current: number, count: number): (number | '…')[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1)
  const out: (number | '…')[] = [1]
  const lo = Math.max(2, current - 1)
  const hi = Math.min(count - 1, current + 1)
  if (lo > 2) out.push('…')
  for (let p = lo; p <= hi; p++) out.push(p)
  if (hi < count - 1) out.push('…')
  out.push(count)
  return out
}
