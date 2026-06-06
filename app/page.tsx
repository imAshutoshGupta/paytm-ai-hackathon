'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { APP_NAME, APP_TAGLINE } from '@/lib/brand'
import { ShieldAlert, ChevronRight, Phone } from 'lucide-react'

type Step = 'phone' | 'otp' | 'profile'

const businessTypes = [
  'Kirana/Grocery', 'Restaurant/Food', 'Clothing/Fashion',
  'Electronics', 'Pharmacy', 'Salon/Beauty', 'Other',
]

export default function LoginPage() {
  const { merchant, hydrated, setMerchant } = useApp()
  const router = useRouter()
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState('Kirana/Grocery')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (hydrated && merchant) router.replace('/dashboard')
  }, [hydrated, merchant, router])

  async function sendOtp() {
    if (phone.length < 10) { setError('Enter a valid 10-digit number'); return }
    setLoading(true); setError('')
    const res = await fetch('/api/auth', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'send-otp', phone }),
    })
    setLoading(false)
    if (res.ok) setStep('otp'); else setError('Failed to send OTP')
  }

  async function verifyOtp() {
    if (otp.length !== 4) { setError('Enter the 4-digit OTP'); return }
    setLoading(true); setError('')
    const res = await fetch('/api/auth', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify-otp', phone, otp }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError('Invalid OTP. Use 1234'); return }
    if (data.merchant) {
      setMerchant(data.merchant)
      router.push('/dashboard')
    } else {
      setStep('profile')
    }
  }

  async function register() {
    if (!name.trim()) { setError('Enter your name'); return }
    setLoading(true); setError('')
    const res = await fetch('/api/auth', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', phone, name, businessName, businessType }),
    })
    const data = await res.json()
    setLoading(false)
    if (res.ok && data.merchant) {
      setMerchant(data.merchant)
      router.push('/dashboard')
    } else setError(data.error || 'Registration failed')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy px-4 py-10">
      {/* Brand */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-3 flex items-center gap-2">
          <ShieldAlert size={26} className="text-brand" />
          <span className="text-2xl font-bold tracking-tight text-white">{APP_NAME}</span>
        </div>
        <p className="text-sm text-white/50">{APP_TAGLINE}</p>
        <p className="mt-1 text-2xs uppercase tracking-widest text-brand/70">Paytm for Business</p>
      </div>

      <div className="card w-full max-w-sm p-6">
        {step === 'phone' && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="text-lg font-semibold text-navy">Merchant Login</h2>
              <p className="text-xs text-muted">Sign in with your registered mobile number</p>
            </div>
            <div>
              <label className="label">Mobile Number</label>
              <div className="flex gap-2">
                <span className="flex items-center rounded-lg border border-line bg-canvas px-3 text-sm text-muted">
                  <Phone size={13} className="mr-1" />+91
                </span>
                <input type="tel" maxLength={10} value={phone} autoFocus
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && sendOtp()}
                  placeholder="9999999001" className="flex-1" />
              </div>
            </div>
            {error && <p className="text-xs text-danger">{error}</p>}
            <button onClick={sendOtp} disabled={loading} className="btn btn-md btn-blue w-full">
              {loading ? 'Sending…' : 'Get OTP'} <ChevronRight size={16} />
            </button>
            <p className="text-center text-2xs text-muted">Demo: 9999999001 (Kirana) · 9999999002 (Salon)</p>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="text-lg font-semibold text-navy">Verify OTP</h2>
              <p className="text-xs text-brand-dark">OTP sent to +91 {phone} — use 1234</p>
            </div>
            <input type="text" maxLength={4} value={otp} autoFocus
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && verifyOtp()}
              placeholder="1234" className="text-center text-2xl tracking-[0.5em]" />
            {error && <p className="text-xs text-danger">{error}</p>}
            <button onClick={verifyOtp} disabled={loading} className="btn btn-md btn-blue w-full">
              {loading ? 'Verifying…' : 'Verify & Login'} <ChevronRight size={16} />
            </button>
            <button onClick={() => { setStep('phone'); setOtp(''); setError('') }}
              className="w-full text-center text-xs text-muted hover:text-navy">← Change number</button>
          </div>
        )}

        {step === 'profile' && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="text-lg font-semibold text-navy">Complete your profile</h2>
              <p className="text-xs text-muted">New merchant — tell us about your business</p>
            </div>
            <div>
              <label className="label">Your Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ramesh Sharma" />
            </div>
            <div>
              <label className="label">Business Name</label>
              <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Sharma Kirana Store" />
            </div>
            <div>
              <label className="label">Business Type (optional)</label>
              <select value={businessType} onChange={(e) => setBusinessType(e.target.value)}>
                {businessTypes.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            {error && <p className="text-xs text-danger">{error}</p>}
            <button onClick={register} disabled={loading} className="btn btn-md btn-blue w-full">
              {loading ? 'Setting up…' : 'Create Account'} <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
