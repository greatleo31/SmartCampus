import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { campusApi } from '../api/campus'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import { Input } from '../components/ui/Input'

export function SemestersPage() {
  const qc = useQueryClient()
  const { data } = useQuery({ queryKey: ['semesters'], queryFn: campusApi.semesters })
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', currentFlag: 0 })
  const create = useMutation({ mutationFn: campusApi.createSemester, onSuccess: () => qc.invalidateQueries({ queryKey: ['semesters'] }) })
  const remove = useMutation({ mutationFn: campusApi.deleteSemester, onSuccess: () => qc.invalidateQueries({ queryKey: ['semesters'] }) })

  function submit(e: FormEvent) {
    e.preventDefault()
    create.mutate(form)
    setForm({ name: '', startDate: '', endDate: '', currentFlag: 0 })
  }

  return (
    <CrudFrame title="学期管理" onSubmit={submit}>
      <Input placeholder="学期名称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
      <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
      <label className="flex h-9 items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={form.currentFlag === 1} onChange={(e) => setForm({ ...form, currentFlag: e.target.checked ? 1 : 0 })} />
        当前学期
      </label>
      <Button>保存</Button>
      <DataTable
        rows={(data?.records ?? []) as unknown as Record<string, unknown>[]}
        columns={[
          { key: 'name', title: '名称' },
          { key: 'startDate', title: '开始日期' },
          { key: 'endDate', title: '结束日期' },
          { key: 'currentFlag', title: '当前' },
          { key: 'id', title: '操作', render: (row) => <Button variant="danger" onClick={() => remove.mutate(Number(row.id))}>删除</Button> },
        ]}
      />
    </CrudFrame>
  )
}

function CrudFrame({ title, onSubmit, children }: { title: string; onSubmit: (e: FormEvent) => void; children: ReactNode }) {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-slate-950">{title}</h1>
      <Card className="p-5">
        <form className="mb-5 grid gap-3 md:grid-cols-5" onSubmit={onSubmit}>{children}</form>
      </Card>
    </div>
  )
}
