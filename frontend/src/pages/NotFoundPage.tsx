import { Home, LogOut, SearchX } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useAuth } from '../hooks/useAuth'

export function NotFoundPage() {
  const { clearSession } = useAuth()
  const navigate = useNavigate()

  function relogin() {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center">
      <Card className="w-full max-w-xl p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-[#f2f5f1] text-[var(--campus-green)]">
          <SearchX size={30} />
        </div>
        <h1 className="mt-5 text-2xl font-semibold text-[#172235]">未找到对应教务页面</h1>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[var(--campus-green)] px-3 text-sm font-medium text-white hover:bg-[var(--campus-green-dark)]" to="/">
            <Home size={16} />
            返回首页
          </Link>
          <Button variant="secondary" onClick={relogin}><LogOut size={16} />退出登录</Button>
        </div>
      </Card>
    </div>
  )
}
