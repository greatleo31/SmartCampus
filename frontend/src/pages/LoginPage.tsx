import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'

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
    <div className="grid min-h-screen place-items-center bg-[linear-gradient(135deg,#f6f7f9_0%,#e7f3f0_50%,#fff7e8_100%)] px-4">
      <Card className="w-full max-w-sm p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-950">SmartCampus</h1>
          <p className="mt-1 text-sm text-slate-500">高校教务系统</p>
        </div>
        <form className="space-y-4" onSubmit={submit}>
          <label className="block space-y-1 text-sm font-medium text-slate-700">
            <span>用户名</span>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} required />
          </label>
          <label className="block space-y-1 text-sm font-medium text-slate-700">
            <span>密码</span>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <Button className="w-full" disabled={loading}>{loading ? '登录中' : '登录'}</Button>
        </form>
      </Card>
    </div>
  )
}
