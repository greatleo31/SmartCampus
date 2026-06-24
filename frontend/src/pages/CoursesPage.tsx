import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Edit3, Plus, Trash2 } from 'lucide-react'
import { campusApi } from '../api/campus'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { PaginationBar } from '../components/ui/PaginationBar'
import type { Course } from '../types/api'

const emptyForm = { code: '', name: '', aliasName: '', collegeId: 0, credit: 3, hours: 48 }

export function CoursesPage() {
  const qc = useQueryClient()
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const { data } = useQuery({ queryKey: ['courses', page, size, keyword], queryFn: () => campusApi.courses({ page, size, keyword: keyword.trim() || undefined }) })
  const { data: colleges = [] } = useQuery({ queryKey: ['colleges'], queryFn: campusApi.colleges })
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Course | null>(null)
  const [form, setForm] = useState(emptyForm)
  const save = useMutation({
    mutationFn: () => {
      const collegeId = form.collegeId || colleges[0]?.id
      const payload = { ...form, collegeId }
      return editing ? campusApi.updateCourse(editing.id, payload) : campusApi.createCourse(payload)
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['courses'] })
      setOpen(false)
      setEditing(null)
      setForm(emptyForm)
    },
  })
  const remove = useMutation({ mutationFn: campusApi.deleteCourse, onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }) })

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  function openEdit(item: Course) {
    setEditing(item)
    setForm({
      code: item.code,
      name: item.name,
      aliasName: item.aliasName ?? '',
      collegeId: item.collegeId ?? 0,
      credit: item.credit,
      hours: item.hours,
    })
    setOpen(true)
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    save.mutate()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-[#172235]">课程管理</h1>
        <Button onClick={openCreate}><Plus size={16} />新增课程</Button>
      </div>
      <Card className="p-5">
        <div className="mb-4 max-w-sm">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-[#556273]">关键词</span>
            <Input placeholder="搜索课程编号、名称、别名" value={keyword} onChange={(e) => { setKeyword(e.target.value); setPage(1) }} />
          </label>
        </div>
        <DataTable
          rows={(data?.records ?? []) as unknown as Record<string, unknown>[]}
          columns={[
            { key: 'code', title: '课程编号' },
            { key: 'name', title: '课程名称' },
            { key: 'aliasName', title: '课程别名' },
            { key: 'collegeName', title: '学院' },
            { key: 'credit', title: '学分' },
            { key: 'hours', title: '学时' },
            { key: 'id', title: '操作', render: (row) => <div className="flex gap-2"><Button variant="secondary" onClick={() => openEdit(row as unknown as Course)}><Edit3 size={16} />编辑</Button><Button variant="danger" onClick={() => window.confirm('确认删除该课程？') && remove.mutate(Number(row.id))}><Trash2 size={16} />删除</Button></div> },
          ]}
        />
        <PaginationBar total={data?.total ?? 0} page={data?.page ?? page} size={data?.size ?? size} onPageChange={setPage} onSizeChange={(next) => { setSize(next); setPage(1) }} />
      </Card>
      <Modal open={open} title={editing ? '编辑课程' : '新增课程'} onClose={() => setOpen(false)}>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
          <Field label="课程编号"><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required /></Field>
          <Field label="课程名称"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
          <Field label="课程别名"><Input value={form.aliasName} onChange={(e) => setForm({ ...form, aliasName: e.target.value })} /></Field>
          <Field label="学院"><select className={inputClass} value={form.collegeId || colleges[0]?.id || 0} onChange={(e) => setForm({ ...form, collegeId: Number(e.target.value) })} required>{colleges.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
          <Field label="学分"><Input type="number" step="0.5" value={form.credit} onChange={(e) => setForm({ ...form, credit: Number(e.target.value) })} required /></Field>
          <Field label="学时"><Input type="number" value={form.hours} onChange={(e) => setForm({ ...form, hours: Number(e.target.value) })} required /></Field>
          <div className="md:col-span-2"><Button type="submit" disabled={save.isPending}>保存</Button></div>
        </form>
      </Modal>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-medium text-[#556273]">{label}</span>{children}</label>
}
const inputClass = 'h-10 w-full rounded-md border border-[#cfd8d2] bg-white px-3 text-sm text-[#172235] outline-none transition focus:border-[var(--campus-green)] focus:ring-2 focus:ring-emerald-100'
