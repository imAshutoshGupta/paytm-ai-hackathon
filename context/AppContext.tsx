'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type MsgLanguage = 'en' | 'hi' | 'hinglish'

export interface Merchant {
  id: string
  phone: string
  name: string
  businessName: string
  businessType: string
}

interface AppContextValue {
  merchant: Merchant | null
  hydrated: boolean
  setMerchant: (m: Merchant | null) => void
  logout: () => void
}

const AppContext = createContext<AppContextValue>({
  merchant: null,
  hydrated: false,
  setMerchant: () => {},
  logout: () => {},
})

const STORAGE_KEY = 'cg_merchant'

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [merchant, setMerchantState] = useState<Merchant | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setMerchantState(JSON.parse(stored) as Merchant)
    } catch {}
    setHydrated(true)
  }, [])

  function setMerchant(m: Merchant | null) {
    setMerchantState(m)
    if (m) localStorage.setItem(STORAGE_KEY, JSON.stringify(m))
    else localStorage.removeItem(STORAGE_KEY)
  }

  function logout() {
    setMerchantState(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AppContext.Provider value={{ merchant, hydrated, setMerchant, logout }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
