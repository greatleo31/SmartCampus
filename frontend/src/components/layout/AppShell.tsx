import { useQuery } from '@tanstack/react-query'
import { BookOpen, CalendarDays, ClipboardCheck, Gauge, GraduationCap, LogOut, School, ShieldAlert, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { authApi } from '../../api/auth'
import { cn } from '../../lib/utils'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/Button'

const iconMap = [Gauge, CalendarDays, BookOpen, School, Users, GraduationCap, ClipboardCheck, ShieldAlert]

export function AppShell({ children }: { children: ReactNode }) {
  const { user, clearSession } = useAuth()
  const navigate = useNavigate()
  const { data: menus = [] } = useQuery({ queryKey: ['menus'], queryFn: authApi.menus })

  function logout() {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen lg:flex">
      <aside className="border-r border-slate-200 bg-white lg:w-64">
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-teal-700 text-white">
            <School size={19} />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-950">SmartCampus</div>
            <div className="text-xs text-slate-500">{user?.userType}</div>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto p-3 lg:block lg:space-y-1">
          {menus.map((menu, index) => {
            const Icon = iconMap[index % iconMap.length]
            return (
              <NavLink
                key={`${menu.path}-${menu.permission}`}
                to={menu.path}
                className={({ isActive }) => cn(
                  'flex min-w-max items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-600',
                  isActive ? 'bg-teal-50 text-teal-800' : 'hover:bg-slate-50',
                )}
              >
                <Icon size={17} />
                {menu.name}
              </NavLink>
            )
          })}
        </nav>
      </aside>
      <main className="min-w-0 flex-1">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
          <div>
            <div className="text-sm font-semibold text-slate-950">{user?.realName}</div>
            <div className="text-xs text-slate-500">{user?.username}</div>
          </div>
          <Button variant="secondary" onClick={logout}><LogOut size={16} />退出</Button>
        </header>
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  )
}
