import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { campusApi } from '../api/campus'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import { Input } from '../components/ui/Input'

export function CoursesPage() {
  const qc = useQueryClient()
  const { data } = useQuery({ queryKey: ['courses'], queryFn: campusApi.courses })
  const [form, setForm] = useState({ code: '', name: '', credit: 3, hours: 48 })
  const create = useMutation({ mutationFn: campusApi.createCourse, onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }) })
  const remove = useMutation({ mutationFn: campusApi.deleteCourse, onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }) })

  function submit(e: FormEvent) {
    e.preventDefault()
    create.mutate(form)
    setForm({ code: '', name: '', credit: 3, hours: 48 })
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-slate-950">课程管理</h1>
      <Card className="p-5">
        <form className="mb-5 grid gap-3 md:grid-cols-5" onSubmit={submit}>
          <Input placeholder="课程编码" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
          <Input placeholder="课程名称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input type="number" step="0.5" value={form.credit} onChange={(e) => setForm({ ...form, credit: Number(e.target.value) })} required />
          <Input type="number" value={form.hours} onChange={(e) => setForm({ ...form, hours: Number(e.target.value) })} required />
          <Button>保存</Button>
        </form>
        <DataTable
          rows={(data?.records ?? []) as unknown as Record<string, unknown>[]}
          columns={[
            { key: 'code', title: '编码' },
            { key: 'name', title: '名称' },
            { key: 'credit', title: '学分' },
            { key: 'hours', title: '学时' },
            { key: 'id', title: '操作', render: (row) => <Button variant="danger" onClick={() => remove.mutate(Number(row.id))}>删除</Button> },
          ]}
        />
      </Card>
    </div>
  )
}
