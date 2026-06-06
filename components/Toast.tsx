'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, X } from 'lucide-react'

interface Toast { id: number; message: string }
interface ToastContextValue { show: (message: string) => void }

const ToastContext = createContext<ToastContextValue>({ show: () => {} })

let seq = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback((message: string) => {
    const id = ++seq
    setToasts((t) => [...t, { id, message }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id}
            className="flex items-center gap-2.5 rounded-lg bg-navy px-4 py-3 text-sm font-medium text-white shadow-pop animate-fade-up">
            <CheckCircle2 size={16} className="text-brand" />
            <span>{t.message}</span>
            <button onClick={() => setToasts((arr) => arr.filter((x) => x.id !== t.id))}
              className="ml-1 text-white/60 hover:text-white">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
