'use client'

import { LucideIcon } from 'lucide-react'
import clsx from 'clsx'

export default function MetricCard({
  label, value, sub, icon: Icon, tone = 'navy',
}: {
  label: string
  value: string | number
  sub?: string
  icon: LucideIcon
  tone?: 'navy' | 'danger' | 'brand' | 'success'
}) {
  const toneMap = {
    navy: 'text-navy bg-canvas',
    danger: 'text-danger bg-danger-soft',
    brand: 'text-brand-dark bg-brand-tint',
    success: 'text-success bg-success-soft',
  }
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between">
        <span className="text-2xs font-semibold uppercase tracking-wide text-muted">{label}</span>
        <span className={clsx('flex h-7 w-7 items-center justify-center rounded-lg', toneMap[tone])}>
          <Icon size={15} strokeWidth={2} />
        </span>
      </div>
      <div className="mt-2 text-2xl font-bold text-navy">{value}</div>
      {sub && <div className="mt-0.5 text-2xs text-muted">{sub}</div>}
    </div>
  )
}
