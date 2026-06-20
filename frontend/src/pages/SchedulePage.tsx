import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { campusApi } from '../api/campus'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import type { ScheduleItem } from '../types/api'

const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const sections = Array.from({ length: 14 }, (_, index) => index + 1)
const palette = ['#d9f0e5', '#e5eefb', '#fff0c2', '#f4e8ff', '#fde7df', '#e2f5f2']

export function SchedulePage({ title = '课表中心' }: { title?: string }) {
  const { data = [] } = useQuery({ queryKey: ['mySchedules'], queryFn: campusApi.mySchedules })
  const [selected, setSelected] = useState<ScheduleItem | null>(null)
  const byDay = useMemo(() => {
    const map = new Map<number, ScheduleItem[]>()
    data.forEach((item) => {
      map.set(item.dayOfWeek, [...(map.get(item.dayOfWeek) ?? []), item])
    })
    return map
  }, [data])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-[#172235]">{title}</h1>
      </div>
      <Card className="p-4">
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
