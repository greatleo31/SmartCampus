import { useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Download, Edit3, FileDown, FileUp, Plus, Trash2 } from 'lucide-react'
import { campusApi } from '../api/campus'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import { ExportProgressOverlay } from '../components/ui/ExportProgressOverlay'
import { Modal } from '../components/ui/Modal'
import { PaginationBar } from '../components/ui/PaginationBar'
import { useAuth } from '../hooks/useAuth'
import { useDownloadProgress } from '../hooks/useDownloadProgress'
import { saveBlob } from '../lib/download'
import type { AttendancePayload, AttendanceRecord } from '../types/api'

type PageMessage = {
  kind: 'info' | 'error'
  text: string
}

const emptyForm: AttendancePayload = { teachingClassId: 0, studentId: 0, attendanceDate: '', status: 'NORMAL', remark: '' }

const statusLabels: Record<AttendancePayload['status'], string> = {
  NORMAL: '正常',
  LATE: '迟到',
  EARLY_LEAVE: '早退',
  LEAVE: '请假',
  ABSENT: '旷课',
}

export function AttendancePage({ adminMode = false }: { adminMode?: boolean }) {
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const [selected, setSelected] = useState<number[]>([])
  const [message, setMessage] = useState<PageMessage | null>(null)
  const [teachingClassId, setTeachingClassId] = useState(0)
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [year, setYear] = useState('')
  const [term, setTerm] = useState(2)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<AttendanceRecord | null>(null)
  const [form, setForm] = useState<AttendancePayload>(emptyForm)
  const { downloadProgress, runWithProgress } = useDownloadProgress()
  const canManage = adminMode || user?.userType === 'ADMIN'
  const { data: teachingClasses } = useQuery({ queryKey: ['teachingClasses'], queryFn: () => campusApi.teachingClasses() })
  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: campusApi.students, enabled: canManage })
  const { data: calendarOptions = [] } = useQuery({ queryKey: ['calendarOptions'], queryFn: campusApi.calendarOptions })
  const queryParams = useMemo(() => ({
    page,
    size,
    ...(teachingClassId ? { teachingClassId } : {}),
    ...(year ? { academicYear: year, term } : {}),
  }), [page, size, teachingClassId, year, term])
  const { data } = useQuery({
    queryKey: ['attendance', queryParams],
    queryFn: () => campusApi.attendance(queryParams),
  })
  const upload = useMutation({
    mutationFn: (file: File) => campusApi.importAttendance(file),
    onSuccess: async (result) => {
      await qc.invalidateQueries({ queryKey: ['attendance'] })
      setMessage({
        kind: result.errors.length ? 'error' : 'info',
        text: `导入成功 ${result.successCount} 行${result.errors.length ? `，失败 ${result.errors.length} 行：${result.errors.slice(0, 3).join('；')}` : ''}`,
      })
    },
    onError: (error) => setMessage({ kind: 'error', text: error.message }),
  })
  const remove = useMutation({
    mutationFn: (ids: number[]) => campusApi.deleteAttendanceBatch(ids),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['attendance'] })
      setSelected([])
      setMessage({ kind: 'info', text: '已批量删除' })
    },
  })
  const removeOne = useMutation({
    mutationFn: campusApi.deleteAttendance,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['attendance'] })
      setSelected((prev) => prev.filter((id) => id !== editing?.id))
      setMessage({ kind: 'info', text: '已删除考勤' })
    },
    onError: (error) => setMessage({ kind: 'error', text: error.message }),
  })
  const save = useMutation({
    mutationFn: (payload: AttendancePayload) => editing ? campusApi.updateAttendance(editing.id, payload) : campusApi.saveAttendance(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['attendance'] })
      setOpen(false)
      setEditing(null)
      setForm(emptyForm)
      setMessage({ kind: 'info', text: editing ? '已更新考勤' : '已新增考勤' })
    },
    onError: (error) => setMessage({ kind: 'error', text: error.message }),
  })

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  function openEdit(item: AttendanceRecord) {
    setEditing(item)
    setForm({
      teachingClassId: item.teachingClassId,
      studentId: item.studentId,
      attendanceDate: item.attendanceDate,
      status: item.status,
      remark: item.remark ?? '',
    })
    setOpen(true)
  }

  async function download(kind: 'template' | 'export') {
    const label = kind === 'template' ? '正在下载考勤模板' : '正在导出考勤数据'
    const filename = kind === 'template' ? '考勤导入模板.xlsx' : '考勤数据.xlsx'
    try {
      const blob = await runWithProgress(label, (onProgress) => (
        kind === 'template' ? campusApi.attendanceTemplate(onProgress) : campusApi.exportAttendance(onProgress)
      ))
      saveBlob(blob, filename)
    } catch (error) {
      setMessage({ kind: 'error', text: error instanceof Error ? error.message : '下载失败' })
    }
  }

  const yearOptions = Array.from(new Set(calendarOptions.map((item) => item.academicYear)))
  const termOptions = Array.from(new Set(calendarOptions.filter((item) => item.academicYear === year).map((item) => item.term)))
  const teachingClassOptions = teachingClasses?.records ?? []
  const selectedTeachingClassId = form.teachingClassId || teachingClassOptions[0]?.id || 0
  const selectedStudentId = form.studentId || students[0]?.id || 0
  const rows = (data?.records ?? []) as unknown as Record<string, unknown>[]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-[#172235]">考勤管理</h1>
      </div>
      <Card className="relative p-5">
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-[#556273]">教学班</span>
            <select className={inputClass} value={teachingClassId} onChange={(event) => { setTeachingClassId(Number(event.target.value)); setPage(1) }}>
              <option value={0}>全部教学班</option>
              {teachingClassOptions.map((item) => <option key={item.id} value={item.id}>{item.className}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-[#556273]">学年</span>
            <select className={inputClass} value={year} onChange={(event) => { setYear(event.target.value); setPage(1) }}>
              <option value="">全部学年</option>
              {yearOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-[#556273]">学期</span>
            <select className={inputClass} value={term} onChange={(event) => { setTerm(Number(event.target.value)); setPage(1) }}>
              {(termOptions.length ? termOptions : [1, 2]).map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>
        {canManage && (
          <div className="mb-4 flex flex-wrap gap-2">
            <Button onClick={openCreate}><Plus size={16} />单条新增</Button>
            <Button variant="secondary" disabled={Boolean(downloadProgress)} onClick={() => download('template')}><FileDown size={16} />下载模板</Button>
            <Button variant="secondary" disabled={Boolean(downloadProgress)} onClick={() => download('export')}><Download size={16} />导出 XLSX</Button>
            <Button onClick={() => fileRef.current?.click()}><FileUp size={16} />导入 XLSX</Button>
            <Button variant="danger" disabled={selected.length === 0} onClick={() => window.confirm('确认批量删除所选考勤？') && remove.mutate(selected)}><Trash2 size={16} />批量删除</Button>
            <input ref={fileRef} className="hidden" type="file" accept=".xlsx" onChange={(event) => { const file = event.target.files?.[0]; if (file) upload.mutate(file); event.currentTarget.value = '' }} />
          </div>
        )}
        {message && <div className={`mb-4 rounded-md border px-3 py-2 text-sm ${message.kind === 'error' ? 'border-[#f1b5b5] bg-[#fff6f6] text-[#9f1d1d]' : 'border-[#d9dfd8] bg-[#f8faf7] text-[#344256]'}`}>{message.text}</div>}
        <DataTable
          rows={rows}
          columns={[
            ...(canManage ? [{ key: 'select', title: '', render: (row: Record<string, unknown>) => <input type="checkbox" checked={selected.includes(Number(row.id))} onChange={(e) => setSelected((prev) => e.target.checked ? [...prev, Number(row.id)] : prev.filter((id) => id !== Number(row.id)))} /> }] : []),
            { key: 'adminClassName', title: '班级' },
            { key: 'studentNo', title: '学号' },
            { key: 'studentName', title: '姓名' },
            { key: 'courseName', title: '课程' },
            { key: 'teachingClassName', title: '教学班' },
            { key: 'attendanceDate', title: '日期' },
            { key: 'weekLabel', title: '周次' },
            { key: 'teacherName', title: '任课老师' },
            { key: 'sectionLabel', title: '节次' },
            { key: 'classroom', title: '教室' },
            { key: 'statusText', title: '状态' },
            ...(canManage ? [{ key: 'actions', title: '操作', render: (row: Record<string, unknown>) => <div className="flex gap-2"><Button variant="secondary" onClick={() => openEdit(row as unknown as AttendanceRecord)}><Edit3 size={16} />编辑</Button><Button variant="danger" onClick={() => window.confirm('确认删除该考勤？') && removeOne.mutate(Number(row.id))}><Trash2 size={16} />删除</Button></div> }] : []),
          ]}
        />
        <PaginationBar total={data?.total ?? 0} page={data?.page ?? page} size={data?.size ?? size} onPageChange={setPage} onSizeChange={(next) => { setSize(next); setPage(1) }} />
        <ExportProgressOverlay progress={downloadProgress} />
      </Card>
      <Modal open={open} title={editing ? '编辑考勤' : '单条新增考勤'} onClose={() => setOpen(false)}>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); if (selectedTeachingClassId && selectedStudentId && form.attendanceDate) save.mutate({ ...form, teachingClassId: selectedTeachingClassId, studentId: selectedStudentId }) }}>
          <Field label="教学班">
            <select className={inputClass} value={selectedTeachingClassId} onChange={(event) => setForm({ ...form, teachingClassId: Number(event.target.value) })} required>
              {teachingClassOptions.map((item) => <option key={item.id} value={item.id}>{item.className} · {item.courseName}</option>)}
            </select>
          </Field>
          <Field label="学生">
            <select className={inputClass} value={selectedStudentId} onChange={(event) => setForm({ ...form, studentId: Number(event.target.value) })} required>
              {students.map((item) => <option key={item.id} value={item.id}>{item.studentNo} · {item.realName} · {item.className}</option>)}
            </select>
          </Field>
          <Field label="日期"><input className={inputClass} type="date" value={form.attendanceDate} onChange={(event) => setForm({ ...form, attendanceDate: event.target.value })} required /></Field>
          <Field label="状态">
            <select className={inputClass} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as AttendancePayload['status'] })} required>
              {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </Field>
          <Field label="备注"><input className={inputClass} value={form.remark ?? ''} onChange={(event) => setForm({ ...form, remark: event.target.value })} /></Field>
          <div className="md:col-span-2"><Button type="submit" disabled={save.isPending || !selectedTeachingClassId || !selectedStudentId || !form.attendanceDate}>保存</Button></div>
        </form>
      </Modal>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-medium text-[#556273]">{label}</span>{children}</label>
}

const inputClass = 'h-10 w-full rounded-md border border-[#cfd8d2] bg-white px-3 text-sm text-[#172235] outline-none transition focus:border-[var(--campus-green)] focus:ring-2 focus:ring-emerald-100'
