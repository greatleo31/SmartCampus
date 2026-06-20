import { ExternalLink } from 'lucide-react'
import { Button } from './Button'
import { Modal } from './Modal'

type ExternalLinkConfirmProps = {
  url: string | null
  onClose: () => void
}

export function ExternalLinkConfirm({ url, onClose }: ExternalLinkConfirmProps) {
  if (!url) return null
  const host = safeHost(url)

  function open() {
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
    onClose()
  }

  return (
    <Modal open title="打开外部链接" onClose={onClose}>
      <div className="space-y-5">
        <div className="rounded-md border border-[#d9dfd8] bg-[#f8faf7] px-4 py-3 text-sm leading-6 text-[#344256]">
          此链接将打开校外网站。外部网站内容由对方提供，请确认来源后继续。
        </div>
        <div>
          <div className="text-xs font-medium text-[#667085]">目标网站</div>
          <div className="mt-1 font-medium text-[#172235]">{host}</div>
          <div className="mt-2 break-all rounded-md bg-[#f2f5f1] px-3 py-2 text-sm text-[#344256]">{url}</div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button onClick={open}><ExternalLink size={16} />继续访问</Button>
        </div>
      </div>
    </Modal>
  )
}

function safeHost(url: string) {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}
