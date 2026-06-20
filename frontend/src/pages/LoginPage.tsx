import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'
import campusAuthBg from '../assets/campus-auth-bg.png'

export function LoginPage() {
  const navigate = useNavigate()
  const { setSession } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await authApi.login(username, password)
      setSession(result.token, result.user)
      navigate('/', { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center text-white"
      style={{ backgroundImage: `linear-gradient(90deg, rgba(5, 45, 33, 0.88) 0%, rgba(5, 45, 33, 0.7) 46%, rgba(5, 45, 33, 0.36) 100%), url(${campusAuthBg})` }}
    >
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <div className="min-w-0">
          <div className="text-lg font-semibold sm:text-2xl">智慧校园统一身份认证平台</div>
          <div className="mt-1 h-0.5 w-20 bg-[#d7a547]" />
        </div>
        <div className="hidden shrink-0 text-sm text-emerald-50/90 sm:block">厚德 / 博学 / 求实 / 创新</div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-88px)] max-w-7xl items-center justify-end px-5 pb-10 sm:px-8">
        <div className="w-full max-w-[420px] rounded-lg border border-white/30 bg-white/88 p-6 text-[#172235] shadow-2xl backdrop-blur-md sm:p-8">
          <div className="mb-7">
            <div className="text-sm font-medium text-[var(--campus-green)]">账号密码登录</div>
            <h1 className="mt-2 text-2xl font-semibold">统一身份认证</h1>
            <p className="mt-2 text-sm text-[#667085]">请使用校园账号进入教务运行中心</p>
          </div>
          <form className="space-y-4" onSubmit={submit}>
            <label className="block space-y-1.5 text-sm font-medium text-[#344256]">
              <span>用户名</span>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="username" />
            </label>
            <label className="block space-y-1.5 text-sm font-medium text-[#344256]">
              <span>密码</span>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            </label>
            {error && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-[var(--risk-red)]">{error}</div>}
            <Button className="h-10 w-full" disabled={loading}>{loading ? '登录中...' : '登录'}</Button>
          </form>
          <div className="mt-5 border-t border-[#d9dfd8] pt-4 text-xs leading-5 text-[#667085]">
            演示账号：admin / 123456。请勿在公共设备保存登录状态。
          </div>
        </div>
      </main>
    </div>
  )
}
