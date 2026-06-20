import { useQuery } from '@tanstack/react-query'
import {
  Bell,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  FileText,
  Gauge,
  GraduationCap,
  LayoutGrid,
  LogOut,
  Menu,
  School,
  Settings,
  ShieldAlert,
  UserCog,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { authApi } from '../../api/auth'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../lib/utils'
import { Button } from '../ui/Button'

const iconByPath: Record<string, LucideIcon> = {
  '/': Gauge,
  '/schedule': CalendarDays,
  '/semesters': CalendarDays,
  '/courses': BookOpen,
  '/teaching-classes': School,
  '/enrollments': Users,
  '/grades': GraduationCap,
  '/attendance': ClipboardCheck,
  '/warnings': ShieldAlert,
  '/profile': UserRound,
  '/admin': LayoutGrid,
  '/admin/announcements': Bell,
  '/admin/configs': Settings,
  '/admin/users': UserCog,
  '/admin/roles': ShieldAlert,
  '/admin/schedules': CalendarDays,
  '/my/grades': GraduationCap,
  '/my/attendance': ClipboardCheck,
  '/my/warnings': ShieldAlert,
}

const roleLabels = {
  ADMIN: '管理员',
  TEACHER: '教师',
  STUDENT: '学生',
} as const

const groupRules: { key: string; title: string; paths: string[] }[] = [
  { key: 'student', title: '学生管理', paths: ['/schedule', '/my/grades', '/my/attendance', '/my/warnings', '/enrollments', '/grades', '/attendance', '/warnings'] },
  { key: 'class', title: '班级管理', paths: ['/teaching-classes', '/courses', '/semesters', '/admin/schedules'] },
  { key: 'system', title: '系统管理', paths: ['/admin', '/admin/announcements', '/admin/configs', '/admin/users', '/admin/roles'] },
]

function titleFor(pathname: string, menus: { name: string; path: string }[]) {
  if (pathname === '/') return '我的主页'
  if (pathname === '/profile') return '个人主页'
  if (pathname === '/admin') return '管理员后台'
  if (pathname === '/schedule') return '课表中心'
  const matched = menus.find((menu) => menu.path === pathname)
  return matched?.name ?? '页面未找到'
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, clearSession } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data: menus = [] } = useQuery({ queryKey: ['menus'], queryFn: authApi.menus })
  const currentTitle = titleFor(location.pathname, menus)
  const groupedMenus = useMemo(() => {
    const withAdminRoot = menus.some((menu) => menu.path === '/admin')
      ? menus
      : user?.permissions.includes('admin:access')
        ? [...menus, { name: '管理员后台', path: '/admin', permission: 'admin:access' }]
        : menus
    return groupRules.map((group) => ({
      ...group,
      items: withAdminRoot.filter((menu) => group.paths.includes(menu.path)),
    })).filter((group) => group.items.length > 0)
  }, [menus, user?.permissions])
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ student: true, class: true, system: true })

  function logout() {
    clearSession()
    navigate('/login', { replace: true })
  }

  function toggleGroup(key: string) {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="min-h-screen bg-[var(--paper-bg)] lg:flex">
      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/35 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col overflow-hidden bg-[linear-gradient(180deg,rgba(8,68,50,0.96),rgba(12,76,58,0.88)),url(/icons.svg)] text-white shadow-2xl transition-[width,transform] duration-200 lg:static lg:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full',
        collapsed ? 'w-[84px]' : 'w-72',
      )}>
        <div className="flex h-20 items-center gap-3 border-b border-white/12 px-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/16 text-white shadow-inner ring-1 ring-white/25 backdrop-blur">
            <School size={23} />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-base font-semibold">智慧校园</div>
              <div className="truncate text-xs text-emerald-50/75">教务运行中心</div>
            </div>
          )}
          <button className="ml-auto rounded-md p-2 text-white/80 hover:bg-white/12 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="关闭菜单">
            <X size={18} />
          </button>
        </div>
        <div className="px-4 pt-5">
          <button
            className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-white/14 bg-white/10 text-sm text-white/85 backdrop-blur transition hover:bg-white/18 hover:shadow-[inset_0_1px_0_rgba(255,255,255,.28),0_10px_28px_rgba(0,0,0,.18)]"
            onClick={() => setCollapsed((value) => !value)}
            title={collapsed ? '展开导航' : '收起导航'}
          >
            <Menu size={17} />
            {!collapsed && <span>收起导航</span>}
          </button>
        </div>
        <nav className="mt-6 flex-1 overflow-y-auto px-4 pb-6">
          <NavLink
            to="/"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => cn(
              'mb-5 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition',
              'border border-white/12 bg-white/8 backdrop-blur hover:border-white/35 hover:bg-white/18 hover:shadow-[inset_0_1px_0_rgba(255,255,255,.34),0_14px_32px_rgba(5,45,33,.28)]',
              isActive && 'bg-white/20 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.35),0_12px_28px_rgba(0,0,0,.22)]',
              collapsed && 'justify-center px-0',
            )}
          >
            <Gauge size={19} />
            {!collapsed && '我的主页'}
          </NavLink>
          {groupedMenus.map((group) => {
            const active = group.items.some((item) => item.path === location.pathname)
            const open = collapsed ? true : openGroups[group.key] || active
            return (
              <div key={group.key} className="mb-4">
                {!collapsed && (
                  <button
                    className="mb-2 flex w-full items-center justify-between rounded-lg px-2 py-2 text-xs font-semibold text-emerald-50/70 hover:bg-white/8"
                    onClick={() => toggleGroup(group.key)}
                  >
                    <span>{group.title}</span>
                    <ChevronDown className={cn('transition', open && 'rotate-180')} size={15} />
                  </button>
                )}
                {open && (
                  <div className="space-y-1.5">
                    {group.items.map((menu) => {
                      const Icon = iconByPath[menu.path] ?? FileText
                      return (
                        <NavLink
                          key={`${menu.path}-${menu.permission}`}
                          to={menu.path}
                          end={menu.path === '/admin'}
                          onClick={() => setMobileOpen(false)}
                          className={({ isActive }) => cn(
                            'group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-white/84 transition',
                            'hover:bg-white/16 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,.32),0_10px_24px_rgba(0,0,0,.16)]',
                            isActive && 'bg-white/22 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.35),0_10px_22px_rgba(0,0,0,.2)]',
                            collapsed && 'justify-center px-0',
                          )}
                          title={collapsed ? menu.name : undefined}
                        >
                          <Icon className="shrink-0 transition group-hover:scale-110" size={18} />
                          {!collapsed && <span className="truncate">{menu.name}</span>}
                        </NavLink>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
        <div className="border-t border-white/12 p-4">
          <Link to="/profile" className={cn('flex items-center gap-3 rounded-xl bg-white/10 px-3 py-3 backdrop-blur hover:bg-white/16', collapsed && 'justify-center px-0')} title={user?.realName}>
            <UserRound size={19} />
            {!collapsed && (
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{user?.realName}</div>
                <div className="text-xs text-white/65">{user ? roleLabels[user.userType] : '-'}</div>
              </div>
            )}
          </Link>
        </div>
      </aside>
      <main className="min-w-0 flex-1">
        <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-[#d9dfd8] bg-white/92 px-4 py-3 backdrop-blur lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button className="rounded-md border border-[#d9dfd8] bg-white p-2 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="打开菜单">
              <Menu size={18} />
            </button>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#667085]">
                <Link className="hover:text-[var(--campus-green)]" to="/">智慧校园</Link>
                <span>/</span>
                <span className="text-[#344256]">{currentTitle}</span>
              </div>
              <div className="mt-1 truncate text-base font-semibold text-[#172235]">{currentTitle}</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="rounded-md border border-[#d9dfd8] bg-[#f7f8f5] px-3 py-1.5 text-xs text-[#344256]">
              {user ? roleLabels[user.userType] : '-'}
            </div>
            <Link to="/profile" className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#d9dfd8] bg-white px-3 text-sm font-medium text-[#172235] transition hover:bg-[#f7f8f5]">
              <UserRound size={16} />
              个人主页
            </Link>
            <Button variant="secondary" onClick={logout}><LogOut size={16} />退出</Button>
          </div>
        </header>
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  )
}
