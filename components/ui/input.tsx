import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-stone-700 mb-1.5">{label}</label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-3.5 py-2.5 border rounded-lg text-sm transition-colors bg-white',
            'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent',
            'placeholder:text-stone-400',
            error ? 'border-red-300' : 'border-stone-200',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
