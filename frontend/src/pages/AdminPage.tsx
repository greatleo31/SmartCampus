import { useState, type FormEvent, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, CalendarDays, Edit3, RotateCcw, Save, Settings, ShieldAlert, Trash2, UserCog } from 'lucide-react'
import { campusApi } from '../api/campus'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import type {
  AdminUser,
  AdminUserPayload,
  Announcement,
  AnnouncementCategory,
  AnnouncementPayload,
  Permission,
  Role,
  ScheduleItem,
  SchedulePayload,
  SystemConfig,
  User,
} from '../types/api'

const tabs = [
  { key: 'announcements', label: '公告管理', path: '/admin/announcements', icon: Bell },
  { key: 'users', label: '用户管理', path: '/admin/users', icon: UserCog },
  { key: 'roles', label: '角色权限', path: '/admin/roles', icon: ShieldAlert },
  { key: 'configs', label: '系统配置', path: '/admin/configs', icon: Settings },
  { key: 'schedules', label: '课表管理', path: '/admin/schedules', icon: CalendarDays },
] as const

type TabKey = typeof tabs[number]['key']
type Message = { type: 'ok' | 'error'; text: string } | null

const categoryLabels: Record<AnnouncementCategory, string> = {
  NOTICE: '通知',
  MEETING: '会议',
  PUBLICITY: '公示',
  LECTURE: '讲座',
}

const roleLabels: Record<User['userType'], string> = {
  ADMIN: '管理员',
  TEACHER: '教师',
  STUDENT: '学生',
}

const dataScopeLabels: Record<string, string> = {
  ALL: '全校',
  TEACHER_OWN: '授课范围',
  STUDENT_OWN: '个人',
  TEACHER: '授课范围',
  SELF: '个人',
}

const dataScopeOptions = [
  { value: 'ALL', label: '全校' },
  { value: 'TEACHER_OWN', label: '授课范围' },
  { value: 'STUDENT_OWN', label: '个人' },
]

function tabFromPath(pathname: string): TabKey {
  return tabs.find((tab) => pathname === tab.path)?.key ?? 'announcements'
}

export function AdminPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const activeTab = tabFromPath(location.pathname)

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-[#d9dfd8] bg-white px-5 py-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#172235]">管理员后台</h1>
            <p className="mt-1 text-sm text-[#667085]">维护公告、用户、权限、系统配置和课表数据，前台工作台保持与教师、学生一致。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {tabs.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.key}
                  onClick={() => navigate(item.path)}
                  className={`inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition ${
                    activeTab === item.key
                      ? 'border-[var(--campus-green)] bg-[var(--campus-green)] text-white'
                      : 'border-[#d9dfd8] bg-white text-[#344256] hover:bg-[#f7f8f5]'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>
      </section>
      {activeTab === 'announcements' && <AnnouncementsAdmin />}
      {activeTab === 'users' && <UsersAdmin />}
      {activeTab === 'roles' && <RolesAdmin />}
      {activeTab === 'configs' && <ConfigsAdmin />}
      {activeTab === 'schedules' && <SchedulesAdmin />}
    </div>
  )
}

function AnnouncementsAdmin() {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [message, setMessage] = useState<Message>(null)
  const [form, setForm] = useState<AnnouncementPayload>(emptyAnnouncement())
  const { data = [], isLoading } = useQuery({ queryKey: ['adminAnnouncements'], queryFn: campusApi.adminAnnouncements })
  const save = useMutation({
    mutationFn: () => editing ? campusApi.updateAnnouncement(editing.id, form) : campusApi.createAnnouncement(form),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['adminAnnouncements'] })
      await queryClient.invalidateQueries({ queryKey: ['announcements'] })
      setEditing(null)
      setForm(emptyAnnouncement())
      setMessage({ type: 'ok', text: '公告已保存' })
    },
    onError: (error) => setMessage({ type: 'error', text: error.message }),
  })
  const remove = useMutation({
    mutationFn: (id: number) => campusApi.deleteAnnouncement(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['adminAnnouncements'] })
      await queryClient.invalidateQueries({ queryKey: ['announcements'] })
      setMessage({ type: 'ok', text: '公告已删除' })
    },
    onError: (error) => setMessage({ type: 'error', text: error.message }),
  })

  function startEdit(row: Announcement) {
    setEditing(row)
    setForm({
      title: row.title,
      category: row.category,
      summary: row.summary,
      content: row.content,
      status: row.status,
      pinned: row.pinned === 1,
    })
    setMessage(null)
  }

  return (
    <AdminSection
      title="公告管理"
      description="公告发布后对所有角色可见；草稿仅管理员后台可见。"
      message={message}
      form={(
        <form className="grid gap-4 xl:grid-cols-[1fr_180px_160px]" onSubmit={(event) => submit(event, save.mutate)}>
          <Field label="标题" className="xl:col-span-1">
            <input className={inputClass} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
          </Field>
          <Field label="分类">
            <select className={inputClass} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as AnnouncementCategory })}>
              {Object.entries(categoryLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </Field>
          <Field label="状态">
            <select className={inputClass} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as AnnouncementPayload['status'] })}>
              <option value="PUBLISHED">发布</option>
              <option value="DRAFT">草稿</option>
            </select>
          </Field>
          <Field label="摘要" className="xl:col-span-3">
            <input className={inputClass} value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} required />
          </Field>
          <Field label="正文" className="xl:col-span-3">
            <textarea className={`${inputClass} min-h-24 py-2`} value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} required />
          </Field>
          <div className="flex flex-wrap items-center gap-3 xl:col-span-3">
            <label className="inline-flex items-center gap-2 text-sm text-[#344256]">
              <input type="checkbox" checked={form.pinned} onChange={(event) => setForm({ ...form, pinned: event.target.checked })} />
              置顶公告
            </label>
            <Button type="submit" disabled={save.isPending}><Save size={16} />{editing ? '保存修改' : '发布公告'}</Button>
            {editing && <Button type="button" variant="secondary" onClick={() => { setEditing(null); setForm(emptyAnnouncement()) }}><RotateCcw size={16} />取消编辑</Button>}
          </div>
        </form>
      )}
    >
      <DataTable rows={data as unknown as Record<string, unknown>[]} columns={[
        { key: 'title', title: '标题' },
        { key: 'category', title: '分类', render: (row) => categoryLabels[row.category as AnnouncementCategory] },
        { key: 'status', title: '状态', render: (row) => row.status === 'PUBLISHED' ? '已发布' : '草稿' },
        { key: 'pinned', title: '置顶', render: (row) => Number(row.pinned) === 1 ? '是' : '否' },
        { key: 'publishTime', title: '发布时间', render: (row) => String(row.publishTime ?? '-').slice(0, 16).replace('T', ' ') },
        {
          key: 'actions',
          title: '操作',
          render: (row) => (
            <RowActions>
              <button onClick={() => startEdit(row as unknown as Announcement)}><Edit3 size={14} />编辑</button>
              <button className="text-[var(--risk-red)]" onClick={() => remove.mutate(Number(row.id))}><Trash2 size={14} />删除</button>
            </RowActions>
          ),
        },
      ]} />
      {isLoading && <LoadingLine />}
    </AdminSection>
  )
}

function UsersAdmin() {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<AdminUser | null>(null)
  const [message, setMessage] = useState<Message>(null)
  const [form, setForm] = useState<AdminUserPayload>(emptyUser())
  const { data: users = [] } = useQuery({ queryKey: ['adminUsers'], queryFn: campusApi.adminUsers })
  const { data: roles = [] } = useQuery({ queryKey: ['adminRoles'], queryFn: campusApi.adminRoles })
  const save = useMutation({
    mutationFn: () => editing ? campusApi.updateUser(editing.id, sanitizedUser(form, true)) : campusApi.createUser(sanitizedUser(form, false)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      setEditing(null)
      setForm(emptyUser())
      setMessage({ type: 'ok', text: '用户已保存' })
    },
    onError: (error) => setMessage({ type: 'error', text: error.message }),
  })
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: number }) => campusApi.setUserStatus(id, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      setMessage({ type: 'ok', text: '用户状态已更新' })
    },
    onError: (error) => setMessage({ type: 'error', text: error.message }),
  })
  const resetMutation = useMutation({
    mutationFn: (id: number) => campusApi.resetPassword(id, { password: form.password || '123456' }),
    onSuccess: () => setMessage({ type: 'ok', text: '密码已重置' }),
    onError: (error) => setMessage({ type: 'error', text: error.message }),
  })

  function startEdit(row: AdminUser) {
    const roleIds = roles.filter((role) => row.roles.includes(role.code)).map((role) => role.id)
    setEditing(row)
    setForm({ username: row.username, realName: row.realName, userType: row.userType, status: row.status, roleIds, password: '' })
    setMessage(null)
  }

  return (
    <AdminSection
      title="用户管理"
      description="创建账号、调整角色、启停账号；编辑时密码留空则不修改密码。"
      message={message}
      form={(
        <form className="grid gap-4 lg:grid-cols-3 xl:grid-cols-6" onSubmit={(event) => submit(event, save.mutate)}>
          <Field label="用户名"><input className={inputClass} value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} required /></Field>
          <Field label="姓名"><input className={inputClass} value={form.realName} onChange={(event) => setForm({ ...form, realName: event.target.value })} required /></Field>
          <Field label="类型">
            <select className={inputClass} value={form.userType} onChange={(event) => setForm({ ...form, userType: event.target.value as User['userType'] })}>
              {Object.entries(roleLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </Field>
          <Field label="状态">
            <select className={inputClass} value={form.status} onChange={(event) => setForm({ ...form, status: Number(event.target.value) })}>
              <option value={1}>启用</option>
              <option value={0}>停用</option>
            </select>
          </Field>
          <Field label={editing ? '新密码' : '初始密码'}>
            <input className={inputClass} value={form.password ?? ''} onChange={(event) => setForm({ ...form, password: event.target.value })} required={!editing} type="password" placeholder={editing ? '留空不修改' : '必填'} />
          </Field>
          <Field label="角色">
            <select className={inputClass} value={form.roleIds[0] ?? ''} onChange={(event) => setForm({ ...form, roleIds: [Number(event.target.value)] })} required>
              <option value="" disabled>选择角色</option>
              {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
            </select>
          </Field>
          <div className="flex flex-wrap items-center gap-3 lg:col-span-3 xl:col-span-6">
            <Button type="submit" disabled={save.isPending}><Save size={16} />{editing ? '保存用户' : '新增用户'}</Button>
            {editing && (
              <>
                <Button type="button" variant="secondary" onClick={() => resetMutation.mutate(editing.id)}><RotateCcw size={16} />重置为输入密码</Button>
                <Button type="button" variant="secondary" onClick={() => { setEditing(null); setForm(emptyUser()) }}>取消编辑</Button>
              </>
            )}
          </div>
        </form>
      )}
    >
      <DataTable rows={users as unknown as Record<string, unknown>[]} columns={[
        { key: 'username', title: '用户名' },
        { key: 'realName', title: '姓名' },
        { key: 'userType', title: '类型', render: (row) => roleLabels[row.userType as User['userType']] },
        { key: 'status', title: '状态', render: (row) => Number(row.status) === 1 ? '启用' : '停用' },
        { key: 'roles', title: '角色', render: (row) => (row.roles as string[]).join('、') },
        {
          key: 'actions',
          title: '操作',
          render: (row) => (
            <RowActions>
              <button onClick={() => startEdit(row as unknown as AdminUser)}><Edit3 size={14} />编辑</button>
              <button onClick={() => statusMutation.mutate({ id: Number(row.id), status: Number(row.status) === 1 ? 0 : 1 })}>
                {Number(row.status) === 1 ? '停用' : '启用'}
              </button>
            </RowActions>
          ),
        },
      ]} />
    </AdminSection>
  )
}

function RolesAdmin() {
  const queryClient = useQueryClient()
  const [message, setMessage] = useState<Message>(null)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null)
  const [roleForm, setRoleForm] = useState<Omit<Role, 'id'>>(emptyRole())
  const [permissionForm, setPermissionForm] = useState<Omit<Permission, 'id'>>(emptyPermission())
  const { data: roles = [] } = useQuery({ queryKey: ['adminRoles'], queryFn: campusApi.adminRoles })
  const { data: permissions = [] } = useQuery({ queryKey: ['adminPermissions'], queryFn: campusApi.adminPermissions })
  const saveRole = useMutation({
    mutationFn: () => editingRole ? campusApi.updateRole(editingRole.id, roleForm) : campusApi.createRole(roleForm),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['adminRoles'] })
      setEditingRole(null)
      setRoleForm(emptyRole())
      setMessage({ type: 'ok', text: '角色已保存' })
    },
    onError: (error) => setMessage({ type: 'error', text: error.message }),
  })
  const savePermission = useMutation({
    mutationFn: () => editingPermission ? campusApi.updatePermission(editingPermission.id, permissionForm) : campusApi.createPermission(permissionForm),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['adminPermissions'] })
      setEditingPermission(null)
      setPermissionForm(emptyPermission())
      setMessage({ type: 'ok', text: '权限已保存' })
    },
    onError: (error) => setMessage({ type: 'error', text: error.message }),
  })

  return (
    <div className="space-y-5">
      <MessageBar message={message} />
      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <SectionHead title="角色" description="角色决定用户身份和默认数据范围。" />
          <form className="mb-5 grid gap-3 md:grid-cols-3" onSubmit={(event) => submit(event, saveRole.mutate)}>
            <Field label="编码"><input className={inputClass} value={roleForm.code} onChange={(event) => setRoleForm({ ...roleForm, code: event.target.value })} required /></Field>
            <Field label="名称"><input className={inputClass} value={roleForm.name} onChange={(event) => setRoleForm({ ...roleForm, name: event.target.value })} required /></Field>
            <Field label="数据范围">
              <select className={inputClass} value={roleForm.dataScope} onChange={(event) => setRoleForm({ ...roleForm, dataScope: event.target.value })}>
                {dataScopeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </Field>
            <div className="flex gap-2 md:col-span-3">
              <Button type="submit"><Save size={16} />{editingRole ? '保存角色' : '新增角色'}</Button>
              {editingRole && <Button type="button" variant="secondary" onClick={() => { setEditingRole(null); setRoleForm(emptyRole()) }}>取消</Button>}
            </div>
          </form>
          <DataTable rows={roles as unknown as Record<string, unknown>[]} columns={[
            { key: 'code', title: '编码' },
            { key: 'name', title: '名称' },
            { key: 'dataScope', title: '范围', render: (row) => dataScopeLabels[String(row.dataScope)] ?? row.dataScope },
            {
              key: 'actions',
              title: '操作',
              render: (row) => <RowActions><button onClick={() => { const role = row as unknown as Role; setEditingRole(role); setRoleForm({ code: role.code, name: role.name, dataScope: role.dataScope }) }}><Edit3 size={14} />编辑</button></RowActions>,
            },
          ]} />
        </Card>
        <Card className="p-5">
          <SectionHead title="权限" description="权限码控制菜单和接口访问；新增权限后需匹配后端鉴权码。" />
          <form className="mb-5 grid gap-3 md:grid-cols-2" onSubmit={(event) => submit(event, savePermission.mutate)}>
            <Field label="权限码"><input className={inputClass} value={permissionForm.code} onChange={(event) => setPermissionForm({ ...permissionForm, code: event.target.value })} required /></Field>
            <Field label="名称"><input className={inputClass} value={permissionForm.name} onChange={(event) => setPermissionForm({ ...permissionForm, name: event.target.value })} required /></Field>
            <Field label="菜单路径"><input className={inputClass} value={permissionForm.menuPath ?? ''} onChange={(event) => setPermissionForm({ ...permissionForm, menuPath: event.target.value })} /></Field>
            <Field label="角色编码">
              <select className={inputClass} value={permissionForm.roleCode} onChange={(event) => setPermissionForm({ ...permissionForm, roleCode: event.target.value })}>
                {roles.map((role) => <option key={role.id} value={role.code}>{role.code}</option>)}
              </select>
            </Field>
            <div className="flex gap-2 md:col-span-2">
              <Button type="submit"><Save size={16} />{editingPermission ? '保存权限' : '新增权限'}</Button>
              {editingPermission && <Button type="button" variant="secondary" onClick={() => { setEditingPermission(null); setPermissionForm(emptyPermission()) }}>取消</Button>}
            </div>
          </form>
          <DataTable rows={permissions as unknown as Record<string, unknown>[]} columns={[
            { key: 'code', title: '权限码' },
            { key: 'name', title: '名称' },
            { key: 'menuPath', title: '菜单' },
            { key: 'roleCode', title: '角色' },
            {
              key: 'actions',
              title: '操作',
              render: (row) => <RowActions><button onClick={() => { const item = row as unknown as Permission; setEditingPermission(item); setPermissionForm({ code: item.code, name: item.name, menuPath: item.menuPath ?? '', roleCode: item.roleCode }) }}><Edit3 size={14} />编辑</button></RowActions>,
            },
          ]} />
        </Card>
      </div>
    </div>
  )
}

function ConfigsAdmin() {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<SystemConfig | null>(null)
  const [message, setMessage] = useState<Message>(null)
  const [form, setForm] = useState({ configName: '', configValue: '', description: '' })
  const { data = [] } = useQuery({ queryKey: ['adminConfigs'], queryFn: campusApi.adminConfigs })
  const save = useMutation({
    mutationFn: () => editing ? campusApi.updateConfig(editing.id, form) : Promise.reject(new Error('请选择要修改的配置')),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['adminConfigs'] })
      setMessage({ type: 'ok', text: '系统配置已保存' })
    },
    onError: (error) => setMessage({ type: 'error', text: error.message }),
  })

  function startEdit(row: SystemConfig) {
    setEditing(row)
    setForm({ configName: row.configName, configValue: row.configValue, description: row.description ?? '' })
    setMessage(null)
  }

  return (
    <AdminSection
      title="系统配置"
      description="配置项由系统预置，后台支持修改名称、值和说明。"
      message={message}
      form={(
        <form className="grid gap-4 lg:grid-cols-3" onSubmit={(event) => submit(event, save.mutate)}>
          <Field label="配置项"><input className={`${inputClass} bg-[#f7f8f5]`} value={editing?.configKey ?? '请选择下方配置'} readOnly /></Field>
          <Field label="名称"><input className={inputClass} value={form.configName} onChange={(event) => setForm({ ...form, configName: event.target.value })} required /></Field>
          <Field label="值"><input className={inputClass} value={form.configValue} onChange={(event) => setForm({ ...form, configValue: event.target.value })} required /></Field>
          <Field label="说明" className="lg:col-span-3"><input className={inputClass} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field>
          <div className="lg:col-span-3"><Button type="submit" disabled={!editing || save.isPending}><Save size={16} />保存配置</Button></div>
        </form>
      )}
    >
      <DataTable rows={data as unknown as Record<string, unknown>[]} columns={[
        { key: 'configKey', title: '键' },
        { key: 'configName', title: '名称' },
        { key: 'configValue', title: '值' },
        { key: 'description', title: '说明' },
        { key: 'actions', title: '操作', render: (row) => <RowActions><button onClick={() => startEdit(row as unknown as SystemConfig)}><Edit3 size={14} />编辑</button></RowActions> },
      ]} />
    </AdminSection>
  )
}

function SchedulesAdmin() {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<ScheduleItem | null>(null)
  const [message, setMessage] = useState<Message>(null)
  const [form, setForm] = useState<SchedulePayload>(emptySchedule())
  const { data = [] } = useQuery({ queryKey: ['adminSchedules'], queryFn: campusApi.adminSchedules })
  const { data: classPage } = useQuery({ queryKey: ['teachingClasses'], queryFn: campusApi.teachingClasses })
  const classes = classPage?.records ?? []
  const save = useMutation({
    mutationFn: () => editing ? campusApi.updateSchedule(editing.id, form) : campusApi.createSchedule(form),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['adminSchedules'] })
      await queryClient.invalidateQueries({ queryKey: ['mySchedules'] })
      setEditing(null)
      setForm(emptySchedule())
      setMessage({ type: 'ok', text: '课表已保存' })
    },
    onError: (error) => setMessage({ type: 'error', text: error.message }),
  })
  const remove = useMutation({
    mutationFn: (id: number) => campusApi.deleteSchedule(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['adminSchedules'] })
      await queryClient.invalidateQueries({ queryKey: ['mySchedules'] })
      setMessage({ type: 'ok', text: '课表已删除' })
    },
    onError: (error) => setMessage({ type: 'error', text: error.message }),
  })

  function startEdit(row: ScheduleItem) {
    setEditing(row)
    setForm({
      teachingClassId: row.teachingClassId,
      dayOfWeek: row.dayOfWeek,
      startSection: row.startSection,
      endSection: row.endSection,
      startWeek: row.startWeek,
      endWeek: row.endWeek,
      classroom: row.classroom,
      location: row.location ?? '',
    })
    setMessage(null)
  }

  return (
    <AdminSection
      title="课表管理"
      description="维护教学班上课时间、地点和周次，学生与教师课表会同步读取。"
      message={message}
      form={(
        <form className="grid gap-4 lg:grid-cols-4 xl:grid-cols-8" onSubmit={(event) => submit(event, save.mutate)}>
          <Field label="教学班" className="lg:col-span-2 xl:col-span-2">
            <select className={inputClass} value={form.teachingClassId || ''} onChange={(event) => setForm({ ...form, teachingClassId: Number(event.target.value) })} required>
              <option value="" disabled>选择教学班</option>
              {classes.map((item) => <option key={item.id} value={item.id}>{item.className}</option>)}
            </select>
          </Field>
          <Field label="星期">
            <select className={inputClass} value={form.dayOfWeek} onChange={(event) => setForm({ ...form, dayOfWeek: Number(event.target.value) })}>
              {[1, 2, 3, 4, 5, 6, 7].map((day) => <option key={day} value={day}>周{dayText(day)}</option>)}
            </select>
          </Field>
          <NumberField label="开始节" value={form.startSection} min={1} max={12} onChange={(value) => setForm({ ...form, startSection: value })} />
          <NumberField label="结束节" value={form.endSection} min={1} max={12} onChange={(value) => setForm({ ...form, endSection: value })} />
          <NumberField label="开始周" value={form.startWeek} min={1} onChange={(value) => setForm({ ...form, startWeek: value })} />
          <NumberField label="结束周" value={form.endWeek} min={1} onChange={(value) => setForm({ ...form, endWeek: value })} />
          <Field label="教室"><input className={inputClass} value={form.classroom} onChange={(event) => setForm({ ...form, classroom: event.target.value })} required /></Field>
          <Field label="地点" className="lg:col-span-2"><input className={inputClass} value={form.location ?? ''} onChange={(event) => setForm({ ...form, location: event.target.value })} /></Field>
          <div className="flex flex-wrap items-center gap-3 lg:col-span-4 xl:col-span-8">
            <Button type="submit" disabled={save.isPending}><Save size={16} />{editing ? '保存课表' : '新增课表'}</Button>
            {editing && <Button type="button" variant="secondary" onClick={() => { setEditing(null); setForm(emptySchedule()) }}>取消编辑</Button>}
          </div>
        </form>
      )}
    >
      <DataTable rows={data as unknown as Record<string, unknown>[]} columns={[
        { key: 'courseName', title: '课程' },
        { key: 'className', title: '教学班' },
        { key: 'teacherName', title: '教师' },
        { key: 'dayOfWeek', title: '星期', render: (row) => `周${dayText(Number(row.dayOfWeek))}` },
        { key: 'startSection', title: '节次', render: (row) => `${row.startSection}-${row.endSection}` },
        { key: 'startWeek', title: '周次', render: (row) => `${row.startWeek}-${row.endWeek}` },
        { key: 'classroom', title: '教室' },
        {
          key: 'actions',
          title: '操作',
          render: (row) => (
            <RowActions>
              <button onClick={() => startEdit(row as unknown as ScheduleItem)}><Edit3 size={14} />编辑</button>
              <button className="text-[var(--risk-red)]" onClick={() => remove.mutate(Number(row.id))}><Trash2 size={14} />删除</button>
            </RowActions>
          ),
        },
      ]} />
    </AdminSection>
  )
}

function AdminSection({ title, description, message, form, children }: { title: string; description: string; message: Message; form: ReactNode; children: ReactNode }) {
  return (
    <Card className="p-5">
      <SectionHead title={title} description={description} />
      <MessageBar message={message} />
      <div className="mb-5 rounded-lg border border-[#d9dfd8] bg-[#fbfcfa] p-4">{form}</div>
      {children}
    </Card>
  )
}

function SectionHead({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-[#172235]">{title}</h2>
      <p className="mt-1 text-sm text-[#667085]">{description}</p>
    </div>
  )
}

function MessageBar({ message }: { message: Message }) {
  if (!message) return null
  return (
    <div className={`mb-4 rounded-md border px-3 py-2 text-sm ${message.type === 'ok' ? 'border-emerald-200 bg-emerald-50 text-[#0f6b4f]' : 'border-red-200 bg-red-50 text-[#a9332b]'}`}>
      {message.text}
    </div>
  )
}

function Field({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <label className={`block min-w-0 ${className ?? ''}`}>
      <span className="mb-1 block text-xs font-medium text-[#556273]">{label}</span>
      {children}
    </label>
  )
}

function NumberField({ label, value, min, max, onChange }: { label: string; value: number; min: number; max?: number; onChange: (value: number) => void }) {
  return (
    <Field label={label}>
      <input className={inputClass} type="number" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} required />
    </Field>
  )
}

function RowActions({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-3 [&_button]:inline-flex [&_button]:items-center [&_button]:gap-1 [&_button]:text-[#1d4f91] [&_button]:hover:text-[var(--campus-green)]">{children}</div>
}

function LoadingLine() {
  return <div className="mt-3 text-sm text-[#667085]">数据加载中...</div>
}

function submit(event: FormEvent, action: () => void) {
  event.preventDefault()
  action()
}

function emptyAnnouncement(): AnnouncementPayload {
  return { title: '', category: 'NOTICE', summary: '', content: '', status: 'PUBLISHED', pinned: false }
}

function emptyUser(): AdminUserPayload {
  return { username: '', realName: '', userType: 'STUDENT', status: 1, roleIds: [], password: '' }
}

function sanitizedUser(form: AdminUserPayload, editing: boolean): AdminUserPayload {
  if (!editing) return form
  const { password, ...rest } = form
  return password ? form : rest
}

function emptyRole(): Omit<Role, 'id'> {
  return { code: '', name: '', dataScope: 'STUDENT_OWN' }
}

function emptyPermission(): Omit<Permission, 'id'> {
  return { code: '', name: '', menuPath: '', roleCode: 'STUDENT' }
}

function emptySchedule(): SchedulePayload {
  return { teachingClassId: 0, dayOfWeek: 1, startSection: 1, endSection: 2, startWeek: 1, endWeek: 16, classroom: '', location: '' }
}

function dayText(day: number) {
  return ['一', '二', '三', '四', '五', '六', '日'][day - 1] ?? day
}

const inputClass = 'h-10 w-full rounded-md border border-[#cfd8d2] bg-white px-3 text-sm text-[#172235] outline-none transition focus:border-[var(--campus-green)] focus:ring-2 focus:ring-emerald-100'
