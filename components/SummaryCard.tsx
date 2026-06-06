'use client'

import { LucideIcon } from 'lucide-react'
import clsx from 'clsx'

interface SummaryCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  color?: 'neutral' | 'accent' | 'warning' | 'success' | 'danger'
  delay?: number
}

const iconTone: Record<NonNullable<SummaryCardProps['color']>, string> = {
  neutral: 'text-muted',
  accent: 'text-accent',
  warning: 'text-warning',
  success: 'text-success',
  danger: 'text-danger',
}

export default function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'neutral',
  delay = 0,
}: SummaryCardProps) {
  return (
    <div
      className="card card-hover animate-fade-up p-4 opacity-0"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium text-muted">{title}</p>
        <Icon size={16} strokeWidth={1.75} className={iconTone[color]} />
      </div>
      <p
        className={clsx(
          'text-2xl font-semibold tracking-tighter text-ink',
          color === 'warning' && 'text-warning',
          color === 'danger' && 'text-danger',
        )}
      >
        {value}
      </p>
      {subtitle && <p className="mt-1 text-xs text-subtle">{subtitle}</p>}
    </div>
  )
}
