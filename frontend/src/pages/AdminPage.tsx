import { useState, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocation } from 'react-router-dom'
import { BarChart3, Bell, CalendarDays, Edit3, Plus, Save, ShieldAlert, Trash2, UserCog } from 'lucide-react'
import { campusApi } from '../api/campus'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import { Modal } from '../components/ui/Modal'
import type { AdminUser, AdminUserPayload, Announcement, AnnouncementCategory, AnnouncementPayload, Permission, Role, ScheduleItem, SchedulePayload, SystemConfig, User } from '../types/api'

type ModalState =
  | { type: 'announcement'; item?: Announcement }
  | { type: 'user'; item?: AdminUser }
  | { type: 'role'; item?: Role }
  | { type: 'permission'; item?: Permission }
  | { type: 'config'; item: SystemConfig }
  | { type: 'schedule'; item?: ScheduleItem }
  | null

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
}

function tab(pathname: string) {
  if (pathname.endsWith('/announcements')) return 'announcements'
  if (pathname.endsWith('/users')) return 'users'
  if (pathname.endsWith('/roles')) return 'roles'
  if (pathname.endsWith('/configs')) return 'configs'
  if (pathname.endsWith('/schedules')) return 'schedules'
  return 'stats'
}

export function AdminPage() {
  const location = useLocation()
  const active = tab(location.pathname)
  const [modal, setModal] = useState<ModalState>(null)

  return (
    <div className="space-y-5">
      {active === 'stats' && <AdminStats />}
      {active === 'announcements' && <AnnouncementsAdmin open={setModal} />}
      {active === 'users' && <UsersAdmin open={setModal} />}
      {active === 'roles' && <RolesAdmin open={setModal} />}
      {active === 'configs' && <ConfigsAdmin open={setModal} />}
      {active === 'schedules' && <SchedulesAdmin open={setModal} />}
      <AdminModal modal={modal} close={() => setModal(null)} />
    </div>
  )
}

function AdminStats() {
  const { data } = useQuery({ queryKey: ['adminStats'], queryFn: campusApi.adminStats })
  const cards = [
    { label: '用户总数', value: data?.userCount ?? 0, icon: UserCog },
    { label: '活跃用户', value: data?.activeUserCount ?? 0, icon: BarChart3 },
    { label: '公告数量', value: data?.announcementCount ?? 0, icon: Bell },
    { label: '课表记录', value: data?.scheduleCount ?? 0, icon: CalendarDays },
    { label: '导入任务', value: data?.importTaskCount ?? 0, icon: Save },
    { label: '异常任务', value: data?.exceptionTaskCount ?? 0, icon: ShieldAlert },
  ]
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-[#172235]">后台统计</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.label} className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-[#667085]">{item.label}</div>
                  <div className="mt-2 text-3xl font-semibold text-[#172235]">{item.value}</div>
                </div>
                <div className="rounded-lg bg-[#eef5f1] p-3 text-[var(--campus-green)]"><Icon size={22} /></div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function AnnouncementsAdmin({ open }: { open: (modal: ModalState) => void }) {
  const qc = useQueryClient()
  const { data = [] } = useQuery({ queryKey: ['adminAnnouncements'], queryFn: campusApi.adminAnnouncements })
  const remove = useMutation({
    mutationFn: campusApi.deleteAnnouncement,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminAnnouncements'] }),
  })
  return (
    <Section title="公告管理" action={<Button onClick={() => open({ type: 'announcement' })}><Plus size={16} />发布公告</Button>}>
      <DataTable rows={data as unknown as Record<string, unknown>[]} columns={[
        { key: 'title', title: '标题' },
        { key: 'category', title: '分类', render: (row) => categoryLabels[row.category as AnnouncementCategory] },
        { key: 'status', title: '状态', render: (row) => row.status === 'PUBLISHED' ? '已发布' : '草稿' },
        { key: 'publishTime', title: '发布时间', render: (row) => String(row.publishTime ?? '-').slice(0, 16).replace('T', ' ') },
        { key: 'actions', title: '操作', render: (row) => <Actions><button onClick={() => open({ type: 'announcement', item: row as unknown as Announcement })}><Edit3 size={14} />编辑</button><button onClick={() => confirmDelete(() => remove.mutate(Number(row.id)))}><Trash2 size={14} />删除</button></Actions> },
      ]} />
    </Section>
  )
}

function UsersAdmin({ open }: { open: (modal: ModalState) => void }) {
  const qc = useQueryClient()
  const { data = [] } = useQuery({ queryKey: ['adminUsers'], queryFn: campusApi.adminUsers })
  const status = useMutation({
    mutationFn: ({ id, next }: { id: number; next: number }) => campusApi.setUserStatus(id, next),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminUsers'] }),
  })
  return (
    <Section title="用户管理" action={<Button onClick={() => open({ type: 'user' })}><Plus size={16} />新增用户</Button>}>
      <DataTable rows={data as unknown as Record<string, unknown>[]} columns={[
        { key: 'username', title: '用户名' },
        { key: 'realName', title: '姓名' },
        { key: 'userType', title: '身份', render: (row) => roleLabels[row.userType as User['userType']] },
        { key: 'status', title: '状态', render: (row) => Number(row.status) === 1 ? '启用' : '停用' },
        { key: 'roles', title: '角色', render: (row) => (row.roles as string[]).join('、') },
        { key: 'actions', title: '操作', render: (row) => <Actions><button onClick={() => open({ type: 'user', item: row as unknown as AdminUser })}><Edit3 size={14} />编辑</button><button onClick={() => status.mutate({ id: Number(row.id), next: Number(row.status) === 1 ? 0 : 1 })}>{Number(row.status) === 1 ? '停用' : '启用'}</button></Actions> },
      ]} />
    </Section>
  )
}

function RolesAdmin({ open }: { open: (modal: ModalState) => void }) {
  const { data: roles = [] } = useQuery({ queryKey: ['adminRoles'], queryFn: campusApi.adminRoles })
  const { data: permissions = [] } = useQuery({ queryKey: ['adminPermissions'], queryFn: campusApi.adminPermissions })
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Section title="角色" action={<Button onClick={() => open({ type: 'role' })}><Plus size={16} />新增角色</Button>}>
        <DataTable rows={roles as unknown as Record<string, unknown>[]} columns={[
          { key: 'name', title: '名称' },
          { key: 'dataScope', title: '数据范围', render: (row) => dataScopeLabels[String(row.dataScope)] ?? String(row.dataScope ?? '-') },
          { key: 'actions', title: '操作', render: (row) => <Actions><button onClick={() => open({ type: 'role', item: row as unknown as Role })}><Edit3 size={14} />编辑</button></Actions> },
        ]} />
      </Section>
      <Section title="权限" action={<Button onClick={() => open({ type: 'permission' })}><Plus size={16} />新增权限</Button>}>
        <DataTable rows={permissions as unknown as Record<string, unknown>[]} columns={[
          { key: 'name', title: '名称' },
          { key: 'roleCode', title: '角色', render: (row) => roleCodeText(String(row.roleCode)) },
          { key: 'actions', title: '操作', render: (row) => <Actions><button onClick={() => open({ type: 'permission', item: row as unknown as Permission })}><Edit3 size={14} />编辑</button></Actions> },
        ]} />
      </Section>
    </div>
  )
}

function ConfigsAdmin({ open }: { open: (modal: ModalState) => void }) {
  const { data = [] } = useQuery({ queryKey: ['adminConfigs'], queryFn: campusApi.adminConfigs })
  return (
    <Section title="系统配置">
      <DataTable rows={data as unknown as Record<string, unknown>[]} columns={[
        { key: 'configKey', title: '键' },
        { key: 'configName', title: '名称' },
        { key: 'configValue', title: '值' },
        { key: 'actions', title: '操作', render: (row) => <Actions><button onClick={() => open({ type: 'config', item: row as unknown as SystemConfig })}><Edit3 size={14} />编辑</button></Actions> },
      ]} />
    </Section>
  )
}

function SchedulesAdmin({ open }: { open: (modal: ModalState) => void }) {
  const qc = useQueryClient()
  const { data = [] } = useQuery({ queryKey: ['adminSchedules'], queryFn: campusApi.adminSchedules })
  const remove = useMutation({
    mutationFn: campusApi.deleteSchedule,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminSchedules'] }),
  })
  return (
    <Section title="课表管理" action={<Button onClick={() => open({ type: 'schedule' })}><Plus size={16} />新增课表</Button>}>
      <DataTable rows={data as unknown as Record<string, unknown>[]} columns={[
        { key: 'courseName', title: '课程' },
        { key: 'className', title: '教学班' },
        { key: 'teacherName', title: '教师' },
        { key: 'dayOfWeek', title: '星期', render: (row) => `周${'一二三四五六日'[Number(row.dayOfWeek) - 1]}` },
        { key: 'startSection', title: '节次', render: (row) => `${row.startSection}-${row.endSection}` },
        { key: 'classroom', title: '教室' },
        { key: 'actions', title: '操作', render: (row) => <Actions><button onClick={() => open({ type: 'schedule', item: row as unknown as ScheduleItem })}><Edit3 size={14} />编辑</button><button onClick={() => confirmDelete(() => remove.mutate(Number(row.id)))}><Trash2 size={14} />删除</button></Actions> },
      ]} />
    </Section>
  )
}

function AdminModal({ modal, close }: { modal: ModalState; close: () => void }) {
  if (!modal) return null
  const title = modal.type === 'announcement' ? '公告' : modal.type === 'user' ? '用户' : modal.type === 'role' ? '角色' : modal.type === 'permission' ? '权限' : modal.type === 'config' ? '系统配置' : '课表'
  return (
    <Modal open title={`${modal.item ? '编辑' : '新增'}${title}`} onClose={close}>
      {modal.type === 'announcement' && <AnnouncementForm item={modal.item} close={close} />}
      {modal.type === 'user' && <UserForm item={modal.item} close={close} />}
      {modal.type === 'role' && <RoleForm item={modal.item} close={close} />}
      {modal.type === 'permission' && <PermissionForm item={modal.item} close={close} />}
      {modal.type === 'config' && <ConfigForm item={modal.item} close={close} />}
      {modal.type === 'schedule' && <ScheduleForm item={modal.item} close={close} />}
    </Modal>
  )
}

function AnnouncementForm({ item, close }: { item?: Announcement; close: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState<AnnouncementPayload>({
    title: item?.title ?? '',
    category: item?.category ?? 'NOTICE',
    publishTime: item?.publishTime?.slice(0, 16) ?? '',
    sourceUrl: item?.sourceUrl ?? '',
    status: item?.status ?? 'PUBLISHED',
    pinned: item?.pinned === 1,
  })
  const save = useMutation({
    mutationFn: () => item ? campusApi.updateAnnouncement(item.id, normalizeAnnouncement(form)) : campusApi.createAnnouncement(normalizeAnnouncement(form)),
    onSuccess: async () => { await qc.invalidateQueries({ queryKey: ['adminAnnouncements'] }); await qc.invalidateQueries({ queryKey: ['announcements'] }); close() },
  })
  return <Form onSubmit={() => save.mutate()}><Field label="标题"><input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></Field><Field label="分类"><select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as AnnouncementCategory })}>{Object.entries(categoryLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></Field><Field label="发布时间"><input className={inputClass} type="datetime-local" value={form.publishTime ?? ''} onChange={(e) => setForm({ ...form, publishTime: e.target.value })} /></Field><Field label="外链"><input className={inputClass} type="url" value={form.sourceUrl} onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })} required /></Field><Field label="状态"><select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as AnnouncementPayload['status'] })}><option value="PUBLISHED">发布</option><option value="DRAFT">草稿</option></select></Field><label className="flex items-center gap-2 text-sm text-[#344256]"><input type="checkbox" checked={form.pinned} onChange={(e) => setForm({ ...form, pinned: e.target.checked })} />置顶</label><Submit pending={save.isPending} /></Form>
}

function UserForm({ item, close }: { item?: AdminUser; close: () => void }) {
  const qc = useQueryClient()
  const { data: roles = [] } = useQuery({ queryKey: ['adminRoles'], queryFn: campusApi.adminRoles })
  const [form, setForm] = useState<AdminUserPayload>({ username: item?.username ?? '', realName: item?.realName ?? '', userType: item?.userType ?? 'STUDENT', status: item?.status ?? 1, roleIds: [], password: '' })
  const matchedRoleId = roles.find((role) => item?.roles.includes(role.code))?.id
  const selectedRoleId = form.roleIds[0] ?? matchedRoleId ?? ''
  const save = useMutation({ mutationFn: () => item ? campusApi.updateUser(item.id, userPayload({ ...form, roleIds: [Number(selectedRoleId)] }, true)) : campusApi.createUser(userPayload(form, false)), onSuccess: async () => { await qc.invalidateQueries({ queryKey: ['adminUsers'] }); close() } })
  return <Form onSubmit={() => save.mutate()}><Field label="用户名"><input className={inputClass} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></Field><Field label="姓名"><input className={inputClass} value={form.realName} onChange={(e) => setForm({ ...form, realName: e.target.value })} required /></Field><Field label="身份"><select className={inputClass} value={form.userType} onChange={(e) => setForm({ ...form, userType: e.target.value as User['userType'] })}>{Object.entries(roleLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></Field><Field label="状态"><select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}><option value={1}>启用</option><option value={0}>停用</option></select></Field><Field label={item ? '新密码' : '初始密码'}><input className={inputClass} type="password" value={form.password ?? ''} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!item} /></Field><Field label="角色"><select className={inputClass} value={selectedRoleId} onChange={(e) => setForm({ ...form, roleIds: [Number(e.target.value)] })} required><option value="" disabled>选择角色</option>{roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select></Field><Submit pending={save.isPending} /></Form>
}

function RoleForm({ item, close }: { item?: Role; close: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState<Omit<Role, 'id'>>({ code: item?.code ?? '', name: item?.name ?? '', dataScope: item?.dataScope ?? 'STUDENT_OWN' })
  const save = useMutation({ mutationFn: () => item ? campusApi.updateRole(item.id, form) : campusApi.createRole(form), onSuccess: async () => { await qc.invalidateQueries({ queryKey: ['adminRoles'] }); close() } })
  return <Form onSubmit={() => save.mutate()}><Field label="编码"><input className={inputClass} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required /></Field><Field label="名称"><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field><Field label="数据范围"><select className={inputClass} value={form.dataScope} onChange={(e) => setForm({ ...form, dataScope: e.target.value })}><option value="ALL">全校</option><option value="TEACHER_OWN">授课范围</option><option value="STUDENT_OWN">个人</option></select></Field><Submit pending={save.isPending} /></Form>
}

function PermissionForm({ item, close }: { item?: Permission; close: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState<Omit<Permission, 'id'>>({ code: item?.code ?? '', name: item?.name ?? '', menuPath: item?.menuPath ?? '', roleCode: item?.roleCode ?? 'STUDENT' })
  const save = useMutation({ mutationFn: () => item ? campusApi.updatePermission(item.id, form) : campusApi.createPermission(form), onSuccess: async () => { await qc.invalidateQueries({ queryKey: ['adminPermissions'] }); close() } })
  return <Form onSubmit={() => save.mutate()}><Field label="权限码"><input className={inputClass} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required /></Field><Field label="名称"><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field><Field label="菜单路径"><input className={inputClass} value={form.menuPath ?? ''} onChange={(e) => setForm({ ...form, menuPath: e.target.value })} /></Field><Field label="角色编码"><input className={inputClass} value={form.roleCode} onChange={(e) => setForm({ ...form, roleCode: e.target.value })} required /></Field><Submit pending={save.isPending} /></Form>
}

function ConfigForm({ item, close }: { item: SystemConfig; close: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ configName: item.configName, configValue: item.configValue, description: item.description ?? '' })
  const save = useMutation({ mutationFn: () => campusApi.updateConfig(item.id, form), onSuccess: async () => { await qc.invalidateQueries({ queryKey: ['adminConfigs'] }); close() } })
  return <Form onSubmit={() => save.mutate()}><Field label="配置键"><input className={`${inputClass} bg-[#f7f8f5]`} value={item.configKey} readOnly /></Field><Field label="名称"><input className={inputClass} value={form.configName} onChange={(e) => setForm({ ...form, configName: e.target.value })} required /></Field><Field label="值"><input className={inputClass} value={form.configValue} onChange={(e) => setForm({ ...form, configValue: e.target.value })} required /></Field><Field label="说明"><input className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field><Submit pending={save.isPending} /></Form>
}

function ScheduleForm({ item, close }: { item?: ScheduleItem; close: () => void }) {
  const qc = useQueryClient()
  const { data: page } = useQuery({ queryKey: ['teachingClasses'], queryFn: campusApi.teachingClasses })
  const [form, setForm] = useState<SchedulePayload>({ teachingClassId: item?.teachingClassId ?? 0, dayOfWeek: item?.dayOfWeek ?? 1, startSection: item?.startSection ?? 1, endSection: item?.endSection ?? 2, startWeek: item?.startWeek ?? 1, endWeek: item?.endWeek ?? 16, classroom: item?.classroom ?? '', location: item?.location ?? '' })
  const save = useMutation({ mutationFn: () => item ? campusApi.updateSchedule(item.id, form) : campusApi.createSchedule(form), onSuccess: async () => { await qc.invalidateQueries({ queryKey: ['adminSchedules'] }); await qc.invalidateQueries({ queryKey: ['mySchedules'] }); close() } })
  return <Form onSubmit={() => save.mutate()}><Field label="教学班"><select className={inputClass} value={form.teachingClassId || ''} onChange={(e) => setForm({ ...form, teachingClassId: Number(e.target.value) })} required><option value="" disabled>选择教学班</option>{(page?.records ?? []).map((row) => <option key={row.id} value={row.id}>{row.className}</option>)}</select></Field><Field label="星期"><select className={inputClass} value={form.dayOfWeek} onChange={(e) => setForm({ ...form, dayOfWeek: Number(e.target.value) })}>{[1, 2, 3, 4, 5, 6, 7].map((day) => <option key={day} value={day}>周{'一二三四五六日'[day - 1]}</option>)}</select></Field><Field label="开始节"><input className={inputClass} type="number" min={1} max={14} value={form.startSection} onChange={(e) => setForm({ ...form, startSection: Number(e.target.value) })} /></Field><Field label="结束节"><input className={inputClass} type="number" min={1} max={14} value={form.endSection} onChange={(e) => setForm({ ...form, endSection: Number(e.target.value) })} /></Field><Field label="开始周"><input className={inputClass} type="number" min={1} value={form.startWeek} onChange={(e) => setForm({ ...form, startWeek: Number(e.target.value) })} /></Field><Field label="结束周"><input className={inputClass} type="number" min={1} value={form.endWeek} onChange={(e) => setForm({ ...form, endWeek: Number(e.target.value) })} /></Field><Field label="教室"><input className={inputClass} value={form.classroom} onChange={(e) => setForm({ ...form, classroom: e.target.value })} required /></Field><Field label="地点"><input className={inputClass} value={form.location ?? ''} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field><Submit pending={save.isPending} /></Form>
}

function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return <Card className="p-5"><div className="mb-4 flex items-center justify-between gap-3"><h1 className="text-xl font-semibold text-[#172235]">{title}</h1>{action}</div>{children}</Card>
}

function Form({ children, onSubmit }: { children: ReactNode; onSubmit: () => void }) {
  return <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); onSubmit() }}>{children}</form>
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block min-w-0"><span className="mb-1 block text-xs font-medium text-[#556273]">{label}</span>{children}</label>
}

function Submit({ pending }: { pending: boolean }) {
  return <div className="md:col-span-2"><Button type="submit" disabled={pending}><Save size={16} />保存</Button></div>
}

function Actions({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-3 [&_button]:inline-flex [&_button]:items-center [&_button]:gap-1 [&_button]:text-[#1d4f91] [&_button]:hover:text-[var(--campus-green)]">{children}</div>
}

function normalizeAnnouncement(form: AnnouncementPayload): AnnouncementPayload {
  return { ...form, summary: '', content: '', publishTime: form.publishTime ? `${form.publishTime}:00` : undefined }
}

function userPayload(form: AdminUserPayload, editing: boolean): AdminUserPayload {
  if (!editing || form.password) return form
  const rest = { ...form }
  delete rest.password
  return rest
}

function confirmDelete(action: () => void) {
  if (window.confirm('确认删除这条记录？')) action()
}

function roleCodeText(code: string) {
  if (code === 'ADMIN') return '管理员'
  if (code === 'TEACHER') return '教师'
  if (code === 'STUDENT') return '学生'
  return code
}

const inputClass = 'h-10 w-full rounded-md border border-[#cfd8d2] bg-white px-3 text-sm text-[#172235] outline-none transition focus:border-[var(--campus-green)] focus:ring-2 focus:ring-emerald-100'
