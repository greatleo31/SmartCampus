import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { campusApi } from '../api/campus'
import { Card } from '../components/ui/Card'
import type { CalendarDay } from '../types/api'

const weekDays = ['一', '二', '三', '四', '五', '六', '日']

export function CalendarPage() {
  const { data: options = [] } = useQuery({ queryKey: ['calendarOptions'], queryFn: campusApi.calendarOptions })
  const [year, setYear] = useState('2025-2026')
  const [term, setTerm] = useState(2)
  const { data } = useQuery({ queryKey: ['calendar', year, term], queryFn: () => campusApi.calendar({ academicYear: year, term }) })
  const rows = useMemo(() => buildRows(data?.days ?? []), [data?.days])
  const yearOptions = Array.from(new Set(options.map((item) => item.academicYear)))
  const termOptions = Array.from(new Set(options.filter((item) => item.academicYear === year).map((item) => item.term)))

  return (
    <div className="space-y-5">
      <Card className="p-0">
        <div className="grid gap-8 border-b border-[#d9dfd8] bg-white px-6 py-4 md:grid-cols-2">
          <label className="grid items-center gap-3 sm:grid-cols-[56px_1fr]">
            <span className="text-sm font-semibold text-[#172235]"><span className="text-red-600">*</span>学年</span>
            <select className="h-10 w-full rounded-md border border-[#cfd8d2] bg-white px-3 text-sm text-[#172235]" value={year} onChange={(e) => setYear(e.target.value)}>
              {yearOptions.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="grid items-center gap-3 sm:grid-cols-[56px_1fr]">
            <span className="text-sm font-semibold text-[#172235]"><span className="text-red-600">*</span>学期</span>
            <select className="h-10 w-full rounded-md border border-[#cfd8d2] bg-white px-3 text-sm text-[#172235]" value={term} onChange={(e) => setTerm(Number(e.target.value))}>
              {termOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>
        <div className="h-14 bg-[#f4f4f4]" />
      </Card>

      <Card className="p-0">
        <div className="max-h-[calc(100vh-230px)] overflow-auto">
          <table className="w-full min-w-[1180px] border-collapse text-center text-sm">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="text-[#172235]">
                <th className="w-24 border border-[#d9dfd8] px-3 py-2">{data?.yearLabel ?? year.slice(0, 4)}年</th>
                <th className="w-24 border border-[#d9dfd8] px-3 py-2">周次</th>
                {weekDays.map((day) => <th key={day} className="border border-[#d9dfd8] px-3 py-2">{day}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${row.weekNo}-${index}`}>
                  <td className="border border-[#d9dfd8] px-3 py-2 text-[#344256]">{row.monthLabel}</td>
                  <td className="border border-[#d9dfd8] px-3 py-2 text-[#344256]">{row.weekNo || ''}</td>
                  {row.days.map((day, dayIndex) => (
                    <td key={`${row.weekNo}-${dayIndex}-${day?.date ?? dayIndex}`} className={`border border-[#d9dfd8] px-3 py-2 ${dayClass(day)}`} title={formatCell(day, false)}>
                      {formatCell(day)}
                    </td>
                  ))}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="border border-[#d9dfd8] px-3 py-3 text-center text-red-600" colSpan={9}>对不起该学年学期校历还没有创建</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function buildRows(days: CalendarDay[]) {
  const rows: { weekNo?: number; monthLabel?: string; days: (CalendarDay | undefined)[] }[] = []
  for (let index = 0; index < days.length; index += 7) {
    const weekDays = days.slice(index, index + 7)
    while (weekDays.length < 7) weekDays.push(undefined as unknown as CalendarDay)
    rows.push({
      weekNo: weekDays.find(Boolean)?.weekNo,
      monthLabel: firstMonthLabel(weekDays),
      days: weekDays,
    })
  }
  return rows
}

function firstMonthLabel(days: (CalendarDay | undefined)[]) {
  const explicit = days.find((day) => day?.monthLabel)?.monthLabel
  if (explicit) return explicit
  const first = days.find(Boolean)
  if (!first) return ''
  return first.dayText === '01' ? `${Number(first.date.slice(5, 7))}月` : ''
}

function formatCell(day?: CalendarDay, truncate = true) {
  if (!day) return ''
  const text = `${day.dayText}${day.eventName ? `(${day.eventName})` : ''}`
  return truncate && text.length > 14 ? `${text.slice(0, 13)}...` : text
}

function dayClass(day?: CalendarDay) {
  if (!day) return 'bg-white text-[#344256]'
  if (day.dayType === 'EXAM') return 'bg-[#ffa30f] text-[#172235]'
  if (day.dayType === 'ADJUST') return 'bg-[#ffb5c0] text-[#172235]'
  if (day.dayType === 'HOLIDAY') return 'bg-[#add8e6] text-[#344256]'
  if (day.dayType === 'WEEKEND') return 'bg-[#73c982] text-[#17402f]'
  return 'bg-white text-[#344256]'
}
