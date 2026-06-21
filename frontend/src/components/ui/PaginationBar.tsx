import { Button } from './Button'

const sizeOptions = [10, 20, 50, 100]

type PaginationBarProps = {
  total: number
  page: number
  size: number
  onPageChange: (page: number) => void
  onSizeChange: (size: number) => void
}

export function PaginationBar({ total, page, size, onPageChange, onSizeChange }: PaginationBarProps) {
  const pages = Math.max(1, Math.ceil(total / size))
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#556273]">
      <div>共 {total} 条，第 {page} / {pages} 页</div>
      <div className="flex flex-wrap items-center gap-2">
        <select
          className="h-9 rounded-md border border-[#cfd8d2] bg-white px-3 text-sm text-[#172235]"
          value={size}
          onChange={(e) => onSizeChange(Number(e.target.value))}
        >
          {sizeOptions.map((option) => <option key={option} value={option}>{option} / 页</option>)}
        </select>
        <Button variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>上一页</Button>
        <Button variant="secondary" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>下一页</Button>
      </div>
    </div>
  )
}
