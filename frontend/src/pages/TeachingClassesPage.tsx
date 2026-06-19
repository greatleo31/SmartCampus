import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { campusApi } from '../api/campus'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import { Input } from '../components/ui/Input'

export function TeachingClassesPage() {
  const qc = useQueryClient()
  const { data } = useQuery({ queryKey: ['teachingClasses'], queryFn: campusApi.teachingClasses })
  const [form, setForm] = useState({ classCode: '', className: '', semesterId: 1, courseId: 1, teacherId: 1, capacity: 60 })
  const create = useMutation({ mutationFn: campusApi.createTeachingClass, onSuccess: () => qc.invalidateQueries({ queryKey: ['teachingClasses'] }) })
  const remove = useMutation({ mutationFn: campusApi.deleteTeachingClass, onSuccess: () => qc.invalidateQueries({ queryKey: ['teachingClasses'] }) })

  function submit(e: FormEvent) {
    e.preventDefault()
    create.mutate(form)
    setForm({ classCode: '', className: '', semesterId: 1, courseId: 1, teacherId: 1, capacity: 60 })
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-slate-950">教学班管理</h1>
      <Card className="p-5">
        <form className="mb-5 grid gap-3 md:grid-cols-6" onSubmit={submit}>
          <Input placeholder="教学班编码" value={form.classCode} onChange={(e) => setForm({ ...form, classCode: e.target.value })} required />
          <Input placeholder="教学班名称" value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} required />
          <Input type="number" value={form.semesterId} onChange={(e) => setForm({ ...form, semesterId: Number(e.target.value) })} required />
          <Input type="number" value={form.courseId} onChange={(e) => setForm({ ...form, courseId: Number(e.target.value) })} required />
          <Input type="number" value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: Number(e.target.value) })} required />
          <div className="flex gap-2">
            <Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} required />
            <Button>保存</Button>
          </div>
        </form>
        <DataTable
          rows={(data?.records ?? []) as unknown as Record<string, unknown>[]}
          columns={[
            { key: 'classCode', title: '编码' },
            { key: 'className', title: '名称' },
            { key: 'semesterId', title: '学期ID' },
            { key: 'courseId', title: '课程ID' },
            { key: 'teacherId', title: '教师ID' },
            { key: 'capacity', title: '容量' },
            { key: 'id', title: '操作', render: (row) => <Button variant="danger" onClick={() => remove.mutate(Number(row.id))}>删除</Button> },
          ]}
        />
      </Card>
    </div>
  )
}
