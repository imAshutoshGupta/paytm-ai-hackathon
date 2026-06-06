'use client'

import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { t, formatAmount, formatDate } from '@/lib/i18n'
import { Check, MessageSquare, Clock, ChevronDown } from 'lucide-react'
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

interface Props {
  entries: UdhaarEntry[]
  onMarkPaid: (id: string) => void
  onReminder: (id: string, name: string, amount: number) => void
}

const statusChip: Record<UdhaarEntry['status'], string> = {
  pending: 'chip-warning',
  partial: 'chip-accent',
  paid: 'chip-success',
}

export default function UdhaarList({ entries, onMarkPaid, onReminder }: Props) {
  const { language } = useApp()
  const [expanded, setExpanded] = useState<string | null>(null)

  if (!entries.length) {
    return (
      <div className="card flex flex-col items-center justify-center py-14 text-center">
        <p className="text-sm text-subtle">{t('common.noData', language)}</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      {entries.map((entry, i) => {
        const balance = entry.amount - entry.amountPaid
        const days = Math.floor((Date.now() - new Date(entry.createdAt).getTime()) / 86400000)
        const isOpen = expanded === entry._id

        return (
          <div key={entry._id} className={clsx(i !== 0 && 'border-t border-line')}>
            <button
              onClick={() => setExpanded(isOpen ? null : entry._id)}
              className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-line-soft"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-line bg-background text-sm font-medium text-muted">
                  {entry.customerName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{entry.customerName}</p>
                  <p className="truncate text-xs text-subtle">
                    {entry.note || formatDate(entry.createdAt)}
                  </p>
                </div>
              </div>
              <div className="ml-2 flex flex-shrink-0 items-center gap-3">
                <div className="text-right">
                  <p
                    className={clsx(
                      'text-sm font-semibold tracking-tight',
                      entry.status === 'paid' ? 'text-success' : 'text-ink',
                    )}
                  >
                    {formatAmount(balance)}
                  </p>
                  <span className={clsx('chip mt-0.5', statusChip[entry.status])}>
                    {t(`udhaar.status.${entry.status}`, language)}
                  </span>
                </div>
                <ChevronDown
                  size={15}
                  strokeWidth={1.75}
                  className={clsx('text-subtle transition-transform', isOpen && 'rotate-180')}
                />
              </div>
            </button>

            {isOpen && (
              <div className="animate-fade-in border-t border-line bg-line-soft/40 px-4 py-3">
                <div className="mb-3 flex items-center justify-between text-xs text-muted">
                  <span className="flex items-center gap-1.5">
                    <Clock size={12} strokeWidth={1.75} />
                    {days} {t('udhaar.daysOverdue', language)}
                  </span>
                  <span>
                    {t('udhaar.amount', language)}: {formatAmount(entry.amount)}
                    {entry.amountPaid > 0 && ` · Paid ${formatAmount(entry.amountPaid)}`}
                  </span>
                </div>
                {entry.status !== 'paid' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onMarkPaid(entry._id)}
                      className="btn btn-sm btn-outline flex-1"
                    >
                      <Check size={14} strokeWidth={1.75} />
                      {t('udhaar.markPaid', language)}
                    </button>
                    <button
                      onClick={() => onReminder(entry._id, entry.customerName, balance)}
                      className="btn btn-sm btn-outline flex-1"
                    >
                      <MessageSquare size={14} strokeWidth={1.75} />
                      {t('udhaar.sendReminder', language)}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
