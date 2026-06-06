'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useApp } from '@/context/AppContext'
import { useChurn } from '@/context/ChurnContext'
import { useToast } from '@/components/Toast'
import { ScoredCustomer, maskName, maskPhone, lastVisitedLabel } from '@/lib/churn'
import {
  X, RefreshCw, Send, Volume2, Loader2, Download, Sparkles,
} from 'lucide-react'
import clsx from 'clsx'

type Lang = 'en' | 'hi' | 'hinglish'
const langs: { code: Lang; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'hinglish', label: 'Hinglish' },
]

export default function WinBackModal({
  customer, onClose,
}: {
  customer: ScoredCustomer
  onClose: () => void
}) {
  const { merchant } = useApp()
  const { markSent } = useChurn()
  const toast = useToast()

  const [language, setLanguage] = useState<Lang>('hinglish')
  const [message, setMessage] = useState('')
  const [generating, setGenerating] = useState(false)
  const [voiceLoading, setVoiceLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const generate = useCallback(async (lang: Lang) => {
    if (!merchant) return
    setGenerating(true)
    setAudioUrl(null)
    try {
      const res = await fetch('/api/winback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customer.name,
          merchantName: merchant.name,
          businessName: merchant.businessName,
          businessType: merchant.businessType,
          lastAmount: customer.lastTransactionAmount,
          recencyDays: customer.recencyDays,
          language: lang,
        }),
      })
      const data = await res.json()
      setMessage(data.message || '')
    } catch {
      toast.show('Could not generate message')
    } finally {
      setGenerating(false)
    }
  }, [merchant, customer, toast])

  useEffect(() => { generate('hinglish') /* on open */ }, [generate])

  async function makeVoiceNote() {
    if (!message) return
    setVoiceLoading(true)
    try {
      const res = await fetch('/api/sarvam/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message, languageCode: language === 'en' ? 'en-IN' : 'hi-IN' }),
      })
      const data = await res.json()
      if (data.audio) {
        const url = `data:${data.mimeType || 'audio/wav'};base64,${data.audio}`
        setAudioUrl(url)
        setTimeout(() => audioRef.current?.play().catch(() => {}), 100)
      } else {
        toast.show('Voice note needs a live Sarvam key')
      }
    } catch {
      toast.show('Voice generation failed')
    } finally {
      setVoiceLoading(false)
    }
  }

  function send() {
    markSent(customer.id)
    toast.show(`Win-back sent to ${maskName(customer.name)}`)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-navy/50 px-4 pb-4 backdrop-blur-sm md:items-center md:pb-0">
      <div className="card w-full max-w-lg overflow-hidden animate-fade-up">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-line bg-canvas px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-brand" />
              <h3 className="font-semibold text-navy">AI Win-Back Message</h3>
            </div>
            <p className="mt-0.5 text-xs text-muted">
              {maskName(customer.name)} · {maskPhone(customer.phone)}
            </p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-navy"><X size={18} /></button>
        </div>

        {/* Context row */}
        <div className="grid grid-cols-3 divide-x divide-line border-b border-line text-center">
          <div className="px-3 py-2.5">
            <div className="text-2xs uppercase tracking-wide text-muted">Last Visit</div>
            <div className="text-sm font-semibold text-navy">{lastVisitedLabel(customer.recencyDays)}</div>
          </div>
          <div className="px-3 py-2.5">
            <div className="text-2xs uppercase tracking-wide text-muted">Last Paid</div>
            <div className="text-sm font-semibold text-navy">₹{customer.lastTransactionAmount.toLocaleString('en-IN')}</div>
          </div>
          <div className="px-3 py-2.5">
            <div className="text-2xs uppercase tracking-wide text-muted">Churn Risk</div>
            <div className={clsx('text-sm font-bold', customer.churnPct >= 70 ? 'text-danger' : customer.churnPct >= 45 ? 'text-amber-dark' : 'text-success')}>
              {customer.churnPct}%
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-3 p-5">
          {/* Language toggle */}
          <div className="flex items-center gap-1 rounded-lg border border-line bg-canvas p-0.5">
            {langs.map((l) => (
              <button key={l.code}
                onClick={() => { setLanguage(l.code); generate(l.code) }}
                className={clsx('flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
                  language === l.code ? 'bg-navy text-white' : 'text-muted hover:text-navy')}>
                {l.label}
              </button>
            ))}
          </div>

          {/* Message */}
          <div className="relative">
            <textarea
              value={generating ? '' : message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder={generating ? '' : 'Message...'}
              className="resize-none !text-sm leading-relaxed"
            />
            {generating && (
              <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-muted">
                <Loader2 size={16} className="animate-spin text-brand" />
                Sarvam AI is writing…
              </div>
            )}
          </div>

          {/* Audio preview */}
          {audioUrl && (
            <div className="flex items-center gap-3 rounded-lg border border-line bg-brand-tint px-3 py-2">
              <audio ref={audioRef} src={audioUrl} controls className="h-8 w-full" />
              <a href={audioUrl} download={`winback-${customer.name.replace(/\s+/g, '-')}.wav`}
                className="flex-shrink-0 text-brand-dark hover:text-navy" title="Download voice note">
                <Download size={16} />
              </a>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button onClick={() => generate(language)} disabled={generating}
              className="btn btn-sm btn-outline">
              <RefreshCw size={14} className={generating ? 'animate-spin' : ''} /> Regenerate
            </button>
            <button onClick={makeVoiceNote} disabled={voiceLoading || generating || !message}
              className="btn btn-sm btn-outline">
              {voiceLoading ? <Loader2 size={14} className="animate-spin" /> : <Volume2 size={14} />}
              Voice Note
            </button>
            <button onClick={send} disabled={generating || !message}
              className="btn btn-sm btn-amber ml-auto">
              <Send size={14} /> Send via WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
