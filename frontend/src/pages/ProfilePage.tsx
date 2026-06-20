import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BadgeCheck, KeyRound, Mail, ShieldCheck, UserRound } from 'lucide-react'
import { campusApi } from '../api/campus'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { useAuth } from '../hooks/useAuth'

const roleLabels = {
  ADMIN: '系统管理员',
  TEACHER: '任课教师',
  STUDENT: '学生',
} as const

type ModalType = 'password' | 'email' | 'wechat' | null

export function ProfilePage() {
  const { user } = useAuth()
  const { data = null } = useQuery({ queryKey: ['profileSecurity'], queryFn: campusApi.profileSecurity })
  const [modal, setModal] = useState<ModalType>(null)

  return (
    <div className="space-y-5">
      <Card className="p-5 lg:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[var(--campus-green)] text-white">
              <UserRound size={28} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-semibold text-[#172235]">{data?.realName ?? user?.realName ?? '-'}</h1>
              <p className="mt-1 text-sm text-[#667085]">账号 {data?.username ?? user?.username ?? '-'} · {data ? roleLabels[data.userType] : user ? roleLabels[user.userType] : '-'}</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-[#0f6b4f]">
            <BadgeCheck size={16} />账号正常
          </div>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-5">
          <h2 className="mb-4 text-base font-semibold text-[#172235]">基础信息</h2>
          <dl className="divide-y divide-[#edf0eb] text-sm">
            {[
              ['姓名', data?.realName ?? user?.realName ?? '-'],
              ['用户名', data?.username ?? user?.username ?? '-'],
              ['身份', data ? roleLabels[data.userType] : user ? roleLabels[user.userType] : '-'],
              ['校园身份', data?.campusIdentity || '未绑定'],
              ['最近登录', data?.lastLoginTime?.replace('T', ' ').slice(0, 16) || '暂无记录'],
            ].map(([label, value]) => (
              <div key={label} className="grid grid-cols-[88px_1fr] gap-3 py-3">
                <dt className="text-[#667085]">{label}</dt>
                <dd className="min-w-0 break-words font-medium text-[#172235]">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-base font-semibold text-[#172235]">账号安全</h2>
          <div className="space-y-3">
            <SecurityRow icon={<KeyRound size={19} />} title="登录密码" text="建议定期修改，避免与其他系统复用。" action="修改密码" onClick={() => setModal('password')} />
            <SecurityRow icon={<Mail size={19} />} title="绑定邮箱" text={data?.email || '未绑定邮箱'} action={data?.email ? '更新邮箱' : '绑定邮箱'} onClick={() => setModal('email')} />
            <SecurityRow icon={<ShieldCheck size={19} />} title="微信/校园身份" text={data?.wechatBound ? `已绑定${data.campusIdentity ? ` · ${data.campusIdentity}` : ''}` : '未绑定，当前仅保存业务状态'} action="维护绑定" onClick={() => setModal('wechat')} />
          </div>
        </Card>
      </div>

      <SecurityModal type={modal} close={() => setModal(null)} />
    </div>
  )
}

function SecurityRow({ icon, title, text, action, onClick }: { icon: React.ReactNode; title: string; text: string; action: string; onClick: () => void }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[#edf0eb] bg-[#fbfcfa] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 gap-3">
        <div className="mt-0.5 text-[var(--campus-green)]">{icon}</div>
        <div className="min-w-0">
          <div className="font-medium text-[#172235]">{title}</div>
          <div className="mt-1 break-words text-sm text-[#667085]">{text}</div>
        </div>
      </div>
      <Button variant="secondary" onClick={onClick}>{action}</Button>
    </div>
  )
}

function SecurityModal({ type, close }: { type: ModalType; close: () => void }) {
  const qc = useQueryClient()
  const [password, setPassword] = useState({ oldPassword: '', newPassword: '' })
  const [email, setEmail] = useState('')
  const [wechat, setWechat] = useState({ bound: true, campusIdentity: '' })
  const [message, setMessage] = useState('')
  const passwordMutation = useMutation({ mutationFn: campusApi.changePassword, onSuccess: () => { setMessage('密码已修改'); setPassword({ oldPassword: '', newPassword: '' }) }, onError: (error) => setMessage(error.message) })
  const emailMutation = useMutation({ mutationFn: campusApi.bindEmail, onSuccess: async () => { await qc.invalidateQueries({ queryKey: ['profileSecurity'] }); close() }, onError: (error) => setMessage(error.message) })
  const wechatMutation = useMutation({ mutationFn: campusApi.bindWechat, onSuccess: async () => { await qc.invalidateQueries({ queryKey: ['profileSecurity'] }); close() }, onError: (error) => setMessage(error.message) })

  function submit(event: FormEvent) {
    event.preventDefault()
    setMessage('')
    if (type === 'password') passwordMutation.mutate(password)
    if (type === 'email') emailMutation.mutate({ email })
    if (type === 'wechat') wechatMutation.mutate(wechat)
  }

  return (
    <Modal open={type !== null} title={type === 'password' ? '修改密码' : type === 'email' ? '绑定邮箱' : '维护微信/校园身份'} onClose={close}>
      <form className="space-y-4" onSubmit={submit}>
        {type === 'password' && (
          <>
            <Field label="原密码"><input className={inputClass} type="password" value={password.oldPassword} onChange={(e) => setPassword({ ...password, oldPassword: e.target.value })} required /></Field>
            <Field label="新密码"><input className={inputClass} type="password" minLength={6} value={password.newPassword} onChange={(e) => setPassword({ ...password, newPassword: e.target.value })} required /></Field>
          </>
        )}
        {type === 'email' && <Field label="邮箱"><input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></Field>}
        {type === 'wechat' && (
          <>
            <Field label="绑定状态"><select className={inputClass} value={wechat.bound ? 'true' : 'false'} onChange={(e) => setWechat({ ...wechat, bound: e.target.value === 'true' })}><option value="true">已绑定</option><option value="false">未绑定</option></select></Field>
            <Field label="校园身份"><input className={inputClass} value={wechat.campusIdentity} onChange={(e) => setWechat({ ...wechat, campusIdentity: e.target.value })} placeholder="如：本科生 / 教师 / 管理员" /></Field>
          </>
        )}
        {message && <div className="rounded-md border border-[#d9dfd8] bg-[#f8faf7] px-3 py-2 text-sm text-[#344256]">{message}</div>}
        <Button type="submit">保存</Button>
      </form>
    </Modal>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-medium text-[#556273]">{label}</span>{children}</label>
}

const inputClass = 'h-10 w-full rounded-md border border-[#cfd8d2] bg-white px-3 text-sm text-[#172235] outline-none transition focus:border-[var(--campus-green)] focus:ring-2 focus:ring-emerald-100'
