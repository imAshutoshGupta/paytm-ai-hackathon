'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { t, Language } from '@/lib/i18n'
import { ChevronRight, Store, BookOpen, Scissors, CheckCircle } from 'lucide-react'
import clsx from 'clsx'

type Step = 'phone' | 'otp' | 'profile'
type BizType = 'kirana' | 'tuition' | 'tailor'

const bizTypes: { type: BizType; icon: typeof Store; key: string; desc: Record<Language, string> }[] = [
  {
    type: 'kirana',
    icon: Store,
    key: 'login.kirana',
    desc: { en: 'Grocery & daily essentials', hi: 'किराना और रोज़मर्रा का सामान', mr: 'किराणा आणि रोजच्या गरजा' },
  },
  {
    type: 'tuition',
    icon: BookOpen,
    key: 'login.tuition',
    desc: { en: 'Students, fees & materials', hi: 'छात्र, फीस और सामग्री', mr: 'विद्यार्थी, फी आणि साहित्य' },
  },
  {
    type: 'tailor',
    icon: Scissors,
    key: 'login.tailor',
    desc: { en: 'Orders, fabric & alterations', hi: 'ऑर्डर, कपड़ा और बदलाव', mr: 'ऑर्डर, कापड आणि बदल' },
  },
]

export default function LoginPage() {
  const { setUser, language, setLanguage } = useApp()
  const router = useRouter()
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState<BizType | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [otpSent, setOtpSent] = useState(false)

  const steps: Step[] = ['phone', 'otp', 'profile']
  const stepIdx = steps.indexOf(step)

  async function sendOtp() {
    if (phone.length < 10) { setError('Enter a valid 10-digit mobile number'); return }
    setLoading(true); setError('')
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'send-otp', phone }),
    })
    setLoading(false)
    if (res.ok) { setOtpSent(true); setStep('otp') }
    else setError('Failed to send OTP')
  }

  async function verifyOtp() {
    if (otp.length !== 4) { setError('Enter 4-digit OTP'); return }
    setLoading(true); setError('')
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify-otp', phone, otp }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError('Invalid OTP. Try 1234'); return }
    if (data.user) {
      setUser(data.user)
      router.push('/dashboard')
    } else {
      setStep('profile')
    }
  }

  async function register() {
    if (!name.trim() || !businessName.trim() || !businessType) {
      setError('Please fill all fields and select business type')
      return
    }
    setLoading(true); setError('')
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', phone, name, businessName, businessType, language }),
    })
    const data = await res.json()
    setLoading(false)
    if (res.ok && data.user) {
      setUser(data.user)
      router.push('/dashboard')
    } else setError(data.error || 'Registration failed')
  }

  const langOptions: { code: Language; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'mr', label: 'मराठी' },
  ]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8"
      style={{ background: 'radial-gradient(ellipse at top, #FFFFFF 0%, #FAFAFA 60%)' }}>
      {/* Lang switcher */}
      <div className="mb-8 flex items-center gap-0.5 rounded-lg border border-line bg-surface p-0.5">
        {langOptions.map(({ code, label }) => (
          <button key={code} onClick={() => setLanguage(code)}
            className={clsx('rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              language === code ? 'bg-ink text-white' : 'text-muted hover:text-ink')}>
            {label}
          </button>
        ))}
      </div>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-1 text-5xl font-semibold tracking-tightest text-ink">
            Hisaab
          </h1>
          <p className="text-sm text-muted">{t('login.subtitle', language)}</p>
        </div>

        {/* Step indicators */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={clsx(
                'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                i < stepIdx ? 'bg-accent text-white' :
                i === stepIdx ? 'bg-ink text-white' : 'bg-line text-subtle',
              )}>
                {i < stepIdx ? <CheckCircle size={14} /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={clsx('h-px w-8', i < stepIdx ? 'bg-accent' : 'bg-line')} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="card p-6">

          {/* Step 1: Phone */}
          {step === 'phone' && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-semibold tracking-tight text-ink">{t('login.title', language)}</h2>
              <div>
                <label className="label">{t('login.phone', language)}</label>
                <div className="flex gap-2">
                  <span className="flex items-center rounded-lg border border-line bg-line-soft px-3 text-sm text-muted">
                    +91
                  </span>
                  <input type="tel" maxLength={10} value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => e.key === 'Enter' && sendOtp()}
                    placeholder="9876543210"
                    className="flex-1" />
                </div>
              </div>
              {error && <p className="text-sm text-danger">{error}</p>}
              <button onClick={sendOtp} disabled={loading}
                className="btn btn-md btn-primary w-full">
                {loading ? 'Sending...' : t('login.sendOtp', language)}
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* Step 2: OTP */}
          {step === 'otp' && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-semibold tracking-tight text-ink">{t('login.enterOtp', language)}</h2>
              {otpSent && (
                <p className="text-sm text-accent">{t('login.otpSent', language)}</p>
              )}
              <input type="text" maxLength={4} value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && verifyOtp()}
                placeholder="1234"
                className="text-center text-2xl tracking-[0.5rem]" />
              {error && <p className="text-sm text-danger">{error}</p>}
              <button onClick={verifyOtp} disabled={loading}
                className="btn btn-md btn-primary w-full">
                {loading ? 'Verifying...' : t('login.verify', language)}
                <ChevronRight size={18} />
              </button>
              <button onClick={() => { setStep('phone'); setOtp('') }}
                className="w-full text-center text-sm text-muted transition-colors hover:text-ink">
                ← Change number
              </button>
            </div>
          )}

          {/* Step 3: Profile */}
          {step === 'profile' && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-xl font-semibold tracking-tight text-ink">{t('login.selectBusiness', language)}</h2>

              {/* Business Type */}
              <div className="grid grid-cols-3 gap-2">
                {bizTypes.map(({ type, icon: Icon, key, desc }) => (
                  <button key={type} onClick={() => setBusinessType(type)}
                    className={clsx(
                      'card flex flex-col items-center gap-2 p-3 transition-colors',
                      businessType === type
                        ? 'border-accent bg-accent-soft text-ink'
                        : 'text-muted hover:border-subtle',
                    )}>
                    <Icon size={22} />
                    <span className="text-center text-xs font-semibold leading-tight">
                      {t(key, language)}
                    </span>
                    <span className="text-center text-[10px] leading-tight text-subtle">
                      {desc[language]}
                    </span>
                  </button>
                ))}
              </div>

              <div>
                <label className="label">{t('login.yourName', language)}</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Ramesh Gupta" />
              </div>

              <div>
                <label className="label">{t('login.businessName', language)}</label>
                <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && register()}
                  placeholder="Gupta Kirana Store" />
              </div>

              {error && <p className="text-sm text-danger">{error}</p>}

              <button onClick={register} disabled={loading}
                className="btn btn-md btn-primary w-full">
                {loading ? 'Setting up...' : t('login.getStarted', language)}
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
