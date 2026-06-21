import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { List, LayoutGrid } from 'lucide-react'
import { campusApi } from '../api/campus'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import { Modal } from '../components/ui/Modal'
import { PaginationBar } from '../components/ui/PaginationBar'
import type { ScheduleItem } from '../types/api'

const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const sections = Array.from({ length: 14 }, (_, index) => index + 1)
const palette = ['#d9f0e5', '#e5eefb', '#fff0c2', '#f4e8ff', '#fde7df', '#e2f5f2']

export function SchedulePage({ title = '个人课表', scope = 'personal' }: { title?: string; scope?: 'personal' | 'class' }) {
  const { data = [] } = useQuery({
    queryKey: [scope === 'class' ? 'classSchedules' : 'mySchedules'],
    queryFn: scope === 'class' ? campusApi.classSchedules : campusApi.mySchedules,
  })
  const { data: calendarOptions = [] } = useQuery({ queryKey: ['calendarOptions'], queryFn: campusApi.calendarOptions })
  const [selected, setSelected] = useState<ScheduleItem | null>(null)
  const [year, setYear] = useState('')
  const [term, setTerm] = useState(2)
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [view, setView] = useState<'list' | 'grid'>('list')

  const yearOptions = Array.from(new Set(calendarOptions.map((item) => item.academicYear)))
  const termOptions = Array.from(new Set(calendarOptions.filter((item) => item.academicYear === year).map((item) => item.term)))
  const filtered = useMemo(() => {
    return data.filter((item) => !year || item.semesterName === `${year}-${term}`)
  }, [data, year, term])
  const paged = useMemo(() => {
    const start = (page - 1) * size
    return filtered.slice(start, start + size)
  }, [filtered, page, size])
  const byDay = useMemo(() => {
    const map = new Map<number, ScheduleItem[]>()
    filtered.forEach((item) => {
      map.set(item.dayOfWeek, [...(map.get(item.dayOfWeek) ?? []), item])
    })
    return map
  }, [filtered])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-[#172235]">{title}</h1>
      </div>
      <Card className="p-5">
        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-[#556273]">学年</span>
            <select className={inputClass} value={year} onChange={(e) => { setYear(e.target.value); setPage(1) }}>
              <option value="">全部学年</option>
              {yearOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-[#556273]">学期</span>
            <select className={inputClass} value={term} onChange={(e) => { setTerm(Number(e.target.value)); setPage(1) }}>
              {(termOptions.length ? termOptions : [1, 2]).map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <div className="flex items-end gap-2">
            <Button variant={view === 'list' ? 'primary' : 'secondary'} onClick={() => setView('list')}><List size={16} />列表</Button>
            <Button variant={view === 'grid' ? 'primary' : 'secondary'} onClick={() => setView('grid')}><LayoutGrid size={16} />周视图</Button>
          </div>
        </div>

        {view === 'list' ? (
          <>
            <DataTable
              rows={paged as unknown as Record<string, unknown>[]}
              columns={[
                { key: 'semesterName', title: '学期' },
                { key: 'courseName', title: '课程' },
                { key: 'className', title: '教学班' },
                { key: 'teacherName', title: '任课教师' },
                { key: 'dayOfWeek', title: '星期', render: (row) => days[Number(row.dayOfWeek) - 1] ?? '-' },
                { key: 'startWeek', title: '周次', render: (row) => `第 ${row.startWeek}-${row.endWeek} 周` },
                { key: 'startSection', title: '节次', render: (row) => `第 ${row.startSection}-${row.endSection} 节` },
                { key: 'classroom', title: '教室' },
                { key: 'actions', title: '详情', render: (row) => <Button variant="ghost" onClick={() => setSelected(row as unknown as ScheduleItem)}>查看</Button> },
              ]}
            />
            <PaginationBar total={filtered.length} page={page} size={size} onPageChange={setPage} onSizeChange={(next) => { setSize(next); setPage(1) }} />
          </>
        ) : (
          <div className="overflow-auto">
            <div className="grid min-w-[1040px] grid-cols-[74px_repeat(7,minmax(130px,1fr))]">
              <div className="sticky left-0 z-20 border-b border-r border-[#d9dfd8] bg-white p-3 text-sm font-medium text-[#667085]">节次</div>
              {days.map((day) => (
                <div key={day} className="border-b border-r border-[#d9dfd8] bg-[#f7faf7] p-3 text-center text-sm font-semibold text-[#0f6b4f]">{day}</div>
              ))}
              <div className="sticky left-0 z-10 grid bg-white">
                {sections.map((section) => (
                  <div key={section} className="flex h-16 items-center justify-center border-b border-r border-[#d9dfd8] text-sm font-medium text-[#2b6f80]">
                    {section}
                  </div>
                ))}
              </div>
              {days.map((_, dayIndex) => (
                <div key={dayIndex} className="relative grid border-r border-[#d9dfd8]" style={{ gridTemplateRows: `repeat(14, 4rem)` }}>
                  {sections.map((section) => <div key={section} className="border-b border-[#edf0eb] bg-white" />)}
                  {(byDay.get(dayIndex + 1) ?? []).map((item, index) => (
                    <button
                      key={item.id}
                      className="absolute left-1 right-1 overflow-hidden rounded-md border border-white/70 px-2 py-2 text-left text-xs leading-5 text-[#172235] shadow-sm transition hover:shadow-md"
                      style={{
                        top: `${(item.startSection - 1) * 4 + 0.25}rem`,
                        height: `${(item.endSection - item.startSection + 1) * 4 - 0.5}rem`,
                        background: palette[index % palette.length],
                      }}
                      title={`${item.courseName} ${item.classroom}`}
                      onClick={() => setSelected(item)}
                    >
                      <div className="font-semibold">{item.courseName}</div>
                      <div className="mt-1 text-[#344256]">{item.className}</div>
                      <div className="text-[#667085]">第{item.startSection}-{item.endSection}节 · {item.classroom}</div>
                      <div className="text-[#667085]">{item.startWeek}-{item.endWeek}周</div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
      <ScheduleDetail item={selected} close={() => setSelected(null)} />
    </div>
  )
}

function ScheduleDetail({ item, close }: { item: ScheduleItem | null; close: () => void }) {
  if (!item) return null
  return (
    <Modal open title="课程信息" onClose={close}>
      <div className="grid gap-3 text-sm text-[#344256] sm:grid-cols-2">
        <Detail label="学期" value={item.semesterName} />
        <Detail label="课程名称" value={item.courseName} />
        <Detail label="班级名称" value={item.className} />
        <Detail label="任课教师" value={item.teacherName} />
        <Detail label="周次" value={`第 ${item.startWeek}-${item.endWeek} 周`} />
        <Detail label="节次" value={`第 ${item.startSection}-${item.endSection} 节`} />
        <Detail label="教室" value={item.classroom} />
        <Detail label="地点" value={item.location || '-'} />
      </div>
      <div className="mt-5 flex justify-end">
        <Button onClick={close}>知道了</Button>
      </div>
    </Modal>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-[#f8faf7] px-3 py-2">
      <div className="text-xs text-[#667085]">{label}</div>
      <div className="mt-1 font-medium text-[#172235]">{value}</div>
    </div>
  )
}

const inputClass = 'h-10 w-full rounded-md border border-[#cfd8d2] bg-white px-3 text-sm text-[#172235] outline-none transition focus:border-[var(--campus-green)] focus:ring-2 focus:ring-emerald-100'
