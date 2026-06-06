'use client'

import clsx from 'clsx'

interface ChatBubbleProps {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

export default function ChatBubble({ role, content, timestamp }: ChatBubbleProps) {
  const isUser = role === 'user'

  return (
    <div className={clsx('flex animate-fade-up', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="mr-2.5 mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-line bg-surface text-[11px] font-semibold text-accent">
          H
        </div>
      )}
      <div
        className={clsx(
          'max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'rounded-br-md bg-ink text-white'
            : 'rounded-bl-md border border-line bg-surface text-ink',
        )}
      >
        <p className="whitespace-pre-wrap">{content}</p>
        {timestamp && (
          <p className={clsx('mt-1 text-[11px]', isUser ? 'text-white/50' : 'text-subtle')}>
            {timestamp}
          </p>
        )}
      </div>
    </div>
  )
}
