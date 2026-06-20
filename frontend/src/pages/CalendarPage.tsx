import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { campusApi } from '../api/campus'
import { Card } from '../components/ui/Card'

type CalendarEvent = {
  事项?: string
  日期?: string
  说明?: string
}

const weekDays = ['一', '二', '三', '四', '五', '六', '日']

export function CalendarPage() {
  const [year, setYear] = useState('2025-2026')
  const [term, setTerm] = useState('2')
  const { data = [] } = useQuery({ queryKey: ['readonly', '/api/calendar'], queryFn: () => campusApi.readOnly('/api/calendar') })
  const eventMap = useMemo(() => {
    const events = Array.isArray(data) ? data as CalendarEvent[] : []
    return new Map(events.map((item) => [item.日期, item]))
  }, [data])
  const weeks = useMemo(() => buildWeeks(2026, 1, eventMap), [eventMap])

  return (
    <div className="space-y-5">
      <Card className="p-4">
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[#344256]">学年</span>
            <select className="h-10 w-full rounded-md border border-[#cfd8d2] bg-white px-3 text-sm" value={year} onChange={(e) => setYear(e.target.value)}>
              <option>2025-2026</option>
              <option>2026-2027</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[#344256]">学期</span>
            <select className="h-10 w-full rounded-md border border-[#cfd8d2] bg-white px-3 text-sm" value={term} onChange={(e) => setTerm(e.target.value)}>
              <option value="1">1</option>
              <option value="2">2</option>
            </select>
          </label>
          <button className="h-10 rounded-md bg-[var(--academic-blue)] px-4 text-sm font-medium text-white">查询</button>
        </div>
      </Card>

      <Card className="p-0">
        <div className="overflow-auto">
          <table className="w-full min-w-[1040px] border-collapse text-center text-sm">
            <thead>
              <tr className="bg-[#f7faf7] text-[#344256]">
                <th className="border border-[#d9dfd8] px-3 py-2">{year.slice(0, 4)}年</th>
                <th className="border border-[#d9dfd8] px-3 py-2">周次</th>
                {weekDays.map((day) => <th key={day} className="border border-[#d9dfd8] px-3 py-2">{day}</th>)}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week) => (
                <tr key={week.weekNo}>
                  <td className="border border-[#d9dfd8] px-3 py-2 text-[#556273]">{week.monthLabel}</td>
                  <td className="border border-[#d9dfd8] px-3 py-2 text-[#556273]">{week.weekNo}</td>
                  {week.days.map((day) => (
                    <td key={day.date} className={`border border-[#d9dfd8] px-3 py-2 ${day.className}`} title={day.event?.说明 || day.event?.事项 || ''}>
                      {day.label}{day.event?.事项 ? `(${shortEvent(day.event.事项)})` : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function buildWeeks(year: number, startMonth: number, eventMap: Map<string | undefined, CalendarEvent>) {
  const start = new Date(year, startMonth, 23)
  const rows = []
  for (let week = 1; week <= 20; week++) {
    const days = []
    for (let index = 0; index < 7; index++) {
      const date = new Date(start)
      date.setDate(start.getDate() + (week - 1) * 7 + index)
      const iso = formatDate(date)
      const event = eventMap.get(iso)
      days.push({
        date: iso,
        label: String(date.getDate()).padStart(2, '0'),
        event,
        className: dayClass(date, event),
      })
    }
    rows.push({
      weekNo: week,
      monthLabel: week === 1 || days[0].label === '01' || days.some((day) => day.label === '01') ? `${days[0].date.slice(5, 7)}月` : '',
      days,
    })
  }
  return rows
}

function formatDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function dayClass(date: Date, event?: CalendarEvent) {
  if (event?.事项?.includes('考试')) return 'bg-[#ffa81d] text-[#172235]'
  if (event) return 'bg-[#aeddea] text-[#344256]'
  if (date.getDay() === 0 || date.getDay() === 6) return 'bg-[#75c985] text-[#17402f]'
  return 'bg-white text-[#556273]'
}

function shortEvent(value: string) {
  return value.replace('期末', '').replace('教学', '').slice(0, 5)
}
