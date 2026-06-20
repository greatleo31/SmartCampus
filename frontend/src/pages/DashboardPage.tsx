import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, CalendarDays, CloudRain, GraduationCap, Megaphone, School, TrendingUp, Users } from 'lucide-react'
import { campusApi } from '../api/campus'
import { Card } from '../components/ui/Card'
import { ExternalLinkConfirm } from '../components/ui/ExternalLinkConfirm'
import type { AnnouncementCategory, ScheduleItem, TrendPoint } from '../types/api'

const categoryTabs: { key: AnnouncementCategory; label: string }[] = [
  { key: 'NOTICE', label: '通知' },
  { key: 'MEETING', label: '会议' },
  { key: 'PUBLICITY', label: '公示' },
  { key: 'LECTURE', label: '讲座' },
]

const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

function greeting() {
  const hour = new Date().getHours()
  if (hour < 11) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
}

export function DashboardPage() {
  const [category, setCategory] = useState<AnnouncementCategory>('NOTICE')
  const [externalUrl, setExternalUrl] = useState<string | null>(null)
  const { data } = useQuery({ queryKey: ['dashboard'], queryFn: campusApi.dashboard })
  const { data: weather } = useQuery({ queryKey: ['weather', 'guangzhou'], queryFn: campusApi.weather })
  const { data: announcements = [] } = useQuery({ queryKey: ['announcements', category], queryFn: () => campusApi.announcements(category) })
  const { data: schedules = [] } = useQuery({ queryKey: ['mySchedules'], queryFn: campusApi.mySchedules })
  const roleName = data?.role === 'TEACHER' ? '老师' : data?.role === 'ADMIN' ? '管理员' : '同学'

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-[#d9dfd8] bg-[#e6f4eb] px-5 py-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#172235] lg:text-3xl">
              {data?.greetingName ?? roleName}，{greeting()}
            </h1>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-white/70 bg-white/60 px-4 py-3">
            <CloudRain className="text-[#2f80c0]" size={34} />
            <div>
              <div className="text-sm font-medium text-[#172235]">{weather?.city ?? '广州'}实时天气</div>
              <div className="text-sm text-[#556273]">
                {weather?.weather ?? '加载中'}
                {typeof weather?.temperature === 'number' ? ` · ${weather.temperature.toFixed(1)}℃` : ''}
                {weather?.stale ? ' · 缓存' : ''}
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
                  <div className={`rounded-lg p-3 ${item.tone}`}><Icon size={23} /></div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <Megaphone size={20} className="text-[var(--campus-green)]" />
            <h2 className="text-lg font-semibold text-[#172235]">公告栏</h2>
          </div>
          <div className="mb-4 flex gap-5 border-b border-[#d9dfd8]">
            {categoryTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setCategory(tab.key)}
                className={`pb-2 text-sm font-semibold ${category === tab.key ? 'border-b-3 border-[var(--campus-green)] text-[var(--campus-green)]' : 'text-[#5d6470]'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {announcements.slice(0, 8).map((item) => (
              <button
                key={item.id}
                className="grid w-full gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-[#f2f5f1] sm:grid-cols-[1fr_auto] sm:items-center"
                title={item.title}
                onClick={() => setExternalUrl(item.sourceUrl)}
              >
                <span className="truncate text-base font-medium text-[var(--campus-green)] underline-offset-4 hover:underline">{item.pinned === 1 ? '【置顶】' : ''}{item.title}</span>
                <span className="text-[#667085]">{item.publishTime?.slice(0, 10) ?? '-'}</span>
              </button>
            ))}
            {announcements.length === 0 && <div className="py-8 text-center text-sm text-[#667085]">暂无公告</div>}
          </div>
        </Card>

        {data?.showKpis ? <TrendCard trends={data.trends ?? []} role={data.role} /> : <ScheduleSummary schedules={schedules} />}
      </div>

      {data?.role !== 'ADMIN' && (
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <GraduationCap size={20} className="text-[var(--campus-green)]" />
            <h2 className="text-lg font-semibold text-[#172235]">{data?.role === 'TEACHER' ? '教学课表' : '我的课表'}</h2>
          </div>
          <ScheduleSummary schedules={schedules} compact />
        </Card>
      )}
      <ExternalLinkConfirm url={externalUrl} onClose={() => setExternalUrl(null)} />
    </div>
  )
}

function TrendCard({ trends, role }: { trends: TrendPoint[]; role?: string }) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp size={20} className="text-[var(--campus-green)]" />
        <h2 className="text-lg font-semibold text-[#172235]">{role === 'TEACHER' ? '授课班级趋势' : '全校运行趋势'}</h2>
      </div>
      <LineChart trends={trends} />
      <TrendValues trends={trends} />
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-[#667085]">
        <Legend color="#0f6b4f" label="考勤异常" />
        <Legend color="#b97612" label="预警" />
        <Legend color="#c43d32" label="旷课" />
      </div>
    </Card>
  )
}

function TrendValues({ trends }: { trends: TrendPoint[] }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-md border border-[#d9dfd8]">
      <table className="w-full min-w-[480px] text-left text-xs">
        <thead className="bg-[#f2f5f1] text-[#556273]">
          <tr>
            <th className="px-3 py-2">日期</th>
            <th className="px-3 py-2">考勤异常</th>
            <th className="px-3 py-2">预警</th>
            <th className="px-3 py-2">旷课</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#edf0eb]">
          {trends.map((item) => (
            <tr key={item.label}>
              <td className="px-3 py-2 text-[#344256]">{item.label}</td>
              <td className="px-3 py-2 text-[#344256]">{item.attendanceAbnormalCount}</td>
              <td className="px-3 py-2 text-[#344256]">{item.warningCount}</td>
              <td className="px-3 py-2 text-[#344256]">{item.absentCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function LineChart({ trends }: { trends: TrendPoint[] }) {
  const width = 520
  const height = 220
  const padding = 28
  const max = Math.max(1, ...trends.flatMap((item) => [item.attendanceAbnormalCount, item.warningCount, item.absentCount]))
  const points = useMemo(() => {
    const x = (index: number) => padding + (index * (width - padding * 2)) / Math.max(1, trends.length - 1)
    const y = (value: number) => height - padding - (value / max) * (height - padding * 2)
    const series = [
      { key: 'attendanceAbnormalCount', color: '#0f6b4f' },
      { key: 'warningCount', color: '#b97612' },
      { key: 'absentCount', color: '#c43d32' },
    ] as const
    return series.map((line) => ({
      ...line,
      d: trends.map((item, index) => `${index === 0 ? 'M' : 'L'} ${x(index)} ${y(item[line.key])}`).join(' '),
      dots: trends.map((item, index) => ({ x: x(index), y: y(item[line.key]), value: item[line.key], label: item.label })),
    }))
  }, [max, trends])

  return (
    <div className="overflow-x-auto">
      <svg className="min-w-[520px]" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="趋势曲线图">
        <rect x="0" y="0" width={width} height={height} rx="8" fill="#f8faf7" />
        {[0, 1, 2, 3].map((line) => {
          const y = padding + line * ((height - padding * 2) / 3)
          return <line key={line} x1={padding} x2={width - padding} y1={y} y2={y} stroke="#d9dfd8" strokeDasharray="4 4" />
        })}
        {points.map((line) => (
          <g key={line.key}>
            <path d={line.d} fill="none" stroke={line.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {line.dots.map((dot) => (
              <circle key={`${line.key}-${dot.label}`} cx={dot.x} cy={dot.y} r="3.5" fill={line.color}>
                <title>{dot.label}：{dot.value}</title>
              </circle>
            ))}
          </g>
        ))}
        {trends.map((item, index) => {
          const x = padding + (index * (width - padding * 2)) / Math.max(1, trends.length - 1)
          return <text key={item.label} x={x} y={height - 8} textAnchor="middle" fontSize="11" fill="#667085">{item.label}</text>
        })}
      </svg>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />{label}</span>
}

function ScheduleSummary({ schedules, compact = false }: { schedules: ScheduleItem[]; compact?: boolean }) {
  return (
    <div className={compact ? 'grid gap-3 md:grid-cols-2 xl:grid-cols-4' : 'space-y-3'}>
      {schedules.slice(0, compact ? 4 : 5).map((item) => (
        <div key={item.id} className="rounded-lg bg-[#f2f5f1] px-4 py-3">
          <div className="font-medium text-[#172235]">{item.courseName}</div>
          <div className="mt-1 text-sm text-[#667085]">{dayNames[item.dayOfWeek - 1]} 第{item.startSection}-{item.endSection}节 · {item.classroom}</div>
        </div>
      ))}
      {schedules.length === 0 && <div className="py-8 text-center text-sm text-[#667085]">暂无课表</div>}
    </div>
  )
}
