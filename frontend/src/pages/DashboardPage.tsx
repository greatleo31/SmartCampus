import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, CalendarCheck, ClipboardList, School, TrendingUp, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { authApi } from '../api/auth'
import { campusApi } from '../api/campus'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import type { AcademicWarning } from '../types/api'

const warningLabels = {
  LOW: '低风险',
  MEDIUM: '中风险',
  HIGH: '高风险',
} as const

const warningStyles = {
  LOW: 'border-blue-200 bg-blue-50 text-blue-700',
  MEDIUM: 'border-amber-200 bg-amber-50 text-amber-700',
  HIGH: 'border-red-200 bg-red-50 text-[var(--risk-red)]',
} as const

function WarningTag({ level }: { level: AcademicWarning['warningLevel'] }) {
  return (
    <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${warningStyles[level]}`}>
      {warningLabels[level]}
    </span>
  )
}

function percent(value: number, max: number) {
  if (max <= 0) return 0
  return Math.min(100, Math.round((value / max) * 100))
}

export function DashboardPage() {
  const { data } = useQuery({ queryKey: ['dashboard'], queryFn: campusApi.dashboard })
  const { data: menus = [] } = useQuery({ queryKey: ['menus'], queryFn: authApi.menus })
  const cards = [
    { label: '教学班数量', value: data?.teachingClassCount ?? 0, icon: School, tone: 'text-[var(--campus-green)] bg-emerald-50' },
    { label: '学生数量', value: data?.studentCount ?? 0, icon: Users, tone: 'text-[var(--academic-blue)] bg-blue-50' },
    { label: '今日考勤异常', value: data?.todayAttendanceAbnormalCount ?? 0, icon: CalendarCheck, tone: 'text-[var(--notice-amber)] bg-amber-50' },
    { label: '高风险学生', value: data?.highRiskStudentCount ?? 0, icon: AlertTriangle, tone: 'text-[var(--risk-red)] bg-red-50' },
  ]
  const abnormalRatio = percent(data?.todayAttendanceAbnormalCount ?? 0, Math.max(data?.studentCount ?? 0, 1))
  const warningRatio = percent(data?.highRiskStudentCount ?? 0, Math.max(data?.studentCount ?? 0, 1))
  const classRatio = percent(data?.teachingClassCount ?? 0, Math.max((data?.teachingClassCount ?? 0) + 4, 1))

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-[#d9dfd8] bg-white px-5 py-5 shadow-sm lg:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#172235]">教务运行工作台</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">
              汇总教学班、学生规模、考勤异常与学业预警，辅助教务人员快速定位今日需要处理的事项。
            </p>
          </div>
          <div className="flex w-full max-w-xs items-center gap-3 rounded-lg bg-[#f2f5f1] px-4 py-3 text-sm text-[#344256] lg:w-auto">
            <ClipboardList className="shrink-0 text-[var(--campus-green)]" size={22} />
            <div>
              <div className="font-medium">教学闭环</div>
              <div className="text-xs text-[#667085]">排课、选课、成绩、考勤、预警</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.label} className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="truncate text-sm text-[#667085]">{item.label}</div>
                  <div className="mt-2 text-3xl font-semibold text-[#172235]">{item.value}</div>
                </div>
                <div className={`shrink-0 rounded-md p-3 ${item.tone}`}><Icon size={22} /></div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.45fr_0.85fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-[#172235]">最近预警</h2>
              <p className="mt-1 text-sm text-[#667085]">按风险等级优先处理学业异常</p>
            </div>
            <AlertTriangle className="text-[var(--notice-amber)]" size={20} />
          </div>
          <DataTable
            rows={(data?.recentWarnings ?? []) as unknown as Record<string, unknown>[]}
            columns={[
              { key: 'studentId', title: '学生ID' },
              { key: 'teachingClassId', title: '教学班ID' },
              { key: 'warningLevel', title: '等级', render: (row) => <WarningTag level={row.warningLevel as AcademicWarning['warningLevel']} /> },
              { key: 'reason', title: '原因' },
              { key: 'status', title: '状态', render: (row) => row.status === 'OPEN' ? '待处理' : '已关闭' },
            ]}
          />
        </Card>

        <div className="space-y-5">
          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp size={19} className="text-[var(--campus-green)]" />
              <h2 className="text-base font-semibold text-[#172235]">教学闭环进度</h2>
            </div>
            {[
              { label: '教学班覆盖', value: classRatio },
              { label: '考勤异常处置', value: 100 - abnormalRatio },
              { label: '高风险跟进', value: 100 - warningRatio },
            ].map((item) => (
              <div key={item.label} className="mb-4 last:mb-0">
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-[#344256]">{item.label}</span>
                  <span className="font-medium text-[#172235]">{item.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-[#edf0eb]">
                  <div className="h-2 rounded-full bg-[var(--campus-green)]" style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-base font-semibold text-[#172235]">角色快捷入口</h2>
            <div className="divide-y divide-[#edf0eb]">
              {menus.slice(0, 5).map((menu) => (
                <Link key={`${menu.path}-${menu.permission}`} to={menu.path} className="grid gap-1 py-3 text-sm text-[#344256] hover:text-[var(--campus-green)] sm:grid-cols-[1fr_auto] sm:items-center">
                  <span className="min-w-0">{menu.name}</span>
                  <span className="min-w-0 break-all text-xs text-[#8a95a5] sm:text-right">{menu.permission}</span>
                </Link>
              ))}
              {menus.length === 0 && <div className="py-5 text-center text-sm text-[#667085]">暂无可访问菜单</div>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
