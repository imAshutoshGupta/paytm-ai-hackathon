'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/context/AppContext'
import { t } from '@/lib/i18n'
import ChatBubble from '@/components/ChatBubble'
import MicButton from '@/components/MicButton'
import { SendHorizontal, Loader2 } from 'lucide-react'

interface Message { role: 'user' | 'assistant'; content: string; time: string }

const examples = ['ask.example1', 'ask.example2', 'ask.example3', 'ask.example4']

export default function AskPage() {
  const { user, language } = useApp()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { if (!user) router.push('/') }, [user, router])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  function timeNow() {
    return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  }

  async function send(text?: string) {
    const msg = (text || input).trim()
    if (!msg || !user) return
    setInput('')

    const userMsg: Message = { role: 'user', content: msg, time: timeNow() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setLoading(true)

    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        language,
        messages: newMessages.map(({ role, content }) => ({ role, content })),
      }),
    })
    const data = await res.json()
    setLoading(false)
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: data.reply || t('common.error', language), time: timeNow() },
    ])
  }

  if (!user) return null

  return (
    <div className="flex flex-col h-screen max-h-screen pt-12 md:pt-16 pb-16 md:pb-0 bg-background">
      {/* Title bar */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-line bg-background">
        <h1 className="font-semibold tracking-tight text-ink text-lg">{t('ask.title', language)}</h1>
        <p className="text-xs text-muted">{user.businessName}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="space-y-4 animate-fade-in">
            {/* Welcome */}
            <div className="flex justify-start">
              <div className="card max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-3">
                <p className="text-sm text-ink">
                  {language === 'hi'
                    ? `नमस्ते ${user.name}! मैं हिसाब हूं। आप मुझसे अपने ${user.businessName} के बारे में कुछ भी पूछ सकते हैं।`
                    : language === 'mr'
                    ? `नमस्कार ${user.name}! मी हिसाब आहे. तुम्ही मला ${user.businessName} बद्दल काहीही विचारू शकता.`
                    : `Hello ${user.name}! I'm Hisaab, your AI business assistant for ${user.businessName}. Ask me anything!`}
                </p>
              </div>
            </div>

            {/* Example prompts */}
            <div>
              <p className="text-xs text-subtle mb-2">{t('ask.examples', language)}</p>
              <div className="space-y-2">
                {examples.map((key) => (
                  <button key={key} onClick={() => send(t(key, language))}
                    className="card card-hover w-full text-left px-4 py-3 text-sm text-muted hover:text-ink">
                    {t(key, language)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <ChatBubble key={i} role={msg.role} content={msg.content} timestamp={msg.time} />
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="card flex items-center gap-2 px-4 py-3 rounded-full">
              <Loader2 size={14} strokeWidth={1.75} className="text-accent animate-spin" />
              <span className="text-sm text-muted">{t('ask.thinking', language)}</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-line bg-background/90 backdrop-blur sticky bottom-0">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <MicButton onTranscript={(text) => send(text)} language={language} />
          <div className="flex-1 flex items-center gap-2">
            <input type="text" value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder={t('ask.placeholder', language)}
              className="input flex-1 rounded-full" />
            <button onClick={() => send()} disabled={!input.trim() || loading}
              className="btn btn-md btn-primary flex-shrink-0">
              <SendHorizontal size={18} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
