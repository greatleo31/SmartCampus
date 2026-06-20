import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from './Button'

type ModalProps = {
  open: boolean
  title: string
  description?: string
  children: ReactNode
  onClose: () => void
}

export function Modal({ open, title, description, children, onClose }: ModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#08130f]/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-lg border border-[#d9dfd8] bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#edf0eb] px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-[#172235]">{title}</h2>
            {description && <p className="mt-1 text-sm text-[#667085]">{description}</p>}
          </div>
          <Button variant="ghost" className="h-8 w-8 px-0" onClick={onClose} aria-label="关闭">
            <X size={17} />
          </Button>
        </div>
        <div className="max-h-[calc(88vh-76px)] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  )
}
