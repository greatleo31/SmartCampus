import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, CalendarCheck, School, Users } from 'lucide-react'
import { campusApi } from '../api/campus'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'

export function DashboardPage() {
  const { data } = useQuery({ queryKey: ['dashboard'], queryFn: campusApi.dashboard })
  const cards = [
    { label: '教学班数量', value: data?.teachingClassCount ?? 0, icon: School, tone: 'text-teal-700 bg-teal-50' },
    { label: '学生数量', value: data?.studentCount ?? 0, icon: Users, tone: 'text-blue-700 bg-blue-50' },
    { label: '今日考勤异常', value: data?.todayAttendanceAbnormalCount ?? 0, icon: CalendarCheck, tone: 'text-amber-700 bg-amber-50' },
    { label: '高风险学生', value: data?.highRiskStudentCount ?? 0, icon: AlertTriangle, tone: 'text-red-700 bg-red-50' },
  ]
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">首页仪表盘</h1>
        <p className="text-sm text-slate-500">教学运行概览</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.label} className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-500">{item.label}</div>
                  <div className="mt-2 text-3xl font-semibold text-slate-950">{item.value}</div>
                </div>
                <div className={`rounded-md p-3 ${item.tone}`}><Icon size={22} /></div>
              </div>
            </Card>
          )
        })}
      </div>
      <Card className="p-5">
        <h2 className="mb-4 text-base font-semibold text-slate-950">最近预警</h2>
        <DataTable
          rows={(data?.recentWarnings ?? []) as unknown as Record<string, unknown>[]}
          columns={[
            { key: 'studentId', title: '学生ID' },
            { key: 'teachingClassId', title: '教学班ID' },
            { key: 'warningLevel', title: '等级' },
            { key: 'reason', title: '原因' },
            { key: 'status', title: '状态' },
          ]}
        />
      </Card>
    </div>
  )
}
