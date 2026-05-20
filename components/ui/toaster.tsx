'use client'
import { useEffect, useState } from 'react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

let listeners: ((toast: Toast) => void)[] = []

export function toast(message: string, type: Toast['type'] = 'success') {
  const id = Math.random().toString(36).slice(2)
  listeners.forEach((fn) => fn({ id, message, type }))
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const handler = (t: Toast) => {
      setToasts((prev) => [...prev, t])
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 3500)
    }
    listeners.push(handler)
    return () => { listeners = listeners.filter((l) => l !== handler) }
  }, [])

  if (!toasts.length) return null

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-xl text-sm font-medium shadow-lg border animate-in slide-in-from-bottom-2 flex items-center gap-2 ${
            t.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-700'
              : t.type === 'error'
              ? 'bg-red-600 text-white border-red-700'
              : 'bg-stone-800 text-white border-stone-900'
          }`}
        >
          <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}</span>
          {t.message}
        </div>
      ))}
    </div>
  )
}
