import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { campusApi } from '../api/campus'
import { Card } from '../components/ui/Card'
import type { ScheduleItem } from '../types/api'

const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const sections = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export function SchedulePage() {
  const { data = [] } = useQuery({ queryKey: ['mySchedules'], queryFn: campusApi.mySchedules })
  const map = useMemo(() => {
    const next = new Map<string, ScheduleItem[]>()
    data.forEach((item) => {
      for (let section = item.startSection; section <= item.endSection; section++) {
        const key = `${item.dayOfWeek}-${section}`
        next.set(key, [...(next.get(key) ?? []), item])
      }
    })
    return next
  }, [data])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-[#172235]">课表中心</h1>
        <p className="mt-1 text-sm text-[#667085]">按当前身份展示个人课表或教学课表</p>
      </div>
      <Card className="p-5">
        <div className="overflow-x-auto">
          <div className="grid min-w-[920px] grid-cols-[72px_repeat(7,1fr)] gap-2">
            <div className="text-sm text-[#667085]">第16周</div>
            {days.map((day) => <div key={day} className="text-center text-lg font-semibold text-[#007d59]">{day}</div>)}
            {sections.map((section) => (
              <div key={`section-${section}`} className="contents">
                <div className="flex min-h-20 items-center justify-center text-lg text-[#2b7d92]">{section}</div>
                {days.map((_, index) => {
                  const items = map.get(`${index + 1}-${section}`) ?? []
                  return (
                    <div key={`${index}-${section}`} className="min-h-20 rounded-md bg-[#edf5fb] p-2">
                      {items.map((item) => (
                        <div key={`${item.id}-${section}`} className="rounded-xl bg-[#ffdc6f] px-3 py-2 text-sm leading-5 text-[#172235]">
                          <div className="line-clamp-2">{item.courseName}</div>
                          <div className="mt-1 text-xs text-[#344256]">{item.classroom}</div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
