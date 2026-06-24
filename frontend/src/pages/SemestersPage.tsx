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
import type { Semester } from '../types/api'

const emptyForm = { name: '', startDate: '', endDate: '', currentFlag: 0 }

export function SemestersPage() {
  const qc = useQueryClient()
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const { data } = useQuery({ queryKey: ['semesters', page, size, keyword], queryFn: () => campusApi.semesters({ page, size, keyword: keyword.trim() || undefined }) })
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Semester | null>(null)
  const [form, setForm] = useState(emptyForm)
  const save = useMutation({
    mutationFn: () => editing ? campusApi.updateSemester(editing.id, form) : campusApi.createSemester(form),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['semesters'] })
      setOpen(false)
      setEditing(null)
      setForm(emptyForm)
    },
  })
  const remove = useMutation({ mutationFn: campusApi.deleteSemester, onSuccess: () => qc.invalidateQueries({ queryKey: ['semesters'] }) })

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  function openEdit(item: Semester) {
    setEditing(item)
    setForm({ name: item.name, startDate: item.startDate, endDate: item.endDate, currentFlag: item.currentFlag })
    setOpen(true)
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    save.mutate()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-[#172235]">学期管理</h1>
        <Button onClick={openCreate}><Plus size={16} />新增学期</Button>
      </div>
      <Card className="p-5">
        <div className="mb-4 max-w-sm">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-[#556273]">关键词</span>
            <Input placeholder="搜索学期名称" value={keyword} onChange={(e) => { setKeyword(e.target.value); setPage(1) }} />
          </label>
        </div>
        <DataTable
          rows={(data?.records ?? []) as unknown as Record<string, unknown>[]}
          columns={[
            { key: 'name', title: '名称' },
            { key: 'startDate', title: '开始日期' },
            { key: 'endDate', title: '结束日期' },
            { key: 'currentFlag', title: '当前' },
            { key: 'id', title: '操作', render: (row) => <div className="flex gap-2"><Button variant="secondary" onClick={() => openEdit(row as unknown as Semester)}><Edit3 size={16} />编辑</Button><Button variant="danger" onClick={() => window.confirm('确认删除该学期？') && remove.mutate(Number(row.id))}><Trash2 size={16} />删除</Button></div> },
          ]}
        />
        <PaginationBar total={data?.total ?? 0} page={data?.page ?? page} size={data?.size ?? size} onPageChange={setPage} onSizeChange={(next) => { setSize(next); setPage(1) }} />
      </Card>
      <Modal open={open} title={editing ? '编辑学期' : '新增学期'} onClose={() => setOpen(false)}>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
          <Field label="学期名称"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
          <Field label="开始日期"><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required /></Field>
          <Field label="结束日期"><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required /></Field>
          <label className="flex h-10 items-center gap-2 text-sm text-[#344256]">
            <input type="checkbox" checked={form.currentFlag === 1} onChange={(e) => setForm({ ...form, currentFlag: e.target.checked ? 1 : 0 })} />
            当前学期
          </label>
          <div className="md:col-span-2"><Button type="submit" disabled={save.isPending}>保存</Button></div>
        </form>
      </Modal>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-medium text-[#556273]">{label}</span>{children}</label>
}
