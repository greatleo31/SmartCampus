import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  CalendarDays,
  Cloud,
  CloudLightning,
  CloudRain,
  Expand,
  GraduationCap,
  IdCard,
  Megaphone,
  School,
  ShieldCheck,
  Sun,
  TrendingUp,
  UserRound,
  Users,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { campusApi } from '../api/campus'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ExternalLinkConfirm } from '../components/ui/ExternalLinkConfirm'
import { Modal } from '../components/ui/Modal'
import type { AnnouncementCategory, ProfileSecurity, ScheduleItem, TrendPoint, Weather } from '../types/api'

const categoryTabs: { key: AnnouncementCategory; label: string }[] = [
  { key: 'NOTICE', label: '通知' },
  { key: 'MEETING', label: '会议' },
  { key: 'PUBLICITY', label: '公示' },
  { key: 'LECTURE', label: '讲座' },
]

const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

const roleLabels = {
  ADMIN: '管理员',
  TEACHER: '教师',
  STUDENT: '学生',
} as const

const trendSeries = [
  { key: 'attendanceAbnormalCount', label: '考勤异常', color: '#0f6b4f' },
  { key: 'warningCount', label: '预警', color: '#b97612' },
  { key: 'absentCount', label: '旷课', color: '#c43d32' },
] as const

type TrendKey = typeof trendSeries[number]['key']

type HoverPoint = {
  x: number
  y: number
  item: TrendPoint
}

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
  const { data: profile = null } = useQuery({
    queryKey: ['profileSecurity'],
    queryFn: campusApi.profileSecurity,
    enabled: data?.role === 'STUDENT',
  })
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
          <WeatherCard weather={weather} />
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
              <Card key={item.label} className="group p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm text-[#667085]">{item.label}</div>
                    <div className="mt-2 text-3xl font-semibold text-[#172235]">{item.value}</div>
                  </div>
                  <div className={`rounded-lg p-3 ${item.tone}`}><Icon className="campus-flip-icon" size={23} /></div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <Card className="p-5">
          <div className="campus-icon-hover mb-4 flex items-center gap-2">
            <Megaphone size={20} className="campus-flip-icon text-[var(--campus-green)]" />
            <h2 className="text-lg font-semibold text-[#172235]">公告栏</h2>
          </div>
          <div className="mb-4 flex gap-5 overflow-x-auto border-b border-[#d9dfd8]">
            {categoryTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setCategory(tab.key)}
                className={`shrink-0 pb-2 text-sm font-semibold ${category === tab.key ? 'border-b-3 border-[var(--campus-green)] text-[var(--campus-green)]' : 'text-[#5d6470]'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {announcements.slice(0, 10).map((item) => (
              <button
                key={item.id}
                className="grid w-full gap-2 rounded-md px-2 py-2.5 text-left text-sm transition hover:bg-[#f2f5f1] sm:grid-cols-[1fr_auto] sm:items-center"
                title={item.title}
                onClick={() => setExternalUrl(item.sourceUrl)}
              >
                <span className="truncate text-base font-medium text-[var(--campus-green)] underline-offset-4 hover:underline">{item.pinned === 1 ? '【置顶】' : ''}{item.title}</span>
                <span className="text-[#2f3b63]">{item.publishTime?.slice(0, 10) ?? '-'}</span>
              </button>
            ))}
            {announcements.length === 0 && <div className="py-8 text-center text-sm text-[#667085]">暂无公告</div>}
          </div>
        </Card>

        {data?.showKpis ? (
          <TrendCard trends={data.trends ?? []} role={data.role} />
        ) : data?.role === 'STUDENT' ? (
          <StudentProfileCard profile={profile} />
        ) : (
          <ScheduleSummary schedules={schedules} />
        )}
      </div>

      {data?.role !== 'ADMIN' && (
        <Card className="p-5">
          <div className="campus-icon-hover mb-4 flex items-center gap-2">
            <GraduationCap size={20} className="campus-flip-icon text-[var(--campus-green)]" />
            <h2 className="text-lg font-semibold text-[#172235]">{data?.role === 'TEACHER' ? '教学课表' : '我的课表'}</h2>
          </div>
          <ScheduleSummary schedules={schedules} compact />
        </Card>
      )}
      <ExternalLinkConfirm url={externalUrl} onClose={() => setExternalUrl(null)} />
    </div>
  )
}

type WeatherKind = 'sunny' | 'cloudy' | 'rain' | 'thunder'

const weatherMeta = {
  sunny: { icon: Sun, className: 'weather-card-sunny' },
  cloudy: { icon: Cloud, className: 'weather-card-cloudy' },
  rain: { icon: CloudRain, className: 'weather-card-rain' },
  thunder: { icon: CloudLightning, className: 'weather-card-thunder' },
} as const

function WeatherCard({ weather }: { weather?: Weather }) {
  const kind = weatherKind(weather?.weather)
  const meta = weatherMeta[kind]
  const Icon = meta.icon
  const showRain = kind === 'rain' || kind === 'thunder'

  return (
    <div className={`weather-card campus-icon-hover ${meta.className}`}>
      {showRain && (
        <div className="weather-rain" aria-hidden="true">
          {Array.from({ length: 16 }, (_, index) => (
            <span
              key={index}
              style={{
                left: `${8 + index * 5.7}%`,
                animationDelay: `${(index % 6) * 0.16}s`,
                animationDuration: `${0.76 + (index % 4) * 0.08}s`,
              }}
            />
          ))}
        </div>
      )}
      {kind === 'thunder' && <span className="weather-lightning" aria-hidden="true" />}
      <Icon className="campus-flip-icon relative z-10 shrink-0 text-current" size={34} />
      <div className="relative z-10 min-w-0">
        <div className="text-sm font-semibold text-current">{weather?.city ?? '广州'}实时天气</div>
        <div className="mt-0.5 text-sm opacity-80">
          {weather?.weather ?? '加载中'}
          {typeof weather?.temperature === 'number' ? ` · ${weather.temperature.toFixed(1)}℃` : ''}
          {weather?.stale ? ' · 缓存' : ''}
        </div>
      </div>
    </div>
  )
}

function weatherKind(value?: string): WeatherKind {
  if (!value) return 'cloudy'
  if (value.includes('雷')) return 'thunder'
  if (value.includes('雨')) return 'rain'
  if (value.includes('晴')) return 'sunny'
  if (value.includes('阴') || value.includes('云')) return 'cloudy'
  return 'cloudy'
}

function StudentProfileCard({ profile }: { profile: ProfileSecurity | null }) {
  const navigate = useNavigate()
  const rows = [
    { label: '学号', value: profile?.studentNo ?? profile?.username ?? '-', icon: IdCard },
    { label: '姓名', value: profile?.realName ?? '-', icon: UserRound },
    { label: '班级', value: profile?.className ?? '-', icon: School },
    { label: '角色', value: profile?.userType ? roleLabels[profile.userType] : '学生', icon: ShieldCheck },
  ]

  return (
    <Card className="overflow-hidden p-0">
      <button
        type="button"
        className="block w-full p-5 text-left transition hover:bg-[#fbfcfa] focus:outline-none focus:ring-2 focus:ring-emerald-200"
        onClick={() => navigate('/profile')}
        aria-label="查看个人主页"
      >
        <div className="campus-icon-hover mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[var(--campus-green)]">个人信息</h2>
            <div className="mt-2 h-1 w-20 bg-[var(--campus-green)]" />
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#e6f4eb] text-[var(--campus-green)]">
            <UserRound className="campus-flip-icon" size={25} />
          </div>
        </div>
        <div className="grid gap-3">
          {rows.map((row) => {
            const Icon = row.icon
            return (
              <div key={row.label} className="flex items-center gap-3 rounded-md bg-[#f8faf7] px-3 py-2.5">
                <Icon className="shrink-0 text-[var(--campus-green)]" size={18} />
                <span className="w-10 shrink-0 text-sm text-[#667085]">{row.label}</span>
                <span className="min-w-0 truncate font-semibold text-[#2f3b63]">{row.value}</span>
              </div>
            )
          })}
        </div>
      </button>
      <button
        type="button"
        className="block w-full border-t border-[#d9dfd8] bg-[#dcefe8] px-4 py-4 text-left text-[var(--campus-green)]"
        onClick={() => navigate('/profile')}
      >
        <div className="overflow-hidden">
          <span className="security-marquee-track">
            <span>非涉密平台，严禁处理、传输国家秘密</span>
            <span aria-hidden="true">非涉密平台，严禁处理、传输国家秘密</span>
          </span>
        </div>
      </button>
    </Card>
  )
}

function TrendCard({ trends, role }: { trends: TrendPoint[]; role?: string }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="campus-icon-hover flex min-w-0 items-center gap-2">
          <TrendingUp size={20} className="campus-flip-icon text-[var(--campus-green)]" />
          <h2 className="truncate text-lg font-semibold text-[#172235]">{role === 'TEACHER' ? '授课班级趋势' : '全校运行趋势'}</h2>
        </div>
        <Button variant="secondary" className="shrink-0" onClick={() => setExpanded(true)}>
          <Expand size={16} />
          放大
        </Button>
      </div>
      <button
        type="button"
        className="block w-full rounded-md text-left focus:outline-none focus:ring-2 focus:ring-emerald-200"
        onClick={() => setExpanded(true)}
        aria-label="放大趋势图"
      >
        <LineChart trends={trends} animated />
      </button>
      <TrendValues trends={trends} />
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-[#667085]">
        {trendSeries.map((item) => <Legend key={item.key} color={item.color} label={item.label} />)}
      </div>
      <Modal open={expanded} title={role === 'TEACHER' ? '授课班级趋势' : '全校运行趋势'} onClose={() => setExpanded(false)}>
        <LineChart trends={trends} width={640} height={280} animated />
        <TrendValues trends={trends} />
      </Modal>
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
          {trends.map((item, index) => (
            <tr key={`${item.label}-${index}`}>
              <td className="px-3 py-2 text-[#344256]">{item.label}</td>
              <td className="px-3 py-2 text-[#344256]">{item.attendanceAbnormalCount}</td>
              <td className="px-3 py-2 text-[#344256]">{item.warningCount}</td>
              <td className="px-3 py-2 text-[#344256]">{item.absentCount}</td>
            </tr>
          ))}
          {trends.length === 0 && (
            <tr>
              <td className="px-3 py-6 text-center text-[#667085]" colSpan={4}>暂无趋势数据</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function LineChart({ trends, width = 520, height = 220, animated = false }: { trends: TrendPoint[]; width?: number; height?: number; animated?: boolean }) {
  const padding = 30
  const [hover, setHover] = useState<HoverPoint | null>(null)
  const max = Math.max(1, ...trends.flatMap((item) => [item.attendanceAbnormalCount, item.warningCount, item.absentCount]))
  const chart = useMemo(() => {
    const x = (index: number) => padding + (index * (width - padding * 2)) / Math.max(1, trends.length - 1)
    const y = (value: number) => height - padding - (value / max) * (height - padding * 2)
    const lines = trendSeries.map((line) => ({
      ...line,
      d: trends.map((item, index) => `${index === 0 ? 'M' : 'L'} ${x(index)} ${y(item[line.key])}`).join(' '),
      dots: trends.map((item, index) => ({ x: x(index), y: y(item[line.key]), value: item[line.key], label: item.label })),
    }))
    const hoverPoints = trends.map((item, index) => ({
      x: x(index),
      y: Math.min(...trendSeries.map((line) => y(item[line.key]))),
      item,
    }))
    return { lines, hoverPoints }
  }, [height, max, trends, width])

  const tooltipX = hover ? Math.min(width - 162, Math.max(12, hover.x - 78)) : 0
  const tooltipY = hover ? Math.max(10, hover.y - 72) : 0

  return (
    <div className="overflow-x-auto">
      <svg
        className={width > 560 ? 'min-w-[640px]' : 'min-w-[520px]'}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="趋势曲线图"
        onMouseLeave={() => setHover(null)}
      >
        <rect x="0" y="0" width={width} height={height} rx="8" fill="#f8faf7" />
        {[0, 1, 2, 3].map((line) => {
          const y = padding + line * ((height - padding * 2) / 3)
          return <line key={line} x1={padding} x2={width - padding} y1={y} y2={y} stroke="#d9dfd8" strokeDasharray="4 4" />
        })}
        {chart.lines.map((line) => (
          <g key={line.key}>
            <path
              className={animated ? 'trend-line-animated' : undefined}
              d={line.d}
              fill="none"
              stroke={line.color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
            />
            {line.dots.map((dot) => (
              <circle key={`${line.key}-${dot.label}`} cx={dot.x} cy={dot.y} r="4" fill={line.color} stroke="#fff" strokeWidth="1.5" />
            ))}
          </g>
        ))}
        {trends.map((item, index) => {
          const x = padding + (index * (width - padding * 2)) / Math.max(1, trends.length - 1)
          return <text key={`${item.label}-${index}`} x={x} y={height - 8} textAnchor="middle" fontSize="11" fill="#667085">{item.label}</text>
        })}
        {chart.hoverPoints.map((point, index) => {
          const hitWidth = (width - padding * 2) / Math.max(1, trends.length - 1)
          return (
            <rect
              key={`${point.item.label}-${index}`}
              x={point.x - hitWidth / 2}
              y={0}
              width={hitWidth}
              height={height}
              fill="transparent"
              onMouseEnter={() => setHover(point)}
              onMouseMove={() => setHover(point)}
            />
          )
        })}
        {hover && (
          <g pointerEvents="none">
            <line x1={hover.x} x2={hover.x} y1={padding} y2={height - padding} stroke="#9aa6a0" strokeDasharray="3 3" />
            <rect x={tooltipX} y={tooltipY} width="150" height="64" rx="8" fill="#172235" opacity="0.92" />
            <text x={tooltipX + 10} y={tooltipY + 18} fill="#fff" fontSize="12" fontWeight="600">{hover.item.label}</text>
            {trendSeries.map((line, index) => (
              <text key={line.key} x={tooltipX + 10} y={tooltipY + 34 + index * 13} fill="#e9eef0" fontSize="11">
                {line.label}：{hover.item[line.key as TrendKey]}
              </text>
            ))}
          </g>
        )}
        {trends.length === 0 && <text x={width / 2} y={height / 2} textAnchor="middle" fontSize="13" fill="#667085">暂无趋势数据</text>}
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
