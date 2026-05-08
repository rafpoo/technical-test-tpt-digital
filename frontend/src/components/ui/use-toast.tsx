import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type ToastVariant = 'default' | 'destructive'

type ToastInput = {
  title: string
  description?: string
  variant?: ToastVariant
}

type ToastMessage = ToastInput & {
  id: number
}

type ToastContextValue = {
  toast: (input: ToastInput) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([])

  const value = useMemo(
    () => ({
      toast: (input: ToastInput) => {
        const id = Date.now()
        setMessages((current) => [...current, { id, ...input }])
        window.setTimeout(() => {
          setMessages((current) => current.filter((message) => message.id !== id))
        }, 3500)
      },
    }),
    [],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'rounded-lg border bg-white p-4 text-sm shadow-lg',
              message.variant === 'destructive'
                ? 'border-red-200 text-red-900'
                : 'border-slate-200 text-slate-900',
            )}
          >
            <div className="font-semibold">{message.title}</div>
            {message.description ? (
              <div className="mt-1 text-muted-foreground">{message.description}</div>
            ) : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used inside ToastProvider')
  }

  return context
}
