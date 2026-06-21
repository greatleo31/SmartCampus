import { useQuery } from '@tanstack/react-query'
import {
  Award,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  FileText,
  Gauge,
  GraduationCap,
  LogOut,
  Menu,
  School,
  Search,
  ShieldAlert,
  UserRound,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { authApi } from '../../api/auth'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../lib/utils'
import { AppCopyrightBar } from './AppCopyrightBar'
import { GlobalRequestLoader } from './GlobalRequestLoader'
import { SessionTabs } from './SessionTabs'

const roleLabels = {
  ADMIN: '管理员',
  TEACHER: '教师',
  STUDENT: '学生',
} as const

const iconByPath: Record<string, LucideIcon> = {
  '/': Gauge,
  '/schedule': CalendarDays,
  '/class-schedule': CalendarDays,
  '/calendar': CalendarDays,
  '/my/courses': BookOpen,
  '/my/grades': GraduationCap,
  '/gpa-ranking': Award,
  '/exams': ClipboardCheck,
  '/makeup-exams': ClipboardCheck,
  '/semesters': CalendarDays,
  '/courses': BookOpen,
  '/teaching-classes': School,
  '/enrollments': FileText,
  '/grades': GraduationCap,
  '/attendance': ClipboardCheck,
  '/warnings': ShieldAlert,
}

const titleMap: Record<string, string> = {
  '/': '主页',
  '/profile': '个人主页',
  '/schedule': '个人课表',
  '/class-schedule': '班级课表',
  '/calendar': '校历',
  '/gpa-ranking': '绩点查询',
  '/my/grades': '成绩查询',
  '/exams': '考试',
  '/makeup-exams': '补考',
}

function titleFor(pathname: string, menus: { name: string; path: string }[]) {
  return titleMap[pathname] ?? menus.find((menu) => menu.path === pathname)?.name ?? '页面未找到'
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, clearSession } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const { data: menus = [] } = useQuery({ queryKey: ['menus', user?.id], queryFn: authApi.menus, enabled: Boolean(user?.id) })
  const visibleMenus = useMemo(() => {
    const base = menus
      .filter((menu) => !menu.path.startsWith('/admin') && menu.path !== '/profile')
      .map((menu) => ({ ...menu, name: normalizedMenuName(menu.path, menu.name, user?.userType) }))
    if (!base.some((menu) => menu.path === '/')) {
      return [{ name: normalizedMenuName('/', '主页', user?.userType), path: '/', permission: 'dashboard:view' }, ...base]
    }
    return base
  }, [menus, user?.userType])
  const currentTitle = titleFor(location.pathname, visibleMenus)

  function logout() {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[var(--paper-bg)] lg:flex">
      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/35 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col overflow-hidden bg-[#102238] text-white shadow-xl transition-[width,transform] duration-200 lg:static lg:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full',
        collapsed ? 'w-[78px]' : 'w-72',
      )}>
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/12 text-white ring-1 ring-white/20">
            <School size={23} />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-base font-semibold">智慧校园</div>
              <div className="truncate text-xs text-white/60">教务服务门户</div>
            </div>
          )}
          <button className="ml-auto rounded-md p-2 text-white/80 hover:bg-white/10 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="关闭菜单">
            <X size={18} />
          </button>
        </div>
        <div className="px-4 pt-5">
          <button
            className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-white/12 bg-white/8 text-sm text-white/82 backdrop-blur transition hover:border-white/30 hover:bg-white/16 hover:shadow-[inset_0_1px_0_rgba(255,255,255,.22)]"
            onClick={() => setCollapsed((value) => !value)}
            title={collapsed ? '展开导航' : '收起导航'}
          >
            <Menu size={17} />
            {!collapsed && <span>收起导航</span>}
          </button>
        </div>
        <nav className="mt-8 flex-1 overflow-y-auto px-4 pb-6">
          <div className={cn('mb-3 px-2 text-xs font-semibold text-white/38', collapsed && 'sr-only')}>常用功能</div>
          <div className="space-y-1.5">
            {visibleMenus.map((menu) => {
              const Icon = iconByPath[menu.path] ?? Search
              return (
                <NavLink
                  key={`${menu.path}-${menu.permission}`}
                  to={menu.path}
                  end={menu.path === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => cn(
                    'group flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-white/76 transition',
                    'hover:bg-white/12 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,.18)]',
                    isActive && 'bg-[var(--campus-green)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,.22)]',
                    collapsed && 'justify-center px-0',
                  )}
                  title={collapsed ? menu.name : undefined}
                >
                  <Icon className="shrink-0 transition group-hover:scale-105" size={18} />
                  {!collapsed && <span className="truncate">{menu.name}</span>}
                </NavLink>
              )
            })}
          </div>
        </nav>
      </aside>
      <main className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="relative z-[80] flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-[#d9dfd8] bg-white/95 px-4 py-3 backdrop-blur lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button className="rounded-md border border-[#d9dfd8] bg-white p-2 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="打开菜单">
              <Menu size={18} />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold text-[#172235]">{currentTitle}</h1>
            </div>
          </div>
          <div className="relative">
            <button
              className="flex h-10 items-center gap-2 rounded-md border border-[#d9dfd8] bg-white px-2.5 text-left text-sm hover:bg-[#f7f8f5]"
              onClick={() => setUserOpen((value) => !value)}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--campus-green)] text-white"><UserRound size={16} /></span>
              <span className="hidden min-w-0 sm:block">
                <span className="block max-w-[120px] truncate font-medium text-[#172235]">{user?.realName ?? '-'}</span>
                <span className="block text-xs text-[#667085]">{user ? roleLabels[user.userType] : '-'}</span>
              </span>
            </button>
            {userOpen && (
              <div className="absolute right-0 z-[90] mt-2 w-44 rounded-md border border-[#d9dfd8] bg-white py-1 text-sm shadow-lg">
                <button className="block w-full px-3 py-2 text-left hover:bg-[#f2f5f1]" onClick={() => { setUserOpen(false); navigate('/profile') }}>个人主页</button>
                {user?.permissions.includes('admin:access') && (
                  <button className="block w-full px-3 py-2 text-left hover:bg-[#f2f5f1]" onClick={() => { setUserOpen(false); navigate('/admin') }}>管理员后台</button>
                )}
                <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-[var(--risk-red)] hover:bg-red-50" onClick={logout}><LogOut size={15} />退出账号</button>
              </div>
            )}
          </div>
        </header>
        <SessionTabs menus={[...visibleMenus, { name: '个人主页', path: '/profile', permission: 'profile' }]} titleMap={titleMap} />
        <div className="relative flex-1 p-4 lg:p-6">
          {children}
          <GlobalRequestLoader disabled={location.pathname === '/'} />
        </div>
        <AppCopyrightBar />
      </main>
    </div>
  )
}

function normalizedMenuName(path: string, fallback: string, userType?: string) {
  if (userType !== 'STUDENT') {
    return fallback
  }
  const map: Record<string, string> = {
    '/': '主页',
    '/calendar': '校历',
    '/class-schedule': '班级课表',
    '/schedule': '个人课表',
    '/my/courses': '我的选课',
    '/exams': '考试',
    '/my/grades': '成绩查询',
    '/gpa-ranking': '绩点查询',
    '/makeup-exams': '补考',
  }
  return map[path] ?? fallback
}
