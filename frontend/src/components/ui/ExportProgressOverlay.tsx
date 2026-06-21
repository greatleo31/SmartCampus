import { LoaderCircle } from 'lucide-react'
import type { DownloadProgressState } from '../../hooks/useDownloadProgress'

type ExportProgressOverlayProps = {
  progress: DownloadProgressState
}

export function ExportProgressOverlay({ progress }: ExportProgressOverlayProps) {
  if (!progress) return null

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center rounded-lg bg-white/72">
      <div className="flex min-w-72 flex-col items-center gap-4 rounded-xl border border-[#cfd8d2] bg-white px-8 py-7 text-[#344256] shadow-2xl">
        <LoaderCircle className="animate-[loader-spin_1s_linear_infinite] text-[var(--campus-green)]" size={60} />
        <div className="text-base font-semibold">{progress.label}</div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#edf0eb]">
          <div
            className="h-full rounded-full bg-[var(--campus-green)] transition-[width] duration-200"
            style={{ width: `${progress.progress}%` }}
          />
        </div>
        <div className="text-sm font-medium text-[#667085]">{progress.progress}%</div>
      </div>
    </div>
  )
}
