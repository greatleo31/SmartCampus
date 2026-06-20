import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-[var(--campus-green)] text-white hover:bg-[var(--campus-green-dark)]',
    secondary: 'border border-[#d9dfd8] bg-white text-[#172235] hover:bg-[#f7f8f5]',
    danger: 'bg-[var(--risk-red)] text-white hover:bg-[#a9332b]',
    ghost: 'bg-transparent text-[#344256] hover:bg-[#eef2ed]',
  }
  return (
    <button
      className={cn('inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium tracking-normal transition disabled:cursor-not-allowed disabled:opacity-60', variants[variant], className)}
      {...props}
    />
  )
}
