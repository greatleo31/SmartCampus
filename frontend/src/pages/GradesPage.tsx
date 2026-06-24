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
import type { GradePayload, GradeRecord } from '../types/api'

type PageMessage = {
  kind: 'info' | 'error'
  text: string
}

const emptyForm: GradePayload = { teachingClassId: 0, studentId: 0, regularScore: 0, finalScore: 0 }

export function GradesPage({ adminMode = false }: { adminMode?: boolean }) {
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
  const [editing, setEditing] = useState<GradeRecord | null>(null)
  const [form, setForm] = useState<GradePayload>(emptyForm)
  const { downloadProgress, runWithProgress } = useDownloadProgress()
  const hasAdminAccess = user?.permissions.includes('admin:access') === true
  const hasGradeManage = user?.permissions.includes('grade:manage') === true
  const isAdminViewer = adminMode || user?.userType === 'ADMIN' || hasAdminAccess
  // Grade write APIs are admin-only, but admins are read-only in this UI.
  const canManageGrades = !isAdminViewer && hasAdminAccess
  const canImportGrades = !isAdminViewer && hasGradeManage
  const { data: teachingClasses } = useQuery({ queryKey: ['teachingClasses'], queryFn: () => campusApi.teachingClasses() })
  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: campusApi.students, enabled: canManageGrades })
  const { data: calendarOptions = [] } = useQuery({ queryKey: ['calendarOptions'], queryFn: campusApi.calendarOptions })
  const queryParams = useMemo(() => ({
    page,
    size,
    ...(teachingClassId ? { teachingClassId } : {}),
    ...(year ? { academicYear: year, term } : {}),
  }), [page, size, teachingClassId, year, term])
  const { data } = useQuery({
    queryKey: ['grades', queryParams],
    queryFn: () => campusApi.grades(queryParams),
  })
  const upload = useMutation({
    mutationFn: (file: File) => campusApi.importGrades(file),
    onSuccess: async (result) => {
      await qc.invalidateQueries({ queryKey: ['grades'] })
      setMessage({
        kind: result.errors.length ? 'error' : 'info',
        text: `导入成功 ${result.successCount} 行${result.errors.length ? `，失败 ${result.errors.length} 行：${result.errors.slice(0, 3).join('；')}` : ''}`,
      })
    },
    onError: (error) => setMessage({ kind: 'error', text: error.message }),
  })
  const remove = useMutation({
    mutationFn: (ids: number[]) => campusApi.deleteGrades(ids),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['grades'] })
      setSelected([])
      setMessage({ kind: 'info', text: '已批量删除' })
    },
  })
  const removeOne = useMutation({
    mutationFn: campusApi.deleteGrade,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['grades'] })
      setSelected((prev) => prev.filter((id) => id !== editing?.id))
      setMessage({ kind: 'info', text: '已删除成绩' })
    },
    onError: (error) => setMessage({ kind: 'error', text: error.message }),
  })
  const save = useMutation({
    mutationFn: (payload: GradePayload) => editing ? campusApi.updateGrade(editing.id, payload) : campusApi.saveGrade(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['grades'] })
      setOpen(false)
      setEditing(null)
      setForm(emptyForm)
      setMessage({ kind: 'info', text: editing ? '已更新成绩' : '已新增成绩' })
    },
    onError: (error) => setMessage({ kind: 'error', text: error.message }),
  })

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  function openEdit(item: GradeRecord) {
    setEditing(item)
    setForm({
      teachingClassId: item.teachingClassId,
      studentId: item.studentId,
      regularScore: item.regularScore,
      finalScore: item.finalScore,
    })
    setOpen(true)
  }

  async function download(kind: 'template' | 'export') {
    const label = kind === 'template' ? '正在下载成绩模板' : '正在导出成绩数据'
    const filename = kind === 'template' ? '成绩导入模板.xlsx' : '成绩数据.xlsx'
    try {
      const blob = await runWithProgress(label, (onProgress) => (
        kind === 'template' ? campusApi.gradeTemplate(onProgress) : campusApi.exportGrades(onProgress)
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
        <h1 className="text-2xl font-semibold text-[#172235]">成绩管理</h1>
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
        <div className="mb-4 flex flex-wrap items-end gap-2">
          {canManageGrades && <Button onClick={openCreate}><Plus size={16} />单条新增</Button>}
          {canImportGrades && <Button variant="secondary" disabled={Boolean(downloadProgress)} onClick={() => download('template')}><FileDown size={16} />下载模板</Button>}
          <Button variant="secondary" disabled={Boolean(downloadProgress)} onClick={() => download('export')}><Download size={16} />导出 XLSX</Button>
          {canImportGrades && <Button onClick={() => fileRef.current?.click()}><FileUp size={16} />导入 XLSX</Button>}
          {canManageGrades && <Button variant="danger" disabled={selected.length === 0} onClick={() => window.confirm('确认批量删除所选成绩？') && remove.mutate(selected)}><Trash2 size={16} />批量删除</Button>}
          {canImportGrades && <input ref={fileRef} className="hidden" type="file" accept=".xlsx" onChange={(event) => { const file = event.target.files?.[0]; if (file) upload.mutate(file); event.currentTarget.value = '' }} />}
        </div>
        {message && <div className={`mb-4 rounded-md border px-3 py-2 text-sm ${message.kind === 'error' ? 'border-[#f1b5b5] bg-[#fff6f6] text-[#9f1d1d]' : 'border-[#d9dfd8] bg-[#f8faf7] text-[#344256]'}`}>{message.text}</div>}
        <DataTable
          rows={rows}
          columns={[
            ...(canManageGrades ? [{ key: 'select', title: '', render: (row: Record<string, unknown>) => <input type="checkbox" checked={selected.includes(Number(row.id))} onChange={(e) => setSelected((prev) => e.target.checked ? [...prev, Number(row.id)] : prev.filter((id) => id !== Number(row.id)))} /> }] : []),
            { key: 'semesterName', title: '学期' },
            { key: 'studentNo', title: '学号' },
            { key: 'courseName', title: '课程' },
            { key: 'teachingClassName', title: '教学班' },
            { key: 'studentName', title: '学生' },
            { key: 'regularScore', title: '平时分' },
            { key: 'finalScore', title: '期末分' },
            { key: 'totalScore', title: '总评' },
            ...(canManageGrades ? [{ key: 'actions', title: '操作', render: (row: Record<string, unknown>) => <div className="flex gap-2"><Button variant="secondary" onClick={() => openEdit(row as unknown as GradeRecord)}><Edit3 size={16} />编辑</Button><Button variant="danger" onClick={() => window.confirm('确认删除该成绩？') && removeOne.mutate(Number(row.id))}><Trash2 size={16} />删除</Button></div> }] : []),
          ]}
        />
        <PaginationBar total={data?.total ?? 0} page={data?.page ?? page} size={data?.size ?? size} onPageChange={setPage} onSizeChange={(next) => { setSize(next); setPage(1) }} />
        <ExportProgressOverlay progress={downloadProgress} />
      </Card>
      {canManageGrades && <Modal open={open} title={editing ? '编辑成绩' : '单条新增成绩'} onClose={() => setOpen(false)}>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); if (selectedTeachingClassId && selectedStudentId) save.mutate({ ...form, teachingClassId: selectedTeachingClassId, studentId: selectedStudentId }) }}>
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
          <Field label="平时分"><input className={inputClass} type="number" min={0} max={100} step="0.1" value={form.regularScore} onChange={(event) => setForm({ ...form, regularScore: Number(event.target.value) })} required /></Field>
          <Field label="期末分"><input className={inputClass} type="number" min={0} max={100} step="0.1" value={form.finalScore} onChange={(event) => setForm({ ...form, finalScore: Number(event.target.value) })} required /></Field>
          <div className="md:col-span-2"><Button type="submit" disabled={save.isPending || !selectedTeachingClassId || !selectedStudentId}>保存</Button></div>
        </form>
      </Modal>}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-medium text-[#556273]">{label}</span>{children}</label>
}

const inputClass = 'h-10 w-full rounded-md border border-[#cfd8d2] bg-white px-3 text-sm text-[#172235] outline-none transition focus:border-[var(--campus-green)] focus:ring-2 focus:ring-emerald-100'
