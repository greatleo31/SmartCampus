import { useIsFetching, useIsMutating } from '@tanstack/react-query'
import { LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '../../lib/utils'

const SHOW_DELAY_MS = 420

type GlobalRequestLoaderProps = {
  disabled?: boolean
  className?: string
}

export function GlobalRequestLoader({ disabled = false, className }: GlobalRequestLoaderProps) {
  const pendingRequests = useIsFetching() + useIsMutating()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (disabled || pendingRequests === 0) {
      const timer = window.setTimeout(() => setVisible(false), 0)
      return () => window.clearTimeout(timer)
    }
    const timer = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [disabled, pendingRequests])

  if (!visible) return null

  return (
    <div className={cn('pointer-events-none absolute inset-0 z-30 overflow-hidden bg-white/45', className)}>
      <div className="absolute left-[58%] top-1/2 flex min-h-40 min-w-52 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-4 rounded-xl border border-[#cfd8d2] bg-white/96 px-8 py-7 text-[#344256] shadow-2xl">
        <LoaderCircle className="animate-[loader-spin_1s_linear_infinite] text-[var(--campus-green)]" size={58} />
        <div className="text-base font-semibold">正在读取数据</div>
      </div>
    </div>
  )
}
