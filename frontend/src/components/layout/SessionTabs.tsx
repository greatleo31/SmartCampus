import { X } from 'lucide-react'
import { useEffect, useMemo, useReducer, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { Menu } from '../../types/api'
import { cn } from '../../lib/utils'
import { SESSION_TABS_STORAGE_KEY } from '../../lib/sessionTabs'

type TabItem = {
  path: string
  title: string
}

type SessionTabsProps = {
  menus: Menu[]
  titleMap?: Record<string, string>
  homePath?: string
}

type TabAction =
  | { type: 'visit'; item: TabItem }
  | { type: 'replace'; items: TabItem[] }

function tabsReducer(state: TabItem[], action: TabAction) {
  if (action.type === 'replace') {
    return action.items
  }
  const exists = state.some((item) => item.path === action.item.path)
  return exists
    ? state.map((item) => item.path === action.item.path ? action.item : item)
    : [...state, action.item]
}

export function SessionTabs({ menus, titleMap = {}, homePath = '/' }: SessionTabsProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [tabs, dispatchTabs] = useReducer(tabsReducer, undefined, () => {
    const raw = sessionStorage.getItem(SESSION_TABS_STORAGE_KEY)
    if (!raw) return []
    try {
      return JSON.parse(raw) as TabItem[]
    } catch {
      return []
    }
  })
  const [menu, setMenu] = useState<{ x: number; y: number; path: string } | null>(null)
  const currentTitle = useMemo(() => {
    return titleMap[location.pathname] ?? menus.find((item) => item.path === location.pathname)?.name ?? '页面'
  }, [location.pathname, menus, titleMap])

  useEffect(() => {
    if (location.pathname === '/login') return
    dispatchTabs({ type: 'visit', item: { path: location.pathname, title: currentTitle } })
  }, [currentTitle, location.pathname])

  useEffect(() => {
    sessionStorage.setItem(SESSION_TABS_STORAGE_KEY, JSON.stringify(tabs))
  }, [tabs])

  useEffect(() => {
    const close = () => setMenu(null)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [])

  function persist(next: TabItem[]) {
    dispatchTabs({ type: 'replace', items: next })
  }

  function closeTab(path: string) {
    const next = tabs.filter((item) => item.path !== path)
    persist(next)
    if (path === location.pathname) {
      navigate(next.at(-1)?.path ?? homePath)
    }
  }

  function closeOthers(path: string) {
    const current = tabs.find((item) => item.path === path)
    const next = current ? [current] : []
    persist(next)
    navigate(path)
  }

  function closeAll() {
    persist([])
    navigate(homePath)
  }

  if (tabs.length === 0) return null

  return (
    <div className="relative z-[20] border-b border-[#d9dfd8] bg-[#f8faf7] px-3">
      <div className="flex min-h-10 items-end gap-1 overflow-x-auto pt-1">
        {tabs.map((tab) => {
          const active = tab.path === location.pathname
          return (
            <button
              key={tab.path}
              className={cn(
                'group flex h-9 max-w-[180px] shrink-0 items-center gap-2 rounded-t-md border border-b-0 px-3 text-sm transition',
                active ? 'border-[#d9dfd8] bg-white text-[#172235]' : 'border-transparent bg-transparent text-[#667085] hover:bg-white/80',
              )}
              onClick={() => navigate(tab.path)}
              onContextMenu={(event) => {
                event.preventDefault()
                setMenu({ x: event.clientX, y: event.clientY, path: tab.path })
              }}
              title={tab.title}
            >
              <span className="truncate">{tab.title}</span>
              <span
                className="rounded p-0.5 opacity-65 hover:bg-[#edf0eb] hover:opacity-100"
                onClick={(event) => {
                  event.stopPropagation()
                  closeTab(tab.path)
                }}
              >
                <X size={13} />
              </span>
            </button>
          )
        })}
      </div>
      {menu && (
        <div className="fixed z-[70] w-36 rounded-md border border-[#d9dfd8] bg-white py-1 text-sm shadow-lg" style={{ left: menu.x, top: menu.y }}>
          <button className="block w-full px-3 py-2 text-left hover:bg-[#f2f5f1]" onClick={() => closeTab(menu.path)}>关闭当前</button>
          <button className="block w-full px-3 py-2 text-left hover:bg-[#f2f5f1]" onClick={() => closeOthers(menu.path)}>关闭其他</button>
          <button className="block w-full px-3 py-2 text-left hover:bg-[#f2f5f1]" onClick={closeAll}>关闭全部</button>
        </div>
      )}
    </div>
  )
}
