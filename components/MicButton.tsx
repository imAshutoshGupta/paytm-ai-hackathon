'use client'

import { useState, useRef } from 'react'
import { Mic, Square, Loader2 } from 'lucide-react'
import clsx from 'clsx'

interface MicButtonProps {
  onTranscript: (text: string) => void
  language?: string
  disabled?: boolean
}

export default function MicButton({ onTranscript, disabled }: MicButtonProps) {
  const [recording, setRecording] = useState(false)
  const [processing, setProcessing] = useState(false)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  async function startRecording() {
    if (disabled || recording) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      chunksRef.current = []
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      mr.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop())
        setProcessing(true)
        try {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
          const fd = new FormData()
          fd.append('audio', blob, 'recording.webm')
          const res = await fetch('/api/sarvam/stt', { method: 'POST', body: fd })
          const data = await res.json()
          if (data.transcript) onTranscript(data.transcript)
        } catch {
          /* silent — user can type manually */
        } finally {
          setProcessing(false)
        }
      }
      mr.start()
      mediaRef.current = mr
      setRecording(true)
    } catch {
      alert('Microphone access denied. Please allow mic permissions.')
    }
  }

  function stopRecording() {
    mediaRef.current?.stop()
    mediaRef.current = null
    setRecording(false)
  }

  return (
    <button
      onClick={recording ? stopRecording : startRecording}
      disabled={disabled || processing}
      aria-label={recording ? 'Stop recording' : 'Start recording'}
      className={clsx(
        'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border transition-colors duration-150',
        recording
          ? 'animate-pulse-ring border-danger/30 bg-danger text-white'
          : processing
          ? 'cursor-not-allowed border-line bg-line-soft text-subtle'
          : 'border-line bg-surface text-ink hover:border-subtle hover:bg-line-soft',
      )}
    >
      {processing ? (
        <Loader2 size={17} strokeWidth={1.75} className="animate-spin" />
      ) : recording ? (
        <Square size={15} strokeWidth={2} fill="currentColor" />
      ) : (
        <Mic size={17} strokeWidth={1.75} />
      )}
    </button>
  )
}
