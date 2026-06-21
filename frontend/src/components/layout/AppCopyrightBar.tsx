import { cn } from '../../lib/utils'

type AppCopyrightBarProps = {
  className?: string
}

export function AppCopyrightBar({ className }: AppCopyrightBarProps) {
  return (
    <div
      className={cn(
        'sticky bottom-0 z-40 border-t border-[#cbd6d0] bg-[#eef4f8]/96 px-4 py-2 text-center text-xs font-medium text-[#446077] shadow-[0_-4px_14px_rgba(23,34,53,.07)] backdrop-blur',
        className,
      )}
    >
      SmartCampus copyright 版本v4.0
    </div>
  )
}
