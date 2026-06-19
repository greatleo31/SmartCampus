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
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 bg-white text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
          <tr>
            {columns.map((column) => <th key={String(column.key)} className="whitespace-nowrap px-4 py-3">{column.title}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, index) => (
            <tr key={String(row.id ?? index)} className="hover:bg-slate-50">
              {columns.map((column) => (
                <td key={String(column.key)} className="whitespace-nowrap px-4 py-3 text-slate-700">
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
