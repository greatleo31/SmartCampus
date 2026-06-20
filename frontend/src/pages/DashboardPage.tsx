import { Fragment, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, CalendarDays, CloudRain, GraduationCap, Megaphone, School, TrendingUp, Users } from 'lucide-react'
import { campusApi } from '../api/campus'
import { Card } from '../components/ui/Card'
import type { AnnouncementCategory, ScheduleItem, TrendPoint } from '../types/api'

const categoryTabs: { key: AnnouncementCategory; label: string }[] = [
  { key: 'NOTICE', label: '通知' },
  { key: 'MEETING', label: '会议' },
  { key: 'PUBLICITY', label: '公示' },
  { key: 'LECTURE', label: '讲座' },
]

const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const sectionRows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

function greeting() {
  const hour = new Date().getHours()
  if (hour < 11) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
}

export function DashboardPage() {
  const [category, setCategory] = useState<AnnouncementCategory>('NOTICE')
  const { data } = useQuery({ queryKey: ['dashboard'], queryFn: campusApi.dashboard })
  const { data: weather } = useQuery({ queryKey: ['weather', 'guangzhou'], queryFn: campusApi.weather })
  const { data: announcements = [] } = useQuery({ queryKey: ['announcements', category], queryFn: () => campusApi.announcements(category) })
  const { data: schedules = [] } = useQuery({ queryKey: ['mySchedules'], queryFn: campusApi.mySchedules })
  const scheduleMap = useMemo(() => {
    const map = new Map<string, ScheduleItem[]>()
    schedules.forEach((item) => {
      for (let section = item.startSection; section <= item.endSection; section++) {
        const key = `${item.dayOfWeek}-${section}`
        map.set(key, [...(map.get(key) ?? []), item])
      }
    })
    return map
  }, [schedules])

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-lg bg-[#dff8eb] px-5 py-6 lg:px-9">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="text-3xl font-semibold text-[#27365f] lg:text-4xl">
            {data?.greetingName ?? '同学'}，{greeting()}
          </h1>
          <div className="flex items-center gap-3 text-[#4f625b]">
            <CloudRain className="text-sky-400" size={44} />
            <div>
              <div className="text-base text-[#344256]">{weather?.city ?? '广州'}</div>
              <div className="text-sm">
                {weather?.weather ?? '天气加载中'}
                {typeof weather?.temperature === 'number' ? `，${weather.temperature.toFixed(1)}℃` : ''}
                {weather?.stale ? '（缓存）' : ''}
              </div>
            </div>
          </div>
        </div>
      </section>

      {data?.showKpis && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: '教学班数量', value: data.teachingClassCount, icon: School, tone: 'text-[var(--campus-green)] bg-emerald-50' },
            { label: data.role === 'TEACHER' ? '授课学生数' : '学生数量', value: data.studentCount, icon: Users, tone: 'text-[var(--academic-blue)] bg-blue-50' },
            { label: '今日考勤异常', value: data.todayAttendanceAbnormalCount, icon: CalendarDays, tone: 'text-[var(--notice-amber)] bg-amber-50' },
            { label: '高风险学生', value: data.highRiskStudentCount, icon: AlertTriangle, tone: 'text-[var(--risk-red)] bg-red-50' },
          ].map((item) => {
            const Icon = item.icon
            return (
              <Card key={item.label} className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm text-[#667085]">{item.label}</div>
                    <div className="mt-2 text-3xl font-semibold text-[#172235]">{item.value}</div>
                  </div>
                  <div className={`rounded-xl p-3 ${item.tone}`}><Icon size={24} /></div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Megaphone size={20} className="text-[var(--campus-green)]" />
              <h2 className="text-lg font-semibold text-[#172235]">公告栏</h2>
            </div>
            <button className="text-sm text-[#51627a] hover:text-[var(--campus-green)]">查看更多</button>
          </div>
          <div className="mb-4 flex gap-6 border-b border-[#d9dfd8]">
            {categoryTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setCategory(tab.key)}
                className={`pb-2 text-base font-semibold ${category === tab.key ? 'border-b-4 border-[var(--campus-green)] text-[var(--campus-green)]' : 'text-[#5d6470]'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {announcements.slice(0, 6).map((item) => (
              <div key={item.id} className="grid gap-2 text-sm sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="truncate text-base text-[#172235]">{item.pinned === 1 ? '【置顶】' : ''}{item.title}</div>
                <div className="text-[#344256]">{item.publishTime?.slice(0, 10) ?? '-'}</div>
              </div>
            ))}
            {announcements.length === 0 && <div className="py-8 text-center text-sm text-[#667085]">暂无公告</div>}
          </div>
        </Card>

        {data?.showKpis ? <TrendCard trends={data.trends ?? []} role={data.role} /> : <ScheduleSummary schedules={schedules} />}
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <GraduationCap size={20} className="text-[var(--campus-green)]" />
          <h2 className="text-lg font-semibold text-[#172235]">{scheduleTitle(data?.role)}</h2>
        </div>
        <ScheduleGrid scheduleMap={scheduleMap} />
      </Card>
    </div>
  )
}

function TrendCard({ trends, role }: { trends: TrendPoint[]; role?: string }) {
  const max = Math.max(1, ...trends.flatMap((item) => [item.attendanceAbnormalCount, item.warningCount, item.lowScoreCount]))
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp size={20} className="text-[var(--campus-green)]" />
        <h2 className="text-lg font-semibold text-[#172235]">{role === 'TEACHER' ? '授课班级趋势' : '全校运行趋势'}</h2>
      </div>
      <div className="flex h-64 items-end gap-3 border-b border-l border-[#d9dfd8] px-3 pb-3">
        {trends.map((item) => (
          <div key={item.label} className="flex flex-1 flex-col items-center justify-end gap-1">
            <div className="flex h-44 items-end gap-1">
              <div className="w-2 rounded-t bg-[#0f6b4f]" style={{ height: `${(item.attendanceAbnormalCount / max) * 100}%` }} />
              <div className="w-2 rounded-t bg-[#d7a547]" style={{ height: `${(item.warningCount / max) * 100}%` }} />
              <div className="w-2 rounded-t bg-[#c43d32]" style={{ height: `${(item.lowScoreCount / max) * 100}%` }} />
            </div>
            <span className="text-xs text-[#667085]">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-[#667085]">
        <span>绿色 考勤异常</span>
        <span>琥珀 预警</span>
        <span>红色 低分</span>
      </div>
    </Card>
  )
}

function ScheduleSummary({ schedules }: { schedules: ScheduleItem[] }) {
  return (
    <Card className="p-5">
      <h2 className="mb-4 text-lg font-semibold text-[#172235]">今日课程</h2>
      <div className="space-y-3">
        {schedules.slice(0, 4).map((item) => (
          <div key={item.id} className="rounded-lg bg-[#f2f5f1] px-4 py-3">
            <div className="font-medium text-[#172235]">{item.courseName}</div>
            <div className="mt-1 text-sm text-[#667085]">{dayNames[item.dayOfWeek - 1]} 第{item.startSection}-{item.endSection}节 · {item.classroom}</div>
          </div>
        ))}
        {schedules.length === 0 && <div className="py-8 text-center text-sm text-[#667085]">暂无课表</div>}
      </div>
    </Card>
  )
}

function scheduleTitle(role?: string) {
  if (role === 'ADMIN') return '全校课表概览'
  if (role === 'TEACHER') return '教学课表'
  return '我的课表'
}

function ScheduleGrid({ scheduleMap }: { scheduleMap: Map<string, ScheduleItem[]> }) {
  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[860px] grid-cols-[64px_repeat(7,1fr)] gap-2">
        <div />
        {dayNames.map((day) => <div key={day} className="text-center font-semibold text-[#0f6b4f]">{day}</div>)}
        {sectionRows.map((section) => (
          <Fragment key={`row-${section}`}>
            <div key={`label-${section}`} className="flex h-16 items-center justify-center text-[#2b7d92]">{section}</div>
            {dayNames.map((_, dayIndex) => {
              const items = scheduleMap.get(`${dayIndex + 1}-${section}`) ?? []
              return (
                <div key={`${dayIndex}-${section}`} className="min-h-16 rounded-md bg-[#edf5fb] p-1">
                  {items.map((item) => (
                    <div key={`${item.id}-${section}`} className="rounded-md bg-[#b7eeb7] px-2 py-1 text-xs leading-5 text-[#172235]">
                      {item.courseName}，{item.classroom}
                    </div>
                  ))}
                </div>
              )
            })}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
