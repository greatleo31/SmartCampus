import { ArrowUp, MapPin, Mailbox, Settings } from 'lucide-react'
import { cn } from '../../lib/utils'

type SiteFooterProps = {
  variant?: 'default' | 'dark'
  className?: string
}

export function SiteFooter({ variant = 'default', className }: SiteFooterProps) {
  const dark = variant === 'dark'
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  return (
    <footer
      className={cn(
        'mt-auto overflow-hidden border-t px-4 py-10 text-sm',
        dark
          ? 'border-white/15 bg-[linear-gradient(90deg,rgba(5,68,48,.94),rgba(8,120,73,.90)),radial-gradient(circle_at_18%_20%,rgba(255,255,255,.16),transparent_24%)] text-white/90 backdrop-blur'
          : 'border-emerald-900/20 bg-[linear-gradient(90deg,rgba(7,92,60,.96),rgba(5,126,73,.92)),radial-gradient(circle_at_18%_20%,rgba(255,255,255,.15),transparent_24%)] text-white/90',
        className,
      )}
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-4 pb-8 text-center">
          <div className="flex items-center justify-center gap-4">
            <img src="/favicon.svg" alt="SmartCampus logo" className="h-16 w-16 shrink-0 rounded-xl ring-2 ring-white/45" />
            <div className="text-left">
              <div className="text-3xl font-semibold tracking-normal text-white">智慧校园</div>
              <div className="mt-1 text-base font-semibold text-white/86">SmartCampus</div>
            </div>
          </div>
          <div className="h-px w-full bg-white/20" />
        </div>
        <div className="grid gap-5 text-base font-semibold lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex flex-wrap items-center justify-center gap-x-9 gap-y-3 lg:justify-start">
            <span>联系我们</span>
            <span className="inline-flex items-center gap-2">
              <MapPin size={20} />
              地址：智慧校园
            </span>
            <span className="inline-flex items-center gap-2">
              <Mailbox size={20} />
              邮编：825300
            </span>
            <span className="inline-flex items-center gap-2">
              <Settings size={21} />
              管理登录
            </span>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-white/30 bg-white/10 px-4 py-2 text-base font-semibold text-white transition hover:bg-white/18"
            onClick={scrollTop}
          >
            <ArrowUp size={18} />
            回到顶部
          </button>
        </div>
        <div className="mt-8 border-t border-white/18 pt-6 text-center text-base font-semibold text-white">
          SCAU Copyright © 2024 SmartCampus All rights reserved 备案编号：粤ICP备05008874号 粤公安备案4401060500010
        </div>
      </div>
    </footer>
  )
}
