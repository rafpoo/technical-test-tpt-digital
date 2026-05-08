import { createContext } from 'react'

export type ToastVariant = 'default' | 'destructive'

export type ToastInput = {
  title: string
  description?: string
  variant?: ToastVariant
}

export type ToastMessage = ToastInput & {
  id: number
}

export type ToastContextValue = {
  toast: (input: ToastInput) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)
