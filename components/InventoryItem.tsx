'use client'

import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { t } from '@/lib/i18n'
import { AlertTriangle, Package, Check, X } from 'lucide-react'
import clsx from 'clsx'

interface InventoryItemProps {
  _id: string
  itemName: string
  quantity: number
  unit: string
  reorderThreshold: number
  onUpdate: (id: string, quantity: number) => void
}

export default function InventoryItem({
  _id,
  itemName,
  quantity,
  unit,
  reorderThreshold,
  onUpdate,
}: InventoryItemProps) {
  const { language } = useApp()
  const [editing, setEditing] = useState(false)
  const [newQty, setNewQty] = useState(quantity.toString())
  const isLow = quantity <= reorderThreshold

  function handleSave() {
    const parsed = parseFloat(newQty)
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdate(_id, parsed)
      setEditing(false)
    }
  }

  return (
    <div className="flex items-center justify-between px-4 py-3.5 transition-colors hover:bg-line-soft">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div
          className={clsx(
            'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border',
            isLow ? 'border-warning/20 bg-warning-soft text-warning' : 'border-line bg-background text-muted',
          )}
        >
          {isLow ? (
            <AlertTriangle size={15} strokeWidth={1.75} />
          ) : (
            <Package size={15} strokeWidth={1.75} />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{itemName}</p>
          <p className={clsx('text-xs', isLow ? 'text-warning' : 'text-subtle')}>
            {isLow ? t('inv.lowStock', language) : t('inv.inStock', language)} · min {reorderThreshold} {unit}
          </p>
        </div>
      </div>

      <div className="ml-2 flex flex-shrink-0 items-center gap-2">
        {editing ? (
          <>
            <input
              type="number"
              value={newQty}
              onChange={(e) => setNewQty(e.target.value)}
              className="!w-20 !py-1.5 text-center"
              autoFocus
            />
            <span className="text-xs text-subtle">{unit}</span>
            <button
              onClick={handleSave}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-line text-success transition-colors hover:bg-success-soft"
            >
              <Check size={15} strokeWidth={1.75} />
            </button>
            <button
              onClick={() => setEditing(false)}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-line text-subtle transition-colors hover:bg-line-soft"
            >
              <X size={15} strokeWidth={1.75} />
            </button>
          </>
        ) : (
          <>
            <div className="text-right">
              <p className={clsx('text-base font-semibold tracking-tight', isLow ? 'text-warning' : 'text-ink')}>
                {quantity}
              </p>
              <p className="text-xs text-subtle">{unit}</p>
            </div>
            <button
              onClick={() => {
                setEditing(true)
                setNewQty(quantity.toString())
              }}
              className="btn btn-sm btn-outline"
            >
              {t('inv.updateQty', language)}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
