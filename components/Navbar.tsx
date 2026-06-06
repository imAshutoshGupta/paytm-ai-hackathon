'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useApp } from '@/context/AppContext'
import { t, Language } from '@/lib/i18n'
import {
  LayoutDashboard,
  IndianRupee,
  FileText,
  Package,
  MessageCircle,
  LogOut,
  Settings,
} from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { key: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'nav.dues', href: '/udhaar', icon: IndianRupee },
  { key: 'nav.bills', href: '/bills', icon: FileText },
  { key: 'nav.stock', href: '/inventory', icon: Package },
  { key: 'nav.ask', href: '/ask', icon: MessageCircle },
]

const langOptions: { code: Language; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'हि' },
  { code: 'mr', label: 'म' },
]

export default function Navbar() {
  const { user, language, setLanguage, logout } = useApp()
  const pathname = usePathname()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleLogout() {
    logout()
    router.push('/')
  }

  if (!user) return null

  return (
    <>
      {/* Desktop top navbar — transparent until scroll */}
      <nav
        className={clsx(
          'fixed inset-x-0 top-0 z-50 hidden h-14 items-center px-6 transition-colors duration-200 md:flex',
          scrolled
            ? 'border-b border-line bg-background/80 backdrop-blur-md'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        <Link
          href="/dashboard"
          className="mr-10 text-[15px] font-semibold tracking-tighter text-ink"
        >
          Hisaab
        </Link>

        <div className="flex flex-1 items-center gap-1">
          {navItems.map(({ key, href, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'group relative flex items-center gap-2 px-3 py-2 text-sm transition-colors',
                  active ? 'text-ink' : 'text-muted hover:text-ink',
                )}
              >
                <Icon size={15} strokeWidth={1.75} />
                {t(key, language)}
                <span
                  className={clsx(
                    'absolute inset-x-3 -bottom-px h-px origin-left bg-ink transition-transform duration-200',
                    active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                  )}
                />
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          <LangSwitcher language={language} setLanguage={setLanguage} />
          <Link
            href="/admin"
            className="rounded-md p-2 text-subtle transition-colors hover:bg-line-soft hover:text-ink"
            aria-label="Admin"
          >
            <Settings size={15} strokeWidth={1.75} />
          </Link>
          <button
            onClick={handleLogout}
            className="btn btn-sm btn-ghost"
          >
            <LogOut size={14} strokeWidth={1.75} />
            {t('common.logout', language)}
          </button>
        </div>
      </nav>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-50 flex h-[53px] items-center justify-between border-b border-line bg-background/80 px-4 backdrop-blur-md md:hidden">
        <Link href="/dashboard" className="text-[15px] font-semibold tracking-tighter text-ink">
          Hisaab
        </Link>
        <LangSwitcher language={language} setLanguage={setLanguage} />
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-line bg-surface/90 px-2 py-2 backdrop-blur-md md:hidden">
        {navItems.map(({ key, href, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex flex-col items-center gap-1 rounded-md px-3 py-1 transition-colors',
                active ? 'text-ink' : 'text-subtle',
              )}
            >
              <Icon size={19} strokeWidth={active ? 2 : 1.75} />
              <span className="text-[10px] font-medium">{t(key, language)}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}

function LangSwitcher({
  language,
  setLanguage,
}: {
  language: Language
  setLanguage: (l: Language) => void
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-line bg-surface p-0.5">
      {langOptions.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLanguage(code)}
          className={clsx(
            'rounded-md px-2 py-1 text-xs font-medium transition-colors',
            language === code ? 'bg-ink text-white' : 'text-muted hover:text-ink',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
