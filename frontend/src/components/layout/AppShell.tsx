import { useQuery } from '@tanstack/react-query'
import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  FileText,
  Gauge,
  GraduationCap,
  LogOut,
  School,
  ShieldAlert,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { authApi } from '../../api/auth'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../lib/utils'
import { Button } from '../ui/Button'

const pathIcons: Record<string, LucideIcon> = {
  '/': Gauge,
  '/semesters': CalendarDays,
  '/courses': BookOpen,
  '/teaching-classes': School,
  '/enrollments': Users,
  '/grades': GraduationCap,
  '/attendance': ClipboardCheck,
  '/warnings': ShieldAlert,
  '/my/courses': BookOpen,
  '/my/grades': GraduationCap,
  '/my/attendance': ClipboardCheck,
  '/my/warnings': ShieldAlert,
}

const permissionIcons: Record<string, LucideIcon> = {
  'dashboard:view': Gauge,
  'semester:manage': CalendarDays,
  'course:manage': BookOpen,
  'class:manage': School,
  'enrollment:manage': Users,
  'grade:manage': GraduationCap,
  'attendance:manage': ClipboardCheck,
  'warning:view': ShieldAlert,
}

const roleLabels = {
  ADMIN: '系统管理员',
  TEACHER: '任课教师',
  STUDENT: '学生',
} as const

function getIcon(path: string, permission: string) {
  return pathIcons[path] ?? permissionIcons[permission] ?? FileText
}

function breadcrumb(pathname: string, menus: { name: string; path: string }[]) {
  if (pathname === '/profile') return '个人主页'
  const matched = menus.find((menu) => menu.path === pathname)
  return matched?.name ?? '页面未找到'
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, clearSession } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: menus = [] } = useQuery({ queryKey: ['menus'], queryFn: authApi.menus })
  const currentTitle = breadcrumb(location.pathname, menus)
  const roleText = user ? roleLabels[user.userType] : '-'

  function logout() {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[var(--paper-bg)] lg:flex">
      <aside className="bg-[var(--ink-nav)] text-white lg:min-h-screen lg:w-64 lg:shrink-0">
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--campus-green)] text-white">
            <School size={19} />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">智慧校园</div>
            <div className="truncate text-xs text-slate-300">教务运行中心</div>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto p-3 lg:block lg:space-y-1 lg:overflow-visible">
          {menus.map((menu) => {
            const Icon = getIcon(menu.path, menu.permission)
            return (
              <NavLink
                key={`${menu.path}-${menu.permission}`}
                to={menu.path}
                className={({ isActive }) => cn(
                  'flex min-w-max items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition',
                  isActive ? 'bg-white/12 text-white shadow-inner' : 'hover:bg-white/8 hover:text-white',
                )}
              >
                <Icon size={17} />
                <span>{menu.name}</span>
              </NavLink>
            )
          })}
        </nav>
      </aside>
      <main className="min-w-0 flex-1">
        <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-[#d9dfd8] bg-white px-4 py-3 lg:px-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#667085]">
              <Link className="hover:text-[var(--campus-green)]" to="/">教务工作台</Link>
              <span>/</span>
              <span className="text-[#344256]">{currentTitle}</span>
            </div>
            <div className="mt-1 truncate text-base font-semibold text-[#172235]">{currentTitle}</div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="rounded-md border border-[#d9dfd8] bg-[#f7f8f5] px-3 py-1.5 text-xs text-[#344256]">
              {roleText}
            </div>
            <Link
              to="/profile"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#d9dfd8] bg-white px-3 text-sm font-medium text-[#172235] transition hover:bg-[#f7f8f5]"
            >
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
