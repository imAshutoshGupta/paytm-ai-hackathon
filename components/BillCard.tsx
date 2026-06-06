'use client'

import { useApp } from '@/context/AppContext'
import { t, formatAmount, formatDate } from '@/lib/i18n'
import { Check, Store, Calendar } from 'lucide-react'
import clsx from 'clsx'

interface BillItem {
  name: string
  quantity: number
  unit: string
  price: number
}

interface BillCardProps {
  _id: string
  vendorName: string
  items: BillItem[]
  totalAmount: number
  status: 'paid' | 'unpaid'
  billDate: string
  onMarkPaid?: (id: string) => void
}

export default function BillCard({
  _id,
  vendorName,
  items,
  totalAmount,
  status,
  billDate,
  onMarkPaid,
}: BillCardProps) {
  const { language } = useApp()

  return (
    <div className="card card-hover animate-fade-up p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-background text-muted">
            <Store size={15} strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-sm font-medium text-ink">{vendorName}</p>
            <p className="flex items-center gap-1 text-xs text-subtle">
              <Calendar size={11} strokeWidth={1.75} />
              {formatDate(billDate)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold tracking-tight text-ink">{formatAmount(totalAmount)}</p>
          <span className={clsx('chip mt-0.5', status === 'paid' ? 'chip-success' : 'chip-warning')}>
            {t(`bills.status.${status}`, language)}
          </span>
        </div>
      </div>

      {items.length > 0 && (
        <div className="mt-3 space-y-1.5 border-t border-line pt-3">
          {items.slice(0, 4).map((item, i) => (
            <div key={i} className="flex justify-between text-xs">
              <span className="text-muted">
                {item.name} × {item.quantity} {item.unit}
              </span>
              <span className="text-ink">{formatAmount(item.price)}</span>
            </div>
          ))}
          {items.length > 4 && (
            <p className="text-xs text-subtle">+{items.length - 4} more items</p>
          )}
        </div>
      )}

      {status === 'unpaid' && onMarkPaid && (
        <button onClick={() => onMarkPaid(_id)} className="btn btn-sm btn-outline mt-3 w-full">
          <Check size={14} strokeWidth={1.75} />
          {t('bills.markPaid', language)}
        </button>
      )}
    </div>
  )
}
