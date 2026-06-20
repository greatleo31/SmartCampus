import { useQuery } from '@tanstack/react-query'
import { BadgeCheck, KeyRound, ListTree, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { authApi } from '../api/auth'
import { Card } from '../components/ui/Card'
import { useAuth } from '../hooks/useAuth'

const roleLabels = {
  ADMIN: '系统管理员',
  TEACHER: '任课教师',
  STUDENT: '学生',
} as const

export function ProfilePage() {
  const { user, token } = useAuth()
  const { data: me = user } = useQuery({ queryKey: ['me'], queryFn: authApi.me, enabled: Boolean(token) })
  const { data: menus = [] } = useQuery({ queryKey: ['menus'], queryFn: authApi.menus })

  return (
    <div className="space-y-5">
      <Card className="p-5 lg:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[var(--campus-green)] text-white">
            <UserRound size={28} />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold text-[#172235]">{me?.realName ?? '-'}</h1>
            <p className="mt-1 text-sm text-[#667085]">账号 {me?.username ?? '-'}，当前身份为 {me ? roleLabels[me.userType] : '-'}</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <BadgeCheck className="text-[var(--campus-green)]" size={22} />
            <div>
              <div className="text-sm text-[#667085]">账号状态</div>
              <div className="mt-1 font-semibold text-[#172235]">正常可用</div>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <KeyRound className="text-[var(--academic-blue)]" size={22} />
            <div>
              <div className="text-sm text-[#667085]">权限数量</div>
              <div className="mt-1 font-semibold text-[#172235]">{me?.permissions.length ?? 0}</div>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <ListTree className="text-[var(--notice-amber)]" size={22} />
            <div>
              <div className="text-sm text-[#667085]">可访问菜单</div>
              <div className="mt-1 font-semibold text-[#172235]">{menus.length}</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="p-5">
          <h2 className="mb-4 text-base font-semibold text-[#172235]">基础信息</h2>
          <dl className="divide-y divide-[#edf0eb] text-sm">
            {[
              ['姓名', me?.realName ?? '-'],
              ['用户名', me?.username ?? '-'],
              ['角色', me ? roleLabels[me.userType] : '-'],
              ['角色码', me?.roles.join('、') || '-'],
            ].map(([label, value]) => (
              <div key={label} className="grid grid-cols-[88px_1fr] gap-3 py-3">
                <dt className="text-[#667085]">{label}</dt>
                <dd className="min-w-0 break-words font-medium text-[#172235]">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-base font-semibold text-[#172235]">可访问菜单</h2>
          <div className="divide-y divide-[#edf0eb]">
            {menus.map((menu) => (
              <Link key={`${menu.path}-${menu.permission}`} to={menu.path} className="grid gap-1 py-3 text-sm hover:text-[var(--campus-green)] sm:grid-cols-[1fr_auto] sm:items-center">
                <span className="font-medium text-[#172235]">{menu.name}</span>
                <span className="break-all text-xs text-[#667085]">{menu.permission}</span>
              </Link>
            ))}
            {menus.length === 0 && <div className="py-8 text-center text-sm text-[#667085]">暂无可访问菜单</div>}
          </div>
        </Card>
      </div>
    </div>
  )
}
