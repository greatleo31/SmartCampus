import type { ReactNode } from 'react'
import { displayValue } from '../../lib/utils'

type Column<T> = {
  key: keyof T | string
  title: string
  render?: (row: T) => ReactNode
}

type DataTableProps<T> = {
  columns: Column<T>[]
  rows: T[]
}

export function DataTable<T extends Record<string, unknown>>({ columns, rows }: DataTableProps<T>) {
  return (
    <div className="w-full max-w-full overflow-x-auto rounded-lg border border-[#d9dfd8]">
      <table className="w-full min-w-[560px] divide-y divide-[#d9dfd8] bg-white text-left text-sm">
        <thead className="bg-[#f2f5f1] text-xs font-semibold text-[#556273]">
          <tr>
            {columns.map((column) => <th key={String(column.key)} className="whitespace-nowrap px-4 py-3">{column.title}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#edf0eb]">
          {rows.map((row, index) => (
            <tr key={String(row.id ?? index)} className="hover:bg-[#f7f8f5]">
              {columns.map((column) => (
                <td key={String(column.key)} className="whitespace-nowrap px-4 py-3 text-[#344256]">
                  {column.render ? column.render(row) : displayValue(row[column.key])}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td className="px-4 py-8 text-center text-slate-500" colSpan={columns.length}>暂无数据</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
