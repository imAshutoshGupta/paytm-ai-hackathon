'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { useChurn } from '@/context/ChurnContext'
import ChurnEngineBanner from '@/components/ChurnEngineBanner'
import CustomerExplorer from '@/components/CustomerExplorer'

export default function CustomersPage() {
  const { merchant, hydrated } = useApp()
  const { metrics } = useChurn()
  const router = useRouter()

  useEffect(() => {
    if (hydrated && !merchant) router.replace('/')
  }, [hydrated, merchant, router])

  if (!merchant) return null

  return (
    <div className="space-y-5 py-2">
      <div>
        <h1 className="text-xl font-bold text-navy">Customers</h1>
        <p className="text-sm text-muted">{metrics.totalCustomers} customers reconstructed from Paytm QR payments</p>
      </div>
      <ChurnEngineBanner />
      <CustomerExplorer />
    </div>
  )
}
