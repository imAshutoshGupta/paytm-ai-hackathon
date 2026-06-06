'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { useChurn } from '@/context/ChurnContext'
import { APP_NAME } from '@/lib/brand'
import {
  LayoutDashboard, Users, Send, Settings, LogOut, ShieldAlert,
} from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Customers', href: '/customers', icon: Users },
  { label: 'Win-Back', href: '/winback', icon: Send, badge: true },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { merchant, logout } = useApp()
  const pathname = usePathname()
  const router = useRouter()

  // Login / unauthenticated → no chrome
  if (!merchant) return <>{children}</>

  return (
    <ChurnAwareShell pathname={pathname} merchantName={merchant.businessName || merchant.name}
      onLogout={() => { logout(); router.push('/') }}>
      {children}
    </ChurnAwareShell>
  )
}

function ChurnAwareShell({
  children, pathname, merchantName, onLogout,
}: {
  children: React.ReactNode
  pathname: string
  merchantName: string
  onLogout: () => void
}) {
  const { metrics, hasRun } = useChurn()

  return (
    <div className="min-h-screen">
      {/* Topbar */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-[52px] items-center justify-between bg-navy px-4 text-white md:pl-[216px]">
        <div className="flex items-center gap-2 md:hidden">
          <ShieldAlert size={18} className="text-brand" />
          <span className="font-semibold tracking-tight">{APP_NAME}</span>
        </div>
        <div className="hidden text-xs text-white/50 md:block">
          Paytm for Business · Merchant Console
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right leading-tight">
            <div className="text-xs font-semibold">{merchantName}</div>
            <div className="text-2xs text-white/50">Merchant</div>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/20 text-xs font-bold text-brand">
            {merchantName.slice(0, 1).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[200px] flex-col bg-navy px-3 py-4 md:flex">
        <Link href="/dashboard" className="mb-6 flex items-center gap-2 px-2">
          <ShieldAlert size={20} className="text-brand" />
          <span className="text-[15px] font-bold tracking-tight text-white">{APP_NAME}</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map(({ label, href, icon: Icon, badge }) => {
            const active = pathname === href
            const showBadge = badge && hasRun && metrics.atRisk > 0
            return (
              <Link key={href} href={href}
                className={clsx(
                  'relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                  active ? 'bg-brand/15 font-semibold text-white' : 'text-white/60 hover:bg-white/5 hover:text-white',
                )}>
                {active && <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-brand" />}
                <Icon size={16} strokeWidth={1.9} />
                {label}
                {showBadge && (
                  <span className="ml-auto rounded-full bg-danger px-1.5 py-0.5 text-2xs font-bold text-white">
                    {metrics.atRisk}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
        <button onClick={onLogout}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white">
          <LogOut size={16} strokeWidth={1.9} />
          Logout
        </button>
      </aside>

      {/* Mobile nav */}
      <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-line bg-surface py-2 md:hidden">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href}
              className={clsx('flex flex-col items-center gap-1 px-3', active ? 'text-brand' : 'text-muted')}>
              <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
              <span className="text-2xs font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Main */}
      <main className="px-4 pb-24 pt-[68px] md:pb-8 md:pl-[216px] md:pr-6">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  )
}
