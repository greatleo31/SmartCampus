import { useQuery } from '@tanstack/react-query'
import { BarChart3, Bell, CalendarDays, ClipboardCheck, Gauge, Home, LogOut, Menu, Settings, ShieldAlert, UserCog, X, type LucideIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { authApi } from '../../api/auth'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../lib/utils'
import { SessionTabs } from './SessionTabs'

const adminMenus: { name: string; path: string; icon: LucideIcon }[] = [
  { name: '后台统计', path: '/admin', icon: BarChart3 },
  { name: '公告管理', path: '/admin/announcements', icon: Bell },
  { name: '用户管理', path: '/admin/users', icon: UserCog },
  { name: '角色权限', path: '/admin/roles', icon: ShieldAlert },
  { name: '系统配置', path: '/admin/configs', icon: Settings },
  { name: '课表管理', path: '/admin/schedules', icon: CalendarDays },
  { name: '考勤导入', path: '/admin/attendance-import', icon: ClipboardCheck },
  { name: '成绩导入', path: '/admin/grade-import', icon: Gauge },
  { name: '预警管理', path: '/admin/warnings', icon: ShieldAlert },
]

const titleMap = Object.fromEntries(adminMenus.map((item) => [item.path, item.name]))

export function AdminShell({ children }: { children: ReactNode }) {
  const { user, clearSession } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data: menus = [] } = useQuery({ queryKey: ['menus', user?.id], queryFn: authApi.menus, enabled: Boolean(user?.id) })
  const sessionMenus = adminMenus.map((item) => ({ name: item.name, path: item.path, permission: 'admin:access' }))
  const currentTitle = titleMap[location.pathname] ?? '管理员后台'

  function logout() {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#f3f6f3] lg:flex">
      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/35 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col bg-[#101828] text-white shadow-xl transition-[width,transform] duration-200 lg:static lg:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full',
        collapsed ? 'w-[78px]' : 'w-64',
      )}>
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--campus-green)]"><ShieldAlert size={19} /></div>
          {!collapsed && <div className="font-semibold">管理员后台</div>}
          <button className="ml-auto rounded-md p-2 text-white/80 hover:bg-white/10 lg:hidden" onClick={() => setMobileOpen(false)}><X size={18} /></button>
        </div>
        <div className="px-4 pt-4">
          <button className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-white/12 bg-white/8 text-sm text-white/82 hover:bg-white/14" onClick={() => setCollapsed((value) => !value)}>
            <Menu size={17} />{!collapsed && '收起侧栏'}
          </button>
        </div>
        <nav className="mt-6 flex-1 space-y-1.5 overflow-y-auto px-4 pb-6">
          {adminMenus.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) => cn(
                  'flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-white/74 hover:bg-white/12 hover:text-white',
                  isActive && 'bg-[var(--campus-green)] text-white',
                  collapsed && 'justify-center px-0',
                )}
                title={collapsed ? item.name : undefined}
              >
                <Icon size={18} />
                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            )
          })}
        </nav>
      </aside>
      <main className="min-w-0 flex-1">
        <header className="relative z-[80] flex min-h-16 items-center justify-between border-b border-[#d9dfd8] bg-white px-4 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button className="rounded-md border border-[#d9dfd8] bg-white p-2 lg:hidden" onClick={() => setMobileOpen(true)}><Menu size={18} /></button>
            <h1 className="truncate text-base font-semibold text-[#172235]">{currentTitle}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d9dfd8] bg-white px-3 text-sm hover:bg-[#f7f8f5]" onClick={() => navigate('/')}>
              <Home size={16} />返回前台
            </button>
            <button className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d9dfd8] bg-white px-3 text-sm text-[var(--risk-red)] hover:bg-red-50" onClick={logout}>
              <LogOut size={16} />退出
            </button>
          </div>
        </header>
        <SessionTabs menus={[...menus, ...sessionMenus]} titleMap={titleMap} homePath="/admin" />
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  )
}
