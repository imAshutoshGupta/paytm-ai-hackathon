'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Language, BusinessType } from '@/lib/i18n'

export interface UserProfile {
  id: string
  phone: string
  name: string
  businessName: string
  businessType: BusinessType
  language: Language
}

interface AppContextValue {
  user: UserProfile | null
  hydrated: boolean
  language: Language
  setLanguage: (lang: Language) => void
  setUser: (user: UserProfile | null) => void
  logout: () => void
}

const AppContext = createContext<AppContextValue>({
  user: null,
  hydrated: false,
  language: 'en',
  setLanguage: () => {},
  setUser: () => {},
  logout: () => {},
})

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserProfile | null>(null)
  const [language, setLanguageState] = useState<Language>('en')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('hisaab_user')
      if (stored) {
        const parsed = JSON.parse(stored) as UserProfile
        setUserState(parsed)
        setLanguageState(parsed.language ?? 'en')
      }
      const storedLang = localStorage.getItem('hisaab_lang') as Language | null
      if (storedLang) setLanguageState(storedLang)
    } catch {}
    setHydrated(true)
  }, [])

  function setUser(u: UserProfile | null) {
    setUserState(u)
    if (u) {
      localStorage.setItem('hisaab_user', JSON.stringify(u))
    } else {
      localStorage.removeItem('hisaab_user')
    }
  }

  function setLanguage(lang: Language) {
    setLanguageState(lang)
    localStorage.setItem('hisaab_lang', lang)
    if (user) {
      const updated = { ...user, language: lang }
      setUser(updated)
    }
  }

  function logout() {
    setUserState(null)
    localStorage.removeItem('hisaab_user')
  }

  return (
    <AppContext.Provider value={{ user, hydrated, language, setLanguage, setUser, logout }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
